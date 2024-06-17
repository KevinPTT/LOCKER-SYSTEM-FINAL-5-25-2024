import { Component, Inject, ViewChild, ElementRef, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LockerApiService } from 'src/app/locker-services/locker-api.service';
import Swal from 'sweetalert2';

interface ErrorResponse {
  error: {
    error: string;
    occupiedLocker?: string;
  };
}

function isErrorResponse(error: any): error is ErrorResponse {
  return error && typeof error === 'object' && 'error' in error;
}

interface Locker {
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
      program_short: string;
      department_short: {
        department_short: string;
        full_department: string;
      };
    };
    gender: number;
    id: number;
  } | null;
}

@Component({
  selector: 'app-locker-popup-details',
  templateUrl: './locker-popup-details.component.html',
  styleUrls: ['./locker-popup-details.component.scss']
})
export class LockerPopupDetailsComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('barcodeInput') barcodeInput!: ElementRef;

  lockerInfo: Locker;
  barcodeValue: string = '';
  typingTimer: any;
  studentNumber: string = '';
  isExpanded: boolean = false;
  isLoading: boolean = false;
  isUnavailableState: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private lockerApiService: LockerApiService
  ) {
    const storedLockerInfo = localStorage.getItem('lockerInfo');
    this.lockerInfo = storedLockerInfo ? JSON.parse(storedLockerInfo) : data.locker;
    this.barcodeValue = '';
  }

  anotherAction(): void {
    console.log('Another action clicked!');
  }

  yetAnotherAction(): void {
    console.log('Yet another action clicked!');
  }

  remarkText: string = '';
  showRemarkInput: boolean = false;

  // remark(): void {
  //   this.showRemarkInput = true;
  //   this.setLockerUnavailable();
  //   // Optionally, call an API to update the backend status
  //   this.updateLockerStatus('Unavailable');
  // }

  saveRemark(): void {
    console.log('Saving remark:', this.remarkText);
    this.showRemarkInput = false;
  }

  setLockerUnavailable(): void {
    this.lockerInfo.status = 'Unavailable';
    this.isUnavailableState = true;
  }

  // updateLockerStatus(status: string): void {
  //   this.lockerApiService.updateLockerStatus(this.lockerInfo.Id, status).subscribe(
  //     (response: any) => {
  //       console.log('Locker status updated:', response);
  //     },
  //     (error: any) => {
  //       console.error('Error updating locker status:', error);
  //     }
  //   );
  // }

  ngOnInit(): void {
    this.fetchLockerInformation();
    document.body.addEventListener('click', this.handleBodyClick.bind(this));
  }

  ngAfterViewInit(): void {
    this.focusBarcodeInput();
  }

  ngOnDestroy(): void {
    document.body.removeEventListener('click', this.handleBodyClick.bind(this));
  }

  handleBodyClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!this.isExpanded) {
      this.focusBarcodeInput();
    }
  }

  focusBarcodeInput(): void {
    if (this.barcodeInput) {
      this.barcodeInput.nativeElement.focus();
    }
  }

  getGenderLabel(genderValue: number): string {
    return genderValue === 1 ? 'Male' : 'Female';
  }

  get isUnavailable(): boolean {
    return this.lockerInfo.status === 'Unavailable';
  }

  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
    if (!this.isExpanded) {
      this.focusBarcodeInput();
    }
  }

  async scanQRCode(): Promise<void> {
    if (this.isUnavailable || this.isExpanded) return;

    this.isLoading = true;

    try {
      const response: any = await this.lockerApiService.scanQRCode(this.lockerInfo.Id, `StudentNumber:${this.barcodeValue}`).toPromise();

      if (response.status === 'Occupied') {
        this.lockerInfo.studentNumber = response.studentNumber;
        this.lockerInfo.status = response.status;
        this.lockerInfo.user = response.user;
        this.data.locker = this.lockerInfo;

        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: `Locker scanned successfully! Locker Number: ${this.lockerInfo.locker_number}`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else if (response.status === 'Available') {
        this.lockerInfo.studentNumber = '';
        this.lockerInfo.status = response.status;
        this.lockerInfo.user = null;
        this.data.locker = this.lockerInfo;

        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Logged out successfully!',
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Info',
          text: 'Locker already scanned.',
          timer: 2000,
          showConfirmButton: false,
        });
      }

      this.barcodeValue = '';
      this.fetchLockerInformation();
    } catch (error: any) {
      console.error('Error scanning QR code:', error);

      let errorMessage = 'Failed to scan locker.';
      if (error?.status === 400 && error?.error?.error === 'User is already occupying another locker') {
        errorMessage = `You are currently occupying locker ${error.error.occupiedLocker}.`;
      } else if (error?.status === 400 && error?.error?.error === 'StudentNumber doesn\'t match for this locker') {
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
    }
  }

  fetchLockerInformation(): void {
    this.lockerApiService.getLockerDetails(this.lockerInfo.Id).subscribe(
      (response: any) => {
        if (response.status === 'Occupied') {
          this.lockerInfo.studentNumber = response.studentNumber;
          this.lockerInfo.status = response.status;
          this.lockerInfo.user = response.user;
        } else {
          this.lockerInfo.studentNumber = '';
          this.lockerInfo.status = response.status;
          this.lockerInfo.user = null;
        }
        this.data.locker = this.lockerInfo;
      },
      (error: any) => {
        console.error('Error fetching locker information:', error);
      }
    );
  }

  onBarcodeValueChange(newValue: string): void {
    clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(() => {
      if (newValue) {
        this.scanQRCode();
      }
    }, 100);
  }

  onClose(): void {
    this.data.locker = this.lockerInfo;
    this.ngOnInit();
  }

  manualLogin(): void {
    if (this.isUnavailable) return;

    const scannedData = `StudentNumber:${this.studentNumber}`;

    if (this.lockerInfo.status === 'Available') {
      this.lockerApiService.scanQRCode(this.lockerInfo.Id, scannedData).subscribe(
        (response: any) => {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Locker logged in successfully!',
            timer: 2000,
            showConfirmButton: false,
          }).then(() => {
            this.onClose();
          });
        },
        (error: any) => {
          console.error('Error logging in:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Failed to login locker!',
            timer: 2000,
            showConfirmButton: false,
          });
        }
      );
    } else if (this.lockerInfo.status === 'Occupied' && this.lockerInfo.contents) {
      // Expand the locker contents here
    } else {
      alert('Locker is currently occupied. Please try again later.');
    }
  }

  logoutLocker(): void {
    if (this.isUnavailable) return;

    const lockerId = this.lockerInfo.Id;
    const scannedData = 'Logout';

    Swal.fire({
      title: 'Confirm Logout',
      text: 'Are you sure you want to logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'No, cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.lockerApiService.scanQRCode(lockerId, scannedData).subscribe(
          (response: any) => {
            this.lockerInfo.studentNumber = '';
            this.lockerInfo.status = 'Available';
            this.lockerInfo.user = null;
            this.data.locker = this.lockerInfo;

            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'Locker logged out successfully!',
              timer: 2000,
              showConfirmButton: false,
            });
          },
          (error: any) => {
            console.error('Error logging out:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: 'Failed to logout locker!',
              timer: 2000,
              showConfirmButton: false,
            });
          }
        );
      }
    });
  }

  private resetLockerInfo(): void {
    const storedLockerInfo = localStorage.getItem('lockerInfo');
    this.lockerInfo = storedLockerInfo ? JSON.parse(storedLockerInfo) : this.data.locker;
  }
}
