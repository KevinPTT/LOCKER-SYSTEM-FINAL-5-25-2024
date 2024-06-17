import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js';
import { LockerApiService } from 'src/app/locker-services/locker-api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf'; // Changed import statement
import { Observable, catchError, throwError } from 'rxjs';
import { TooltipItem, TooltipModel } from 'chart.js';
import 'chartjs-plugin-datalabels';
import { MatSelectChange } from '@angular/material/select';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import { UserOptions } from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import 'jspdf-autotable';
import Swal from 'sweetalert2';
import * as moment from 'moment';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements AfterViewInit, OnDestroy {
  chartData: any = {}; // Define chartData property
  getGenderChartData(): any {
    throw new Error('Method not implemented.');
  }
  getDepartmentChartData(): any {
    throw new Error('Method not implemented.');
  }
  selectedFileType: string = '';
  activeTab: 'gender' | 'department' = 'gender'; // Default active tab
  @ViewChild('chart1') chart1!: ElementRef;
  @ViewChild('chart2') chart2!: ElementRef;
  filterBy: string = 'all';
  selectedFilter: string = 'all';
  maleCount: number = 0;
  femaleCount: number = 0;
  ceasCount = 0;
  chtmCount = 0;
  cbaCount = 0;
  cahsCount = 0;
  ccsCount = 0;
  bacommCount = 0;
  bcaedCount = 0;
  becedCount = 0;
  beedCount = 0;
  bpedCount = 0;
  bsedBioCount = 0;
  bsedEngCount = 0;
  bsedFilCount = 0;
  bsedMathCount = 0;
  bsedMapedCount = 0;
  bsedSciCount = 0;
  bsedSocCount = 0;
  bsedProfedCount = 0;
  bshmCount = 0;
  bshrmCount = 0;
  bstmCount = 0;
  bsaCount = 0;
  bsbaFmCount = 0;
  bsbaHrmCount = 0;
  bscaCount = 0;
  bsmCount = 0;
  bsnCount = 0;
  bscsCount = 0;
  bsitCount = 0;
  bsemcCount = 0;
  actCount = 0;
  isProgramChartVisible = false;
  activeFilter: string = 'all';
  genderCounts: any = { maleCount: 0, femaleCount: 0 };
  ceasPrograms: any[] = []; // Initialize as an empty array
  ceasProgramCounts: any = {}; // Initialize ceasProgramCounts
  chtmProgramCounts: any = {};
  cbaProgramCounts: any = {};
  cahsProgramCounts: any = {};
  ccsProgramCounts: any = {};
  chart1Instance: Chart<"pie"> | undefined;
  chart2Instance: Chart<"bar"> | undefined;
  isLoading: boolean = false; // Add isLoading property
  showApplyButton: boolean = false; // Define showApplyButton property
  showDateFilter: boolean = false;
  fromDate: Date | null = null;
  toDate: Date | null = null;


  showDepartmentDateFilter: boolean = false;
  departmentFromDate: string | null = null;
  departmentToDate: string | null = null;


  
  
  constructor(private lockerApiService: LockerApiService, private snackBar: MatSnackBar, private cdRef: ChangeDetectorRef) { }
  

  
  ngAfterViewInit(): void {

    const storedTab = sessionStorage.getItem('activeTab');
    if (storedTab === 'department') {
      this.activeTab = 'department';
      this.loadDepartmentChart();
    } else {
      this.activeTab = 'gender'; 
    }
  
    if (this.activeTab === 'gender') {
      this.updateGenderCharts();
      
    } else {
      this.updateDepartmentCharts();
    }
  }
  
  changeTab(tab: 'gender' | 'department'): void {
    this.activeTab = tab;
  
    // Rest ng iyong existing logic
    if (this.activeTab === 'gender') {
      this.updateGenderCharts();
    } else {
      this.loadDepartmentChart();
      this.updateDepartmentCharts();
    }
  
    // I-set ang isProgramChartVisible base sa value ng activeTab
    this.isProgramChartVisible = this.activeTab !== 'gender';
  }
  
  
  
  downloadFile(fileType: string): void {
    this.selectedFileType = fileType;
    
    // Perform download logic here based on fileType (e.g., using file saver library)
    switch (fileType) {
      case 'png':
        this.downloadPNG();
        break;
      case 'svg':
        this.downloadSVG();
        break;
      case 'pdf':
        this.downloadPDF();
        break;
      default:
        // Handle unsupported file types
        console.error('Unsupported file type');
        this.snackBar.open('Error: Unsupported file type', 'Close', { duration: 3000 });
        break;
    }
  }
  
  downloadPNG(): void {
    const container1 = this.chart1.nativeElement.parentElement;
    const container2 = this.chart2.nativeElement.parentElement;
  
    // Determine the maximum width and height among the graphs
    const maxWidth = Math.max(container1.offsetWidth, container2.offsetWidth);
    const totalHeight = container1.offsetHeight + 20 + container2.offsetHeight + 150; // Add 20 pixels spacing and 150 pixels for the header
  
    const mergedCanvas = document.createElement('canvas');
    const context = mergedCanvas.getContext('2d') as CanvasRenderingContext2D;
  
    mergedCanvas.width = maxWidth;
    mergedCanvas.height = totalHeight;
  
    context.fillStyle = 'white'; // Set background color to white
    context.fillRect(0, 0, mergedCanvas.width, mergedCanvas.height); // Fill the entire canvas with the background color
  
    const logoImg = new Image();
    logoImg.src = '../assets/images/library-logo.png'; // Replace 'path/to/your/logo.png' with the actual path of your logo image
  
    logoImg.onload = () => {
      // Draw the logo image on the canvas
      context.drawImage(logoImg, 83, 20, 65, 65); // Adjust the position and size as needed
  
      // Header text
      context.font = '12px helvetica';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
  
      context.fillStyle = 'black'; // Set text color to black
  
      context.fillText('Republic of the Philippines', mergedCanvas.width / 2, 30);
      context.fillText('City of Olongapo', mergedCanvas.width / 2, 45);
  
      context.font = 'bold 12px helvetica';
      context.fillText('GORDON COLLEGE', mergedCanvas.width / 2, 60);
  
      context.font = '12px helvetica';
      context.fillText('Olongapo City Sports Complex, Donor St, East Tapinac, Olongapo City', mergedCanvas.width / 2, 75);
      context.fillText('Tel. No:(047) 224-2089 loc. 401', mergedCanvas.width / 2, 90);
  
      context.font = 'bold 12px helvetica';
      context.fillText('SUMMARY OF TOTALS AND USERS', mergedCanvas.width / 2, 110);
  
      // Draw the first graph below the header
      context.drawImage(container1.querySelector('canvas'), 0, 130, container1.offsetWidth, container1.offsetHeight);
  
      // Draw the second graph below with spacing
      context.drawImage(container2.querySelector('canvas'), 0, container1.offsetHeight + 150, container2.offsetWidth, container2.offsetHeight); // Add 20 pixels spacing below the first graph
  
      // Convert the canvas to a blob and save as PNG
      mergedCanvas.toBlob((blob) => {
        if (blob) {
          saveAs(blob, 'merged_chart.png');
          this.snackBar.open('Downloading PNG file', 'Close', { duration: 3000 });
        } else {
          console.error('Error generating PNG file');
          this.snackBar.open('Error generating PNG file', 'Close', { duration: 3000 });
        }
      });
    };
  }

  downloadBarChartAsPNG(): void {
    const container1 = this.chart1.nativeElement.parentElement;
  
    // Determine the width and height of the bar chart
    const chartWidth = container1.offsetWidth;
    const chartHeight = container1.offsetHeight;
  
    const chartCanvas = document.createElement('canvas');
    const chartContext = chartCanvas.getContext('2d') as CanvasRenderingContext2D;
  
    chartCanvas.width = chartWidth;
    chartCanvas.height = chartHeight;
  
    // Draw the bar chart on the canvas
    chartContext.drawImage(container1.querySelector('canvas'), 0, 0, chartWidth, chartHeight);
  
    // Convert the canvas to a blob and save as PNG
    chartCanvas.toBlob((blob) => {
      if (blob) {
        saveAs(blob, 'bar_chart.png');
        this.snackBar.open('Downloading bar chart as PNG', 'Close', { duration: 3000 });
      } else {
        console.error('Error generating PNG file');
        this.snackBar.open('Error generating PNG file', 'Close', { duration: 3000 });
      }
    });
  }
  
  downloadPieChartAsPNG(): void {
    const container2 = this.chart2.nativeElement.parentElement;
  
    // Determine the width and height of the pie chart
    const chartWidth = container2.offsetWidth;
    const chartHeight = container2.offsetHeight;
  
    const chartCanvas = document.createElement('canvas');
    const chartContext = chartCanvas.getContext('2d') as CanvasRenderingContext2D;
  
    chartCanvas.width = chartWidth;
    chartCanvas.height = chartHeight;
  
    // Draw the pie chart on the canvas
    chartContext.drawImage(container2.querySelector('canvas'), 0, 0, chartWidth, chartHeight);
  
    // Convert the canvas to a blob and save as PNG
    chartCanvas.toBlob((blob) => {
      if (blob) {
        saveAs(blob, 'pie_chart.png');
        this.snackBar.open('Downloading pie chart as PNG', 'Close', { duration: 3000 });
      } else {
        console.error('Error generating PNG file');
        this.snackBar.open('Error generating PNG file', 'Close', { duration: 3000 });
      }
    });
  }
  
  
  private getSVGString(element: HTMLElement): string {
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(element);
    return svgString;
  }
  
downloadSVG(): void {
  const container1 = this.chart1.nativeElement.parentElement;
  const container2 = this.chart2.nativeElement.parentElement;
  const svg1 = this.getSVGString(container1);
  const svg2 = this.getSVGString(container2);
  const mergedSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  mergedSVG.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  mergedSVG.setAttribute('width', `${Math.max(container1.offsetWidth, container2.offsetWidth)}`);
  mergedSVG.setAttribute('height', `${container1.offsetHeight + 20 + container2.offsetHeight}`);
  const svg1Doc = new DOMParser().parseFromString(svg1, 'image/svg+xml');
  const svg1Content = svg1Doc.documentElement;
  mergedSVG.appendChild(mergedSVG.ownerDocument.importNode(svg1Content, true));
  const svg2Doc = new DOMParser().parseFromString(svg2, 'image/svg+xml');
  const svg2Content = svg2Doc.documentElement;
  svg2Content.setAttribute('transform', `translate(0, ${container1.offsetHeight + 20})`);
  mergedSVG.appendChild(mergedSVG.ownerDocument.importNode(svg2Content, true));
  const svgString = new XMLSerializer().serializeToString(mergedSVG);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  setTimeout(() => {
    saveAs(blob, 'merged_chart.svg');
    this.snackBar.open('Downloading SVG file', 'Close', { duration: 3000 });
  }, 100);
}



downloadPDF(): void {
  if (!this.isProgramChartVisible) {
    const currentDate = new Date();
    const formattedDate = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;
    const pdf = new jsPDF();
    
    const headerImg = new Image();
    headerImg.src = '../assets/images/GC.png'; // Adjust path if necessary

    const newLogo = new Image();
    newLogo.src = '../assets/images/library-logo.png'; // Adjust path if necessary

    headerImg.onload = () => {
      pdf.addImage(headerImg, 'PNG', 20, 6, 30, 30);
      pdf.addImage(newLogo, 'PNG', pdf.internal.pageSize.getWidth() - 47, 6, 26, 26);

      pdf.setFont('helvetica');
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);

      pdf.text(`As of: ${formattedDate}`, 83, 45);

      pdf.text('Republic of the Philippines', pdf.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
      pdf.text('City of Olongapo', pdf.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

      pdf.setFont('helvetica', 'bold');
      pdf.text('GORDON COLLEGE', pdf.internal.pageSize.getWidth() / 2, 25, { align: 'center' });

      pdf.setFont('helvetica', 'normal');
      pdf.text('Olongapo City Sports Complex, Donor St, East Tapinac, Olongapo City', pdf.internal.pageSize.getWidth() / 2, 30, { align: 'center' });
      pdf.text('Tel. No:(047) 224-2089 loc. 401', pdf.internal.pageSize.getWidth() / 2, 35, { align: 'center' });

      pdf.setFont('helvetica', 'bold');

      if (this.activeTab === 'gender') {
        pdf.text('GENDER SUMMARY', pdf.internal.pageSize.getWidth() / 2, 55, { align: 'center' });

        const totalGenderCount = this.genderCounts.maleCount + this.genderCounts.femaleCount;
        const genderTableData = [
          ['Gender', 'Count', 'Percentage'],
          ['Male', this.genderCounts.maleCount.toString(), totalGenderCount > 0 ? `${((this.genderCounts.maleCount / totalGenderCount) * 100).toFixed(2)}%` : '0%'],
          ['Female', this.genderCounts.femaleCount.toString(), totalGenderCount > 0 ? `${((this.genderCounts.femaleCount / totalGenderCount) * 100).toFixed(2)}%` : '0%'],
        ];

        console.log('Gender Table Data:', genderTableData);


      autoTable(pdf, {
        head: genderTableData.slice(0, 1),
        body: genderTableData.slice(1),
        startY: 58,
        margin: { left: 20, right: 20 },
        headStyles: { fillColor: [0, 128, 0] } // Set the header color to green
      });
    } else {
      pdf.text('DEPARTMENT SUMMARY', pdf.internal.pageSize.getWidth() / 2, 55, { align: 'center' });

      const departmentTableData = [
        ['Department', 'Count', 'Percentage'],
        ['CEAS', this.ceasCount.toString(), `${((this.ceasCount / (this.ceasCount + this.chtmCount + this.cbaCount + this.cahsCount + this.ccsCount)) * 100).toFixed(2)}%`],
        ['CHTM', this.chtmCount.toString(), `${((this.chtmCount / (this.ceasCount + this.chtmCount + this.cbaCount + this.cahsCount + this.ccsCount)) * 100).toFixed(2)}%`],
        ['CBA', this.cbaCount.toString(), `${((this.cbaCount / (this.ceasCount + this.chtmCount + this.cbaCount + this.cahsCount + this.ccsCount)) * 100).toFixed(2)}%`],
        ['CAHS', this.cahsCount.toString(), `${((this.cahsCount / (this.ceasCount + this.chtmCount + this.cbaCount + this.cahsCount + this.ccsCount)) * 100).toFixed(2)}%`],
        ['CCS', this.ccsCount.toString(), `${((this.ccsCount / (this.ceasCount + this.chtmCount + this.cbaCount + this.cahsCount + this.ccsCount)) * 100).toFixed(2)}%`],
      ];

      autoTable(pdf, {
        head: departmentTableData.slice(0, 1),
        body: departmentTableData.slice(1),
        startY: 60,
        margin: { left: 20, right: 20 },
        headStyles: { fillColor: [0, 128, 0] } // Set the header color to green
      });

      const totalProgramCount =
      (this.ceasProgramCounts.BACOMM || 0) +
      (this.ceasProgramCounts.BCAED || 0) +
      (this.ceasProgramCounts.BECED || 0) +
      (this.ceasProgramCounts.BEED || 0) +
      (this.ceasProgramCounts.BPED || 0) +
      (this.ceasProgramCounts.BSEDBIO || 0) +
      (this.ceasProgramCounts.BSEDENG || 0) +
      (this.ceasProgramCounts.BSEDFIL || 0) +
      (this.ceasProgramCounts.BSEDMATH || 0) +
      (this.ceasProgramCounts.BSEDMAPEH || 0) +
      (this.ceasProgramCounts.BSEDSCI || 0) +
      (this.ceasProgramCounts.BSEDSOC || 0) +
      (this.ceasProgramCounts.BSEDPROFED || 0) +
      (this.chtmProgramCounts.BSHM || 0) +
      (this.chtmProgramCounts.BSHRM || 0) +
      (this.chtmProgramCounts.BSTM || 0) +
      (this.cbaProgramCounts.BSA || 0) +
      (this.cbaProgramCounts.BSBA || 0) +
      (this.cbaProgramCounts.BSBAHRM || 0) +
      (this.cbaProgramCounts.BSBAFM || 0) +
      (this.cahsProgramCounts.BSM || 0) +
      (this.cahsProgramCounts.BSN || 0) +
      (this.ccsProgramCounts.BSCS || 0) +
      (this.ccsProgramCounts.BSIT || 0) +
      (this.ccsProgramCounts.BSEMC || 0) +
      (this.ccsProgramCounts.ACT || 0);
    
          const programTableData = [
            ['Program', 'Count', 'Percentage'],
            ['BACOMM', this.ceasProgramCounts?.BACOMM?.toString() ?? '', totalProgramCount > 0 ? `${((this.ceasProgramCounts?.BACOMM || 0) / totalProgramCount * 100).toFixed(2)}%` : '0%'],
            ['BCAED', this.ceasProgramCounts?.BCAED?.toString() ?? '', totalProgramCount > 0 ? `${((this.ceasProgramCounts?.BCAED || 0) / totalProgramCount * 100).toFixed(2)}%` : '0%'],
            ['BECED', this.ceasProgramCounts?.BECED?.toString() ?? '', totalProgramCount > 0 ? `${((this.ceasProgramCounts?.BECED || 0) / totalProgramCount * 100).toFixed(2)}%` : '0%'],
            ['BEED', this.ceasProgramCounts?.BEED?.toString() ?? '', totalProgramCount > 0 ? `${((this.ceasProgramCounts?.BEED || 0) / totalProgramCount * 100).toFixed(2)}%` : '0%'],
            ['BPED', this.ceasProgramCounts?.BPED?.toString() ?? '', totalProgramCount > 0 ? `${((this.ceasProgramCounts?.BPED || 0) / totalProgramCount * 100).toFixed(2)}%` : '0%'],
            ['BSED-BIO', this.ceasProgramCounts?.BSEDBIO?.toString() ?? '', totalProgramCount > 0 ? `${((this.ceasProgramCounts?.BSEDBIO || 0) / totalProgramCount * 100).toFixed(2)}%` : '0%'],
            ['BSED-ENG', this.ceasProgramCounts?.BSEDENG?.toString() ?? '', totalProgramCount > 0 ? `${((this.ceasProgramCounts?.BSEDENG || 0) / totalProgramCount * 100).toFixed(2)}%` : '0%'],
            ['BSED-FIL', this.ceasProgramCounts?.BSEDFIL?.toString() ?? '', totalProgramCount > 0 ? `${((this.ceasProgramCounts?.BSEDFIL || 0) / totalProgramCount * 100).toFixed(2)}%` : '0%'],
            ['BSED-MATH', this.ceasProgramCounts?.BSEDMATH?.toString() ?? '', totalProgramCount > 0 ? `${((this.ceasProgramCounts?.BSEDMATH || 0) / totalProgramCount * 100).toFixed(2)}%` : '0%'],
            ['BSED-MAPEH', this.ceasProgramCounts?.BSEDMAPEH?.toString() ?? '', totalProgramCount > 0 ? `${((this.ceasProgramCounts?.BSEDMAPEH || 0) / totalProgramCount * 100).toFixed(2)}%` : '0%'],
            ['BSED-SCI', this.ceasProgramCounts?.BSEDSCI?.toString() ?? '', totalProgramCount > 0 ? `${((this.ceasProgramCounts?.BSEDSCI || 0) / totalProgramCount * 100).toFixed(2)}%` : '0%'],
            ['BSED-SOC', this.ceasProgramCounts?.BSEDSOC?.toString() ?? '', totalProgramCount > 0 ? `${((this.ceasProgramCounts?.BSEDSOC || 0) / totalProgramCount * 100).toFixed(2)}%` : '0%'],
            ['BSED-PROFED', this.ceasProgramCounts?.BSEDPROFED?.toString() ?? '', totalProgramCount > 0 ? `${((this.ceasProgramCounts?.BSEDPROFED || 0) / totalProgramCount * 100).toFixed(2)}%` : '0%'],
            ['BSHM', this.chtmProgramCounts?.BSHM?.toString() ?? '', totalProgramCount > 0 ? `${((this.chtmProgramCounts?.BSHM || 0) / totalProgramCount * 100).toFixed(2)}%` : '0%'],
            ['BSHRM', this.chtmProgramCounts?.BSHRM?.toString() ?? '', totalProgramCount > 0 ? `${((this.chtmProgramCounts?.BSHRM || 0) / totalProgramCount * 100).toFixed(2)}%` : '0%'],
            ['BSTM', this.chtmProgramCounts?.BSTM?.toString() ?? '', totalProgramCount > 0 ? `${((this.chtmProgramCounts?.BSTM || 0) / totalProgramCount * 100).toFixed(2)}%` : '0%'],
            ['BSA', this.cbaProgramCounts?.BSA?.toString() ?? '', totalProgramCount > 0 ? `${((this.cbaProgramCounts?.BSA || 0) / totalProgramCount * 100).toFixed(2)}%` : '0%'],
            ['BSBA-FM', this.cbaProgramCounts?.BSBAFM?.toString() ?? '', totalProgramCount > 0 ? `${((this.cbaProgramCounts?.BSBAFM || 0) / totalProgramCount * 100).toFixed(2)}%` : '0%'],
            ['BSBA-MKT', this.cbaProgramCounts?.BSBAMKT?.toString() ?? '', totalProgramCount > 0 ? `${((this.cbaProgramCounts?.BSBAHRM || 0) / totalProgramCount * 100).toFixed(2)}%` : '0%'],
            ['BSBAHRM', this.cbaProgramCounts?.BSBAHRM?.toString() ?? '', totalProgramCount > 0 ? `${((this.cbaProgramCounts?.BSBA || 0) / totalProgramCount * 100).toFixed(2)}%` : '0%'],
            ['BSCA', this.cbaProgramCounts?.BSBAMKT?.toString() ?? '', totalProgramCount > 0 ? `${((this.cbaProgramCounts?.BSBAMKT || 0) / totalProgramCount * 100).toFixed(2)}%` : '0%'],
            ['BSM', this.cahsProgramCounts?.BSM?.toString() ?? '', totalProgramCount > 0 ? `${((this.cahsProgramCounts?.BSM || 0) / totalProgramCount * 100).toFixed(2)}%` : '0%'],
            ['BSN', this.cahsProgramCounts?.BSN?.toString() ?? '', totalProgramCount > 0 ? `${((this.cahsProgramCounts?.BSN || 0) / totalProgramCount * 100).toFixed(2)}%` : '0%'],
            ['BSCS', this.ccsProgramCounts.BSCS || 0, totalProgramCount > 0 ? `${((this.ccsProgramCounts.BSCS || 0) / totalProgramCount * 100).toFixed(2)}%` : '0%'],
            ['BSIT', this.ccsProgramCounts.BSIT || 0, totalProgramCount > 0 ? `${((this.ccsProgramCounts.BSIT || 0) / totalProgramCount * 100).toFixed(2)}%` : '0%'],
            ['BSEMC', this.ccsProgramCounts.BSEMC || 0, totalProgramCount > 0 ? `${((this.ccsProgramCounts.BSEMC || 0) / totalProgramCount * 100).toFixed(2)}%` : '0%'],
            ['ACT', this.ccsProgramCounts.ACT || 0, totalProgramCount > 0 ? `${((this.ccsProgramCounts.ACT || 0) / totalProgramCount * 100).toFixed(2)}%` : '0%'],
          ];
        
        autoTable(pdf, {
          head: programTableData.slice(0, 1),
          body: programTableData.slice(1),
          margin: { left: 20, right: 20 },
          headStyles: { fillColor: [0, 128, 0] } // Set the header color to green

        });
    }

    pdf.save('summary_report.pdf');
    this.snackBar.open('Downloading PDF file', 'Close', { duration: 3000 });
  };
}
}


ngOnDestroy(): void {
  if (this.chart1Instance) {
    this.chart1Instance.destroy();
  }
  if (this.chart2Instance) {
    this.chart2Instance.destroy();
  }
}


loadGenderChart(period: string): void {
  this.isLoading = true; // Show loading spinner
  const params: any = { period };

  if (period === 'custom' && this.fromDate && this.toDate) {
    params.from_date = this.fromDate;
    params.to_date = this.toDate;
  }

  this.lockerApiService.getGenderCounts(params).subscribe(
    (response: any) => {
      console.log('Received gender counts:', response);
      this.genderCounts = response;
      this.updateGenderCharts();
      this.isLoading = false;
    },
    (error: any) => {
      console.error('Error fetching gender counts:', error);
      this.isLoading = false;
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to load gender chart data!',
        timer: 2000,
        showConfirmButton: false
      });
    }
  );
}

