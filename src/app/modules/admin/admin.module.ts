import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { LayoutComponent } from './pages/layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MenuComponent } from './components/menu/menu.component';
import { SharedModule } from '@shared/shared.module';
import { RegistrationListComponent } from './pages/registrations/registration-list/registration-list.component';
import { RegistrationDetailsComponent } from './pages/registrations/registration-details/registration-details.component';
import { UserListComponent } from './pages/users/user-list/user-list.component';
import { UserDetailsComponent } from './pages/users/user-details/user-details.component';
import { TransactionListComponent } from './pages/transactions/transaction-list/transaction-list.component';
import { TransactionDetailsComponent } from './pages/transactions/transaction-details/transaction-details.component';
import { SupportListComponent } from './pages/support/support-list/support-list.component';
import { SupportDetailsComponent } from './pages/support/support-details/support-details.component';
import { PaymentVerificationComponent } from './components/payment-verification/payment-verification.component';
import { ContestantListComponent } from './pages/contestants/contestant-list/contestant-list.component';
import { VoteTransactionsComponent } from './pages/votes/vote-transactions/vote-transactions.component';


@NgModule({
  declarations: [
    LayoutComponent,
    DashboardComponent,
    MenuComponent,
    RegistrationListComponent,
    RegistrationDetailsComponent,
    UserListComponent,
    UserDetailsComponent,
    TransactionListComponent,
    TransactionDetailsComponent,
    SupportListComponent,
    SupportDetailsComponent,
    PaymentVerificationComponent,
    ContestantListComponent,
    VoteTransactionsComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    SharedModule
  ]
})
export class AdminModule { }
