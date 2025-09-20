import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@shared/services/auth.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  activeMenu = 'dashboard';
  manageActive = false;
  loggedInUser: any
  logOutConfirm: boolean = false;
  companyInfo: any;
  companyLogo: any;

  operationsCurrentCompany: any;

  constructor(
    private route: Router, 
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loggedInUser = this.authService.loggedInUser
    //this.getCompanyProfile();

  }

  logOut() {
    this.authService.logOut();
  }
}