ngOnInit() {
  this.applyFilter('all');
}

onFilterChange(event: any): void {
  this.applyFilter(event.value);
}

toggleDateFilter(): void {
  this.showDateFilter = !this.showDateFilter;
}

checkDateInputs(): void {
  if (this.fromDate && this.toDate) {
    this.applyFilter('custom');
  }
}

applyDateFilter(): void {
  if (this.showApplyButton) {
    this.applyFilter('custom');
  }
}

applyFilter(filterBy: string = 'all'): void {
  this.activeFilter = filterBy;
  this.isLoading = true;

  const params: any = { period: filterBy };
  if (filterBy === 'custom' && this.fromDate && this.toDate) {
    params.from_date = this.fromDate;
    params.to_date = this.toDate;
  }

  console.log('Request parameters:', params);

  this.lockerApiService.getGenderCounts(params).subscribe(
    (data: any) => {
      console.log('Received gender counts:', data);
      this.genderCounts = data;
      this.loadGenderChart(this.activeFilter);
      this.isLoading = false;
    },
    (error: any) => {
      console.error('Error fetching gender counts:', error);
      this.isLoading = false;
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to load gender chart data!',
        timer: 2000,
        showConfirmButton: false
      });
    }
  );
}

clearDateFilter(): void {
  this.fromDate = null;
  this.toDate = null;
  this.showApplyButton = false;
  this.applyFilter('all');
}

