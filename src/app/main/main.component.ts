import { Component, inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent {
  userName: string | null = '';
  userRole: string | null = '';
  userPosition: string | null = '';

  private breakpointObserver = inject(BreakpointObserver);
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  isLoggedOut = false;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.userName = this.auth.getName();
    this.userRole = this.auth.getUserRole();
    this.userPosition = this.auth.getUserPosition();
  }

  getUserPosition(): string | null {
    return this.userPosition;
  }

  getName() {
    this.userName = this.auth.getName();
    console.log(this.userName);
  }

  getUserRole(): string | null {
    return this.userRole;
  }
  

  getCurrentDateTime(): string {
    const currentDate = new Date();
    return currentDate.toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  }

  logout(): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out of the locker system.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4F6F52', // Green color
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.auth.logout();
        this.isLoggedOut = true;
  
        Swal.fire({
          title: 'Logged Out',
          text: 'You have been logged out.',
          icon: 'success',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          customClass: {
            popup: 'sweetalert-custom-popup',
            title: 'sweetalert-custom-title',
          },
          background: '#ffffff',
        });
  
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      }
    });
  }
  
}
