import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HistoryComponent } from './components/history/history.component';
import { LockerComponent } from './components/locker/locker.component';
import { NotFoundComponent } from '../components/not-found/not-found.component';
import { ReportComponent } from './components/report/report.component';
import { AddLockerComponent } from './components/locker/addlocker/addlocker.component';



const routes: Routes = [
  { path: '', redirectTo: './main', pathMatch: 'full' },

  { path: 'dashboard', component: DashboardComponent },
  { path: 'locker', component: LockerComponent },
  { path: 'history', component: HistoryComponent },
  { path: 'report', component: ReportComponent },
  { path: 'locker/addlocker', component: AddLockerComponent },

  { path: 'not-found', component: NotFoundComponent },
  { path: '**', redirectTo: 'not-found' },
];


@NgModule({
  imports: [RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class MainRoutingModule { }
