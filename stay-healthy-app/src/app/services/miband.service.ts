import { Injectable } from '@angular/core';
import { BluetoothCore } from '@manekinekko/angular-web-bluetooth';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { MiBand } from '../miband/miband';
import * as UUIDS from '../miband/constants/uuids';
import * as AuthCodes from '../miband/constants/authenticationcodes';
import * as FetchCodes from '../miband/constants/fetchcodes';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { stringify } from '@angular/compiler/src/util';
import { PatientService } from './patient.service';
import { ActivityFrame } from '../miband/activityframe';
import * as moment from 'moment';

const httpOptions = {
  headers: new HttpHeaders({
   'Content-Type': 'application/json'
  })
};
@Injectable({
  providedIn: 'root'
})
export class MibandService {

  private miBand: MiBand;
  private device: BluetoothDevice;
  public connectionStatus$ = new BehaviorSubject<string>("DISCONNECTED");
  public authorizationStatus$ = new Subject<string>();
  public fetchStatus$ = new Subject<string>();
  public lastFetchDate$ = new Subject<string>();
  public connectionStatus = "DISCONNECTED";
  public authorizationStatus = "NOT_AUTHORIZED";
  public batteryLevel: number = 0;
  public isCharging: boolean;

  constructor(private http: HttpClient, private patientService: PatientService) {
    
  }

  //scan devices
  scanDevices(){
    this.connectionStatus$.next("SCANNING");
    //search for services
    navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [
        UUIDS.UUID_MIBAND_1_SERVICE,
        UUIDS.UUID_MIBAND_2_SERVICE,
        UUIDS.UUID_HEART_RATE_SERVICE,
        UUIDS.UUID_FIRMWARE_SERVICE,
        UUIDS.UUID_IMMEDIATE_ALERT_SERVICE,
        UUIDS.UUID_DEVICE_INFORMATION_SERVICE
      ]
    })
    //when device is found, connect to gatt server
    .then(device => {
      this.device = device;
      this.connectionStatus$.next("CONNECTING");
      this.device.addEventListener("gattserverdisconnected", this.onDisconnected.bind(this));
      return this.device.gatt.connect()
    })
    //initialize a new mi band object
    .then(server => {
      this.miBand = new MiBand(server);
      this.getBattery();
      this.connectionStatus$.next("CONNECTED");
      //get authentication status
      this.miBand.getAuthentication()
        .subscribe((code: string) => {
          console.log(code);
          this.authorizationStatus$.next(code);
        })
    })
    .catch(error => {
      this.connectionStatus$.next("CONNECTION ERROR");
      console.log(error);
    })
  }

  private onDisconnected(event){
    this.connectionStatus$.next("DISCONNECTED");
    this.authorizationStatus$.next("NOT_AUTHORIZED");
    console.log("Disconnected");
  }

  //disconnect miband
  public disconnect(){
    if(this.device){
      this.device.gatt.disconnect();
    }
  }

  //start fetching data
  fetchData(lastFetchDate: string){
    this.miBand.fetchData(lastFetchDate);
    let fetchSubscription = this.miBand.getFetchState()
      .subscribe((fetchState: string) => {
        this.fetchStatus$.next(fetchState);
        console.log("service: " + fetchState);
      })
  }

  //start heart rate and sleep monitor
  monitorStart(){
    this.miBand.enableHRMonitor();
  }

  monitorStop(){
    this.miBand.disableHRMonitor();
  }

  //get battery info
  getBattery(): Promise<number>{
    return this.miBand.getBatteryInfo()
    .then((value: DataView) => {
      return value.getUint8(1);
    })
    .catch(error =>{
      console.log(error);
      return null;
    })
  }

  //send activity buffer to db
  sendToDB(){
    var body = this.miBand.getActivityBuffer();
    this.miBand.clearActivityBuffer();
    return this.http.post("/api/miband",JSON.stringify(body),httpOptions);
  }

}
