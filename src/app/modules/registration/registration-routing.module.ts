import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './pages/layout/layout.component';
import { RegisterComponent } from './pages/register/register.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { AuditionPassComponent } from './pages/audition-pass/audition-pass.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { 
        path: '', 
        component: RegisterComponent 
      },
      { 
        path: 'profile', 
        component: ProfileComponent 
      },
      { 
        path: 'audition-pass', 
        component: AuditionPassComponent 
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RegistrationRoutingModule { }
