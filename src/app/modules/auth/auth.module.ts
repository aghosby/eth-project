// Angular modules
import { CommonModule }             from '@angular/common';
import { NgModule }                 from '@angular/core';

// Internal modules
import { AuthRoutingModule }        from './auth-routing.module';
import { SharedModule }             from '../../shared/shared.module';

// Components
import { AuthComponent }            from './auth/auth.component';
import { ForgotPasswordComponent }  from './forgot-password/forgot-password.component';
import { LoginComponent }           from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { NgOtpInputModule } from 'ng-otp-input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations    :
  [
    AuthComponent,
    LoginComponent,
    ForgotPasswordComponent,
    SignupComponent,
  ],
  imports         :
  [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AuthRoutingModule,
    NgOtpInputModule,
    SharedModule
  ],
})
export class AuthModule { }
