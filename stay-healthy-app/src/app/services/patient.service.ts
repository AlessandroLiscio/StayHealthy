import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Patient } from '../models/patient/patient';
import { Observable } from 'rxjs';
import { Doctor } from '../models/doctor/doctor';
import { ResponsePatient } from '../models/patient/responsePatient';
import { ResponseDoctor } from '../models/doctor/responseDoctor';

@Injectable({
  providedIn: 'root'
})
export class PatientService {

  public patient: Patient;
  public doctor: Doctor;

  constructor(private http: HttpClient) {

   }

   public getPatient(): Observable<ResponsePatient>{
    return this.http.get<ResponsePatient>("/api/patient");
  }

  
  public getDoctor(): Observable<ResponseDoctor>{
    return this.http.get<ResponseDoctor>("/api/patient/doctor");
  }
}