updateGenderCharts(): void {
  // Ensure gender counts are numbers
  const maleCount = this.genderCounts.maleCount || 0;
  const femaleCount = this.genderCounts.femaleCount || 0;
  const total = maleCount + femaleCount;

  console.log('Male Count:', maleCount, 'Female Count:', femaleCount, 'Total:', total);

  // Calculate percentages
  const malePercentage = total > 0 ? (maleCount / total) * 100 : 0;
  const femalePercentage = total > 0 ? (femaleCount / total) * 100 : 0;

  console.log('Male Percentage:', malePercentage.toFixed(2), 'Female Percentage:', femalePercentage.toFixed(2));

  // Update Pie Chart
  const ctx1 = this.chart1.nativeElement.getContext('2d');
  if (this.chart1Instance) {
    this.chart1Instance.destroy();
  }
  this.chart1Instance = new Chart<'pie'>(ctx1, {
    type: 'pie',
    data: {
      labels: ['Male', 'Female'],
      datasets: [
        {
          data: [maleCount, femaleCount],
          backgroundColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: (tooltipItem: TooltipItem<'pie'>): string[] => {
              const currentValue = tooltipItem.raw as number;
              const percentage = ((currentValue / total) * 100).toFixed(2);
              return [`${currentValue} (${percentage}%)`];
            },
          },
        },
      },
    },
  });

  // Update Bar Chart
  const ctx2 = this.chart2.nativeElement.getContext('2d');
  if (this.chart2Instance) {
    this.chart2Instance.destroy();
  }
  this.chart2Instance = new Chart<'bar'>(ctx2, {
    type: 'bar',
    data: {
      labels: ['Male', 'Female'],
      datasets: [
        {
          label: '# of using locker',
          data: [maleCount, femaleCount],
          backgroundColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Gender',
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Count',
          },
          beginAtZero: true,
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (tooltipItem: TooltipItem<'bar'>): string[] => {
              const currentValue = tooltipItem.raw as number;
              const percentage = ((currentValue / total) * 100).toFixed(2);
              return [`${currentValue} (${percentage}%) of ${total}`];
            },
          },
        },
        legend: {
          display: false,
        },
      },
    },
  });
}



