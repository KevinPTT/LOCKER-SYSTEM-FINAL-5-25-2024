import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-time-details-dialog',
  templateUrl: './time-details-dialog.component.html',
  styleUrls: ['./time-details-dialog.component.scss']
})
export class TimeDetailsDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  
}
