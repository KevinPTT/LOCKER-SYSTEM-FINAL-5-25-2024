import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

interface LoginResponse {
  displayName: string | null;
  token: string;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000';
  // private apiUrl = 'http://172.20.10.7:8000';
  private userRole: string | null = null;

  constructor(
    private router: Router,
    private http: HttpClient,
    private cookieService: CookieService
  ) {}

  setToken(token: string): void {
    sessionStorage.setItem('token', token);
  }

  getToken(): string | null {
    return sessionStorage.getItem('token');
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

  setUserRole(role: string | null): void {
    this.userRole = role;
    if (role) {
      sessionStorage.setItem('userRole', role);
    } else {
      sessionStorage.removeItem('userRole');
    }
  }

  getUserRole(): string | null {
    if (!this.userRole) {
      this.userRole = sessionStorage.getItem('userRole');
    }
    return this.userRole;
  }

  isLoggedIn(): boolean {
    return this.cookieService.check('name') && !!this.getToken();
  }

  logout(): void {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userRole');
    this.cookieService.delete('name');
    this.router.navigate(['login']);
  }

  login({ email, password }: any): Observable<LoginResponse> {
    const credentials = { username: email, password: password };
    return this.http.post<LoginResponse>(`${this.apiUrl}/api/login/locker`, credentials).pipe(
      tap((res) => {
        this.setToken(res.token);
        this.setName(res.displayName);
        this.setUserRole(res.role); // Set the user's role
      })
    );
  }
}
