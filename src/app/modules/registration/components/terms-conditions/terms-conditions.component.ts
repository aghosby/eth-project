import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FormFields } from '@shared/models/form-fields';
import { UtilityService } from '@shared/services/utility.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-terms-conditions',
  templateUrl: './terms-conditions.component.html',
  styleUrls: ['./terms-conditions.component.scss']
})
export class TermsConditionsComponent implements OnInit {

  @Input() stepName!: string;
  @Input() formInitialValue!: any;
  private stepTrigger!: Subscription;
  grpInfoForm:FormGroup = new FormGroup({});
  formInfoFields!: FormFields[];
  screenSize!:number;
  useFormWidth:boolean = true;
  @Input() applicantAge: number | null = null;
  keepOrder = () => 0;

  constructor(private utilityService: UtilityService) {}
  
  ngOnInit(): void {
    this.screenSize = this.utilityService.getScreenWidth();
    this.useFormWidth = this.screenSize > 768;
    this.setUpForm();

    // 🔥 listen for trigger from parent
    this.stepTrigger = this.utilityService.trigger$.subscribe((stepName) => {
      //console.log('Step', stepName)
      this.grpInfoForm.markAllAsTouched();
      if (stepName === 'Terms & Signatures') {
        this.utilityService.updateStep('termsConditions', {
          valid: this.grpInfoForm.valid,
          value: this.grpInfoForm.value,
        });
      }
    });
  }

  get showGuardianSignature(): boolean {
    //console.log(this.applicantAge)
    return this.applicantAge !== null && this.applicantAge < 16;
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
      }
    ]

    if(this.showGuardianSignature) {
      this.formInfoFields.push({
        controlName: 'guardianSignature',
        controlType: 'signature',
        controlLabel: 'Guardian Signature',
        controlWidth: '48%',
        initialValue: null,
        validators: [],
        visible: true,
        order: 4
      })
    }

    this.formInfoFields.sort((a,b) => (a.order - b.order));

    this.formInfoFields.forEach(field => {
      const formControl = new FormControl(field.initialValue, field.validators)
      this.grpInfoForm.addControl(field.controlName, formControl)
    });

    this.getRegistrationData();
  }

  setInitialFormValues(initial: any) {
    if (!initial) return;
    const savedRegData = this.utilityService.registrationData.termsConditions;
    const patch = savedRegData ? { ...initial, ...savedRegData } : {...initial};

    // 2. patch everything
    this.grpInfoForm.patchValue(patch, { emitEvent: true });
  }

  getRegistrationData() {
    if (this.formInitialValue) {
      this.setInitialFormValues(this.formInitialValue)
    }
    else {
      // 🔥 Use the same map logic as parent
      const stepKey = this.utilityService.mapStepName(this.stepName);
      const storedData = this.utilityService.registrationData[stepKey];
      const savedData = this.utilityService.getStep(stepKey);
      // console.log('Restoring form for', stepKey, savedData);

      if(storedData) {
        this.setInitialFormValues(storedData);
      }
      else if (savedData?.value) {
        this.grpInfoForm.patchValue(savedData.value);
      }
      
    }
  }

}
