// Angular modules
import { Component, OnInit }    from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn }    from '@angular/forms';
import { FormControl }  from '@angular/forms';
import { Validators }   from '@angular/forms';
import { ActivatedRoute, Router }       from '@angular/router';

// Internal modules
import { environment }  from '@env/environment';
import { CustomValidators } from '@helpers/password-validators';

// Services
import { AppService }   from '@services/app.service';
import { AuthService } from '@services/auth.service';
import { NotificationService } from '@services/notification.service';
import { StoreService } from '@services/store.service';
import { timer } from 'rxjs';

@Component({
  selector    : 'app-login',
  templateUrl : './login.component.html',
  styleUrls   : ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  userAction: 'email' | 'login' | 'create' | 'change' | 'reset' | 'verify' = 'login';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  isLoading:boolean = false;

  resendingOtp:boolean = false;
  resetToken:string = '';
  timeLeft: number = 30;
  subscribeTimer:any;
  interval:any

  public authForm !: FormGroup<any>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private notifyService: NotificationService,
    private storeService: StoreService,
    private appService: AppService,
  ){
    this.initFormGroup();
  }

  ngOnInit(): void {

    this.route.url.subscribe(urlSegments => {
      const path = urlSegments[0]?.path;

      switch (path) {
        case 'login':
          this.userAction = 'login';
          break;
        case 'signup':
          this.userAction = 'create';
          break;
        case 'reset-password':
          this.userAction = 'reset';
          break;
        case 'verify':
          this.userAction = 'verify';
          break;
        case 'set-password':
          this.userAction = 'change';
          break;
        default:
          this.userAction = 'login';
          break;
      }
    });
      
  }

  private initFormGroup(): void {
    this.authForm = new FormGroup(
      {
        firstName: new FormControl('', Validators.required),
        lastName: new FormControl('', Validators.required),
        email: new FormControl('', [Validators.required, Validators.email]),
        password: new FormControl('', [Validators.required, Validators.minLength(8)]),
        confirmPassword: new FormControl('', [Validators.required, Validators.minLength(8)]),
        otp: new FormControl('', [Validators.minLength(4), Validators.maxLength(4)]),
      },
      {
        validators: CustomValidators.MatchingPasswords
      }
    );
  }

  get formCtrls() {
    return this.authForm.controls;
  }

  get matchValid() {
    return this.authForm.controls["password"].touched && this.authForm.controls["confirmPassword"].touched && !this.authForm.controls["confirmPassword"].hasError("not_matching");
  }

  checkPasswords: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const pass = group.get('password')?.value;
    const confirmPass = group.get('confirmPassword')?.value;

    // if one of the controls is missing, don't invalidate the form
    if (pass === undefined || confirmPass === undefined) {
      return null;
    }

    return pass === confirmPass ? null : { notSame: true };
  };

  goToLogin() {
    this.changeState('login')
    this.authForm.controls['email'].enable();
  }

  changeState(state:'email' | 'login' | 'create' | 'change' | 'reset' | 'verify') {
    this.userAction = state;

    switch (state) {
      case 'login':
        this.router.navigate(['/login']);
        break;

      case 'create':
        this.router.navigate(['/signup']);
        break;

      case 'reset':
        this.router.navigate(['/reset-password']);
        break;

      case 'verify':
        this.router.navigate(['/verify']);
        break;
      case 'change':
        this.router.navigate(['/set-password']);
        break;

      default:
        break;
    }
  }

  verifyEmail() {
    this.changeState('verify');
    // if(this.authForm.controls['email'].valid) {
    //   this.isLoading = true;
    //   let payload = {
    //     email: this.authForm.value.email,
    //   }
    //   this.authService.verifyEmail(payload).subscribe({
    //     next: res => {
    //       //console.log(res);
    //       if (res.status) {
    //         this.changeState('verify')
    //         this.isLoading = false; 
    //         this.authForm.controls['email'].disable();
    //         this.notifyService.showSuccess('An OTP code has been successfully sent to your email');
    //         this.startTimer();
    //       }
    //     },
    //     error: err => {
    //       this.isLoading = false;  
    //     }
    //   })
    // }
    // else {
    //   this.notifyService.showError('Please check that the you have filled in your email address')
    // }
  }

  verifyOtp() {
    this.changeState('change');
    // if(this.authForm.controls['otp'].valid) {
    //   this.isLoading = true;
    //   let payload = {
    //     email: this.authForm.value.email,
    //     otp: Number(this.authForm.value.otp)
    //   }
    //   this.authService.verifyOtp(payload).subscribe({
    //     next: res => {
    //       //console.log(res);
    //       if (res.status_code == 200) {
    //         this.changeState('create')
    //         this.isLoading = false; 
    //         this.notifyService.showSuccess(res.message)
    //       }
    //     },
    //     error: err => {
    //       this.isLoading = false;  
    //     }
    //   })
    // }
    // else {
    //   this.notifyService.showError('Please check that the you have filled in your email address')
    // }
  }

  createAccount() {
    this.changeState('verify');
    // if(this.formCtrls['firstName'].valid && this.formCtrls['lastName'].valid && this.formCtrls['email'].valid) {
    //   this.isLoading = true;
    //   let payload = {
    //     firstName: this.authForm.value.firstName,
    //     lastName: this.authForm.value.lastName,
    //     email: this.authForm.value.email,
    //   }

    //   this.authService.createAccount(payload).subscribe({
    //     next: res => {
    //       this.changeState('verify');
    //       //this.notifyService.showSuccess('Your account has been created successfully');
    //     },
    //     error: err => {
    //       //console.log(err);
    //       this.notifyService.showError(err.error);
    //       this.isLoading = false;  
    //     }
    //   })
    // }
    // else {
    //   this.notifyService.showError('Please check that the you have filled in all required fields')
    // }    
  }

  resendOtp() {
    this.startTimer();
    this.resendingOtp = true;
    let payload = {
      email: this.authForm.value.email,
    }
    this.authService.verifyEmail(payload).subscribe({
      next: (res:any) => {
        //console.log(res);
        if (res.status_code == 200) {
          this.changeState('verify')
          this.resendingOtp = false; 
        }
      },
      error: (err: any) => {
        this.resendingOtp = false;  
      }
    })
  }

  observableTimer() {
    const source = timer(1000, 2000);
    const abc = source.subscribe(val => {
      //console.log(val, '-');
      this.subscribeTimer = this.timeLeft - val;
    });
  }

  startTimer() {
    this.interval = setInterval(() => {
      if(this.timeLeft > 0) {
        this.timeLeft--;
      } 
      else {
        this.timeLeft = 30;
        this.pauseTimer()
      }
    },1000)
  }

  pauseTimer() {
    clearInterval(this.interval);
  }

  login() {
    this.router.navigate(['/register']);
    // console.log(this.authForm.value)
    // if((this.authForm.controls['email'].valid) && this.authForm.controls['password'].valid) {
    //   this.isLoading = true;
    //   let payload = {
    //     username: this.authForm.value.email,
    //     password: this.authForm.value.password
    //   }
    //   this.authService.login(payload).subscribe({
    //     next: res => {
    //       console.log(res);
    //       if (res.status_code == 200) {
    //         if(res.data.changeDefaultPassword) {
    //           this.userAction = 'change';
    //           this.resetToken = res.data.token.access_token;
    //           this.isLoading = false;
    //           this.authForm.controls['oldPassword'].setValue(this.authForm.value.password);
    //           this.authForm.controls['password'].setValue('');
    //         }
    //         else {
    //           // sessionStorage.setItem("loggedInEventOrganizer", JSON.stringify(res.data))
    //           // this.notifyService.showSuccess('You logged in successfully');
    //           // this.loggedInUser = this.eventsService.loggedInUser;
    //           // this.getProfileInfo();
    //           // this.isLoading = false;  
    //         } 
    //       }
    //     },
    //     error: err => {
    //       //this.notifyService.showError(err.error);
    //       this.isLoading = false;  
    //     }
    //   })
    // }
    // else {
    //   this.notifyService.showError('Please check that the you have filled in all required fields')
    // }
   
  }

  resetPassword() {
    this.changeState('verify');
    // if(this.authForm.controls['email'].valid) {
    //   this.isLoading = true;
    //   let payload = {
    //     email: this.authForm.value.email,
    //   }

    //   this.authService.resetPassword(payload).subscribe({
    //     next: res => {
    //       console.log('Reset', res);
    //       if (res.status_code == 200) {
    //         this.notifyService.showSuccess('You password reset was successful. Check your email for your new password');
    //         this.userAction = 'login';
    //         this.isLoading = false;   
    //       }
    //     },
    //     error: err => {
    //       //this.notifyService.showError(err.error);
    //       this.isLoading = false;  
    //     }
    //   })
    // }
    // else {
    //   this.notifyService.showError('Please check that the you have filled in your email address')
    // }
  }


}
