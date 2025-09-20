import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FormFields } from '@shared/models/form-fields';
import { AuthService } from '@shared/services/auth.service';
import { SharedService } from '@shared/services/shared.service';
import { UtilityService } from '@shared/services/utility.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-talent-info',
  templateUrl: './talent-info.component.html',
  styleUrls: ['./talent-info.component.scss']
})
export class TalentInfoComponent implements OnInit {

  @Input() stepName!: string;
  @Input() formInitialValue!: any;
  private stepTrigger!: Subscription;
  grpInfoForm:FormGroup = new FormGroup({});
  formInfoFields!: FormFields[];
  formStepLabels:any;
  screenSize!:number;
  useFormWidth:boolean = true;
  subscriptionsSetup: boolean = false;
  keepOrder = () => 0;

  constructor(
    private utilityService: UtilityService,
    private authService: AuthService,
    private sharedService: SharedService
  ) {}
  
  ngOnInit(): void {
    this.screenSize = this.utilityService.getScreenWidth();
    this.useFormWidth = this.screenSize > 768;
    this.setUpForm();
    this.setupConditionalLogic();

    // 🔥 listen for trigger from parent
    this.stepTrigger = this.utilityService.trigger$.subscribe((stepName) => {
      //console.log('Step', stepName)
      this.grpInfoForm.markAllAsTouched();
      const stepKey = this.utilityService.mapStepName(this.stepName);
      if (stepName === 'Talent Details') {
        this.utilityService.updateStep(stepKey, {
          valid: this.grpInfoForm.valid,
          value: this.grpInfoForm.value,
        });

        this.utilityService.saveStepLabelsToSession(stepKey, this.formStepLabels);
      }
    });
  }

  setUpForm = async () => {
    this.formInfoFields = [
      {
        controlName: 'talentCategory',
        controlType: 'select',
        controlLabel: 'Talent Category',
        controlWidth: '48%',
        initialValue: '',
        selectOptions: {
          Singing: 'Singing',
          Dancing: 'Dancing',
          Acting: 'Acting',
          Comedy: 'Comedy',
          Drama: 'Drama',
          Instrumental: 'Instrumental',
          Other: 'Other'
        },
        validators: [Validators.required],
        visible: true,
        order: 1
      },
      {
        controlName: 'otherTalentCategory',
        controlType: 'text',
        controlLabel: 'Other Talent',
        controlWidth: '48%',
        initialValue: null,
        validators: [],
        visible: false,
        order: 1
      },
      {
        controlName: 'skillLevel',
        controlType: 'select',
        controlLabel: 'Skill Level',
        controlWidth: '48%',
        initialValue: '',
        selectOptions: {
          Beginner: 'Beginner',
          Intermediate: 'Intermediate',
          Advanced: 'Advanced'
        },
        validators: [Validators.required],
        visible: true,
        order: 2
      },
      {
        controlName: 'stageName',
        controlType: 'text',
        controlLabel: 'Stage Name',
        controlWidth: '48%',
        initialValue: null,
        validators: [],
        visible: true,
        order: 3
      },
      {
        controlName: 'previouslyParticipated',
        controlType: 'select',
        controlLabel: 'Previously participated in a talent hunt ?',
        controlWidth: '48%',
        initialValue: '',
        selectOptions: {
          Yes: 'Yes',
          No: 'No',
        },
        validators: [],
        visible: true,
        order: 4
      },
      {
        controlName: 'previousParticipationCategory',
        controlType: 'select',
        controlLabel: 'Participation Category',
        controlWidth: '48%',
        initialValue: '',
        selectOptions: {
          Singing: 'Singing',
          Dancing: 'Dancing',
          Acting: 'Acting',
          Comedy: 'Comedy',
          Drama: 'Drama',
          Instrumental: 'Instrumental',
          Other: 'Other'
        },
        validators: [],
        visible: false,
        order: 5
      },
      {
        controlName: 'previousParticipationOtherCategory',
        controlType: 'text',
        controlLabel: 'Other Talent',
        controlWidth: '48%',
        initialValue: null,
        validators: [],
        visible: false,
        order: 5
      },
      {
        controlName: 'competitionName',
        controlType: 'text',
        controlLabel: 'Competition Name',
        controlWidth: '48%',
        initialValue: null,
        validators: [],
        visible: false,
        order: 6
      },
      {
        controlName: 'participationPosition',
        controlType: 'text',
        controlLabel: 'Participation Position',
        controlWidth: '48%',
        initialValue: null,
        validators: [],
        visible: false,
        order: 7
      }
    ]

    this.formInfoFields.sort((a,b) => (a.order - b.order));

    this.formInfoFields.forEach(field => {
      const formControl = new FormControl(field.initialValue, field.validators)
      this.grpInfoForm.addControl(field.controlName, formControl)
    });

    this.getRegistrationData();

    this.formStepLabels = this.utilityService.generateFieldMapping(this.formInfoFields);
  }

