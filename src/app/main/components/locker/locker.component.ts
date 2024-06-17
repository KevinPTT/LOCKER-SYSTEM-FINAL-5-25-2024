import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LockerPopupDetailsComponent } from 'src/app/components/locker-popup-details/locker-popup-details.component';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { LockerApiService } from 'src/app/locker-services/locker-api.service';

@Component({
  selector: 'app-locker',
  templateUrl: './locker.component.html',
  styleUrls: ['./locker.component.scss']
})
export class LockerComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('barcodeInput') barcodeInput!: ElementRef;
  @ViewChild('sortDropdown') sortDropdown!: ElementRef;

  lockerCount: number = 0;
  isLoading: boolean = true;
  lockers: Locker[] = [];
  CHUNK_SIZE: number = 100;

  filteredLockers: Locker[] = [];
  selectedSort = 'all';

  barcodeValue: string = '';
  typingTimer: any;
  isPopupOpen: boolean = false;
  lastScannedStudentNumber: string = '';

  constructor(private dialog: MatDialog, private lockerApiService: LockerApiService, private router: Router) {}

  async ngOnInit(): Promise<void> {
    await this.loadLockers();
    this.applySort('all');

    document.body.addEventListener('click', this.handleBodyClick.bind(this));
    this.loadLockersInfoFromSession();

  }



  loadLockersInfoFromSession() {
    const lockerInfoArrayString = sessionStorage.getItem('lockersInfo');
    if (lockerInfoArrayString) {
        const lockerInfoArray = JSON.parse(lockerInfoArrayString);
        lockerInfoArray.forEach((lockerInfo: any) => {
            const locker = this.lockers.find(lock => lock.Id === lockerInfo.Id);
            if (locker) {
                locker.studentNumber = lockerInfo.studentNumber;
                locker.status = lockerInfo.status;
                locker.user = lockerInfo.user;
                locker.imageSrc = this.getLockerImage(lockerInfo.status);
            }
        });
    }
}


  ngAfterViewInit() {
    this.focusBarcodeInput();
  }

  navigateToAddLocker() {
    this.router.navigate(['./main/locker/addlocker']);
  }

  handleBodyClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!this.isPopupOpen && !this.isClickInsideSortDropdown(target)) {
      this.focusBarcodeInput();
    }
  }

  isRemarksPresent(locker: Locker): boolean {
    return locker.remarks != null && locker.remarks.trim().length > 0;
  }

  isClickInsideSortDropdown(target: HTMLElement): boolean {
    const sortDropdown = document.querySelector('.sort-container');
    return !!sortDropdown && sortDropdown.contains(target);
  }

  focusBarcodeInput() {
    if (this.barcodeInput) {
      this.barcodeInput.nativeElement.focus();
    }
  }

  ngOnDestroy(): void {
    document.body.removeEventListener('click', this.handleBodyClick.bind(this));
  }

  applySort(sortBy: string) {
    switch (sortBy) {
      case 'available':
        this.filteredLockers = this.lockers.filter((locker) => locker.status.toLowerCase() === 'available');
        break;
      case 'occupied':
        this.filteredLockers = this.lockers.filter((locker) => locker.status.toLowerCase() === 'occupied');
        break;
      case 'unavailable':
        this.filteredLockers = this.lockers.filter((locker) => locker.status.toLowerCase() === 'unavailable');
        break;
      default:
        this.filteredLockers = this.lockers;
    }
  }

  async loadLockers(): Promise<void> {
    this.isLoading = true;
    try {
      const lockers = await this.lockerApiService.getAllLockers().toPromise();
      this.lockers = lockers.map((locker: Locker) => ({
        ...locker,
        remarks: locker.remarks || ''
      }));
      this.filteredLockers = this.lockers;
    } catch (error) {
      console.error('Error fetching lockers:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async scanLocker(locker: Locker, studentNumber: string): Promise<void> {
    try {
        const response: any = await this.lockerApiService.scanLocker(locker.Id, `StudentNumber:${studentNumber}`).toPromise();

        if (response.status === 'Occupied') {
            const occupiedLocker = this.lockers.find(lock => lock.Id === response.lockerId);
            if (occupiedLocker) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: `You are currently occupying locker ${occupiedLocker.locker_number}.`,
                    timer: 2000,
                    showConfirmButton: false,
                });
                return;
            }
        }

        if (response.status === 'Occupied') {
            locker.studentNumber = studentNumber;
            locker.status = response.status;
            locker.user = response.user;
            locker.imageSrc = this.getLockerImage(response.status);

            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: `Logged in successfully! Locker Number: ${locker.locker_number}`,
                timer: 2000,
                showConfirmButton: false,
            });

            // Get current lockers from session storage
            const lockerInfoArray = JSON.parse(sessionStorage.getItem('lockersInfo') || '[]');

            // Update or add the locker info
            const existingLockerIndex = lockerInfoArray.findIndex((l: any) => l.Id === locker.Id);
            if (existingLockerIndex !== -1) {
                lockerInfoArray[existingLockerIndex] = locker;
            } else {
                lockerInfoArray.push(locker);
            }

            // Store updated lockers info in session storage
            sessionStorage.setItem('lockersInfo', JSON.stringify(lockerInfoArray));
        } else if (response.status === 'Available') {
            locker.studentNumber = '';
            locker.status = response.status;
            locker.user = null;
            locker.imageSrc = this.getLockerImage(response.status);

            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: `Logged out successfully! Locker Number: ${locker.locker_number}`,
                timer: 2000,
                showConfirmButton: false,
            });

            // Get current lockers from session storage
            const lockerInfoArray = JSON.parse(sessionStorage.getItem('lockersInfo') || '[]');

            // Remove the locker info
            const updatedLockerInfoArray = lockerInfoArray.filter((l: any) => l.Id !== locker.Id);

            // Store updated lockers info in session storage
            sessionStorage.setItem('lockersInfo', JSON.stringify(updatedLockerInfoArray));
        } else if (response.error) {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: response.error,
                timer: 2000,
                showConfirmButton: false,
            });
            console.error('Error response from API:', response);
        } else {
            console.log('Unexpected response:', response);
        }
    } catch (error: any) {
        console.error('Error scanning QR code:', error);

        let errorMessage = 'Failed to scan locker.';
        if (error?.status === 400 && error?.error?.error === 'User is already occupying another locker') {
            errorMessage = `You are currently occupying locker ${error.error.occupiedLocker}.`;
        } else if (error?.status === 400 && error?.error?.error === 'User ID doesn\'t match') {
            errorMessage = 'StudentNumber doesn\'t match.';
        } else if (error?.error?.message) {
            errorMessage = error.error.message;
        }

        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: errorMessage,
            timer: 2000,
            showConfirmButton: false,
        });
    } finally {
        this.isLoading = false;
        this.barcodeValue = '';
        this.applySort(this.selectedSort);
        this.focusBarcodeInput();
    }
}




  onBarcodeValueChange(newValue: string): void {
    clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(() => {
      if (newValue) {
        this.lastScannedStudentNumber = newValue;
        const occupiedLocker = this.lockers.find(locker => locker.status === 'Occupied' && locker.studentNumber === newValue);
        if (occupiedLocker) {
          this.scanLocker(occupiedLocker, newValue);
        } else {
          const availableLocker = this.lockers.find(locker => locker.status === 'Available');
          if (availableLocker) {
            this.scanLocker(availableLocker, newValue);
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: 'No available lockers to scan.',
              timer: 2000,
              showConfirmButton: false,
            });
            this.barcodeValue = '';
            this.focusBarcodeInput();
          }
        }
        this.barcodeValue = '';
        this.focusBarcodeInput();
      }
    }, 100);
  }

  openPopup(locker_number: number): void {
    this.isPopupOpen = true;
    const locker = this.lockers.find(l => l.Id === locker_number);
    if (locker) {
      const dialogRef = this.dialog.open(LockerPopupDetailsComponent, {
        width: '800px',
        data: { locker }
      });

      dialogRef.afterClosed().subscribe(async (updatedLocker: Locker) => {
        this.isPopupOpen = false;
        this.focusBarcodeInput();
        if (updatedLocker) {
          const index = this.lockers.findIndex(l => l.Id === updatedLocker.Id);
          if (index !== -1) {
            this.lockers[index] = updatedLocker;
            this.applySort(this.selectedSort);
          }
        }

        await this.logoutAllOccupiedLockers(this.lastScannedStudentNumber);
      });
    } else {
      console.error('Locker not found.');
    }
  }

  async logoutAllOccupiedLockers(studentNumber: string): Promise<void> {
    const occupiedLockers = this.lockers.filter(locker => locker.status === 'Occupied' && locker.studentNumber === studentNumber);
    for (const locker of occupiedLockers) {
      try {
        const response: any = await this.lockerApiService.scanLocker(locker.Id, `StudentNumber:${studentNumber}`).toPromise();
        if (response.status === 'Available') {
          locker.studentNumber = '';
          locker.status = response.status;
          locker.user = null;
          locker.imageSrc = this.getLockerImage(response.status);
        }
      } catch (error) {
        console.error(`Error logging out locker ${locker.locker_number}:`, error);
      }
    }
    this.applySort(this.selectedSort);
  }

  

  getLockerImage(status: string): string {
    switch (status) {
      case 'Occupied':
        return '../assets/images/red.jpg';
      case 'Available':
        return '../assets/images/green.jpg';
      case 'Unavailable':
        return '../assets/images/black.jpg';
      default:
        return '../assets/images/locker.jpg';
    }
  }
}


interface Locker {
  contents: any;
  Id: number;
  locker_number: string;
  status: string;
  studentNumber: string;
  full_program: string;
  remarks?: string; // Add the remarks property

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
    gender: number; // Update to number type
    id: number;
  } | null;
  imageSrc?: string; // Optional property to store image source
}
