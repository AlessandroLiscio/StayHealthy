import { Component, OnInit } from '@angular/core';
import * as SurveyAngular from 'survey-angular';
import { SurveyService } from 'src/app/services/survey.service';
import { Survey } from 'src/app/models/survey/survey';
import { Choice } from 'src/app/models/survey/chioce';
import { Question } from 'src/app/models/survey/question';
import { Patient } from 'src/app/models/patient/patient';
import { AuthorizationService } from 'src/app/services/authorization.service';
import { ResponseSurvey } from 'src/app/models/survey/responseSurvey';
import { images } from 'src/app/models/survey/images';
import { BehaviorSubject } from 'rxjs';
import { PatientSurvey } from 'src/app/models/survey/patientSurvey';



@Component({
  selector: 'app-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.css']
})
export class SurveyComponent implements OnInit {

  public survey: Survey;
  public answers: number[] = [null, null, null];
  public loadingStatus: string;
  public patient: Patient;
  public isLoadingCompleted$: BehaviorSubject<boolean> = new BehaviorSubject(false);


  constructor(private surveyService: SurveyService, private authorizationService: AuthorizationService) {
    this.patient = JSON.parse(localStorage.getItem("patientUser"));
  }

  ngOnInit() {
    this.loadingStatus = "Caricamento del questionario in corso";
    this.getSurvey();
  }

  public setValue(question: Question, choice: Choice) {
    this.answers[question.id] = choice.value;
    question.choices[choice.value].image = images[choice.value].imageSelected;
    this.clearImages(question, choice.value);
    console.log(this.answers);
  }

  public clearImages(question: Question, selected: number){
    question.choices.forEach(choice => {
      if(choice.value != selected){
        choice.image = images[choice.value].imageNotSelected;
      }
    })
  }

  public submit(){
    let surveyToSend = new PatientSurvey();
    
  }

  private getSurvey(){
    this.surveyService.getCompiledSurvey(this.patient.ssn, new Date(Date.now()).toISOString())
      .subscribe(res => {
        this.loadingStatus = "Il questionario è già stato compilato oggi, torna domani!";
      },
      error => {
        if(error.status == 401){
          this.authorizationService.isAuthorized$.next(false);
        }
        this.surveyService.getSurvey()
          .subscribe((res: ResponseSurvey) => {
            this.survey = new Survey(res.title);
            for(let i = 0; i < res.questions.length; i++){
              let choices: Choice[] = [];
              for(let i = 0; i < 6; i++){
                let choice = new Choice(i, images[i].imageNotSelected);
                choices.push(choice);
              }
              let newQuestion = new Question(i, res.questions[i], choices);
              this.survey.questions.push(newQuestion);
            }
            this.isLoadingCompleted$.next(true);
          },
          error => {
            if(error.status == 401){
              this.authorizationService.isAuthorized$.next(false);
            }
            else{
              this.loadingStatus = "Errore nel caricamento del questionario";
            }
          })
      })
}
  /*
  //get survey from server
  private getSurvey() {
    this.surveyService.getCompiledSurvey(this.patient.ssn, new Date(Date.now()).toISOString())
      .subscribe((res: PatientSurvey) => {
        this.loadingStatus = "Il questionario è già stato compilato oggi, torna domani!";
      },
      error => {
        if(error.status == 401){
          this.authorizationService.isAuthorized$.next(false);
        }
        this.surveyService.getSurvey()
          .subscribe((survey: ResponseSurvey) => {
            this.loadingStatus = null;
            //build survey that fits survey.js standard
            this.survey = this.buildSurvey(survey);
            this.displaySurvey(this.survey);
          },
            error => {
              if(error.status == 401){
                this.authorizationService.isAuthorized$.next(false);
              }
              console.log(error);
              this.loadingStatus = "Errore nel caricamento del questionario";
            })
      });
  }

  private displaySurvey(survey: any) {
    var model = new SurveyAngular.ReactSurveyModel(survey);
    //when survey is completed, send answers to server
    model.onComplete.add(result => {
      let answers = [];
      this.questionIDs.forEach(id => {
        answers.push(parseInt(result.data[id]));
      });
      
      var patientSurvey = new PatientSurvey(this.patient.ssn, new Date(Date.now()), this.surveyID, answers);
      this.surveyService.sendSurvey(patientSurvey)
        .subscribe(res => {
          console.log(res);
        },
        error =>{
          if(error.status == 401){
            this.authorizationService.isAuthorized$.next(false);
          }
          console.log(error);
        });
      this.questionIDs = [];
    });
    
    SurveyAngular.StylesManager.applyTheme("bootstrap");
    SurveyAngular.SurveyNG.render('surveyContainer', { model: model });
  }

  //helper function that builds survey according to survey.js standards
  private buildSurvey(responseSurvey: ResponseSurvey): Survey{
    this.surveyID = responseSurvey.id;
    var survey = new Survey(responseSurvey.title);
    survey.pages = [];
    var counter: number = 1;
    responseSurvey.questions.forEach((question: ResponseQuestion) => {
      this.questionIDs.push(question.id);
      var page = new Page("page" + counter);
      var element = new Element(question.id, question.text);
      question.choices.forEach((responseChoice: ResponseChoice) => {
        var choice = new Choice(responseChoice.value, responseChoice.text);
        element.choices.push(choice);
      })
      page.elements.push(element);
      survey.pages.push(page);
      counter++;
    });
    return survey;
  }
*/

}

