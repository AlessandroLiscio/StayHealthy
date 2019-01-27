import { Injectable } from '@angular/core';
import { Options } from 'ng5-slider';
import { ActivityFrame } from '../miband/activityframe';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root' 
})
export class HistoryService {
  
  constructor(private http: HttpClient) { }

  public getHistory(ssn: string, date: string): Observable<ActivityFrame[]>{
    return this.http.get<ActivityFrame[]>("/api/miband?patient_ssn=" + ssn + "&dayFrom=" + date + "T0:0&dayTo=" + date + "T23:59");
  }
}
