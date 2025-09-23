import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkSlotsInfoComponent } from './bulk-slots-info.component';

describe('BulkSlotsInfoComponent', () => {
  let component: BulkSlotsInfoComponent;
  let fixture: ComponentFixture<BulkSlotsInfoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BulkSlotsInfoComponent]
    });
    fixture = TestBed.createComponent(BulkSlotsInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
