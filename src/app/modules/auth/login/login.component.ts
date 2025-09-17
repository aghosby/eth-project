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

  userAction: 'email' | 'login' | 'create' | 'change' | 'reset' | 'verify' = 'change';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  isLoading:boolean = false;

  resendingOtp:boolean = false;
  resetToken:string = '';
  timeLeft: number = 30;
  subscribeTimer:any;
  interval:any

  public authForm !: FormGroup<any>;
  loggedInUser:any;

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
    //this.changeState('verify');
    if(this.authForm.controls['email'].valid) {
      this.isLoading = true;
      let payload = {
        email: this.authForm.value.email,
      }
      this.authService.verifyEmail(payload).subscribe({
        next: res => {
          //console.log(res);
          if (res.success) {
            this.changeState('verify')
            this.isLoading = false; 
            this.authForm.controls['email'].disable();
            this.notifyService.showSuccess('An OTP code has been successfully sent to your email');
            this.startTimer();
          }
        },
        error: err => {
          this.isLoading = false;  
        }
      })
    }
    else {
      this.notifyService.showError('Please check that the you have filled in your email address')
    }
  }

  verifyOtp() {
    //this.changeState('change');
    if(this.authForm.controls['otp'].valid) {
      this.isLoading = true;
      const userRegDetails = JSON.parse(sessionStorage.getItem('userRegDetails')!)
      if(userRegDetails) this.authForm.controls['email'].setValue(userRegDetails.email)
      let payload = {
        email: this.authForm.value.email,
        otp: Number(this.authForm.value.otp)
      }
      this.authService.verifyOtp(payload).subscribe({
        next: res => {
          //console.log(res);
          if (res.success) {
            this.changeState('change')
            this.isLoading = false; 
            this.notifyService.showSuccess(res.message)
          }
        },
        error: err => {
          this.notifyService.showSuccess(err.error.message)
          this.isLoading = false;  
        }
      })
    }
    else {
      this.notifyService.showError('Please check that the you have filled in your email address')
    }
  }

  createAccount() {
    //this.changeState('verify');
    if(this.formCtrls['firstName'].valid && this.formCtrls['lastName'].valid && this.formCtrls['email'].valid) {
      this.isLoading = true;
      let payload = {
        firstName: this.authForm.value.firstName,
        lastName: this.authForm.value.lastName,
        email: this.authForm.value.email,
      }
      sessionStorage.setItem('userRegDetails', JSON.stringify(payload));
      this.authService.createAccount(payload).subscribe({
        next: res => {
          if (res.success) {
            this.changeState('verify');
            this.notifyService.showSuccess(res.message);
          }
        },
        error: err => {
          this.notifyService.showError(err.error.message);
          this.isLoading = false;  
        }
      })
    }
    else {
      this.authForm.markAllAsTouched();
      this.notifyService.showError('Please check that the you have filled in all required fields')
    }    
  }

  resendOtp() {
    this.startTimer();
    this.resendingOtp = true;
    const userRegDetails = JSON.parse(sessionStorage.getItem('userRegDetails')!)
    if(userRegDetails) this.authForm.controls['email'].setValue(userRegDetails.email)
    let payload = {
      email: this.authForm.value.email,
    }
    console.log('payload', payload)
    this.authService.verifyEmail(payload).subscribe({
      next: (res:any) => {
        //console.log(res);
        if (res.success) {
          this.changeState('verify')
          this.notifyService.showSuccess(res.message);
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

  login(email?:string) {
    //this.router.navigate(['/register']);
    console.log(this.authForm.value)
    if((this.authForm.controls['email'].valid) && this.authForm.controls['password'].valid) {
      this.isLoading = true;
      let payload = {
        email: email ? email : this.authForm.value.email,
        password: this.authForm.value.password
      }
      this.authService.login(payload).subscribe({
        next: res => {
          if (res.success) {
            console.log(res)
            if(email) sessionStorage.removeItem('userRegDetails');
            sessionStorage.setItem("loggedInUser", JSON.stringify(res.data.user))
            this.notifyService.showSuccess('You logged in successfully');
            this.authService._isLoggedin$.next(true);
            sessionStorage.setItem(this.authService.TOKEN_NAME, res.data.token);
            this.loggedInUser = this.authService.loggedInUser;
            sessionStorage.setItem('savedRegStep', JSON.stringify(res.data.user.registrationInfo));
            this.router.navigate(['/register']);
            this.isLoading = false; 
          }
        },
        error: err => {
          this.notifyService.showError(err.error.message);
          this.isLoading = false;  
        }
      })
    }
    else {
      this.authForm.markAllAsTouched();
      this.notifyService.showError('Please check that the you have filled in all required fields')
    }
   
  }

  setPassword() {
    //this.changeState('verify');
    const userRegDetails = JSON.parse(sessionStorage.getItem('userRegDetails')!)
    if(userRegDetails) this.authForm.controls['email'].setValue(userRegDetails.email)
    if(this.authForm.controls['email'].valid) {
      this.isLoading = true;
      let payload = {
        email: this.authForm.value.email,
        password: this.authForm.value.password,
        confirmPassword: this.authForm.value.confirmPassword
      }
      this.authService.setPassword(payload).subscribe({
        next: res => {
          console.log('Reset', res);
          if (res.success) {
            this.notifyService.showSuccess(res.message);
            this.login(payload.email)
            this.isLoading = false;   
          }
        },
        error: err => {
          this.notifyService.showError(err.error.message);
          this.isLoading = false;  
        }
      })
    }
    else {
      this.authForm.markAllAsTouched();
      this.notifyService.showError('Please check that the you have filled in your email address')
    }
  }


}
