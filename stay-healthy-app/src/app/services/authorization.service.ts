import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationService {

  public isAuthorized$: BehaviorSubject<boolean>;

  constructor() { 
    this.isAuthorized$ = new BehaviorSubject<boolean>(true);
  }
}
