import { Component, OnInit } from '@angular/core';
import * as saveAs from 'file-saver';
import { LockerApiService } from 'src/app/locker-services/locker-api.service';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import { UserOptions } from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { TimeDetailsDialogComponent } from 'src/app/components/time-details-dialog/time-details-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

interface LockerLog {
  contents: any;
  Id: number;
  locker_number: string;
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
  selectedFilter: string = 'all';
  selectedDepartment = '';
  entriesPerPage = 10;
  activeFilter: string | undefined;
  lockersData: any[] = [];
  startDate: any;
  endDate: any;
  showDateFilter: boolean = false;
  fromDateChange: Subject<any> = new Subject();
  toDateChange: Subject<any> = new Subject();
  fromDateChangeSubscription: Subscription | undefined;
  toDateChangeSubscription: Subscription | undefined;
  filterBy: string = ''; // O kung anuman ang default na value mo
  perPage: number = 10; // I-set ang default na value para sa perPage
  isLoading: boolean = false;
  fromDate: string | null = null;
  toDate: string | null = null;

  private searchSubject = new Subject<string>();

  constructor
  (private lockerApiService: LockerApiService, private dialog: MatDialog, private snackBar: MatSnackBar) { }

  getGenderLabel(genderValue: number): string {
    if (genderValue === null || genderValue === undefined) {
      return '';
    }
    return genderValue === 1 ? 'Male' : 'Female';
  }

  openTimeDetailsDialog(log: any): void {
    const dialogRef = this.dialog.open(TimeDetailsDialogComponent, {
      width: '500px',
      data: { timeIn: log.time_in, timeOut: log.time_out, otherDetails: log.other_details }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  ngOnInit(): void {
    this.loadLockerLogs(1, this.filterBy, 10, this.fromDate, this.toDate);
    this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.applySearch();
      this.getUsers();
    });
  }

  getUsers(page: number = 1, filterBy: string = this.filterBy, perPage: number = 10, fromDate: string | null = this.fromDate, toDate: string | null = this.toDate): void {
    this.lockerApiService.getUsers(page, filterBy, 10, fromDate, toDate).subscribe(response => {
      this.filteredLockers = response;
    });
  }

  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.entriesPerPage);
  }

  loadMore() {
    this.currentPage++;
    this.loadLockerLogs(this.currentPage, this.filterBy, 10, this.fromDate, this.toDate);
  }

  loadLockerLogs(page: number = 1, filterBy: string, perPage: number, fromDate: string | null, toDate: string | null): void {
    this.isLoading = true;
    this.lockerApiService.getUsers(page, filterBy, perPage, fromDate, toDate).subscribe(
      (response: any) => {
        if (page === 1) {
          this.filteredLockers = response.data; // Reset data for first page
          this.logs = response.data; // Save original logs data
        } else {
          this.filteredLockers = response.data; // Update data for subsequent pages
        }
        this.totalItems = response.total;
        this.totalItemsPerPage = response.per_page;
        this.currentPage = response.current_page;
        this.isLoading = false;
      },
      (error: any) => {
        console.error('Error fetching locker logs:', error);
        this.isLoading = false;
      }
    );
  }

  pageChanged(event: number, ): void {
    this.currentPage = event;
    this.loadLockerLogs(this.currentPage, this.filterBy, 10, this.fromDate, this.toDate);
  }

  updatePageData() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.pagedLogs = this.logs.slice(startIndex, endIndex);
    console.log('pagedLogs:', this.pagedLogs); // Add this console log
  }

  applySearch() {
    console.log('Applying search with query:', this.searchQuery);
    const query = this.searchQuery.toLowerCase();
    this.filteredLockers = query ?
      this.logs.filter(log => {
        const lockerNumber = log?.locker?.locker_number?.toLowerCase() || '';
        const firstName = log.user?.first_name?.toLowerCase() || '';
        const lastName = log.user?.last_name?.toLowerCase() || '';
        const department = log.user?.program?.department?.department?.toLowerCase() || '';
        const studentId = log.user?.id?.toString().toLowerCase() || '';
        const gender = this.getGenderLabel(log.user?.gender)?.toLowerCase() || '';
        const status = log?.status?.toLowerCase() || '';

        return lockerNumber.includes(query) ||
          firstName.includes(query) ||
          lastName.includes(query) ||
          department.includes(query) ||
          studentId.includes(query) ||
          gender.includes(query) ||
          status.includes(query);
      }) :
      this.logs;
    console.log('Filtered Lockers:', this.filteredLockers);
    this.updatePageData();
  }

  toggleDateFilter() {
    this.showDateFilter = !this.showDateFilter;
  }

  ngAfterViewInit() {
    this.fromDateChangeSubscription = this.fromDateChange.subscribe(() => {
      this.applyDateFilter();
    });

    this.toDateChangeSubscription = this.toDateChange.subscribe(() => {
      this.applyDateFilter();
    });
  }


  applyDateFilter() {
    if (this.fromDate && this.toDate) {
      const fromDateISO = new Date(this.fromDate).toISOString().split('T')[0];
      const toDateISO = new Date(this.toDate).toISOString().split('T')[0];
      this.filteredLockers = this.logs.filter(log => {
        const logTimestamp = new Date(log.time_in).getTime();
        return logTimestamp >= (this.fromDate ? new Date(this.fromDate).getTime() : 0) &&
          logTimestamp <= (this.toDate ? new Date(this.toDate).setHours(23, 59, 59, 999) : Date.now());
      });
      this.totalItems = this.filteredLockers.length;
      this.currentPage = 1;
      this.loadLockerLogs(this.currentPage, this.filterBy, 9999999, fromDateISO, toDateISO);
    }
  }


  clearDateFilter() {
    this.fromDate = null;
    this.toDate = null;
    this.filteredLockers = this.logs;
    this.totalItems = this.filteredLockers.length;
    this.currentPage = 1;
    this.loadLockerLogs(this.currentPage, this.filterBy, 10, null, null);
  }


  changeEntriesPerPage() {
    this.currentPage = 1;
    this.loadLockerLogs(this.currentPage, this.filterBy, 10, this.fromDate, this.toDate);
  }

  trackByFn(index: number, log: any): number {
    return log.id || index;
  }

  //start here para sa pag aayos//


