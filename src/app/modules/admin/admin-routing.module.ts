import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './pages/layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { RegistrationListComponent } from './pages/registrations/registration-list/registration-list.component';
import { UserListComponent } from './pages/users/user-list/user-list.component';
import { TransactionListComponent } from './pages/transactions/transaction-list/transaction-list.component';
import { SupportListComponent } from './pages/support/support-list/support-list.component';
import { VoteTransactionsComponent } from './pages/votes/vote-transactions/vote-transactions.component';
import { ContestantListComponent } from './pages/contestants/contestant-list/contestant-list.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,    
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'registrations', component: RegistrationListComponent },
      { path: 'users', component: UserListComponent },
      { path: 'transactions', component: TransactionListComponent },
      { path: 'support', component: SupportListComponent },
      { path: 'votes', component: VoteTransactionsComponent },
      { path: 'contestants', component: ContestantListComponent },
      // { 
      //   path: 'registrations', 
      //   children: [
      //     { path: '', redirectTo: 'list', pathMatch: 'full' },
      //     { path: 'list', component: RegistrationListComponent },
      //   ]
      // }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
