import { Component, OnInit } from '@angular/core';
import { MibandService } from 'src/app/services/miband.service';
import { Observable, Subscription } from 'rxjs';
import * as FetchCodes from '../../miband/constants/fetchcodes';
import { PatientService } from 'src/app/services/patient.service';
import { Patient } from 'src/app/models/patient/patient';
import { Doctor } from 'src/app/models/doctor/doctor';
import * as moment from 'moment';
import { AuthorizationService } from 'src/app/services/authorization.service';
import { ResponsePatient } from 'src/app/models/patient/responsePatient';


const animationString = '<span><i class="fa fa-spinner fa-pulse"></i></span>';

@Component({
  selector: 'app-miband',
  templateUrl: './miband.component.html',
  styleUrls: ['./miband.component.css']
})

export class MibandComponent implements OnInit {

  public patient: Patient;
  public lastFecthDate: string;
  //public doctor: Doctor;
  public connection: string;
  public authentication: string;
  public fetchStatus: string;
  public fetchCode: string;
  public connectionStatus: string;
  public batteryLevel: number;
  public isCharging: boolean;
  public authorizationSubscritpion: Subscription;
  public connectionSubscription: Subscription;

  constructor(private miBandService: MibandService, public patientService: PatientService, public authorizationService: AuthorizationService) {
    this.authentication = this.miBandService.authorizationStatus;
  }

  ngOnInit() {
    this.patient = JSON.parse(localStorage.getItem("patientUser"));
    this.lastFecthDate = moment(this.patient.last_fetch_date).toString().slice(0, -9);

    this.authorizationSubscritpion = this.manageAuthorizationStatus();
    this.connectionSubscription = this.manageConnectionStatus();
  }

  ngOnDestroy(){
    this.authorizationSubscritpion.unsubscribe();
    this.connectionSubscription.unsubscribe();
  }


  public scanDevices() {
    this.miBandService.scanDevices();
  }

  public fetch() {
    this.miBandService.fetchData(this.patient.last_fetch_date);
    this.manageFetchStatus();
  }

  public monitorStart() {
    this.miBandService.monitorStart();
  }

  public monitorStop() {
    this.miBandService.monitorStop();
  }

  public disconnect(){
    this.miBandService.disconnect();
  }

  //check authorization status of miband
  private manageAuthorizationStatus(): Subscription{
    return this.miBandService.authorizationStatus$
      .subscribe((code: string) => {
        console.log(code)
        if(code == "AUTHENTICATED"){
          this.getBattery();
        }
        this.authentication = code;
        this.miBandService.authorizationStatus = code;
      });
  }

  //check connection status of miband
  private manageConnectionStatus(): Subscription{

    return this.miBandService.connectionStatus$
      .subscribe((status: string) => {
        console.log(status);
        switch (status) {
          case "SCANNING":
            this.connectionStatus = "Cercando dispositivi compatibili ";
            break;
          case "CONNECTING":
            this.connectionStatus = "Connessione in corso ";
            break;
          case "CONNECTION ERROR":
            this.connectionStatus = "C'è stato un errore di connessione. Per favore riprova."
            break;
          case "CONNECTED":
            this.connectionStatus = "Connesso! Autenticazione in corso ";
            //this.getBattery();
            break;
          default:
            this.connectionStatus = null;
            break;
        }
        this.connection = status;
      });
  }

  //check fetch status of miband
  private manageFetchStatus(){
    let fetchSubscription = this.miBandService.fetchStatus$
      .subscribe((status: string) => {

        this.fetchCode = status;
        console.log("component: " + this.fetchCode);

        if(status != FetchCodes.FINISHED && status != FetchCodes.TERMINATED && status != FetchCodes.ERROR && status != FetchCodes.NO_DATA){
          this.fetchStatus = "Recupero dei dati ";
        }
        else if(status == FetchCodes.NO_DATA){
          this.fetchStatus = "Nessun dato disponibile";
        }
        else if(status == FetchCodes.ERROR){
          this.fetchStatus = "C'è stato un errore!!";
        }
        else if(status == FetchCodes.TERMINATED){
          this.fetchStatus = "Qualcosa è andato storto";
        }
        else if(status == FetchCodes.FINISHED){
          this.fetchStatus = "Invio dei dati";
          //data fetch finished, time to send it to db
          this.miBandService.sendToDB()
            .subscribe((res: any) => {
              console.log(res)
              //update patient last fetch date
              this.patient.last_fetch_date = res.ServerResponse;
              this.lastFecthDate = moment(res.ServerResponse).toString().slice(0, -9);
              this.fetchStatus = "Dati inviati con successo!";
            },
            error => {
              if(error.status == 401){
                this.authorizationService.isAuthorized$.next(false);
              }
              this.fetchStatus = "C'è stato un errore nell'invio dei dati.";
              console.log(error);
              this.getPatientLastFetchDate();
            })
          fetchSubscription.unsubscribe();
        }
      })
  }

  //get battery level
  private async getBattery(){
    this.miBandService.getBattery()
      .then((result: number) => {
        this.batteryLevel = result;
      })
  }

  getPatientLastFetchDate(){
    this.patientService.getPatient()
      .subscribe((patient: ResponsePatient) => {
        this.patient.last_fetch_date = patient.last_fetch_date;
      },
      error => {
        console.log(error);
      })
  }
}
