import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


import Swal from 'sweetalert2';
import { LockerApiService } from 'src/app/locker-services/locker-api.service';

interface MyOption {
  value: string;
  label: string;
}
@Component({
  selector: 'app-editusers',
  templateUrl: './editusers.component.html',
  styleUrl: './editusers.component.scss',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ],
  
})
export class EditUsersComponent {
  locker_number: string = ''
  date: string = ''
  form: {
    status: string,
    remarks: string
  }

  constructor(
    private ref: MatDialogRef<EditUsersComponent>,
    private lockerApiService: LockerApiService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    const today = new Date();
    this.date = today.toISOString().split('T')[0]
    this.form = {
      status: '',
      remarks: ''
    }
  }

  ngOnInit() {
    this.locker_number = this.data.locker_number
    this.form.status = this.data.status
    this.form.remarks = this.data.remarks
    console.log(this.form.remarks)
  }

  updateLocker() {
    this.lockerApiService.updateLocker(this.form, this.data.id).subscribe(
      result => {
        this.ref.close(result);
        Swal.fire({
          title: "Update successful!",
          text: "The changes have been saved.",
          icon: "success",
          confirmButtonText: 'Close',
          confirmButtonColor: "#777777",
        });
      },
      error => {
        console.error(error)
        if(error.status == 400) {
          Swal.fire({
            title: "Error!",
            text: "Invalid input.",
            icon: "error",
            confirmButtonText: 'Close',
            confirmButtonColor: "#777777",
          });
        }
      }
    )

  }

  // SWEETALERT UPDATE POPUP
  updateBox(){
    Swal.fire({
      title: "Update Locker",
      text: "Are you sure you want to update this locker?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
      confirmButtonColor: "#31A463",
      cancelButtonColor: "#777777",
    }).then((result) => {
      if (result.isConfirmed) {
        this.updateLocker()
      }
    });
  }

  // CANCEL EDITING POPUP
  cancelBox(){
    Swal.fire({
      title: "Are you sure you want to cancel editing details?",
      text: "Your changes will not be saved.",
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
            title: "Changes not saved."
          });
      }
    });
  }
  
}


