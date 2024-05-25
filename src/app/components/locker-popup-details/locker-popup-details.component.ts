import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LockerApiService } from 'src/app/locker-services/locker-api.service';
import Swal from 'sweetalert2';


interface Locker {
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
  selector: 'app-locker-popup-details',
  templateUrl: './locker-popup-details.component.html',
  styleUrls: ['./locker-popup-details.component.scss']
})

export class LockerPopupDetailsComponent {
  lockerInfo: Locker;
  barcodeValue: string = '';
  typingTimer: any;
  studentNumber: string = ''; // Add studentNumber property
  isExpanded: boolean = false;
  isEditing = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private lockerApiService: LockerApiService
  ) {
    const storedLockerInfo = localStorage.getItem('lockerInfo');
    this.lockerInfo = storedLockerInfo ? JSON.parse(storedLockerInfo) : data.locker;
    this.barcodeValue = ''; // Clear barcodeValue after successful scan
  }

toggleExpand(): void {
  this.isExpanded =!this.isExpanded;
}

  ngOnInit(): void {
    this.fetchLockerInformation();
  }

  async scanQRCode(): Promise<void> {
    let shouldFetchLocker = false; // Flag para malaman kung kailangan pang i-fetch ang locker information
  
    try {
      const response: any = await this.lockerApiService.scanQRCode(this.lockerInfo.Id, `StudentNumber:${this.barcodeValue}`).toPromise();
      if (response.status === 'Occupied') {
        this.lockerInfo.studentNumber = response.studentNumber;
        this.lockerInfo.status = response.status; // Update locker status
        this.lockerInfo.user = response.user; // Update user details
  
        this.data.locker = this.lockerInfo; // Update data.locker with updated lockerInfo
  
        // Clear barcodeValue after successful scan
        this.barcodeValue = '';
  
        // Set flag to true if locker information needs to be fetched
        shouldFetchLocker = true;
  
        // Show SweetAlert for success with locker number and auto-close after 2 seconds
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: `Locker scanned successfully! Locker Number: ${this.lockerInfo.lockerNumber}`,
          timer: 2000, // Auto-close after 2 seconds
          showConfirmButton: false, // Hide the "OK" button
        });
      } else {
        console.log('Locker already scanned.');
      }
    } catch (error) {
      console.error('Error scanning QR code:', error);
  
      // Show SweetAlert for error and auto-close after 2 seconds
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Student number doesn\'t match!',
        timer: 2000, // Auto-close after 2 seconds
        showConfirmButton: false, // Hide the "OK" button
      });
    }
  
    // Check if locker information needs to be fetched and fetch it if necessary
    if (shouldFetchLocker) {
      this.fetchLockerInformation();
    }
  }
  
  fetchLockerInformation(): void {
    this.lockerApiService.getLockerDetails(this.lockerInfo.Id)
      .subscribe((response: any) => {
        if (response.status === 'Occupied') {
          this.lockerInfo.studentNumber = response.studentNumber;
          this.lockerInfo.status = response.status; // Update locker status
          this.lockerInfo.user = response.user; // Update user details
  
          this.data.locker = this.lockerInfo; 
  
          this.barcodeValue = '';
  
          this.fetchLockerInformation();
        } else {
          this.lockerInfo.studentNumber = '';
          this.lockerInfo.status = response.status; 
          this.lockerInfo.user = null;
        }
      }, (error: any) => {
        console.error('Error scanning QR code:', error);
      });
  }
  

  onBarcodeValueChange(newValue: string): void {
    clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(() => {
      if (newValue) {
        this.scanQRCode();
      }
    }, 500);
  }

  onClose(): void {
    this.data.locker = this.lockerInfo; 

    this.ngOnInit(); 
  }

  manualLogin(): void {
    const scannedData = `StudentNumber:${this.studentNumber}`; // Use the provided student number for login
  
    if (this.lockerInfo.status === 'Available') {
      this.lockerApiService.scanQRCode(this.lockerInfo.Id, scannedData).subscribe(
        (response: any) => {
          // Handle successful login
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Locker logged in successfully!',
            timer: 2000, // Auto-close after 2 seconds
            showConfirmButton: false
          }).then(() => {
            // Close the popup automatically after 2 seconds
            this.onClose();
          });
          // Update lockerInfo or perform other necessary actions
        },
        (error: any) => {
          // Handle error response
          console.error('Error logging in:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Failed to login locker!',
            timer: 2000, // Auto-close after 2 seconds
            showConfirmButton: false
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
    const lockerId = this.lockerInfo.Id; // Get the locker ID
    const scannedData = 'Logout'; // Provide a dummy scannedData for logout
  
    Swal.fire({
      title: 'Confirm Logout',
      text: 'Are you sure you want to logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'No, cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.lockerApiService.scanQRCode(lockerId, scannedData).subscribe(
          (response: any) => {
            // Handle successful logout
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'Locker logged out successfully!',
              timer: 2000, // Auto-close after 2 seconds
              showConfirmButton: false
            });
            // Clear lockerInfo or perform other necessary actions
          },
          (error: any) => {
            // Handle error response
            console.error('Error logging out:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: 'Failed to logout locker!',
              timer: 2000, // Auto-close after 2 seconds
              showConfirmButton: false
            });
          }
        );
      }
    });
  }
  
}
