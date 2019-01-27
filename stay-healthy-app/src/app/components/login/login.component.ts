import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/services/login.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public authResponse: string;
  public username: string;
  public password: string;

  constructor(
    private loginService: LoginService
  ) { }

  //check if user is not logged out
  ngOnInit() {
    if(localStorage.getItem("patientUser")){
      this.loginService.loggedIn$.next(true);
      this.loginService.roleLoggedIn$.next("patient");
      this.loginService.role = "patient";
      this.loginService.router.navigate(['/patient']);
    }
    if(localStorage.getItem("doctorUser")){
      this.loginService.loggedIn$.next(true);
      this.loginService.roleLoggedIn$.next("doctor");
      this.loginService.role = "doctor";
      this.loginService.router.navigate(['/doctor']);
    }
  }

  onLogIn(): void{
    this.loginService.login(this.username, this.password);
  }

}
