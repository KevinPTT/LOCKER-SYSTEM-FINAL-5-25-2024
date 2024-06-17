import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MainComponent } from './main/main.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MainModule } from './main/main.module';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { LockerComponent } from './main/components/locker/locker.component';
import { SkeletonLoaderComponent } from './components/skeleton-loader/skeleton-loader.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './main/components/dashboard/dashboard.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { LockerPopupDetailsComponent } from './components/locker-popup-details/locker-popup-details.component';
import { LockerApiService } from './locker-services/locker-api.service'; // Import LockerApiService
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import autoTable from 'jspdf-autotable';
import { NgChartsModule } from 'ng2-charts';
import { NgApexchartsModule } from "ng-apexcharts";
import { MaterialModule } from './modules/material.module';
import { ReportComponent } from './main/components/report/report.component';
import { ToastrModule } from 'ngx-toastr';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AngularPDFMakeModule } from '@supply-chain-ventures.com/angular-pdfmake';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from './services/auth.service';
import { AuthGuard } from './guards/auth.guard';
import { NgxScannerQrcodeModule, LOAD_WASM } from 'ngx-scanner-qrcode';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { NgxPaginationModule } from 'ngx-pagination';
import { MainRoutingModule } from './main/main-routing.module';
import { SwUpdate } from '@angular/service-worker';
import { ServiceWorkerModule } from '@angular/service-worker';
import { TimeDetailsDialogComponent } from './components/time-details-dialog/time-details-dialog.component';
import { MatCardModule } from '@angular/material/card';
import { CookieService } from 'ngx-cookie-service';


@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    LoginComponent,
    NotFoundComponent,
    LockerPopupDetailsComponent,
    TimeDetailsDialogComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    NgxExtendedPdfViewerModule,
    MatIconModule,
    NgChartsModule,
    NgApexchartsModule,
    ToastrModule.forRoot(),
    MatProgressSpinnerModule,
    MatProgressBarModule,
    NgxScannerQrcodeModule,
    ZXingScannerModule,
    NgxPaginationModule,
    MainRoutingModule,
    MatCardModule, 
    MatMenuModule,
    NgxPaginationModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }), 
    

  ],
  providers: [
    LockerApiService,
    AuthService,
    AuthGuard,
    SwUpdate,
    { provide: LocationStrategy, useClass: HashLocationStrategy, },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },

  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
