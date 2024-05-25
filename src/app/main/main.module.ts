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

@NgModule({
  declarations: [
    HistoryComponent,
    LockerComponent,
    DashboardComponent,
    ReportComponent,
    SkeletonLoaderComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MainRoutingModule,
    MaterialModule,
  ]
})
export class MainModule { }
