import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-locker-history',
  standalone: true,
  imports: [CommonModule], // Add CommonModule here
  templateUrl: './locker-history.component.html',
  styleUrls: ['./locker-history.component.scss'] // corrected styleUrl to styleUrls
})
export class LockerHistoryComponent {
  lockerLogs: any[] = []

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any, 
    private ref: MatDialogRef<LockerHistoryComponent>) {}

  async ngOnInit(): Promise<void> {
    this.lockerLogs = this.data;
    console.log(this.lockerLogs);
  }

  closepopup() {
    this.ref.close('Closed using function');
  }
}
