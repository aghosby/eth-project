import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RegistrationRoutingModule } from './registration-routing.module';
import { ProfileComponent } from './pages/profile/profile.component';
import { RegisterComponent } from './pages/register/register.component';
import { SharedModule } from '@shared/shared.module';
import { LayoutComponent } from './pages/layout/layout.component';
import { PersonalInfoComponent } from './components/personal-info/personal-info.component';
import { TalentInfoComponent } from './components/talent-info/talent-info.component';
import { GroupInfoComponent } from './components/group-info/group-info.component';
import { MediaInfoComponent } from './components/media-info/media-info.component';
import { GuardianInfoComponent } from './components/guardian-info/guardian-info.component';
import { TermsConditionsComponent } from './components/terms-conditions/terms-conditions.component';
import { RegistrationPaymentComponent } from './components/registration-payment/registration-payment.component';
import { AuditionInfoComponent } from './components/audition-info/audition-info.component';
import { AuditionPassComponent } from './pages/audition-pass/audition-pass.component';


@NgModule({
  declarations: [
    LayoutComponent,
    RegisterComponent,
    ProfileComponent,
    PersonalInfoComponent,
    TalentInfoComponent,
    GroupInfoComponent,
    MediaInfoComponent,
    GuardianInfoComponent,
    TermsConditionsComponent,
    RegistrationPaymentComponent,
    AuditionInfoComponent,
    AuditionPassComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RegistrationRoutingModule
  ]
})
export class RegistrationModule { }
