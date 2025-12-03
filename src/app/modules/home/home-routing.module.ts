// Angular modules
import { NgModule }      from '@angular/core';
import { RouterModule }  from '@angular/router';
import { Routes }        from '@angular/router';

// Components
import { HomeComponent } from './home.component';
import { TicketsSaleComponent } from './tickets-sale/tickets-sale.component';
import { VotingComponent } from './voting/voting.component';

const routes: Routes = [
  { 
    path : '', 
    component : HomeComponent 
  },
  {
    path: 'tickets',
    component: TicketsSaleComponent
  },
  {
    path: 'vote',
    component: VotingComponent
  }
];

@NgModule({
  imports : [ RouterModule.forChild(routes) ],
  exports : [ RouterModule ]
})
export class HomeRoutingModule { }
