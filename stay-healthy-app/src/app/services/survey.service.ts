import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

const httpOptions = {
  headers: new HttpHeaders({
   'Content-Type': 'application/json'
  })
};
@Injectable({
  providedIn: 'root'
})
export class SurveyService {

  public survey;
  public loadCompleted$ = new BehaviorSubject<boolean>(false);
  public loadingStatus: string; 

  constructor(private http: HttpClient) { }

  /*
  public getSurvey(): Observable<ResponseSurvey>{
    return this.http.get<ResponseSurvey>("/api/survey?id=PHQ-9");
  }

  public sendSurvey(survey: PatientSurvey){
    let body = JSON.stringify(survey);
    return this.http.post("/api/patient_survey", body, httpOptions);
  }
*/
  getCompiledSurvey(ssn: string, date: string){
    return this.http.get("/api/patient_survey?patient_ssn=" + ssn + "&date=" + date);
  }
}
