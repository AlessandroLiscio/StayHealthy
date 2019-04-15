import { HistoryService } from '../../services/history.service';
import { ActivityFrame } from '../../miband/activityframe';
import { Component, ViewChild, ElementRef } from '@angular/core';

import { Options } from 'ng5-slider';
import * as moment from 'moment';
import * as Plotly from 'plotly.js';
import { SurveyService } from '../../services/survey.service';
import { AuthorizationService } from '../../services/authorization.service';
import { PatientSurvey } from '../survey/patientSurvey';
import { ResponseSurvey } from 'src/app/models/survey/responseSurvey';
import { Choice } from '../survey/chioce';
import { images } from '../survey/images';

const OPTIONS = {
  //responsive: true,
  maintainAspectRatio: false,
  elements:
  {
    point:
    {
      radius: 1,
      hitRadius: 5,
      hoverRadius: 10,
      hoverBorderWidth: 2
    }
  },
  scales: {
    xAxes: [{
      ticks: {
        minRotation: 90,
        autoSkip: true
      }/*,
      labels: {
        filter: (label: string): boolean => {
          return this.showLabelsBasedOnWindow(label)
        }
      }*/
    }]
  }
};

const MINUTES_INTERVAL = 480;
const MINUTES_OFFSET = 0;
const MINUTES_TICK = 480;


const CHART_TYPE = 'line';

//declare var Plotly: any;

export abstract class GraphDrawer {

  public chart: ElementRef;
  @ViewChild('chart') set content(content: ElementRef){
    this.chart = content;
  }
  //ngmodel html
  public date;
  public labelsInterval = 72;

  public labels: string[];
  public activity: number[];
  public heart: number[];
  public time: string[];
  public datasets;
  public sliderOptions: Options;
  public graphOptions;
  public chart_type: string;
  public minutes_offset: number;
  public startingTime: string;
  public surveyStatus: string = "Nessun questionario presente per questa data";
  public questions: string[];
  public answers: Choice[];
  public shapes: any[];

  //hr handling
  public invalids: number[] = [];
  public lastValid: number;


  constructor(protected historyService: HistoryService, protected surveyService: SurveyService, protected authorizationService: AuthorizationService) {
    this.labels = [];
    this.activity = [];
    this.heart = [];
    this.time = [];
    this.answers = [];
    this.questions = [];
  }
  drawGraph() {


    this.datasets =
      [{
        x: this.time,
        y: this.activity,

        name: 'activity',
        fill: 'tonexty',
        line: {
          color: 'rgb(216,45,113)'
        }
      },
      {
        x: this.time,
        y: this.heart,
        name: 'heart rate',
        line: {
          color: 'rgb(0, 153, 255)'
        },
        fill: 'tonexty'
      }];
    var style = {
      shapes: this.shapes,
      margin: {
        l: 20,
        r: 20,
        t: 20
      },
      showlegend: true,
      legend: {
        x: 0,
        y: 1,
        traceorder: 'normal',
        font: {
          family: 'sans-serif',
          size: 12,
          color: '#000'
        },
        bgcolor: '#E2E2E2',
        bordercolor: '#FFFFFF',
        borderwidth: 2
      }
    };
    //html element
    let element = this.chart.nativeElement;
      Plotly.newPlot(element, this.datasets, style, { responsive: true, displayModeBar: false });
  }


  protected getHistory(ssn: string, date: string) {
    this.reset();
    this.historyService.getHistory(ssn, date)
      .subscribe((res: ActivityFrame[]) => {
        this.startingTime = res[0].timestamp;
        res.forEach(activity => {
          let date = moment(activity.timestamp);
          this.time.push(date.get('hours') + ":" + date.get('minutes'));
          this.activity.push(activity.intensity);
          this.handleHeartRate(activity.heart_rate);
        });
        this.drawGraph();
      },
        error => {
          if (error.status == 401) {
            this.authorizationService.isAuthorized$.next(false);
          }
          console.log(error);
        });
    this.surveyService.getCompiledSurvey(ssn, date)
      .subscribe((res: PatientSurvey) => {
        this.surveyStatus = null;
        res.answers.forEach(answer => {
          let choice = new Choice(answer, images[answer].imageSelected);
          this.answers.push(choice);
        })
        this.surveyService.getSurvey()
          .subscribe((res: ResponseSurvey) => {
            this.questions = res.questions;
          },
          error => {
            if (error.status == 401) {
              this.authorizationService.isAuthorized$.next(false);
            }
            this.surveyStatus = "C'è stato un errore nel recupero del modello del quesitonario";
          })
      },
      error => {
        if (error.status == 401) {
          this.authorizationService.isAuthorized$.next(false);
        }
        this.surveyStatus = "Nessun questionario presente per questa data";
      })
  }


  private reset() {
    this.minutes_offset = MINUTES_OFFSET;
    this.time = [];
    this.labels = [];
    this.activity = [];
    this.heart = [];
    this.questions = [];
    this.answers = [];
  }

  private handleHeartRate(heart: number) {
    if (heart == 255) {
      this.invalids.push(heart);
    }
    else {
      if (this.invalids.length == 0) {
        this.heart.push(heart);
        this.lastValid = heart;
      }
      else {
        //this.lastValid = heart;
        let start = Math.min(this.lastValid, heart);
        let gap = Math.abs(heart - this.lastValid);
        let scale = gap / (this.invalids.length + 1);
        for (let i = 0; i < this.invalids.length; i++) {
          let validHeart = start + scale;
          start = validHeart;
          this.heart.push(validHeart);
        }
        this.heart.push(heart);
        this.lastValid = heart;
        this.invalids = [];
      }
    }
  }

  private addShapes(data: ActivityFrame[]){
    let counter = 0;
    while(counter < data.length - 1){
      let x1 = data[counter].timestamp;
      let is_sleeping = data[counter].is_sleeping;
      let j = counter + 1;
      //increase counter while data has same mode
      while(data[j].is_sleeping == is_sleeping && j < data.length){
        j++;
      }
      //data at position j has different mode
      let x2 = data[j - 1].timestamp;
      this.buildShape(x1, x2, is_sleeping);
      x1 = data[j].timestamp;
      counter = j;
    }
  }
  private buildShape(x0: string, x1: string, is_sleeping: number){
    let shape = {
      type: 'rect',
      // x-reference is assigned to the x-values
      xref: 'x',
      // y-reference is assigned to the plot paper [0,1]
      yref: 'paper',
      x0: moment(x0).get('hours') + ":" +  moment(x0).get('minutes'),
      y0: 0,
      x1: moment(x1).get('hours') + ":" +  moment(x1).get('minutes'),
      y1: 1,
      fillcolor: is_sleeping? 'rgb(0, 153, 255)' : 'rgb(216,45,113)',
      opacity: 0.2,
      line: {
          width: 0
      }
    }
    this.shapes.push(shape);
  }
}