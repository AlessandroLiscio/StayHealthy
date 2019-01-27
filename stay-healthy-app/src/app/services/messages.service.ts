import { Injectable } from '@angular/core';
import { Message } from '../models/messages/message';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

const httpOptions = {
  headers: new HttpHeaders({
   'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class MessagesService {

  constructor(private http: HttpClient) { }

  
  public getMessages(ssn: string): Observable<Message[]>{
    return this.http.get<Message[]>("/api/messages/user");
  }

  public sendMessage(message: Message){
    return this.http.post("/api/message", JSON.stringify(message), httpOptions);
  }

  public deleteMessage(message: Message){
    return this.http.delete("/api/message?uuid=" + message.uuid, httpOptions);
  }
  
}
