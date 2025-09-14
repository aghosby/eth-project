import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonutProgressComponent } from './donut-progress.component';

describe('DonutProgressComponent', () => {
  let component: DonutProgressComponent;
  let fixture: ComponentFixture<DonutProgressComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DonutProgressComponent]
    });
    fixture = TestBed.createComponent(DonutProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
