import { Injectable } from '@angular/core';
import { Patient } from '../models/patient/patient';
import { BehaviorSubject, Observable } from 'rxjs';
import { Doctor } from '../models/doctor/doctor';
import { HttpClient } from '@angular/common/http';
import { ResponseDoctor } from '../models/doctor/responseDoctor';
import { ResponsePatient } from '../models/patient/responsePatient';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {

  public patients: Patient[] = [];
  public doctor: Doctor;
  public loadCompleted$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) { }

  public getPatients(): Observable<ResponsePatient[]>{
    return this.http.get<ResponsePatient[]>("/api/doctor/patients");
  }

  
  public getDoctor(): Observable<ResponseDoctor>{
    return this.http.get<ResponseDoctor>("/api/doctor");
  } 
}
