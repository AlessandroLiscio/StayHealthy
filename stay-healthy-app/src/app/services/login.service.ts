import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JsonResponse } from '../models/jsonresponse';
import { PatientService } from './patient.service';
import { DoctorService } from './doctor.service';
import { Patient } from '../models/patient/patient';
import { Doctor } from '../models/doctor/doctor';
import { ResponsePatient } from '../models/patient/responsePatient';
import { ResponseDoctor } from '../models/doctor/responseDoctor';
import { MibandService } from './miband.service';
import { AuthorizationService } from './authorization.service';
import * as Cookies from 'js-cookie';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/x-www-form-urlencoded'
  })
};

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  public loggedIn$ = new BehaviorSubject<boolean>(false);
  public roleLoggedIn$ = new Subject<string>();
  public role: string;

  constructor(
    public router: Router,
    private http: HttpClient,
    private patientService: PatientService,
    private doctorService: DoctorService,
    private miBandService: MibandService,
    private authorizationService: AuthorizationService
  ) { }

  login(username: string, password: string): void {
    this.requestLogin(username, password)
      .subscribe((res: any) => {
        if (res.ServerResponse == "patient") {
          this.initalizePatientUser();
        }
        else if (res.ServerResponse == "doctor") {
          this.initializeDoctorUser();
        }
      },
        error => {
          if (error.status == 401) {
            this.authorizationService.isAuthorized$.next(false);
          }
          console.log(error.status + ": " + error.error.ServerResponse);
        })
  }

  initalizePatientUser() {
    this.patientService.getPatient()
      .subscribe((patient: ResponsePatient) => {
        this.patientService.getDoctor()
          .subscribe((doctor: ResponseDoctor) => {
            var patientUser = new Patient(patient.patient_ssn, patient.first_name, patient.last_name, patient.date_of_birth, patient.last_fetch_date, doctor);
            localStorage.setItem("patientUser", JSON.stringify(patientUser));
            this.loggedIn$.next(true);
            this.roleLoggedIn$.next("patient");
            this.role = "patient";
            this.router.navigate(['/patient']);
          },
            error => {
              if (error.status == 401) {
                this.authorizationService.isAuthorized$.next(false);
              }
              console.log("errore nella ricerca del medico curante");
            })
      },
        error => {
          if (error.status == 401) {
            this.authorizationService.isAuthorized$.next(false);
          }
          console.log("Errore nella ricerca del paziente");
        })
  }

  initializeDoctorUser() {
    this.doctorService.getDoctor()
      .subscribe((doctor: ResponseDoctor) => {
        this.doctorService.getPatients()
          .subscribe((patients: ResponsePatient[]) => {
            var doctorUser = new Doctor(doctor.doctor_ssn, doctor.first_name, doctor.last_name, doctor.date_of_birth, patients);
            localStorage.setItem("doctorUser", JSON.stringify(doctorUser));
            this.loggedIn$.next(true);
            this.roleLoggedIn$.next("doctor");
            this.role = "doctor";
            this.router.navigate(['/doctor']);
          },
            error => {
              if (error.status == 401) {
                this.authorizationService.isAuthorized$.next(false);
              }
              console.log("Errore nella ricerca dei pazienti");
            })
      },
        error => {
          if (error.status == 401) {
            this.authorizationService.isAuthorized$.next(false);
          }
          console.log("Errore nella ricerca del dottore");
        })
  }

  requestLogin(username: string, password: string) {
    let body = `username=${username}&password=${password}`;
    return this.http.post("/api/login", body, httpOptions);
  }

  requestLogout() {
    return this.http.get("/api/logout");
  }

  logout(): void {
    this.requestLogout()
      .subscribe(res => {
        console.log(res)
      },
        error => {
          console.log(error)
        })
    //disconnect from miband
    this.miBandService.disconnect();
    this.loggedIn$.next(false);
    //clear localstorage
    localStorage.clear();
    //back to login page
    this.router.navigate(['']);
  }
}
