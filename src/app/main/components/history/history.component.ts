import { Component, OnInit } from '@angular/core';
import * as saveAs from 'file-saver';
import { LockerApiService } from 'src/app/locker-services/locker-api.service';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import { UserOptions } from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { TimeDetailsDialogComponent } from 'src/app/components/time-details-dialog/time-details-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';


interface LockerLog {
  contents: any;
  Id: number;
  lockerNumber: string;
  status: string;
  studentNumber: string;
  full_program: string;

  user: {
    first_name: string;
    last_name: string;
    program: {
      program: string;
      department: {
        department: string;
        full_department: string;
      };
    };
    gender: string;
    id: number; // Add id property
  } | null; // Allow user property to be nullable
}


@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements OnInit {
  // Pagination variables
  pagedLogs: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  lockers: any[] = [];
  filteredLockers: any[] = [];
  searchQuery: string = '';
  showFilter = false;
  logs: any[] = []; // Assuming logs is an array to store locker log data
  totalItemsPerPage: number = 0; // New variable
  filterBy: string = 'all';
  selectedFilter: string = 'all';
  selectedDepartment = '';

  entriesPerPage = 10;
  activeFilter: string | undefined;

  
  

  trackByFn(index: number, log: any): number {
    return log.id || index; // Replace 'id' with the unique identifier of the log object
  }

  isLoading: boolean = true;
  private searchSubject = new Subject<string>();

  constructor(private lockerApiService: LockerApiService, private dialog: MatDialog, private snackBar: MatSnackBar) {}

  changeEntriesPerPage() {
    this.currentPage = 1;
    this.pageChanged(this.currentPage);
  }
  
  


  openTimeDetailsDialog(log: any): void {
    const dialogRef = this.dialog.open(TimeDetailsDialogComponent, {
      width: '500px', // I-adjust depende sa iyong preference
      data: { timeIn: log.time_in, timeOut: log.time_out, otherDetails: log.other_details }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      // Dito mo pwedeng i-handle ang anumang logic pagkatapos isara ang popup
    });
  }


  ngOnInit(): void {
    this.loadLockerLogs();
    this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.applySearch();
      this.getUsers();

    });
  }

  getUsers(): void {
    this.lockerApiService.getUsers(this.filterBy).subscribe(response => {
      this.filteredLockers  = response;
    });
  }

  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  loadLockerLogs() {
    this.lockerApiService.getUsers().subscribe(
      (data: any[]) => {
        console.log('Locker logs data:', data);
        this.logs = data;
        this.filteredLockers = data;
        this.totalItems = this.filteredLockers.length;
        this.totalItemsPerPage = Math.ceil(this.totalItems / this.itemsPerPage);

        this.updatePageData(); // Update page data after loading
        this.isLoading = false;
        console.log('isLoading:', this.isLoading);
      },
      (error: any) => {
        console.error('Error fetching locker logs:', error);
        this.isLoading = false;
      }
    );
  }

  pageChanged(event: any) {
    console.log('Page changed event:', event);
    this.currentPage = event;
    console.log('Current page in pageChanged:', this.currentPage);
    this.updatePageData();
  }

  updatePageData() {
    console.log('Updating page data...');
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    console.log('Start index:', startIndex);
    console.log('End index:', endIndex);
    this.pagedLogs = this.filteredLockers.slice(startIndex, endIndex);
    console.log('Paged logs:', this.pagedLogs);
    this.pagedLogs = this.filteredLockers.slice(startIndex, endIndex);
  }

  applySearch() {
    const query = this.searchQuery.trim().toLowerCase();
    console.log('Search query:', query);
    console.log('Logs:', this.logs);
    this.filteredLockers = query!== ''?
      this.logs.filter(log =>
        (log?.locker?.lockerNumber?.toLowerCase()?.includes(query)) ||
        (log.user?.first_name?.toLowerCase()?.includes(query)) ||
        (log.user?.last_name?.toLowerCase()?.includes(query)) ||
        (log.user?.department?.toLowerCase()?.includes(query)) ||
        (log.user?.student_id?.toLowerCase()?.includes(query)) ||
        (log.user?.gender?.toLowerCase()?.includes(query)) ||
        (log?.status?.toLowerCase()?.includes(query))
      ) :
      this.logs;
    console.log('Filtered Lockers:', this.filteredLockers);
    this.updatePageData();
  }

  // openFilter() {
  //   this.showFilter = true;
  //   this.applyFilter();
  // }

  // closeFilter() {
  //   this.showFilter = false;
  //   this.applyFilter();
  // }

  applyFilter(filterBy: string = 'all'): void {
        this.activeFilter = filterBy;

    this.filterBy = filterBy;
    this.currentPage = 1; // Reset current page to 1
    this.filteredLockers = []; // Reset filteredLockers
  
    // Convert time_in to Date objects
    this.logs = this.logs.map(log => ({
     ...log,
      time_in: new Date(log.time_in),
    }));
  
    switch (filterBy) {
      case 'today':
        this.filteredLockers = this.logs.filter(log => {
          const today = new Date();
          const logDate = log.time_in;
          return logDate.getDate() === today.getDate() &&
            logDate.getMonth() === today.getMonth() &&
            logDate.getFullYear() === today.getFullYear();
        });
        break;
      case 'week':
        const today = new Date();
        const firstDayOfWeek = today.getDate() - today.getDay() + (today.getDay() === 0? -6 : 1);
        const startOfWeek = new Date(today.setDate(firstDayOfWeek));
        startOfWeek.setHours(0, 0, 0, 0);
        this.filteredLockers = this.logs.filter(log => {
          const logDate = log.time_in;
          return logDate >= startOfWeek && logDate <= new Date();
        });
        break;
      case 'month':
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        this.filteredLockers = this.logs.filter(log => {
          const logDate = log.time_in;
          return logDate >= startOfMonth && logDate <= new Date();
        });
        break;
      case 'all':
      default:
        this.filteredLockers = this.logs.slice(); // Show all logs by default
        break;
    }
  
    // Format date strings to display "Philippine Standard Time"
    this.filteredLockers.forEach(log => {
      log.time_in = log.time_in.toLocaleString('en-PH', {
        timeZone: 'Asia/Manila',
        timeZoneName: 'short',
      });
    });
  
    this.totalItems = this.filteredLockers.length;
    this.totalItemsPerPage = Math.ceil(this.totalItems / this.itemsPerPage);
    this.updatePageData();
  }


  
  //start here para sa pag aayos//
