import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkUserInfoComponent } from './bulk-user-info.component';

describe('BulkUserInfoComponent', () => {
  let component: BulkUserInfoComponent;
  let fixture: ComponentFixture<BulkUserInfoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BulkUserInfoComponent]
    });
    fixture = TestBed.createComponent(BulkUserInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