//DEPARTMENT CHART
applyDepartmentFilter(filterBy: string = 'all'): void {
  this.isLoading = true;

  const params: any = { period: filterBy };
  if (filterBy === 'custom' && this.departmentFromDate && this.departmentToDate) {
    params.from_date = this.departmentFromDate;
    params.to_date = this.departmentToDate;
  }

  console.log('Request parameters for department:', params);

  this.lockerApiService.getDepartmentCounts(params).subscribe(
    (counts: any) => {
      console.log('API Response:', counts); // Log the API response
      this.updateCounts(counts);
      this.isLoading = false;
    },
    (error: any) => {
      console.error('Error fetching department counts:', error);
      this.isLoading = false;
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to load department chart data!',
        timer: 2000,
        showConfirmButton: false
      });
    }
  );
}
updateCounts(counts: any): void {
  console.log('Updating counts with data:', counts); // Add logging here to verify counts
  this.ceasCount = counts.CEAS?.departmentCount ?? 0;
  this.ceasProgramCounts = counts.CEAS?.programCounts ?? {};

  this.chtmCount = counts.CHTM?.departmentCount ?? 0;
  this.chtmProgramCounts = counts.CHTM?.programCounts ?? {};

  this.cbaCount = counts.CBA?.departmentCount ?? 0;
  this.cbaProgramCounts = counts.CBA?.programCounts ?? {};

  this.cahsCount = counts.CAHS?.departmentCount ?? 0;
  this.cahsProgramCounts = counts.CAHS?.programCounts ?? {};

  this.ccsCount = counts.CCS?.departmentCount ?? 0;
  this.ccsProgramCounts = counts.CCS?.programCounts ?? {};

  this.updateDepartmentCharts();
}




