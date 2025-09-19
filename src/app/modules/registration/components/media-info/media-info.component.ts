import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UtilityService } from '@shared/services/utility.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-media-info',
  templateUrl: './media-info.component.html',
  styleUrls: ['./media-info.component.scss']
})
export class MediaInfoComponent implements OnInit, OnDestroy {

  @Input() stepName!: string;
  @Input() formInitialValue!: any;
  grpInfoForm!: FormGroup;
  profilePic!: string;
  videoUrl!: string;
  screenSize!: number;
  useFormWidth: boolean = true;

  private stepTrigger!: Subscription;

  constructor(private utilityService: UtilityService) {}

  ngOnInit(): void {
    this.screenSize = this.utilityService.getScreenWidth();
    this.useFormWidth = this.screenSize > 768;

    this.setUpForm();

    this.stepTrigger = this.utilityService.trigger$.subscribe((stepName) => {
      this.grpInfoForm.markAllAsTouched();
      if (stepName === 'Media Upload') {
        this.saveMediaToSession();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.stepTrigger) this.stepTrigger.unsubscribe();
  }

  private setUpForm(): void {
    this.grpInfoForm = new FormGroup({
      profilePhoto: new FormControl(''),
      videoUpload: new FormControl(''),
    });

    this.restoreFromSession();
  }

  private restoreFromSession(): void {
    const savedRegData = this.utilityService.registrationData?.mediaInfo;
    // const patch = savedRegData ? { ...initial, ...savedRegData } : {...initial};
    const saved = savedRegData ? savedRegData : JSON.parse(sessionStorage.getItem('mediaUpload') || '{}');

    if (saved.profilePhoto || saved.videoUpload) {
      this.profilePic = saved.profilePhoto || '';
      this.videoUrl = saved.videoUpload || '';

      this.grpInfoForm.patchValue({
        profilePhoto: saved.profilePhoto || '',
        videoUpload: saved.videoUpload || ''
      });
    }
  }


  async saveMediaToSession() {
    const profilePhotoValue = this.grpInfoForm.get('profilePhoto')?.value;
    const videoUploadValue = this.grpInfoForm.get('videoUpload')?.value;

    const profilePhotoBase64 = profilePhotoValue instanceof File 
      ? await this.fileToBase64(profilePhotoValue) 
      : profilePhotoValue;

    const videoUploadBase64 = videoUploadValue instanceof File 
      ? await this.fileToBase64(videoUploadValue) 
      : videoUploadValue;

    const mediaData = {
      profilePhoto: profilePhotoBase64,
      videoUpload: videoUploadBase64
    };

    sessionStorage.setItem('mediaUpload', JSON.stringify(mediaData));
    console.log('Form Valid', this.grpInfoForm.valid)
    const stepKey = this.utilityService.mapStepName(this.stepName);
    this.utilityService.updateStep(stepKey, {
      valid: this.grpInfoForm.valid,
      value: mediaData,
    });
  }


  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }
}
