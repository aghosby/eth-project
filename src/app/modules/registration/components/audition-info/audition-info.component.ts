import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FormFields } from '@shared/models/form-fields';
import { SharedService } from '@shared/services/shared.service';
import { UtilityService } from '@shared/services/utility.service';
import { Subscription } from 'rxjs';
import { DateTime } from 'luxon';

function makeTime(hour: number, minute: number): DateTime {
  return DateTime.local().set({ hour, minute, second: 0, millisecond: 0 });
}

@Component({
  selector: 'app-audition-info',
  templateUrl: './audition-info.component.html',
  styleUrls: ['./audition-info.component.scss']
})
export class AuditionInfoComponent implements OnInit {
  @Input() stepName!: string;
  @Input() formInitialValue!: any;
  private stepTrigger!: Subscription;
  grpInfoForm:FormGroup = new FormGroup({});
  formInfoFields!: FormFields[];
  formStepLabels:any;
  screenSize!:number;
  useFormWidth:boolean = true;
  keepOrder = () => 0;
  subscriptionsSetup:boolean = false;
  talentType!: string;
  minTime!: DateTime;
  maxTime!: DateTime;

  constructor(
    private utilityService: UtilityService,
    private sharedService: SharedService
  ) {}

  ngOnInit(): void {
    this.minTime = DateTime.fromObject({ hour: 8, minute: 0 }) as any;
    this.maxTime = DateTime.fromObject({ hour: 17, minute: 0 }) as any;
    // const today = new Date();
    // this.minTime = new Date(today);
    // this.minTime.setHours(8, 0, 0); // 8:00 AM

    // this.maxTime = new Date(today);
    // this.maxTime.setHours(17, 0, 0);

    this.screenSize = this.utilityService.getScreenWidth();
    this.useFormWidth = this.screenSize > 768;
    this.setUpForm();
    this.setupConditionalLogic();

    // 🔥 listen for trigger from parent
    this.stepTrigger = this.utilityService.trigger$.subscribe((stepName) => {
      //console.log('Step', stepName)
      this.grpInfoForm.markAllAsTouched();
      const stepKey = this.utilityService.mapStepName(this.stepName);
      if (stepName === 'Audition Details') {
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
        controlName: 'auditionLocation',
        controlType: 'text',
        controlLabel: 'Audition Location',
        controlWidth: '48%',
        initialValue: 'No 3 Imuetinyan Street, Off Ihama, Opposite Ebenezer Junction, GRA, Benin City',
        readonly: true,
        validators: [Validators.required],
        visible: true,
        order: 1
      },
      {
        controlName: 'auditionDate',
        controlType: 'date',
        controlLabel: 'Audition Date',
        controlWidth: '48%',
        initialValue: null,
        validators: [Validators.required],
        visible: true,
        order: 2
      },
      {
        controlName: 'auditionTime',
        controlType: 'time',
        controlLabel: 'Audition Time',
        controlWidth: '48%',
        initialValue: null,
        validators: [Validators.required],
        visible: true,
        order: 3
      },
      {
        controlName: 'audtionRequirement',
        controlType: 'select',
        controlLabel: 'Instrument Required',
        controlWidth: '48%',
        initialValue: '',
        selectOptions: {
          Microphone: 'Microphone',
          Guitar: 'Guitar',
          Bass: 'Bass',
          Drum: 'Drum',
          BackgroundMusic: 'Background Music',
          StageLighting: 'Stage Lighting',
          Projector: 'Projector',
          Other: 'Other'
        },
        validators: [],
        visible: true,
        order: 4
      },
      {
        controlName: 'otherRequirement',
        controlType: 'text',
        controlLabel: 'Other Requirement',
        controlWidth: '48%',
        initialValue: null,
        validators: [],
        visible: false,
        order: 4
      },
      {
        controlName: 'hasInstrument',
        controlType: 'select',
        controlLabel: 'Do you have your own instrument ?',
        controlWidth: '48%',
        initialValue: '',
        selectOptions: {
          Yes: 'Yes',
          No: 'No'
        },
        validators: [],
        visible: true,
        order: 5
      }
    ]

    this.formInfoFields.sort((a,b) => (a.order - b.order));

    this.formInfoFields.forEach(field => {
      const formControl = new FormControl(field.initialValue, field.validators)
      this.grpInfoForm.addControl(field.controlName, formControl)
    });

    this.getRegistrationData();
    const regData = this.utilityService.registrationData 
      ?? JSON.parse(sessionStorage.getItem('registrationData') || '{}');

    this.talentType = regData?.talentInfo?.talentCategory || '';
    this.setTalentDate(this.talentType);

    this.formStepLabels = this.utilityService.generateFieldMapping(this.formInfoFields);
  }

  dateFilter = (d: Date | null): boolean => {
    if (!d) return false;

    const date = d.getDate();
    const month = d.getMonth(); // 0 = Jan, 11 = Dec

    // Only December
    if (month !== 11) return false;

    switch (this.talentType.toLowerCase()) {
      case 'singing':
        return date === 1;
      case 'comedy':
        return date === 2;
      case 'dancing':
        return date === 3;
      default:
        return date === 5 || date === 6;
    }
  };

  private setupConditionalLogic() {
    // TalentCategory → show/hide OtherTalentCategory
    this.grpInfoForm.get('audtionRequirement')?.valueChanges.subscribe(value => {
      const otherField = this.formInfoFields.find(f => f.controlName === 'otherRequirement');
      const control = this.grpInfoForm.get('otherRequirement');

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

  //Converts an array to an Object of key value pairs
  arrayToObject(arrayVar:any, key:string) {
    let reqObj = {}
    reqObj = arrayVar.reduce((agg:any, item:any, index:any) => {
      agg[item['id']] = item[key];
      return agg;
    }, {})
    console.log(reqObj);
    return reqObj;
  }

  setInitialFormValues(initial: any) {
    if (!initial) return;
    const savedRegData = this.utilityService.registrationData.auditionInfo;
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
      console.log('Patched')
    }
    else {
      // 🔥 Use the same map logic as parent
      const stepKey = this.utilityService.mapStepName(this.stepName);
      const storedData = this.utilityService.registrationData && this.utilityService.registrationData[stepKey];
      const savedData = this.utilityService.getStep(stepKey);
      console.log('Restoring form for', stepKey, savedData);

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
    const audtionRequirement = this.grpInfoForm.get('audtionRequirement')?.value;
    if (audtionRequirement) {
      this.grpInfoForm.get('audtionRequirement')?.setValue(audtionRequirement);
    }
  }

  private setTalentDate(talentType:string): void {
    const year = new Date().getFullYear();
    let selectedDate: Date;

    switch (talentType?.toLowerCase()) {
      case 'singing':
        selectedDate = new Date(year, 11, 1); // Dec 1
        break;
      case 'comedy':
        selectedDate = new Date(year, 11, 2); // Dec 2
        break;
      case 'dancing':
        selectedDate = new Date(year, 11, 3); // Dec 3
        break;
      default:
        selectedDate = new Date(year, 11, 5); // Default Dec 5
        break;
    }

    // Set the value into the form
    this.grpInfoForm.get('auditionDate')?.setValue(selectedDate);

    // Disable the picker so user cannot change
    //this.grpInfoForm.get('auditionDate')?.disable();
  }

}
