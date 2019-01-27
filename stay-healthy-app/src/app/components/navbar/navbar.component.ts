import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  isLoggedIn: Observable<boolean>;
  role: string;

  constructor(private loginService: LoginService) { }

  //display navbar only if user is logged in and check his role
  ngOnInit(): void {
    this.isLoggedIn = this.loginService.loggedIn$;
    this.loginService.roleLoggedIn$
      .subscribe((role: string) => {
        this.role = role;
      },
      error => {
        console.log(error + ": Errore nel recupero del ruolo");
      })
  }

  onLogout(): void{
    this.loginService.logout();
  }
}
