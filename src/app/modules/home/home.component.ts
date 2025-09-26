// Angular modules
import { Component } from '@angular/core';
import { OnInit }    from '@angular/core';
import { Router } from '@angular/router';
import { UtilityService } from '@shared/services/utility.service';

@Component({
  selector    : 'app-home',
  templateUrl : './home.component.html',
  styleUrls   : ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public isLoading : boolean = true;
  partners = [
    {
      name: '',
      image: 'assets/img/project/partners/logo-1.jpg',
      websiteUrl: '',
    },
    {
      name: '',
      image: 'assets/img/project/partners/logo-2.png',
      websiteUrl: '',
    },
    {
      name: '',
      image: 'assets/img/project/partners/logo-3.jpg',
      websiteUrl: '',
    },
    {
      name: '',
      image: 'assets/img/project/partners/logo-4.png',
      websiteUrl: '',
    },
    {
      name: '',
      image: 'assets/img/project/partners/logo-5.png',
      websiteUrl: '',
    },
    {
      name: '',
      image: 'assets/img/project/partners/logo-6.png',
      websiteUrl: '',
    },
    {
      name: '',
      image: 'assets/img/project/partners/logo-7.png',
      websiteUrl: '',
      size: 'sm'
    },{
      name: '',
      image: 'assets/img/project/partners/logo-8.png',
      websiteUrl: '',
      size: 'sm'
    },
    {
      name: '',
      image: 'assets/img/project/partners/logo-9.png',
      websiteUrl: '',
    },
    {
      name: '',
      image: 'assets/img/project/partners/logo-10.jpg',
      websiteUrl: '',
    },
    {
      name: '',
      image: 'assets/img/project/partners/logo-11.jpg',
      websiteUrl: '',
    },
    {
      name: '',
      image: 'assets/img/project/partners/logo-12.png',
      websiteUrl: '',
    },
    {
      name: '',
      image: 'assets/img/project/partners/logo-13.png',
      websiteUrl: '',
    },
    {
      name: '',
      image: 'assets/img/project/partners/logo-14.png',
      websiteUrl: '',
    },{
      name: '',
      image: 'assets/img/project/partners/logo-15.png',
      websiteUrl: '',
    },
    {
      name: '',
      image: 'assets/img/project/partners/logo-16.jpg',
      websiteUrl: '',
    },
  ]

  constructor(
    private utilityService: UtilityService,
    private router: Router
  ) { }

  ngOnInit() : void {
    setTimeout(_ =>
    {
      this.isLoading = false;
    }, 2000);
  }

  contactForm() {
    this.utilityService.contactForm();
  }

  goToLogin() {
    this.router.navigate(['/login'], { queryParams: { action: 'login' } });
  }

  goToRegister() {
    this.router.navigate(['/login'], { queryParams: { action: 'create' } });
  }

  // -------------------------------------------------------------------------------
  // NOTE Actions ------------------------------------------------------------------
  // -------------------------------------------------------------------------------

  // -------------------------------------------------------------------------------
  // NOTE Computed props -----------------------------------------------------------
  // -------------------------------------------------------------------------------

  // -------------------------------------------------------------------------------
  // NOTE Helpers ------------------------------------------------------------------
  // -------------------------------------------------------------------------------

  // -------------------------------------------------------------------------------
  // NOTE Requests -----------------------------------------------------------------
  // -------------------------------------------------------------------------------

  // -------------------------------------------------------------------------------
  // NOTE Subscriptions ------------------------------------------------------------
  // -------------------------------------------------------------------------------

}
