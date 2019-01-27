import { Component, OnInit } from '@angular/core';
import { MessagesService } from 'src/app/services/messages.service';
import { Message } from 'src/app/models/messages/message';
import { LoginService } from 'src/app/services/login.service';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { Patient } from 'src/app/models/patient/patient';
import { Doctor } from 'src/app/models/doctor/doctor';
import { ResponsePatient } from 'src/app/models/patient/responsePatient';
import * as uuid from 'uuid';
import { DisplayableMessage } from 'src/app/models/messages/displayableMessage';
import { AuthorizationService } from 'src/app/services/authorization.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {

  public role: string;
  public patientUser: Patient;
  public doctorUser: Doctor;

  public incomingMessages: DisplayableMessage[];
  public messageToDelete: DisplayableMessage;
  public currentMessage: Message;
  public newMessage: Message = new Message();
  public formatMatches;

  constructor(private messageService: MessagesService, private loginService: LoginService, private authorizationService: AuthorizationService) { 
    //doctor search format matches
    this.formatMatches = (value: ResponsePatient) => (value.first_name + " " + value.last_name + " (" + value.patient_ssn + ")") || "";
    this.incomingMessages = [];
  }

  ngOnInit() {
    if(this.loginService.role == "patient"){
      this.patientUser = JSON.parse(localStorage.getItem("patientUser"));
      this.getMessages(this.patientUser.ssn);
    }
    else{
      this.doctorUser = JSON.parse(localStorage.getItem("doctorUser"));
      this.getMessages(this.doctorUser.ssn);
    }
  }


  //select message to be displayed
  public changeCurrentMessage(message: Message){
    this.currentMessage = message;
  } 

  public sendMessage(receiver?: string, object?: string){
    this.newMessage.uuid = uuid();
    if(this.loginService.role == "patient"){
      this.newMessage.sender = this.patientUser.ssn;
      this.newMessage.receiver = this.patientUser.doctor.doctor_ssn;
    }
    else{
      this.newMessage.sender = this.doctorUser.ssn;
      if(receiver){
        this.newMessage.receiver = receiver;
      }
    }
    this.newMessage.date = new Date(Date.now());
    if(object){
      this.newMessage.object = object;
    }
    this.messageService.sendMessage(this.newMessage)
      .subscribe(res => {
        console.log(res);
      },
      error => {
        if(error.status == 401){
        this.authorizationService.isAuthorized$.next(false);
      }
        console.log(error);
      })

    this.newMessage = new Message();
  }

  public deleteMessage(){
    if(this.messageToDelete){
      this.messageService.deleteMessage(this.messageToDelete.message)
        .subscribe(res => {
          console.log(res);
          //delete message from incoming messages
          this.incomingMessages.splice(this.incomingMessages.indexOf(this.messageToDelete), 1);
          this.messageToDelete = null;
        },
        error => {
          if(error.status == 401){
            this.authorizationService.isAuthorized$.next(false);
          }
          console.log(error);
        })
    }
  }

  //message to delete
  public selectMessage(message: DisplayableMessage){
    this.messageToDelete = message;
  }

  //doctor search bar
  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 2 ? []
        : this.doctorUser.patients.filter(v => (v.first_name + " " + v.last_name + " (" + v.patient_ssn +")").toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    )

    //get messages from server
    private getMessages(ssn: string){
      this.messageService.getMessages(ssn)
        .subscribe((messages: Message[]) => {
          messages.forEach(message => {
            this.incomingMessages.push(new DisplayableMessage(message));
          });
        },
        error => {
          if(error.status == 401){
            this.authorizationService.isAuthorized$.next(false);
          }
          console.log(error);
        })
    }

    //doctor selects message's receiver
    public selectReceiver(receiver){
      this.newMessage.receiver = receiver.item.patient_ssn;
    }
}
