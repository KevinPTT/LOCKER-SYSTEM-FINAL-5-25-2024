import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { UserComponent } from './components/user/user.component';
import { EditUsersComponent } from './components/editusers/editusers.component';
import { LockerApiService } from 'src/app/locker-services/locker-api.service';
import { LockerHistoryComponent } from './components/locker-history/locker-history.component';

@Component({
  selector: 'app-add-locker',
  templateUrl: './addlocker.component.html',
  styleUrls: ['./addlocker.component.scss'],
})
export class AddLockerComponent implements OnInit {
  lockers: any[] = [];
  isModalOpen: boolean = false;
  currentPage = 1;
  itemsPerPage = 10;
  loading = true;
  loadingTimeout = 0;

  constructor(
    private dialogRef: MatDialog, 
    private lockerApiService: LockerApiService,
  ) { }

  ngOnInit() {
    this.getLockers();
  }

  getStatus(locker: any): string {
    if (locker.remarks) {
      return `Unavailable / ${locker.remarks}`;
    } else {
      return locker.status;
    }
  }

  get totalPages(): number {
    return Math.ceil(this.lockers.length / this.itemsPerPage);
  }

  paginatedLockers(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.lockers.slice(startIndex, endIndex);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  getLockers(): void {
    this.lockerApiService.getLockers().subscribe(
      (lockers: any) => {
        this.lockers = lockers;
      },
      (error: any) => {
        console.error(error);
      }
    );
  }

  deleteLocker(id: number): void {
    this.lockerApiService.deleteLocker(id).subscribe(
      (result: any) => {
        Swal.fire({
          title: "Deleting complete!",
          text: "Locker has been deleted.",
          icon: "success",
          confirmButtonText: 'Close',
          confirmButtonColor: "#777777",
        });
        this.lockers = this.lockers.filter(locker => locker.id !== id);
      },
      (error: any) => {
        console.error(error);
        if (error.status == 400) {
          Swal.fire({
            title: "Error!",
            text: "You must delete the latest locker first.",
            icon: "error",
          });
        } else {
          Swal.fire({
            title: "Error!",
            text: "Something went wrong, please try again later.",
            icon: "error",
          });
        }
      }
    );
  }

  onHistoryBtnClick(): void {
    if (this.isModalOpen) {
      return;
    }
    
    this.isModalOpen = true;
    this.lockerApiService.getHistory().subscribe(
      (result: any) => {
        let modal = this.dialogRef.open(LockerHistoryComponent, {
          data: result
        });
        modal.afterClosed().subscribe(() => {
          this.isModalOpen = false;
        });
      },
      (error: any) => {
        console.error(error);
        this.isModalOpen = false;
        Swal.fire({
          title: "Error!",
          text: "Something went wrong, please try again later.",
          icon: "error",
        });
      }
    );
  }

  onAddNewBtnClick(): void {
    if (this.isModalOpen) {
      return;
    }
    
    this.isModalOpen = true;
    this.lockerApiService.getStartingLockerNumber().subscribe(
      (data: any) => {
        let modal = this.dialogRef.open(UserComponent, {
          data: data
        });
        modal.afterClosed().subscribe((result: any) => {
          this.isModalOpen = false;
          if (result != null) {
            result.success.forEach((locker: any) => {
              this.lockers.push(locker);
            });
          }
        });
      },
      (error: any) => {
        console.error(error);
        this.isModalOpen = false;
        Swal.fire({
          title: "Error!",
          text: "Something went wrong, please try again later.",
          icon: "error",
        });
      }
    );
  }

  onEditBtnClick(id: number): void {
    if (this.isModalOpen) {
      return;
    }
    
    this.isModalOpen = true;
    this.lockerApiService.getLocker(id).subscribe(
      (data: any) => {
        let modal = this.dialogRef.open(EditUsersComponent, {
          data: data
        });
        modal.afterClosed().subscribe((result: any) => {
          this.isModalOpen = false;
          if (result != null) {
            this.lockers = this.lockers.map(locker => {
              if (locker.id === result.success.id) {
                return { ...locker, status: result.success.status, remarks: result.success.remarks };
              }
              return locker;
            });
          }
        });
      },
      (error: any) => {
        console.error(error);
        this.isModalOpen = false;
        Swal.fire({
          title: "Error!",
          text: "Something went wrong. Please try again later",
          icon: "error",
        });
      }
    );
  }

  onArchiveBtnClick(id: number): void {
    Swal.fire({
      title: "Delete Project",
      text: "Are you sure want to delete this locker?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
      confirmButtonColor: "#AB0E0E",
      cancelButtonColor: "#777777",
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.deleteLocker(id);
      }
    });
  }
}
