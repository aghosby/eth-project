// Angular modules
import { NgModule }          from '@angular/core';
import { Routes }            from '@angular/router';
import { RouterModule }      from '@angular/router';

// Components
import { NotFoundComponent } from './static/not-found/not-found.component';
import { adminGuard } from '@shared/guards/admin.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./modules/home/home.module').then(m => m.HomeModule),
  },
  {
    path: 'login',
    loadComponent: () => import('./modules/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'verify',
    loadComponent: () => import('./modules/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'signup',
    loadComponent: () => import('./modules/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'set-password',
    loadComponent: () => import('./modules/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./modules/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadChildren: () => import('./modules/registration/registration.module').then(m => m.RegistrationModule),
  },
  {
    path: 'admin',
    loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule),
    canMatch: [adminGuard],
  },
  { path: '', redirectTo: '', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports : [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports : [RouterModule]
})
export class AppRoutingModule { }
