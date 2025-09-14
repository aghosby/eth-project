import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditionInfoComponent } from './audition-info.component';

describe('AuditionInfoComponent', () => {
  let component: AuditionInfoComponent;
  let fixture: ComponentFixture<AuditionInfoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AuditionInfoComponent]
    });
    fixture = TestBed.createComponent(AuditionInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
