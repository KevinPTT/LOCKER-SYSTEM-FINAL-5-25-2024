import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HistoryComponent } from './components/history/history.component';
import { LockerComponent } from './components/locker/locker.component';
import { NotFoundComponent } from '../components/not-found/not-found.component';
import { LoginComponent } from '../components/login/login.component';
import { ReportComponent } from './components/report/report.component';



const routes: Routes = [
  { path: '', redirectTo: './main', pathMatch: 'full' },

  { path: 'dashboard', component: DashboardComponent },
  { path: 'locker', component: LockerComponent },
  { path: 'history', component: HistoryComponent },
  { path: 'report', component: ReportComponent },
  { path: 'not-found', component: NotFoundComponent },
  { path: '**', redirectTo: 'not-found' },
];


// const routes: Routes = [
//   {
//     path: '',
//     component: DashboardComponent,
//     children: [
//       { path: 'dashboard', component: DashboardComponent },
//       { path: 'locker', component: LockerComponent },
//       { path: 'history', component: HistoryComponent },
//       { path: 'report', component: ReportComponent },
//       { path: 'not-found', component: NotFoundComponent },
//       { path: '**', redirectTo: 'not-found' },
//       { path: '', redirectTo: '/main/dashboard', pathMatch: 'full' },
//     ],
//   },
// ];

@NgModule({
  imports: [RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class MainRoutingModule { }
