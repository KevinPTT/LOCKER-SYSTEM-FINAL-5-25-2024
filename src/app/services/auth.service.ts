import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

interface LoginResponse {
  displayName: string | null;
  token: string;
  role: string;
  position: string; // Add position property
}


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // private apiUrl = 'http://26.68.32.39:8000';
  private apiUrl = 'http://127.0.0.1:8000'; 
  // private apiUrl = 'http://172.20.10.7:8000';
  private userRole: string | null = null;
  private userPosition: string | null = null; // I-add ito sa `AuthService`


  constructor(
    private router: Router,
    private http: HttpClient,
    private cookieService: CookieService
  ) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + this.getToken()
    });
  }

  public post(url: string, formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl + url, formData, { headers: this.getHeaders() });
  }

  public get(url: string): Observable<any> {
    return this.http.get(this.apiUrl + url, { headers: this.getHeaders() });
  }

  setToken(token: string): void {
    sessionStorage.setItem('auth-token', token);
  }

  getToken(): string | null {
    return sessionStorage.getItem('auth-token');
  }

  setName(name: string | null): void {
    if (name) {
      this.cookieService.set('name', name, { expires: 1 });
    } else {
      this.cookieService.delete('name');
    }
  }

  getName(): string | null {
    return this.cookieService.get('name');
  }

  setUserRole(role: string | null): void { // Dagdagan ng setUserRole method
    this.userRole = role;
    if (role) {
      sessionStorage.setItem('userRole', role);
    } else {
      sessionStorage.removeItem('userRole');
    }
  }

  getUserRole(): string | null { // Dagdagan ng getUserRole method
    if (!this.userRole) {
      this.userRole = sessionStorage.getItem('userRole');
    }
    return this.userRole;
  }

  setUserPosition(position: string | null): void {
    this.userPosition = position;
    if (position) {
      sessionStorage.setItem('userPosition', position);
    } else {
      sessionStorage.removeItem('userPosition');
    }
  }

  getUserPosition(): string | null {
    if (!this.userPosition) {
      this.userPosition = sessionStorage.getItem('userPosition');
    }
    return this.userPosition;
  }

  isLoggedIn(): boolean {
    return this.cookieService.check('name') && !!this.getToken();
  }

  logout(): void {
    console.log('Logging out...');
    sessionStorage.removeItem('auth-token');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userPosition');
    sessionStorage.removeItem('lockersInfo'); // Remove lockersInfo from sessionStorage
    sessionStorage.removeItem('activeTab'); // Remove activeTab from sessionStorage
    this.userRole = null; // Clear userRole variable in AuthService
    this.userPosition = null; // Clear userPosition variable in AuthService
    this.router.navigate(['login']);
  }
  
  
  

  login({ email, password }: { email: string, password: string }): Observable<LoginResponse> {
    const credentials = { username: email, password: password };
    return this.http.post<LoginResponse>(`${this.apiUrl}/api/login`, credentials).pipe(
      tap((res) => {
        this.setToken(res.token);
        this.setName(res.displayName);
        this.setUserRole(res.role);
        this.setUserPosition(res.position); // Save the position when user logs in
      })
    );
  }
}