downloadFile(type: string, department: string = '') {
  let data: Blob;
  let fileName: string;
  const currentDate = new Date();
  const formattedDate = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;

  switch (type) {
    case 'PDF':
      const pdfTableData = this.generatePDFContent(department);
      const doc = new jsPDF();

      const logoImg = new Image();
      logoImg.src = '../assets/images/GC.png';

      logoImg.onload = () => {
        const LOGO_WIDTH = 27;
        const LOGO_HEIGHT = 27;
        const LOGO_X = 20;
        const LOGO_Y = 6;

        doc.addImage(logoImg, 'PNG', LOGO_X, LOGO_Y, LOGO_WIDTH, LOGO_HEIGHT);

        const rightImage = new Image();
        rightImage.src = '../assets/images/library-logo.png';

        rightImage.onload = () => {
          const RIGHT_IMAGE_WIDTH = 23;
          const RIGHT_IMAGE_HEIGHT = 23;
          const RIGHT_IMAGE_X = doc.internal.pageSize.getWidth() - RIGHT_IMAGE_WIDTH - 20;
          const RIGHT_IMAGE_Y = 8;

          doc.addImage(rightImage, 'PNG', RIGHT_IMAGE_X, RIGHT_IMAGE_Y, RIGHT_IMAGE_WIDTH, RIGHT_IMAGE_HEIGHT);

          doc.setFontSize(10);

          addHeader(doc);

          const headerHeight = 55;
          const pageWidth = doc.internal.pageSize.getWidth();
          const pageMargin = 20;
          const availableWidth = pageWidth - (pageMargin * 2) - LOGO_WIDTH - RIGHT_IMAGE_WIDTH;
          const columnWidths = Array(9).fill(availableWidth / 9);

          autoTable(doc, {
            head: [['Locker Number', 'First Name', 'Last Name', 'Student Number', 'Department','Program', 'Gender', 'Time In', 'Time Out']],
            body: pdfTableData,
            startY: headerHeight,
            margin: {
              top: headerHeight,
            },
            styles: {
              font: 'Helvetica',
              fontStyle: 'normal',
              fontSize: 10,
              textColor: 'black',
              fillColor: [255, 255, 255],
            },
            headStyles: {
              fillColor: [49, 164, 99],
              textColor: [255, 255, 255],
            },
            didDrawPage: (data) => {
              const pageNumber = data.pageNumber;
              const pdfPageWidth = doc.internal.pageSize.getWidth();
              const pdfPageHeight = doc.internal.pageSize.getHeight();

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
    doc.setFont('helvetica', 'normal');

    doc.text('Olongapo City Sports Complex, Donor St, East Tapinac, Olongapo City', doc.internal.pageSize.getWidth() / 2, 25, { align: 'center' });
    doc.text('Tel. No:(047) 224-2089 loc. 401', doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });
    doc.text('SUMMARY OF TOTALS AND USERS', doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });
  }

  function generateFooterText(doc: jsPDF, pageNumber: number, pdfPageWidth: number, pdfPageHeight: number, filterBy: string, formattedDate: string) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setDrawColor(0, 0, 0);
    doc.setFillColor(0, 0, 0, 0.1);

    doc.text(`Filter: ${filterBy}`, 160, pdfPageHeight - 8, { align: 'left' });
    doc.text(`Page ${pageNumber}  `, pdfPageWidth - 20, pdfPageHeight - 8, { align: 'right' });

    doc.text(`As of: ${formattedDate}`, doc.internal.pageSize.getWidth() / 2, 50, { align: 'center' });
  }
}

isDepartmentAvailable(department: string): boolean {
  // Assuming filteredLockers contains the filtered data
  return this.filteredLockers.some(log => log.user?.program?.department_short === department);
}


generatePDFContent(department: string): any[][] {
  let content: any[][] = [];
  this.filteredLockers.forEach((log) => {
    if (!department || log.user?.program?.department_short === department) {
      content.push([
        log.locker?.locker_number,
        log.user?.first_name,
        log.user?.last_name,
        log.user?.id,
        log.user?.program?.department_short,
        log.user?.program?.program_short,
        this.getGenderLabel(log.user?.gender),
        log.time_in,
        log.time_out,
      ]);
    }
  });
  return content;
}

  
  
    generateCSVContent(filterBy: string = 'all'): string {
      let content = 'Locker Number,Full Name,College Department,College Program,Student Number,Gender,Time In,Time Out,Filter,Date Generated\n';
    
      this.filteredLockers.forEach(log => {
        const fullName = `${log.user?.first_name} ${log.user?.last_name}`;
        const department = log.user?.program?.department_short;
        const program = log.user?.program?.program_short;
        const studentNumber = log.user?.id;
        const gender = this.getGenderLabel(log.user?.gender); // Convert gender to string representation
        const timeIn = log.time_in;
        const timeOut = log.time_out;
    
        content += `${log.locker?.locker_number},${fullName},${department},${program},${studentNumber},${gender},${timeIn},${timeOut},${filterBy},${new Date().toLocaleDateString()}\n`;
      });
    
      return content;
    }
  
    generateExcelContent(filterBy: string = 'all'): any[] {
      let content: any[] = [['Locker Number', 'Full Name', 'College Department', 'College Program', 'Student Number', 'Gender', 'Time In', 'Time Out','Date Generated']];
    
      const filteredLogs = this.filteredLockers; // Use filteredLockers instead of logs
    
      filteredLogs.forEach(log => {
        const fullName = `${log.user?.first_name} ${log.user?.last_name}`;
        const department = log.user?.program?.department_short;
        const program = log.user?.program?.program_short;
        const studentNumber = log.user?.id;
        const gender = this.getGenderLabel(log.user?.gender); // Convert gender to string representation
        const timeIn = log.time_in;
        const timeOut = log.time_out;
    
        content.push([log.locker?.locker_number, fullName, department, program, studentNumber, gender, timeIn, timeOut,new Date().toLocaleDateString()]);
      });
    
      return content;
    }
  
  }