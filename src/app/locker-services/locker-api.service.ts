// locker-api.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';

interface Locker {
  Id: number;
  lockerNumber: string;
  status: string;
  studentNumber?: string; // If studentNumber is optional
  validateStudentNumber(studentNumber: string): Observable<any>;


  Contents: { Name: string, Quantity: number }[];



}


@Injectable({
  providedIn: 'root'
})
export class LockerApiService {
  [x: string]: any;
  // private apiUrl = 'http://172.20.10.7:8000';

  private apiUrl = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) { }

  getLockerInfo(lockerId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/locker/${lockerId}`);
  }


  getLockerCounts(filter: string): Observable<any> {
    let endpoint = 'http://127.0.0.1:8000/api/locker-counts';
  
    if (filter !== 'all') {
      endpoint += `?filter=${filter}`;
    }
  
    return this.http.get<any>(endpoint);
  }
  
  
  
  getLockerDetails(lockerid: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/locker/${lockerid}`);
  }

  // getLockerContents(lockerId: number): Observable<any[]> {
  //   return this.http.get<any[]>(`${this.apiUrl}/lockers/${lockerId}/contents`);
  // }

  getLockerData(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/locker`);
  }

  getLockerHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/history`);
  }

  loadGraphData(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/locker`);
  }
  
  getGenderCounts(period?: string): Observable<any> {
    let params = new HttpParams();
  
    if (period) {
      params = params.set('period', period);
    }
  
    return this.http.get<any[]>(`${this.apiUrl}/api/gender-counts`, { params });
  }
  
  getDepartmentCounts(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/college-counts`);
  }
  
  


  getAllLockers(): Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}/api/locker`);
  }

  
  
  scanQRCode(lockerId: number, scannedData: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/locker/${lockerId}/scan`, { scannedData });
    
  }
  




  getLockerLogs() {
    return this.http.get<any[]>(`${this.apiUrl}/api/lockers-log`);

  }

  getUsers(filterBy: string = 'all'): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/lockers-logs-with-users`, {
      params: {
        filter_by: filterBy
      }
    });
  }





  // getCEASPrograms(): Observable<any> {
  //   return this.http.get<number>(`${this.apiUrl}/api/college-counts`);
  // }

  // getCHTMCount(): Observable<number> {
  //   return this.http.get<number>(`${this.apiUrl}/api/department-counts/CHTM`);
  // }
  
  // getCBACount(): Observable<number> {
  //   return this.http.get<number>(`${this.apiUrl}/api/department-counts/CBA`);
  // }
  
  // getCAHSCount(): Observable<number> {
  //   return this.http.get<number>(`${this.apiUrl}/api/department-counts/CAHS`);
  // }
  
  // getCCSCount(): Observable<number> {
  //   return this.http.get<number>(`${this.apiUrl}/api/department-counts/CCS`);
  // }
  

}