toggleDepartmentDateFilter(): void {
  this.showDepartmentDateFilter = !this.showDepartmentDateFilter;
}

checkDepartmentDateInputs(): void {
  if (this.departmentFromDate && this.departmentToDate) {
    this.applyDepartmentFilter('custom');
  }
}

clearDepartmentDateFilter(): void {
  this.departmentFromDate = null;
  this.departmentToDate = null;
  this.applyDepartmentFilter('all');
}



loadDepartmentChart(): void {
  console.log('counts')
  this.lockerApiService.getDepartmentCounts().subscribe(
    (counts: any) => {
      if (counts && counts.CEAS && counts.CEAS.departmentCount !== undefined) {
        this.ceasCount = counts.CEAS.departmentCount;
        this.ceasProgramCounts = counts.CEAS.programCounts;
      }
      if (counts && counts.CHTM && counts.CHTM.departmentCount !== undefined) {
        this.chtmCount = counts.CHTM.departmentCount;
        this.chtmProgramCounts = counts.CHTM.programCounts;
      }
      if (counts && counts.CBA && counts.CBA.departmentCount !== undefined) {
        this.cbaCount = counts.CBA.departmentCount;
        this.cbaProgramCounts = counts.CBA.programCounts;
      }
      if (counts && counts.CAHS && counts.CAHS.departmentCount !== undefined) {
        this.cahsCount = counts.CAHS.departmentCount;
        this.cahsProgramCounts = counts.CAHS.programCounts;
      }
      if (counts && counts.CCS && counts.CCS.departmentCount !== undefined) {
        this.ccsCount = counts.CCS.departmentCount;
        this.ccsProgramCounts = counts.CCS.programCounts;
        console.log(this.ccsProgramCounts.BSIT)
      }
      this.updateDepartmentCharts();
      this.activeTab = 'department'; // Set active tab
    },
    (error: any) => {
      console.error('Error fetching college counts:', error);
    }
  );
}

