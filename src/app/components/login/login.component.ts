import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loading = false;
  version = 'v1.0.0'; 

  // backgroundImageUrl = 'path/to/image.jpg'; // Add the background image URL here
  loginForm = new FormGroup({
    email: new FormControl(''),
    password: new FormControl(''),
  });

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['./main/dashboard']);
    }
  }

  login() {
    this.loading = true; // Set loading to true when login button is clicked

    // Simulate login or call login service
    this.auth.login(this.loginForm.value).subscribe(
      (result) => {
        // Login successful logic
        this.loading = false;
        this.showLoginSuccessToast();
        this.router.navigate(['./main/dashboard']);
      },
      (err) => {
        // Login error logic
        this.loading = false;
        this.showLoginErrorToast(err.error.message);
      }
    );
  }

  showLoginSuccessToast() {
    Swal.fire({
      title: 'Login Successful',
      icon: 'success',
      timer: 3000,
      timerProgressBar: true,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      customClass: {
        popup: 'sweetalert-custom-popup',
        title: 'sweetalert-custom-title',
        icon: 'sweetalert-custom-icon-success'
      },
      background: '#ffffff',
    });
  }

  showLoginErrorToast(errorMessage: string) {
    Swal.fire({
      title: 'Login Failed',
      text: errorMessage,
      icon: 'error',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      customClass: {
        popup: 'sweetalert-custom-popup',
        title: 'sweetalert-custom-title',
        icon: 'sweetalert-custom-icon-error'
      },
      background: '#ffcccc',
    });
  }
  
  onSubmit(): void {
    if (this.loginForm.valid) {
      // Simulate login with AuthService
      this.auth.login(this.loginForm.value).subscribe(
        (result) => {
          // console.log(result);
          this.router.navigate(['./main/dashboard']);
        },
        (err: Error) => {
          alert(err.message);
        }
      );
    }
  }
}
