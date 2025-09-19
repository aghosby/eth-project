import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditionPassComponent } from './audition-pass.component';

describe('AuditionPassComponent', () => {
  let component: AuditionPassComponent;
  let fixture: ComponentFixture<AuditionPassComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AuditionPassComponent]
    });
    fixture = TestBed.createComponent(AuditionPassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
