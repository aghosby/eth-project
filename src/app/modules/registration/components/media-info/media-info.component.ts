import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Countries } from '@shared/constants/countries';
import { FormFields } from '@shared/models/form-fields';
import { UtilityService } from '@shared/services/utility.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-media-info',
  templateUrl: './media-info.component.html',
  styleUrls: ['./media-info.component.scss']
})
export class MediaInfoComponent implements OnInit {

  @Input() stepName!: string;
  private stepTrigger!: Subscription;
  screenSize!:number;
  useFormWidth:boolean = true;
  profilePic!:string;
  videoUrl!:string;
  grpInfoForm!:FormGroup;

  constructor(private utilityService: UtilityService) {}

  ngOnInit(): void {
    this.screenSize = this.utilityService.getScreenWidth();
    this.useFormWidth = this.screenSize > 768;
    this.setUpForm();

    // 🔥 listen for trigger from parent
    this.stepTrigger = this.utilityService.trigger$.subscribe((stepName) => {
      //console.log('Step', stepName)
      if (stepName === 'Media Upload') {
        this.utilityService.updateStep('mediaInfo', {
          valid: this.grpInfoForm.valid,
          value: this.grpInfoForm.value,
        });
      }
    });
  }

  setUpForm() {
    this.grpInfoForm = new FormGroup({
      profilePhoto: new FormControl('', Validators.required),
      videoUpload: new FormControl('', Validators.required),
    })
  }

}
