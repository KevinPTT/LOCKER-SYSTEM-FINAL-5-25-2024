import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';

import { Observable, tap } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    @Inject(PLATFORM_ID) private platformId: any
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Prevent SSR from reading the token
    if (!isPlatformBrowser(this.platformId)) {
      return next.handle(request);
    }

    const token = sessionStorage.getItem('token');

    if (token && !request.url.includes('/logout')) { // Skip adding Authorization for logout requests
      const authReq = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}` // Set the Authorization header correctly
        }
      });

      return next.handle(authReq);
    } else {
      return next.handle(request);
    }
  }
}
