// Angular modules
import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { RouterModule } from '@angular/router';

// Components
import { AuthComponent } from './auth/auth.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from '../registration/pages/register/register.component';
import { SignupComponent } from './signup/signup.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';

const routes: Routes = [
//   { path: '', component: LoginComponent },
//   { path: 'verify', component: LoginComponent },
//   { path: 'signup', component: LoginComponent },
//   { path: 'set-password', component: LoginComponent },
//   { path: 'reset-password', component: LoginComponent },
];

@NgModule({
  imports : [
    RouterModule.forChild(routes)
  ],
  exports : [
    RouterModule
  ],
  providers : []
})
export class AuthRoutingModule { }
