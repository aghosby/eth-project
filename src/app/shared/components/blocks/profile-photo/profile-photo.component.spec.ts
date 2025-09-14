import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilePhotoComponent } from './profile-photo.component';

describe('ProfilePhotoComponent', () => {
  let component: ProfilePhotoComponent;
  let fixture: ComponentFixture<ProfilePhotoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProfilePhotoComponent]
    });
    fixture = TestBed.createComponent(ProfilePhotoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
