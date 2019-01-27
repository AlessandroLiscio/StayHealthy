import { Component } from '@angular/core';
import { LoginService } from './services/login.service';
import { ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { AuthorizationService } from './services/authorization.service';

declare var jQuery: any;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  @ViewChild('unauthorized') unauthorized:ElementRef;
  constructor(private loginService: LoginService, private authorizationService: AuthorizationService){}

  ngOnInit(){
    //check if user receives a 401 response
    this.authorizationService.isAuthorized$
      .subscribe((isAuthorized: boolean) => {
        if(!isAuthorized){
          //open modal fade
          jQuery(this.unauthorized.nativeElement).modal('show');
        }
      })
  }
  
  public logout(){
    this.loginService.logout();
  }
  
}
