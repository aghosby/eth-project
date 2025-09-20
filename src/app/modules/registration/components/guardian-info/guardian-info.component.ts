import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FormFields } from '@shared/models/form-fields';
import { SharedService } from '@shared/services/shared.service';
import { UtilityService } from '@shared/services/utility.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-guardian-info',
  templateUrl: './guardian-info.component.html',
  styleUrls: ['./guardian-info.component.scss']
})
export class GuardianInfoComponent implements OnInit {

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

  constructor(
    private utilityService: UtilityService,
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
      if (stepName === 'Guardian Details') {
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
        controlName: 'title',
        controlType: 'select',
        controlLabel: 'Title',
        controlWidth: '48%',
        initialValue: '',
        selectOptions: {
          Mr: 'Mr',
          Mrs: 'Mrs',
          Miss: 'Miss'
        },
        validators: [Validators.required],
        visible: true,
        order: 1
      },
      {
        controlName: 'guardianName',
        controlType: 'text',
        controlLabel: 'Guardian Name',
        controlWidth: '48%',
        initialValue: null,
        validators: [Validators.required],
        visible: true,
        order: 2
      },
      {
        controlName: 'relationship',
        controlType: 'select',
        controlLabel: 'Relationship',
        controlWidth: '48%',
        initialValue: '',
        selectOptions: {
          Father: 'Father',
          Mother: 'Mother',
          Aunt: 'Aunt',
          Uncle: 'Uncle',
          Brother: 'Brother',
          Sister: 'Sister',
          Other: 'Other'
        },
        validators: [Validators.required],
        visible: true,
        order: 3
      },
      {
        controlName: 'otherRelationship',
        controlType: 'text',
        controlLabel: 'Other Relationship',
        controlWidth: '48%',
        initialValue: null,
        validators: [Validators.required],
        visible: false,
        order: 3
      },
      {
        controlName: 'guardianEmail',
        controlType: 'text',
        controlLabel: 'Guardian Email Address',
        controlWidth: '48%',
        initialValue: null,
        validators: [Validators.required, Validators.email],
        visible: true,
        order: 4
      },
      {
        controlName: 'guardianPhoneNo',
        controlType: 'text',
        controlLabel: 'Guardian Phone Number',
        controlWidth: '48%',
        initialValue: null,
        validators: [Validators.required],
        visible: true,
        order: 5
      },
      {
        controlName: 'guardianAddress',
        controlType: 'text',
        controlLabel: 'Guardian Address',
        controlWidth: '48%',
        initialValue: null,
        validators: [],
        visible: true,
        order: 6
      },
      {
        controlName: 'guardianState',
        controlType: 'select',
        controlLabel: 'Guardian State',
        controlWidth: '48%',
        initialValue: null,
        selectOptions: {},
        validators: [],
        visible: true,
        order: 7
      }
    ]

    this.getStates();

    this.formInfoFields.sort((a,b) => (a.order - b.order));

    this.formInfoFields.forEach(field => {
      const formControl = new FormControl(field.initialValue, field.validators)
      this.grpInfoForm.addControl(field.controlName, formControl)
    });

    this.getRegistrationData();

    this.formStepLabels = this.utilityService.generateFieldMapping(this.formInfoFields);
  }

  getStates() {
    this.sharedService.getStates().subscribe((res: any) => {
      const stateOptions = this.arrayToObject(res.data.states, 'name');
      const stateField = this.formInfoFields.find(f => f.controlName === 'guardianState');
      if (stateField) {
        stateField.selectOptions = stateOptions;
      }
    });
  }

  private setupConditionalLogic() {
    // TalentCategory → show/hide OtherTalentCategory
    this.grpInfoForm.get('relationship')?.valueChanges.subscribe(value => {
      const otherField = this.formInfoFields.find(f => f.controlName === 'otherRelationship');
      const control = this.grpInfoForm.get('otherRelationship');

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
  arrayToObject(arrayVar: any[], key: string) {
    return arrayVar.reduce((agg: any, item: any) => {
      agg[item.name] = item[key]; // ✅ use name instead of _id
      return agg;
    }, {});
  }

  setInitialFormValues(initial: any) {
    if (!initial) return;
    const savedRegData = this.utilityService.registrationData.guardianInfo;
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
      const storedData = this.utilityService.registrationData[stepKey];
      const savedData = this.utilityService.getStep(stepKey);

      if(storedData) {
        this.setInitialFormValues(storedData);
      }
      else if (savedData?.value) {
        this.grpInfoForm.patchValue(savedData.value);
      }
      
    }
  }

  private runInitialConditionalChecks() {
    const relationship = this.grpInfoForm.get('relationship')?.value;
    if (relationship) {
      this.grpInfoForm.get('relationship')?.setValue(relationship);
    }
  }

}
