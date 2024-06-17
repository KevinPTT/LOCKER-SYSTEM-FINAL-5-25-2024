import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { LockerApiService } from 'src/app/locker-services/locker-api.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ],
})
export class UserComponent implements OnInit {
  numberOfLockers: number = 0;
  startingLockerNumber: number = 0; //just a placeholder
  status: string = 'Available'   //just a placeholder
  remarks: string = '';
  date: string = new Date().toISOString().slice(0, 10);

  constructor(
    private ref: MatDialogRef<UserComponent>,
    private lockerApiService: LockerApiService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.getLatestLockerNumber();
  }

  getLatestLockerNumber() {
    this.startingLockerNumber = this.data;
  }

  onStatusChange() {
    if (this.status === 'Available') {
      this.remarks = '';
    }
  }

  addLocker() {
    const form = {
      numberOfLockers: this.numberOfLockers,
      startingLockerNumber: this.startingLockerNumber,
      status: this.status,
      remarks: this.remarks
    };

    this.lockerApiService.addLocker(form).subscribe(
      result => {
        if (result.success) {
          this.showSuccessAlert();
          this.ref.close(result);
        }
      },
      error => {
        if (error.status == 400) {
          this.showErrorAlert();
        }
        console.error(error);
      }
    );
  }

  addBox() {
    Swal.fire({
      title: "Add New Locker",
      text: "Are you sure you want to add a new locker?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
      confirmButtonColor: "#31A463",
      cancelButtonColor: "#777777",
    }).then((result) => {
      if (result.isConfirmed) {
        this.addLocker();
      }
    });
  }

  showSuccessAlert() {
    Swal.fire({
      title: "Success!",
      text: "Locker has been successfully added.",
      icon: "success",
      confirmButtonText: 'Close',
      confirmButtonColor: "#777777",
    });
  }

  showErrorAlert() {
    Swal.fire({
      title: "Error!",
      text: "Failed to add locker.",
      icon: "error",
      confirmButtonText: 'Close',
      confirmButtonColor: "#777777",
    });
  }

  cancelBox(){
    Swal.fire({
      title: "Cancel?",
      text: "Are you sure you want to cancel adding lockers?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      confirmButtonColor: "#AB0E0E",
      cancelButtonColor: "#777777",
    }).then((result) => {
      if (result.isConfirmed) {
        this.ref.close(null);
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          }
        });
        Toast.fire({
          icon: "error",
          title: "Adding lockers has been cancelled."
        });
      }
    });
  }
}
