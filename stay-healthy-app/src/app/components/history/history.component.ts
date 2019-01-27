import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Chart } from 'chart.js';
import { Options } from 'ng5-slider';
import { HistoryService } from 'src/app/services/history.service';
import { PatientService } from 'src/app/services/patient.service';
import { GraphDrawer } from 'src/app/models/history/graphDrawer';
import { Patient } from 'src/app/models/patient/patient';
import { ActivityFrame } from 'src/app/miband/activityframe';
import { PatientSurvey } from 'src/app/models/survey/patientSurvey';
import { SurveyService } from 'src/app/services/survey.service';
import { AuthorizationService } from 'src/app/services/authorization.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent extends GraphDrawer implements OnInit {

  public patient: Patient;

  public labels: string[];
  public activity: number[];
  public heart: number[];
  public datasets;

  constructor(public historyService: HistoryService, public surveyService: SurveyService, public authorizationService: AuthorizationService) {
    super(historyService, surveyService, authorizationService);
   }


  ngOnInit() {
    this.patient = JSON.parse(localStorage.getItem("patientUser"));
  }

  public searchHistory(item){
    let date = item.year + "-" + item.month + "-" + item.day;
    this.getHistory(this.patient.ssn, date);
  }
}
