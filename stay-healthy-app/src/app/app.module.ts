import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WebBluetoothModule } from '@manekinekko/angular-web-bluetooth';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
//import { HomeComponent } from './components/home/home.component';
import { SurveyComponent } from './components/survey/survey.component';
import { HistoryComponent } from './components/history/history.component';
import { LoginComponent } from './components/login/login.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { MibandComponent } from './components/miband/miband.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

//import { ChartsModule } from '../ng2-charts/ng2-charts';
import { NgbDatepickerModule , NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { Ng5SliderModule } from 'ng5-slider';
 
import { FormsModule } from '@angular/forms';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { AuthGuard } from './auth/auth.guard';
import { PatientGuard } from './auth/patient.guard';
import { DoctorGuard } from './auth/doctor.guard';
import { DoctorHistoryComponent } from './components/doctor-history/doctor-history.component';
import { MessagesComponent } from './components/messages/messages.component';

const appRoutes: Routes = [
  { path: '', component: LoginComponent},
  { path: 'patient', component: MibandComponent, canActivate: [PatientGuard] },
  { path: 'patient/survey', component: SurveyComponent, canActivate: [PatientGuard] },
  { path: 'patient/history', component: HistoryComponent, canActivate: [PatientGuard] },
  { path: 'patient/messages', component: MessagesComponent, canActivate: [PatientGuard] },
  
  { path: 'doctor', component: DoctorHistoryComponent, canActivate: [DoctorGuard] },
  { path: 'doctor/messages', component: MessagesComponent, canActivate: [DoctorGuard] },
  { path: '**', component: PageNotFoundComponent}
];

@NgModule({
  declarations: [
    AppComponent,
    //HomeComponent,
    SurveyComponent,
    HistoryComponent,
    LoginComponent,
    NavbarComponent,
    MibandComponent,
    PageNotFoundComponent,
    DoctorHistoryComponent,
    MessagesComponent
  ],
  imports: [
    HttpClientModule,
    FormsModule,
    Ng5SliderModule,
    NgbDatepickerModule,
    NgbTypeaheadModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: false } // <-- debugging purposes only
    ),
    BrowserModule,
    ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production }),
    WebBluetoothModule.forRoot({
      enableTracing: false // or false, this will enable logs in the browser's console
    })
    //ChartsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
