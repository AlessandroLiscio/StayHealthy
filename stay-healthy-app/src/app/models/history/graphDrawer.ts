import { HistoryService } from '../../services/history.service';
import { ActivityFrame } from '../../miband/activityframe';
import { Component, ViewChild, ElementRef } from '@angular/core';

import { Options } from 'ng5-slider';
import * as moment from 'moment';
import * as Plotly from 'plotly.js';
import { SurveyService } from '../../services/survey.service';
import { AuthorizationService } from '../../services/authorization.service';

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

  //hr handling
  public invalids: number[] = [];
  public lastValid: number;


  constructor(protected historyService: HistoryService, protected surveyService: SurveyService, protected authorizationService: AuthorizationService) {
    this.labels = [];
    this.activity = [];
    this.heart = [];
    this.time = [];
    /*
    this.graphOptions = {
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
            //minRotation: 90,
            autoSkip: true
          },
          gridLines: {
            display: false
          },
          scaleLabel: {
            filter: (label: string): boolean => {
              return this.showLabelsBasedOnWindow(label)
            }
          }
        }]
      }
    };
    this.chart_type = CHART_TYPE;
    this.minutes_offset = MINUTES_OFFSET;
    */
  }

  /*
  public onUserChange() {
    this.drawGraph();
  }
  */
  drawGraph() {
    /*
    this.labels = this.time.slice(this.minutes_offset, this.minutes_offset + MINUTES_INTERVAL);
    this.datasets = [
      { data: this.activity.slice(this.minutes_offset, this.minutes_offset + MINUTES_INTERVAL), label: "activity" },
      { data: this.heart.slice(this.minutes_offset, this.minutes_offset + MINUTES_INTERVAL), label: "heart rate" }
    ];
    */


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
        /*
        this.sliderOptions = {
          floor: 0,
          ceil: this.time.length - MINUTES_TICK,
          step: MINUTES_TICK,
          translate: (value: number): string => {
            return this.translate(value)
          }
        };
        */
        this.drawGraph();
      },
        error => {
          if (error.status == 401) {
            this.authorizationService.isAuthorized$.next(false);
          }
          console.log(error);
        })
  }


  private reset() {
    this.minutes_offset = MINUTES_OFFSET;
    this.time = [];
    this.labels = [];
    this.activity = [];
    this.heart = [];
  }

  /*
    private translate(value: number): string {
      return this.getHoursAndMinutes(value) + "-" + this.getHoursAndMinutes(value + MINUTES_TICK);
    }
    private getHoursAndMinutes(value: number): string {
      let date = moment(this.startingTime).add(value, 'minutes');
      return date.get('hours') + ":" + date.get('minutes');
    }
  
    private showLabelsBasedOnWindow(label: string): boolean {
      return (this.time.indexOf(label) % this.labelsInterval) == 0;
    }
  */
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
}