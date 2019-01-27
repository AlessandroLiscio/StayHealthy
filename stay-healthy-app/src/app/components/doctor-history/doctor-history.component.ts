import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { DoctorService } from 'src/app/services/doctor.service';
import { Patient } from 'src/app/models/patient/patient';
import { HistoryService } from 'src/app/services/history.service';
import { GraphDrawer } from 'src/app/models/history/graphDrawer';
import { Doctor } from 'src/app/models/doctor/doctor';
import { ResponsePatient } from 'src/app/models/patient/responsePatient';
import { SurveyService } from 'src/app/services/survey.service';
import { AuthorizationService } from 'src/app/services/authorization.service';

const patients = [
  "Giacomo Rocchetti (RCCGCM97E31E388M)",
  "Alessandro Liscio (LSCAGHVUEVOVIEWV)",
  "Samuele Cucchi (CCHSMLEVIOEBUVU)"
]
@Component({
  selector: 'app-doctor-history',
  templateUrl: './doctor-history.component.html',
  styleUrls: ['./doctor-history.component.css']
})
export class DoctorHistoryComponent extends GraphDrawer implements OnInit {
  
  public doctor: Doctor;
  public patientSelected: ResponsePatient;
  public formatMatches;

  constructor(private doctorService: DoctorService, public historyService: HistoryService, public surveyService: SurveyService, public authorizationService: AuthorizationService) {
    //graph drawer constructor
    super(historyService, surveyService, authorizationService);
    //format matches for search bar
    this.formatMatches = (value: ResponsePatient) => (value.first_name + " " + value.last_name + " (" + value.patient_ssn + ")") || "";
  }

  
  ngOnInit() {
    this.doctor = JSON.parse(localStorage.getItem("doctorUser"));
  }


  //search function for search bar
  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 2 ? []
        : this.doctor.patients.filter(v => (v.first_name + " " + v.last_name + " (" + v.patient_ssn +")").toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    )

    selectPatient(patient){
      this.patientSelected = patient.item;
    }

    //function getHistory located at graph drawer
   searchHistory(item){
    let date = item.year + "-" + item.month + "-" + item.day;
    if(this.patientSelected){
      this.getHistory(this.patientSelected.patient_ssn, date);
    }
   }
}