updateDepartmentCharts(): void {
  // Destroy existing chart instances if they exist
  this.isProgramChartVisible = false;

  if (this.chart1Instance) {
    this.chart1Instance.destroy();
  }
  if (this.chart2Instance) {
    this.chart2Instance.destroy();
  }

  // Create new instances of charts
  const ctx1 = this.chart1.nativeElement.getContext('2d');
  const total = this.ceasCount + this.chtmCount + this.cbaCount + this.cahsCount + this.ccsCount;
  this.chart1Instance = new Chart(ctx1, {
    type: 'pie',
    data: {
      labels: ['CEAS', 'CHTM', 'CBA', 'CAHS', 'CCS'],
      datasets: [
        {
          label: '# of Votes',
          data: [this.ceasCount, this.chtmCount, this.cbaCount, this.cahsCount, this.ccsCount],
          backgroundColor: ['blue', 'pink', 'yellow', 'red', 'orange'],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      onClick: (event, chartElements) => {
        if (chartElements && chartElements.length > 0) {
          const index = chartElements[0].index;
          let selectedDepartment = '';
          switch (index) {
            case 0: // CEAS is clicked
              selectedDepartment = 'CEAS';
              break;
            case 1: // CHTM is clicked
              selectedDepartment = 'CHTM';
              break;
            case 2: // CBA is clicked
              selectedDepartment = 'CBA';
              break;
            case 3: // CAHS is clicked
              selectedDepartment = 'CAHS';
              break;
            case 4: // CCS is clicked
              selectedDepartment = 'CCS';
              break;
            default:
              break;
          }
          if (selectedDepartment !== '') {
            this.filterDepartment(selectedDepartment);
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (tooltipItem: TooltipItem<'pie'>): string[] => {
              const currentValue = tooltipItem.datasetIndex === 0 ? tooltipItem.parsed : 0;
              const percentage = ((currentValue / total) * 100).toFixed(2);
              return [`${currentValue} (${percentage}%)`];
            },
          },
        },
      },
    },
  });

  // Update the bar chart as well
  this.updateBarChart();
}

updateBarChart(): void {
  // Destroy existing chart instance if it exists
  if (this.chart2Instance) {
    this.chart2Instance.destroy();
  }

  const ctx2 = this.chart2.nativeElement.getContext('2d');
  this.chart2Instance = new Chart(ctx2, {
    type: 'bar',
    data: {
      labels: ['CEAS', 'CHTM', 'CBA', 'CAHS', 'CCS'],
      datasets: [
        {
          label: 'DEPARTMENT',
          data: [this.ceasCount, this.chtmCount, this.cbaCount, this.cahsCount, this.ccsCount],
          backgroundColor: ['blue', 'pink', 'yellow', 'red', 'orange'],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: (tooltipItem: TooltipItem<'bar'>): string[] => {
              const dataset = tooltipItem.dataset;
              if (dataset) {
                const currentValue = dataset.data[tooltipItem.dataIndex!] as number;
                // Ensure total is not null before using it
                const total = dataset.data.reduce((prev, curr) => {
                  if (typeof prev === 'number' && typeof curr === 'number') {
                    return prev + curr;
                  }
                  return prev || 0;
                }, 0);
                if (typeof total === 'number' && total > 0) {
                  const percentage = ((currentValue / total) * 100).toFixed(2);
                  return [`${currentValue} (${percentage}%)`];
                } else {
                  return [`${currentValue} (0%)`];
                }
              }
              return [];
            },
          },
        },
      },
    },
  });
}

filterDepartment(department: string): void {
  this.fetchProgramCounts(department).subscribe(
    (programCountsArray: any[]) => {
      switch (department) {
        case 'CEAS':
          this.ceasProgramCounts = programCountsArray;
          this.updateCEASProgramsChart();
          this.updatePieChart(department, this.ceasProgramCounts);
          break;
        case 'CHTM':
          this.chtmProgramCounts = programCountsArray;
          this.updateCHTMProgramsChart();
          this.updatePieChart(department, this.chtmProgramCounts);
          break;
        case 'CBA':
          this.cbaProgramCounts = programCountsArray;
          this.updateCBAProgramsChart();
          this.updatePieChart(department, this.cbaProgramCounts);
          break;
        case 'CAHS':
          this.cahsProgramCounts = programCountsArray;
          this.updateCAHSProgramsChart();
          this.updatePieChart(department, this.cahsProgramCounts);
          break;
        case 'CCS':
          this.ccsProgramCounts = programCountsArray;
          this.updateCCSProgramsChart();
          this.updatePieChart(department, this.ccsProgramCounts);
          break;
        default:
          // Handle default case
          break;
      }
      this.isProgramChartVisible = true; // Set flag to true when program chart is displayed
    },
    (error: any) => {
      console.error(`Error fetching ${department} program counts:`, error);
    }
  );
}


updatePieChart(department: string, programCounts: any[]): void {
  if (this.chart1Instance) {
    this.chart1Instance.destroy();
  }

  const labels = programCounts.map(program => program.label);
  const data = programCounts.map(program => program.count);
  let backgroundColors = this.generateColorsForDepartments([department]); // Gamitin ang function para kumuha ng tamang kulay

  const ctx1 = this.chart1.nativeElement.getContext('2d');
  this.chart1Instance = new Chart(ctx1, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [
        {
          label: '# of Votes',
          data: data,
          backgroundColor: backgroundColors,
        },
      ],
    },
    options: {
      plugins: {
        tooltip: {
          callbacks: {
            label: (tooltipItem: TooltipItem<'pie'>): string[] => {
              const label = labels[tooltipItem.dataIndex!] || '';
              const dataset = tooltipItem.dataset;
              if (dataset) {
                const currentValue = dataset.data[tooltipItem.dataIndex!] as number;
                const total = dataset.data.reduce((prev: number, curr: number) => prev + curr, 0);
                const percentage = total > 0 ? ((currentValue / total) * 100).toFixed(2) : 0;
                return [`${label}: ${currentValue} (${percentage}%)`]; // display label, value, and percentage
              }
              return [];
            },
          },
        },
      },
    },
  });
}



