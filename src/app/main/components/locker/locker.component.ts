import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LockerPopupDetailsComponent } from 'src/app/components/locker-popup-details/locker-popup-details.component';
import { LockerApiService } from 'src/app/locker-services/locker-api.service';

@Component({
  selector: 'app-locker',
  templateUrl: './locker.component.html',
  styleUrls: ['./locker.component.scss']
})
export class LockerComponent implements OnInit {
  lockerCount: number = 0;
  isLoading: boolean = true;
  lockers: Locker[] = [];
  CHUNK_SIZE: number = 20; // Consider using a constant or enum instead

  filteredLockers: Locker[] = [];
  selectedSort = 'all';


  constructor(private dialog: MatDialog, private lockerApiService: LockerApiService) {}


  async ngOnInit(): Promise<void> {
    await this.loadLockers();
    await this.applySort('all');

  }

  applySort(sortBy: string) {
    switch (sortBy) {
      case 'available':
        this.filteredLockers = this.lockers.filter((locker) => locker.status.toLowerCase() === 'available');
        break;
      case 'occupied':
        this.filteredLockers = this.lockers.filter((locker) => locker.status.toLowerCase() === 'occupied');
        break;
      case 'unavailable':
        this.filteredLockers = this.lockers.filter((locker) => locker.status.toLowerCase() === 'unavailable');
        break;
      default:
        this.filteredLockers = this.lockers;
    }
  }
  

  async loadLockers(): Promise<void> {
    this.isLoading = true;
    try {
      const lockers = await this.lockerApiService.getAllLockers().toPromise();
      console.log('Lockers:', lockers);
      this.lockers = lockers;
      this.filteredLockers = this.lockers;
    } catch (error) {
      console.error('Error fetching lockers:', error);
    } finally {
      this.isLoading = false;
    }
  }
  
openPopup(lockerNumber: number): void {
  const locker = this.lockers.find(l => l.Id === lockerNumber);
  if (locker) {
    const dialogRef = this.dialog.open(LockerPopupDetailsComponent, {
      width: '800px',
      data: { lockerNumber, locker }
    });

    dialogRef.afterClosed().subscribe((updatedLocker: Locker) => {
      if (updatedLocker) {
        // Find the index of the updated locker in the lockers array
        const index = this.lockers.findIndex(l => l.Id === updatedLocker.Id);
        if (index !== -1) {
          // Update the locker at the found index
          this.lockers[index] = updatedLocker;
        }
      }
    });
  } else {
    console.error('Locker not found.');
  }
}


  getLockerImage(status: string): string {
    switch (status) {
      case 'Occupied':
        return '../assets/images/red.jpg';
      case 'Available':
        return '../assets/images/green.jpg';
      case 'Unavailable':
        return '../assets/images/black.jpg';
      default:
        return '../assets/images/locker.jpg';
    }
  }

  ngOnDestroy(): void {
    // Unsubscribe from any subscriptions to prevent memory leaks
  }
}

interface Locker {
  Id: number;
  lockerNumber: string;
  status: string;
  studentNumber: string;
  user: {
    first_name: string;
    last_name: string;
    studentNumber: string;
    Program_id: string;
    department: string;
    gender: string;
  };
}
