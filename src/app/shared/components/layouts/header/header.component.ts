import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@shared/services/auth.service';
import { UtilityService } from '@shared/services/utility.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  loggedInUser:any;
  userInitials!:string;
  logOutConfirm: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private utilityService: UtilityService,
  ) {}

  ngOnInit(): void {
    this.loggedInUser = this.authService.loggedInUser;
    this.userInitials = `${this.loggedInUser.firstName[0]}${this.loggedInUser.lastName[0]}`
  }

  logOut() {
    this.authService.logOut();
  }

}
