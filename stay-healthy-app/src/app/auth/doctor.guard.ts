import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { LoginService } from '../services/login.service';

@Injectable({
  providedIn: 'root'
})
export class DoctorGuard implements CanActivate {

  constructor(private loginService: LoginService){}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if(localStorage.getItem("doctorUser")){
      //set loggedin as true when page is refreshed
      this.loginService.loggedIn$.next(true);
      this.loginService.roleLoggedIn$.next("doctor");
      this.loginService.role = "doctor";
      return true;
    }
    return false;
  }
}
