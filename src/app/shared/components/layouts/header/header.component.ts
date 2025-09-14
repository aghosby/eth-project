import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UtilityService } from '@shared/services/utility.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  loggedInUser:any;
  userInitials:string = 'AE';
  logOutConfirm: boolean = false;

  constructor(
    private router: Router,
    private utilityService: UtilityService,
  ) {}

  ngOnInit(): void {
      
  }

  logOut() {
    this.router.navigate([`../login`]);
    // sessionStorage.clear();
    // localStorage.clear();
    setTimeout(()=> {
      window.location.reload();
    }, 800)
  }

}
