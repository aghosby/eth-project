import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FormFields } from '@shared/models/form-fields';
import { UtilityService } from '@shared/services/utility.service';

@Component({
  selector: 'app-terms-conditions',
  templateUrl: './terms-conditions.component.html',
  styleUrls: ['./terms-conditions.component.scss']
})
export class TermsConditionsComponent implements OnInit {

  grpInfoForm:FormGroup = new FormGroup({});
  formInfoFields!: FormFields[];
  screenSize!:number;
  useFormWidth:boolean = true;
  keepOrder = () => 0;

  constructor(private utilityService: UtilityService) {}
  
  ngOnInit(): void {
    this.screenSize = this.utilityService.getScreenWidth();
    this.useFormWidth = this.screenSize > 768;
    this.setUpForm();
  }

  setUpForm = async () => {
    this.formInfoFields = [
      {
        controlName: 'rulesAcceptance',
        controlType: 'checkbox',
        controlLabel: 'I agree to abide by the competition rules and regulations',
        controlWidth: '100%',
        initialValue: false,
        validators: [],
        visible: true,
        order: 1
      },
      {
        controlName: 'promotionalAcceptance',
        controlType: 'checkbox',
        controlLabel: 'I consent to the use of my performance images and videos for promotional purposes',
        controlWidth: '100%',
        initialValue: false,
        validators: [],
        visible: true,
        order: 2
      },
      {
        controlName: 'contestantSignature',
        controlType: 'signature',
        controlLabel: 'Contestant Signature',
        controlWidth: '48%',
        initialValue: null,
        validators: [],
        visible: true,
        order: 3
      },
      {
        controlName: 'guardianSignature',
        controlType: 'signature',
        controlLabel: 'Guardian Signature',
        controlWidth: '48%',
        initialValue: null,
        validators: [],
        visible: true,
        order: 4
      }
    ]

    this.formInfoFields.sort((a,b) => (a.order - b.order));

    this.formInfoFields.forEach(field => {
      const formControl = new FormControl(field.initialValue, field.validators)
      this.grpInfoForm.addControl(field.controlName, formControl)
    });
  }

}
