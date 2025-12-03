import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketsSaleComponent } from './tickets-sale.component';

describe('TicketsSaleComponent', () => {
  let component: TicketsSaleComponent;
  let fixture: ComponentFixture<TicketsSaleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TicketsSaleComponent]
    });
    fixture = TestBed.createComponent(TicketsSaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
