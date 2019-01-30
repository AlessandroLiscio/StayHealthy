import { HistoryService } from '../../services/history.service';
import { ActivityFrame } from '../../miband/activityframe';

import { Options } from 'ng5-slider';
import * as moment from 'moment';
import { SurveyService } from '../../services/survey.service';
import { PatientSurvey } from '../survey/patientSurvey';
import { ResponseSurvey } from '../survey/responseSurvey';
import { DisplayableAnswer } from '../survey/displayableAnswer';
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

export abstract class GraphDrawer {

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
  public survey: PatientSurvey;
  public surveyStatus: string = "Nessun questionario presente per questa data";
  public answers: DisplayableAnswer[];

  //hr handling
  public invalids: number[] = [];
  public lastValid: number;


  constructor(protected historyService: HistoryService, protected surveyService: SurveyService, protected authorizationService: AuthorizationService) {
    this.answers = [];
    this.labels = [];
    this.activity = [];
    this.heart = [];
    this.time = [];
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
  }

  public onUserChange() {
    this.drawGraph();
  }

  drawGraph() {

    //this.labels = this.time.filter(el => this.time.indexOf(el) % this.labelsInterval == 0).slice(this.minutes_offset, this.minutes_offset + MINUTES_INTERVAL);
    this.labels = this.time.slice(this.minutes_offset, this.minutes_offset + MINUTES_INTERVAL);
    this.datasets = [
      { data: this.activity.slice(this.minutes_offset, this.minutes_offset + MINUTES_INTERVAL), label: "activity" },
      { data: this.heart.slice(this.minutes_offset, this.minutes_offset + MINUTES_INTERVAL), label: "heart rate" }
    ];
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
        this.sliderOptions = {
          floor: 0,
          ceil: this.time.length - MINUTES_TICK,
          step: MINUTES_TICK,
          translate: (value: number): string => {
            return this.translate(value)
          }
        };
        this.drawGraph();
      },
        error => {
          if (error.status == 401) {
            this.authorizationService.isAuthorized$.next(false);
          }
          console.log(error);
        })
    this.surveyService.getCompiledSurvey(ssn, date)
      .subscribe((patientSurvey: PatientSurvey) => {
        this.surveyStatus = null;
        this.surveyService.getSurvey()
          .subscribe((survey: ResponseSurvey) => {
            for (let i = 0; i < survey.questions.length; i++) {
              survey.questions[i].choices.forEach(choice => {
                if (choice.value == patientSurvey.answers[i] && choice.value != null) {
                  this.answers.push(new DisplayableAnswer(survey.questions[i].text, choice.text, patientSurvey.answers[i]));
                }
              });
            }
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
    this.answers = [];
  }


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

  private handleHeartRate(heart: number){
    if(heart == 255){
      this.invalids.push(heart);
    }
    else{
      if(this.invalids.length == 0){
        this.heart.push(heart);
        this.lastValid = heart;
      }
      else{
        //this.lastValid = heart;
        let start = Math.min(this.lastValid, heart);
        let gap = Math.abs(heart - this.lastValid);
        let scale = gap / (this.invalids.length + 1);
        for(let i = 0; i < this.invalids.length; i++){
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