  //Converts an array to an Object of key value pairs
  arrayToObject(arrayVar:any, key:string) {
    let reqObj = {}
    reqObj = arrayVar.reduce((agg:any, item:any, index:any) => {
      agg[item['_id']] = item[key];
      return agg;
    }, {})
    return reqObj;
  }

  private setupConditionalLogic() {
    // TalentCategory → show/hide OtherTalentCategory
    this.grpInfoForm.get('talentCategory')?.valueChanges.subscribe(value => {
      const otherField = this.formInfoFields.find(f => f.controlName === 'otherTalentCategory');
      const control = this.grpInfoForm.get('otherTalentCategory');

      if (value === 'Other') {
        otherField!.visible = true;
        control?.setValidators([Validators.required]);
      } 
      else {
        otherField!.visible = false;
        control?.clearValidators();
        control?.setValue('');
      }
      control?.updateValueAndValidity();
    });

    // PreviouslyParticipated → show/hide related fields
    this.grpInfoForm.get('previouslyParticipated')?.valueChanges.subscribe(value => {
      const participationFields = ['previousParticipationCategory', 'competitionName', 'participationPosition', 'previousParticipationOtherCategory'];

      participationFields.forEach(name => {
        const field = this.formInfoFields.find(f => f.controlName === name);
        const control = this.grpInfoForm.get(name);

        if (value === 'Yes') {
          field!.visible = true;
          if (name === 'previousParticipationCategory' || name === 'competitionName') {
            control?.setValidators([Validators.required]);
          }
        } 
        else {
          field!.visible = false;
          control?.clearValidators();
          control?.setValue('');
        }
        control?.updateValueAndValidity();
      });
    });

    // PreviousParticipationCategory → show/hide Other
    this.grpInfoForm.get('previousParticipationCategory')?.valueChanges.subscribe(value => {
      const otherField = this.formInfoFields.find(f => f.controlName === 'previousParticipationOtherCategory');
      const control = this.grpInfoForm.get('previousParticipationOtherCategory');

      if (value === 'Other') {
        otherField!.visible = true;
        control?.setValidators([Validators.required]);
      } 
      else {
        otherField!.visible = false;
        control?.clearValidators();
        control?.setValue('');
      }
      control?.updateValueAndValidity();
    });
  }

  setInitialFormValues(initial: any) {
    if (!initial) return;
    const savedRegData = this.utilityService.registrationData.talentInfo;
    const patch = savedRegData ? { ...initial, ...savedRegData } : {...initial};

    // 1. setup subscriptions first (only once!)
    if (!this.subscriptionsSetup) {
      this.setupConditionalLogic();
      this.subscriptionsSetup = true;
    }

    // 2. patch everything
    this.grpInfoForm.patchValue(patch, { emitEvent: true });

    // 3. manually trigger conditional logic for pre-filled values
    this.runInitialConditionalChecks();
  }


  getRegistrationData() {
    if (this.formInitialValue) {
      this.setInitialFormValues(this.formInitialValue)
    }
    else {
      // 🔥 Use the same map logic as parent
      const stepKey = this.utilityService.mapStepName(this.stepName);
      const storedData = this.utilityService.registrationData?.talentInfo;
      const savedData = this.utilityService.getStep(stepKey);

      if(storedData) {
        console.log('I am here')
        this.setInitialFormValues(storedData);
      }
      else if (savedData?.value) {
        console.log('Saved here')
        this.grpInfoForm.patchValue(savedData.value);
      }
      
    }
  }


  private runInitialConditionalChecks() {
    const talentCategory = this.grpInfoForm.get('talentCategory')?.value;
    if (talentCategory) {
      this.grpInfoForm.get('talentCategory')?.setValue(talentCategory);
    }

    const previouslyParticipated = this.grpInfoForm.get('previouslyParticipated')?.value;
    if (previouslyParticipated) {
      this.grpInfoForm.get('previouslyParticipated')?.setValue(previouslyParticipated);
    }

    const prevParticipationCategory = this.grpInfoForm.get('previousParticipationCategory')?.value;
    if (prevParticipationCategory) {
      this.grpInfoForm.get('previousParticipationCategory')?.setValue(prevParticipationCategory);
    }
  }

}