///dito start sa program aayusin



fetchProgramCounts(department: string): Observable<any> {
  return new Observable((observer) => {
    this.lockerApiService.getDepartmentCounts().subscribe(
      (collegeCounts: any) => {
        const departmentProgramCounts = collegeCounts[department]?.programCounts;
        if (departmentProgramCounts && typeof departmentProgramCounts === 'object') {
          const programCountsArray = Object.keys(departmentProgramCounts).map((programLabel: string) => ({
            label: programLabel,
            count: departmentProgramCounts[programLabel],
          }));
          observer.next(programCountsArray);
          observer.complete();
        } else {
          console.error('Invalid program counts data format:', departmentProgramCounts);
          observer.error('Invalid program counts data format');
        }
      },
      (error: any) => {
        console.error('Error fetching program counts:', error);
        observer.error(error);
      }
    );
  });
}

generateColorsForDepartments(departments: string[]): string[] {
  const colors = [];
  for (let i = 0; i < departments.length; i++) {
    const department = departments[i];
    let color = '';
    switch (department) {
      case 'CEAS':
        color = 'blue';
        break;
      case 'CHTM':
        color = 'pink';
        break;
      case 'CBA':
        color = 'yellow';
        break;
      case 'CAHS':
        color = 'red';
        break;
      case 'CCS':
        color = 'orange';
        break;
      default:
        color = '#' + Math.floor(Math.random() * 16777215).toString(16); // Generate random color for unknown departments
        break;
    }
    colors.push(color);
  }
  return colors;
}


