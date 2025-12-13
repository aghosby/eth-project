import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoteTransactionsComponent } from './vote-transactions.component';

describe('VoteTransactionsComponent', () => {
  let component: VoteTransactionsComponent;
  let fixture: ComponentFixture<VoteTransactionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VoteTransactionsComponent]
    });
    fixture = TestBed.createComponent(VoteTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
