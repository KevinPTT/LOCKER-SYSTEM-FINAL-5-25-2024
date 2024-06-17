// locker-api.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { Observable } from 'rxjs';

export interface Locker {
  lockerNumber: number;
  status: string;
  date: string;
  id: number;
  created_at: Date;
}

@Injectable({
  providedIn: 'root'
})
export class LockerApiService {
  // private baseUrl: string = 'http://26.68.32.39:8000'; 
  private baseUrl: string = 'http://127.0.0.1:8000'; 

  constructor(private http: HttpClient) { }
  
  private getHeaders() {
    return new HttpHeaders({
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('auth-token')
    });
  }

  public post(url: string, formData: FormData): Observable<any> {
    return this.http.post(this.baseUrl + url, formData, { headers: this.getHeaders() });
  }

  public get(url: string): Observable<any> {
    return this.http.get(this.baseUrl + url, { headers: this.getHeaders() });
  }

  getLockerInfo(lockerId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/locker/${lockerId}`, { headers: this.getHeaders() });
  }

  getLockerCounts(filter: string): Observable<any> {
    let endpoint = `${this.baseUrl}/api/locker-counts`;
    if (filter !== 'all') {
      endpoint += `?filter=${filter}`;
    }
    return this.http.get<any>(endpoint, { headers: this.getHeaders() });
  }
  
  getLockerDetails(lockerId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/locker/${lockerId}`, { headers: this.getHeaders() });
  }

  getLockerData(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/locker`, { headers: this.getHeaders() });
  }

  getLockerHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/history`, { headers: this.getHeaders() });
  }

  loadGraphData(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/locker`, { headers: this.getHeaders() });
  }

  getdashboardGenderCounts(period: string = 'all'): Observable<any> {
    let params = new HttpParams().set('period', period);
    console.log('Requesting gender counts with period:', period);
    return this.http.get<any[]>(`${this.baseUrl}/api/dashboard-gender-counts`, { headers: this.getHeaders(), params });
  }


  getGenderCounts(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    for (let key in params) {
      if (params.hasOwnProperty(key)) {
        httpParams = httpParams.set(key, params[key]);
      }
    }
  
    console.log('Requesting gender counts with params:', params);
    return this.http.get<any[]>(`${this.baseUrl}/api/gender-counts`, { headers: this.getHeaders(), params: httpParams });
  }






  
  getDepartmentCounts(params: any = {}): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/college-counts`, { headers: this.getHeaders(), params });
  }
  



  getAllLockers(): Observable<any> {
    return this.http.get<any[]>(`${this.baseUrl}/api/locker`, { headers: this.getHeaders() });
  }
  
  scanQRCode(lockerId: number, scannedData: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/locker/${lockerId}/scan`, { scannedData }, { headers: this.getHeaders() });
  }

  scanLocker(lockerId: number, scannedData: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/locker/${lockerId}/scanLocker`, { scannedData }, { headers: this.getHeaders() });
  }

  // updateLockerStatus(lockerId: number, status: string): Observable<any> {
  //   return this.http.post(`${this.baseUrl}/api/locker/${lockerId}/status`, { status });
  // }
  
  getLockerLogs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/lockers-log`, { headers: this.getHeaders() });
  }

  getUsers(page: number, filterBy: string, perPage: number, fromDate: string | null, toDate: string | null): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('filter_by', filterBy)
      .set('per_page', perPage.toString());

    if (fromDate) {
      params = params.set('from_date', fromDate);
    }

    if (toDate) {
      params = params.set('to_date', toDate);
    }

    return this.http.get<any>(`${this.baseUrl}/api/lockers-logs-with-users`, { params, headers: this.getHeaders() });
  }


  getLockers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/lockers/`, { headers: this.getHeaders() }) ;
  }

  getStartingLockerNumber() {
    return this.http.get(`${this.baseUrl}/api/lockers/latest`, { headers: this.getHeaders() });
  }

  addLocker(numberOfLockers: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/lockers/`, numberOfLockers, { headers: this.getHeaders() });
  }

  getLocker(id:number): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/lockers/${id}`, { headers: this.getHeaders() });
  }

  updateLocker(data: any, id:number): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/lockers/${id}`, data, { headers: this.getHeaders() });
  }
  
  deleteLocker(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/api/lockers/delete/${id}`, { headers: this.getHeaders() });
  }

  getHistory() {
    return this.http.get(`${this.baseUrl}/api/lockers/logs`, { headers: this.getHeaders() });
  }
}