updateCAHSProgramsChart(): void {
  if (this.chart2Instance) {
    this.chart2Instance.destroy();
  }

  interface ProgramItem {
    label: string;
    count: number;
  }

  const ctx = this.chart2.nativeElement.getContext('2d');
  const chartData = this.cahsProgramCounts.map((program: ProgramItem) => program.count);
  const chartLabels = this.cahsProgramCounts.map((program: ProgramItem) => program.label);
  const total = chartData.reduce((a: number, b: number) => a + b, 0);

  this.chart2Instance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: chartLabels,
      datasets: [
        {
          label: 'CAHS Programs',
          data: chartData,
          backgroundColor: ['red'],

          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: (tooltipItem: TooltipItem<'bar'>): string[] => {
              const currentValue = chartData[tooltipItem.dataIndex];
              const percentage = ((currentValue / total) * 100).toFixed(2);
              return [`${currentValue} (${percentage}%)`];
            },
          },
        },
      },
    },
  });
}



updateCCSProgramsChart(): void {
  if (this.chart2Instance) {
    this.chart2Instance.destroy();
  }

  interface ProgramItem {
    label: string;
    count: number;
  }

  const ctx = this.chart2.nativeElement.getContext('2d');
  const chartData = this.ccsProgramCounts.map((program: ProgramItem) => program.count);
  const chartLabels = this.ccsProgramCounts.map((program: ProgramItem) => program.label);
  const total = chartData.reduce((a: number, b: number) => a + b, 0);
  this.chart2Instance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: chartLabels,
      datasets: [
        {
          label: 'CCS Programs',
          data: chartData,
          backgroundColor: ['orange'],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: (tooltipItem: TooltipItem<'bar'>): string[] => {
              const currentValue = chartData[tooltipItem.dataIndex];
              const percentage = ((currentValue / total) * 100).toFixed(2);
              return [`${currentValue} (${percentage}%)`];
            },
          },
        },
      },
    },
  });
}

updateCBAProgramsChart(): void {
  if (this.chart2Instance) {
    this.chart2Instance.destroy();
  }

  interface ProgramItem {
    label: string;
    count: number;
  }

  const ctx = this.chart2.nativeElement.getContext('2d');
  const chartData = this.cbaProgramCounts.map((program: ProgramItem) => program.count);
  const chartLabels = this.cbaProgramCounts.map((program: ProgramItem) => program.label);
  const total = chartData.reduce((a: number, b: number) => a + b, 0);

  this.chart2Instance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: chartLabels,
      datasets: [
        {
          label: 'CBA Programs',
          data: chartData,
          backgroundColor: ['yellow'],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: (tooltipItem: TooltipItem<'bar'>): string[] => {
              const currentValue = chartData[tooltipItem.dataIndex];
              const percentage = ((currentValue / total) * 100).toFixed(2);
              return [`${currentValue} (${percentage}%)`];
            },
          },
        },
      },
    },
  });
}

updateCHTMProgramsChart(): void {
  if (this.chart2Instance) {
    this.chart2Instance.destroy();
  }

  interface ProgramItem {
    label: string;
    count: number;
  }

  const ctx = this.chart2.nativeElement.getContext('2d');
  const chartData = this.chtmProgramCounts.map((program: ProgramItem) => program.count);
  const chartLabels = this.chtmProgramCounts.map((program: ProgramItem) => program.label);
  const total = chartData.reduce((a: number, b: number) => a + b, 0);

  this.chart2Instance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: chartLabels,
      datasets: [
        {
          label: 'CHTM Programs',
          data: chartData,
          backgroundColor: ['pink'],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: (tooltipItem: TooltipItem<'bar'>): string[] => {
              const currentValue = chartData[tooltipItem.dataIndex];
              const percentage = ((currentValue / total) * 100).toFixed(2);
              return [`${currentValue} (${percentage}%)`];
            },
          },
        },
      },
    },
  });
}

updateCEASProgramsChart(): void {
  if (this.chart2Instance) {
    this.chart2Instance.destroy();
  }

  interface ProgramItem {
    label: string;
    count: number;
  }

  const ctx = this.chart2.nativeElement.getContext('2d');
  const chartData = this.ceasProgramCounts.map((program: ProgramItem) => program.count);
  const chartLabels = this.ceasProgramCounts.map((program: ProgramItem) => program.label);
  const total = chartData.reduce((a: number, b: number) => a + b, 0);

  this.chart2Instance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: chartLabels,
      datasets: [
        {
          label: 'CEAS Programs',
          data: chartData,
          backgroundColor: ['blue'],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: (tooltipItem: TooltipItem<'bar'>): string[] => {
              const currentValue = chartData[tooltipItem.dataIndex];
              const percentage = ((currentValue / total) * 100).toFixed(2);
              return [`${currentValue} (${percentage}%)`];
            },
          },
        },
      },
    },
  });
}
}