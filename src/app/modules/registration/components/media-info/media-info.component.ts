import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Countries } from '@shared/constants/countries';
import { FormFields } from '@shared/models/form-fields';
import { UtilityService } from '@shared/services/utility.service';

@Component({
  selector: 'app-media-info',
  templateUrl: './media-info.component.html',
  styleUrls: ['./media-info.component.scss']
})
export class MediaInfoComponent implements OnInit {

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
  }

  setUpForm() {
    this.grpInfoForm = new FormGroup({
      profilePhoto: new FormControl('', Validators.required),
      videoUpload: new FormControl('', Validators.required),
    })
  }

}
