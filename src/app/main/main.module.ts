import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MainRoutingModule } from "./main-routing.module";
import { MaterialModule } from "../modules/material.module";
import { HistoryComponent } from './components/history/history.component';
import { LockerComponent } from "./components/locker/locker.component";
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SkeletonLoaderComponent } from "../components/skeleton-loader/skeleton-loader.component";
import { ReportComponent } from "./components/report/report.component";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { AddLockerComponent } from "./components/locker/addlocker/addlocker.component";
import { ArchiveComponent } from "./components/locker/addlocker/components/archives/archives.component";
import { EditUsersComponent } from "./components/locker/addlocker/components/editusers/editusers.component";
import { UserComponent } from "./components/locker/addlocker/components/user/user.component";
import { MatNativeDateModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { NgxPaginationModule } from "ngx-pagination/lib/ngx-pagination.module";
import { OrderByPipe } from "./components/history/order-by.pipe";


@NgModule({
  declarations: [
    HistoryComponent,
    LockerComponent,
    DashboardComponent,
    ReportComponent,
    SkeletonLoaderComponent,
    AddLockerComponent,
    OrderByPipe

  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MainRoutingModule,
    MaterialModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatInputModule,
  ]
})
export class MainModule { }
