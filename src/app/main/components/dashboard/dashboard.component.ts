import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Chart } from 'chart.js';
import { LockerApiService } from 'src/app/locker-services/locker-api.service';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartGender') chartGender!: ElementRef;
  @ViewChild('chartDepartment') chartDepartment!: ElementRef;
  @ViewChild('chartLine') chartLine!: ElementRef;

  availableCount: number = 0;
  occupiedCount: number = 0;
  unavailableCount: number = 0;
  totalLockers: number = 0;
  totalUser: number = 0;
  counts: any;
  maleCount: number = 0;
  femaleCount: number = 0;
  ceasCount: number = 0;
  chtmCount: number = 0;
  cbaCount: number = 0;
  cahsCount: number = 0;
  ccsCount: number = 0;
  chartGenderInstance: Chart<"pie"> | undefined;
  chartDepartmentInstance: Chart<"pie"> | undefined;
  activeTab: 'gender' | 'department' = 'gender';
  userCount: any;
  totalUsers: any;
  todayUsers = 0;
  thisWeekUsers = 0;
  thisMonthUsers = 0;
  filterMenuOpen: boolean = false;
  selectedFilter: string = 'all';
  
  constructor(private lockerApiService: LockerApiService) {}

  toggleFilterMenu() {
    this.filterMenuOpen = !this.filterMenuOpen;
  }
  
  ngOnInit(): void {
    this.fetchLockerData();
  }

  ngAfterViewInit(): void {
    this.loadGenderChart();
    this.loadDepartmentChart();
  }

  ngOnDestroy(): void {
    if (this.chartGenderInstance) {
      this.chartGenderInstance.destroy();
    }
    if (this.chartDepartmentInstance) {
      this.chartDepartmentInstance.destroy();
    }
  }

  fetchLockerData() {
    this.lockerApiService.getLockerCounts(this.selectedFilter).subscribe(
      (counts) => {
        this.availableCount = counts.available;
        this.occupiedCount = counts.occupied;
        this.unavailableCount = counts.unavailable;
        this.totalLockers = counts.total;
        this.totalUsers = counts.totalUsers;
        this.totalUsers = counts.totalUsers;
        this.todayUsers = counts.todayUsers;
        this.thisWeekUsers = counts.thisWeekUsers;
        this.thisMonthUsers = counts.thisMonthUsers;
  
        this.animateCount('availableCount', 0, this.availableCount);
        this.animateCount('occupiedCount', 0, this.occupiedCount);
        this.animateCount('unavailableCount', 0, this.unavailableCount);
        this.animateCount('totalLockers', 0, this.totalLockers);
        this.animateCount('totalUsers', 0, this.totalUsers);
      },
      (error) => {
        console.error('Error fetching locker counts:', error);
      }
    );
  }
  
  onFilterChange() {
    this.fetchLockerData();
  }

  loadGenderChart(): void {
    this.lockerApiService.getdashboardGenderCounts().subscribe(
      (counts: any) => {
        this.maleCount = counts.maleCount;
        this.femaleCount = counts.femaleCount;
        this.updateGenderChart();
      },
      (error: any) => {
        console.error('Error fetching gender counts:', error);
      }
    );
  }

  loadDepartmentChart(): void {
    this.lockerApiService.getDepartmentCounts().subscribe(
      (counts: any) => {
        console.log('Department Counts:', counts); // I-log ang mga counts para sa debugging
        this.counts = counts; // Assign the fetched counts to the counts property

        this.ceasCount = counts.ceasCount;
        this.chtmCount = counts.chtmCount;
        this.cbaCount = counts.cbaCount;
        this.cahsCount = counts.cahsCount;
        this.ccsCount = counts.ccsCount;
        this.updateDepartmentChart();
      },
      (error: any) => {
        console.error('Error fetching department counts:', error);
      }
    );
  }

  updateGenderChart(): void {
    console.log('Chart Data:', this.ceasCount, this.chtmCount, this.cbaCount, this.cahsCount, this.ccsCount); // I-log ang chart data para sa debugging
  
    if (this.chartGender && this.chartGender.nativeElement) {
      const ctx = this.chartGender.nativeElement.getContext('2d');
      const chartData = [this.maleCount, this.femaleCount];
      const chartLabels = ['Male', 'Female'];
      if (this.chartGenderInstance) {
        this.chartGenderInstance.data.labels = chartLabels;
        this.chartGenderInstance.data.datasets[0].data = chartData;
        this.chartGenderInstance.update();
      } else {
        this.chartGenderInstance = new Chart<"pie">(ctx, {
          type: 'pie',
          data: {
            labels: chartLabels,
            datasets: [{
              label: 'Gender Distribution',
              data: chartData,
              backgroundColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
            }],
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
          },
        });
      }
    }
  }

  updateDepartmentChart(): void {
    if (this.chartDepartment && this.chartDepartment.nativeElement) {
      const ctx = this.chartDepartment.nativeElement.getContext('2d');
  
      const chartData = [
        this.counts.CEAS.departmentCount,
        this.counts.CHTM.departmentCount,
        this.counts.CBA.departmentCount,
        this.counts.CAHS.departmentCount,
        this.counts.CCS.departmentCount,
      ];
      const chartLabels = ['CEAS', 'CHTM', 'CBA', 'CAHS', 'CCS'];
  
      if (this.chartDepartmentInstance) {
        this.chartDepartmentInstance.data.labels = chartLabels;
        this.chartDepartmentInstance.data.datasets[0].data = chartData;
        this.chartDepartmentInstance.update();
      } else {
        this.chartDepartmentInstance = new Chart<"pie">(ctx, {
          type: 'pie', // Updated chart type to 'bar'
          data: {
            labels: chartLabels,
            datasets: [{
              label: 'Departments',
              data: chartData,
              backgroundColor: ['blue', 'pink', 'yellow', 'red', 'orange'],
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                display: true,
                title: {
                  display: true,
                  text: 'Department',
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
          },
        });
      }
    }
  }
  
  changeTab(tab: 'gender' | 'department'): void {
    this.activeTab = tab;
    if (this.activeTab === 'gender') {
      this.loadGenderChart();
    } else {
      this.loadDepartmentChart();
    }
  }
 
  animateCount(
    propertyName:
      | 'availableCount'
      | 'occupiedCount'
      | 'unavailableCount'
      | 'totalLockers'
      | 'totalUsers', // Idagdag ang 'totalUsers' sa property name
    from: number,
    to: number,
    duration: number = 1000,
    delayDuration: number = 0
  ) {
    const interval = 50; // Update interval in milliseconds
    const steps = Math.ceil(duration / interval); // Number of steps based on duration and interval
    const stepValue = (to - from) / steps; // Value to increment or decrement at each step
  
    let currentValue = from;
    const intervalId = setInterval(() => {
      currentValue += stepValue; // Increment or decrement the current value
  
      // Round the current value if it's not the final step
      const value = currentValue < to ? Math.round(currentValue) : to;
  
      // Update the property with the current value
      switch (propertyName) {
        case 'availableCount':
          this.availableCount = value;
          break;
        case 'occupiedCount':
          this.occupiedCount = value;
          break;
        case 'unavailableCount':
          this.unavailableCount = value;
          break;
        case 'totalLockers':
          this.totalLockers = value;
          break;
        case 'totalUsers': // Idagdag ang case para sa 'totalUsers'
          this.totalUsers = value;
          break;
        default:
          break;
      }
  
      if (
        (stepValue > 0 && currentValue >= to) ||
        (stepValue < 0 && currentValue <= to)
      ) {
        clearInterval(intervalId); // Stop the interval when reaching the target value
  
        // Ensure the property is set to the exact target value
        switch (propertyName) {
          case 'availableCount':
            this.availableCount = to;
            break;
          case 'occupiedCount':
            this.occupiedCount = to;
            break;
          case 'unavailableCount':
            this.unavailableCount = to;
            break;
          case 'totalLockers':
            this.totalLockers = to;
            break;
          case 'totalUsers': // Idagdag ang case para sa 'totalUsers'
            this.totalUsers = to;
            break;
          default:
            break;
        }
      }
    }, interval + delayDuration); // Add delay duration to the interval
  }
}