downloadFile(type: string) {
  let data: Blob;
  let fileName: string;
  const currentDate = new Date();
  const formattedDate = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;

  switch (type) {
    case 'PDF':
      const pdfTableData = this.generatePDFContent();
      const doc = new jsPDF();

      // Add logo image to the PDF
      const logoImg = new Image();
      logoImg.src = '../assets/images/GC.png'; // Replace 'path/to/your/logo.png' with the actual path of your logo image
    
      // Wait for the image to load before adding it to the PDF
      logoImg.onload = () => {
        const LOGO_WIDTH = 27;
        const LOGO_HEIGHT = 27;
        const LOGO_X = 20;
        const LOGO_Y = 6;
    
        // Add logo to the first page
        doc.addImage(logoImg, 'PNG', LOGO_X, LOGO_Y, LOGO_WIDTH, LOGO_HEIGHT);
    
        const rightImage = new Image();
        rightImage.src = '../assets/images/library-logo.png'; // Replace this with the actual path of your right image
    
        rightImage.onload = () => {
          const RIGHT_IMAGE_WIDTH = 23;
          const RIGHT_IMAGE_HEIGHT = 23;
          const RIGHT_IMAGE_X = doc.internal.pageSize.getWidth() - RIGHT_IMAGE_WIDTH - 20; // Adjust the x coordinate to place the image on the right side
          const RIGHT_IMAGE_Y = 8;
    
          doc.addImage(rightImage, 'PNG', RIGHT_IMAGE_X, RIGHT_IMAGE_Y, RIGHT_IMAGE_WIDTH, RIGHT_IMAGE_HEIGHT);
    
          doc.setFontSize(10); // Set font size to 12
    
          // Add header content
          addHeader(doc);
    
          // Calculate the height of the header
          const headerHeight = 55;
    
          // Calculate the available width for the table
          const pageWidth = doc.internal.pageSize.getWidth();
          const pageMargin = 20; // Assuming a consistent margin of 20 on both sides
          const availableWidth = pageWidth - (pageMargin * 2) - LOGO_WIDTH - RIGHT_IMAGE_WIDTH;
    
          // Divide the available width equally among the table columns
          const columnWidths = Array(9).fill(availableWidth / 9);

          
    
          // Generate the table
         // Generate the table
        autoTable(doc, {
          head: [['Locker Number', 'First Name', 'Last Name', 'Student Number', 'Department','Program', 'Gender', 'Time In', 'Time Out']],
          body: pdfTableData,
          startY: headerHeight, // Adjust the startY to leave space for the header
          margin: {
            top: headerHeight, // Set the top margin to the height of the header
          },
          styles: {
            font: 'poppins',
            fontStyle: 'normal',
            fontSize: 10,
            textColor: 'black', // Text color remains black
            fillColor: [255, 255, 255], // Fill color for the whole table (white color)
          },
          headStyles: {
            fillColor: [49, 164, 99], // Green color for header background
            textColor: [255, 255, 255], // White color for header text
          },
          didDrawPage: (data) => {
            const pageNumber = data.pageNumber;
            const pdfPageWidth = doc.internal.pageSize.getWidth();
            const pdfPageHeight = doc.internal.pageSize.getHeight();
    
              // Add logo image to every page
              doc.setPage(pageNumber);
              doc.addImage(logoImg, 'PNG', LOGO_X, LOGO_Y, LOGO_WIDTH, LOGO_HEIGHT);
              doc.addImage(rightImage, 'PNG', RIGHT_IMAGE_X, RIGHT_IMAGE_Y, RIGHT_IMAGE_WIDTH, RIGHT_IMAGE_HEIGHT);
    
              addHeader(doc);
              generateFooterText(doc, pageNumber, pdfPageWidth, pdfPageHeight, this.filterBy, formattedDate);
            },
    
          });
    
          data = doc.output('blob');
          fileName = 'locker_report.pdf';
    
          if (data) {
            saveAs(data, fileName);
            this.snackBar.open('Downloading PDF file...', 'Close', { duration: 3000 });
          } else {
            console.error('Error generating PDF file data.');
          }
        };
      };
    
      break;
      case 'CSV':
        const csvContent = this.generateCSVContent(this.filterBy);
        data = new Blob([csvContent], { type: 'text/csv' });
        fileName = 'locker_report.csv';
        
        if (data) {
          saveAs(data, fileName);
        } else {
          console.error('Error generating CSV file data.');
        }
        break;
        case 'Excel':
          
        const excelContent = this.generateExcelContent(this.filterBy);
        const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(excelContent);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        fileName = 'locker_report.xlsx';
    
       if (data) {
          saveAs(data, fileName);
        } else {
          console.error('Error generating Excel file data.');
        }
        break;
      default:
        console.error('Invalid file type.');
        return;
    }
    function addHeader(doc: jsPDF) {
      doc.setFontSize(10);
      doc.text('Republic of the Philippines', doc.internal.pageSize.getWidth() / 2, 10, { align: 'center' });
      doc.text('City of Olongapo', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
    
      doc.setFont('helvetica', 'bold');
      doc.text('GORDO COLLEGE', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
      doc.setFont('helvetica', 'normal'); // Reset fontstyle to normal
    
      doc.text('Olongapo City Sports Complex, Donor St, East Tapinac, Olongapo City', doc.internal.pageSize.getWidth() / 2, 25, { align: 'center' });
      doc.text('Tel. No:(047) 224-2089 loc. 401', doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });
      doc.text('SUMMARY OF TOTALS AND USERS', doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });
    }
    
  
    function generateFooterText(doc: jsPDF, pageNumber: number, pdfPageWidth: number, pdfPageHeight: number, filterBy: string, formattedDate: string) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal'); // Reset font style to normal
      
      // Set text color to black
      doc.setDrawColor(0, 0, 0);
      
      // Set fill color to transparent black (0, 0, 0 with 0.1 opacity)
      doc.setFillColor(0, 0, 0, 0.1);
      
      doc.text(`Filter: ${filterBy}`, 160, pdfPageHeight - 8, { align: 'left' });
      doc.text(`Page ${pageNumber}  `, pdfPageWidth - 20, pdfPageHeight - 8, { align: 'right' });
    
      // Move "Generated on" below "SUMMARY OF TOTALS AND USERS"
      doc.text(`As of: ${formattedDate}`, doc.internal.pageSize.getWidth() / 2, 50, { align: 'center' });
    }
    
  }

  

  generatePDFContent(): any[][] {
    let content: any[][] = [];
    this.filteredLockers.forEach((log) => {
      content.push([
        log.locker?.lockerNumber,
        log.user?.first_name,
        log.user?.last_name,
        log.user?.id,
        log.user?.program?.department?.department ,
        log.user?.program?.program,
        log.user?.gender,
        log.time_in,
        log.time_out,
      ]);
    });
    return content;
  }

  generateCSVContent(filterBy: string = 'all'): string {
    let content = 'Locker Number,Full Name,College Department,College Program,Student Number,Gender,Time In,Time Out,Filter,Date Generated\n';
  
    this.filteredLockers.forEach(log => {
      const fullName = `${log.user?.first_name} ${log.user?.last_name}`;
      const department =  log.user?.program?.department?.department;
      const program =   log.user?.program?.program;
      const studentNumber = log.user?.id;
      const gender = log.user?.gender;
      const timeIn = log.time_in;
      const timeOut = log.time_out;
  
      content += `${log.locker?.lockerNumber},${fullName},${department},${program},${studentNumber},${gender},${timeIn},${timeOut},${filterBy},${new Date().toLocaleDateString()}\n`;
    });
  
    return content;
  }

  
generateExcelContent(filterBy: string = 'all'): any[] {
  let content: any[] = [['Locker Number', 'Full Name', 'College Department', 'College Program', 'Student Number', 'Gender', 'Time In', 'Time Out', 'Filter', 'Date Generated']];

  const filteredLogs = this.filteredLockers; // Use filteredLockers instead of logs

  filteredLogs.forEach(log => {
    const fullName = `${log.user?.first_name} ${log.user?.last_name}`;
    const department = log.user?.program?.department?.department;
    const program = log.user?.program?.program;
    const studentNumber = log.user?.id;
    const gender = log.user?.gender;
    const timeIn = log.time_in;
    const timeOut = log.time_out;

    content.push([log.locker?.lockerNumber, fullName, department, program, studentNumber, gender, timeIn, timeOut, filterBy, new Date().toLocaleDateString()]);
  });

  return content;
}

}
