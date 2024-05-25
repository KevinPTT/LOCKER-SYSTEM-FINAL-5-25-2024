// locker-data.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LockerDataService {
  timeIn: string = '';
  timeOut: string = '';
  lockerNumber: string = '';

  constructor() {}

  setTimeIn(timeIn: string) {
    this.timeIn = timeIn;
  }

  setTimeOut(timeOut: string) {
    this.timeOut = timeOut;
  }

  setLockerNumber(lockerNumber: string) {
    this.lockerNumber = lockerNumber;
  }
}
