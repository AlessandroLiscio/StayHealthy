import { Component, OnInit } from '@angular/core';
import * as SurveyAngular from 'survey-angular';
import { SurveyService } from 'src/app/services/survey.service';
import { Survey } from 'src/app/models/survey/survey';
import { Choice } from 'src/app/models/survey/chioce';
import { Question } from 'src/app/models/survey/question';
import { Patient } from 'src/app/models/patient/patient';
import { AuthorizationService } from 'src/app/services/authorization.service';

const images: {imageNotSelected: string, imageSelected: string}[] = [
  {imageNotSelected: "../../../assets/img/0v.jpeg", imageSelected: "../../../assets/img/0.jpeg" },
  {imageNotSelected: "../../../assets/img/1v.jpeg", imageSelected: "../../../assets/img/1.jpeg" },
  {imageNotSelected: "../../../assets/img/2v.jpeg", imageSelected: "../../../assets/img/2.jpeg" },
  {imageNotSelected: "../../../assets/img/3v.jpeg", imageSelected: "../../../assets/img/3.jpeg" },
  {imageNotSelected: "../../../assets/img/4v.jpeg", imageSelected: "../../../assets/img/4.jpeg" },
  {imageNotSelected: "../../../assets/img/5v.jpeg", imageSelected: "../../../assets/img/5.jpeg" }
];

@Component({
  selector: 'app-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.css']
})
export class SurveyComponent implements OnInit {

  public survey: Survey = {
    title: "Questionario giornaliero",
    questions: [
      {
        id: 0,
        title: 'Depressione',
        choices: [
          { name: "zero", value: 0, image: images[0].imageNotSelected },
          { name: "one", value: 1, image: images[1].imageNotSelected },
          { name: "two", value: 2, image: images[2].imageNotSelected },
          { name: "three", value: 3, image: images[3].imageNotSelected },
          { name: "four", value: 4, image: images[4].imageNotSelected },
          { name: "five", value: 5, image: images[5].imageNotSelected }
        ]
      },
      {
        id: 1,
        title: 'Dolore',
        choices: [
          { name: "zero", value: 0, image: images[0].imageNotSelected },
          { name: "one", value: 1, image: images[1].imageNotSelected },
          { name: "two", value: 2, image: images[2].imageNotSelected },
          { name: "three", value: 3, image: images[3].imageNotSelected },
          { name: "four", value: 4, image: images[4].imageNotSelected },
          { name: "five", value: 5, image: images[5].imageNotSelected }
        ]
      },
      {
        id: 2,
        title: 'Stato di salute',
        choices: [
          { name: "zero", value: 0, image: images[0].imageNotSelected },
          { name: "one", value: 1, image: images[1].imageNotSelected },
          { name: "two", value: 2, image: images[2].imageNotSelected },
          { name: "three", value: 3, image: images[3].imageNotSelected },
          { name: "four", value: 4, image: images[4].imageNotSelected },
          { name: "five", value: 5, image: images[5].imageNotSelected }
        ]
      }
    ]
  }
  public answers: number[] = [null, null, null];
  public loadingStatus: string;
  public patient: Patient;


  constructor(private surveyService: SurveyService, private authorizationService: AuthorizationService) {
    this.patient = JSON.parse(localStorage.getItem("patientUser"));
  }

  ngOnInit() {
    this.loadingStatus = "Caricamento del questionario in corso";
    //this.getSurvey();
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

