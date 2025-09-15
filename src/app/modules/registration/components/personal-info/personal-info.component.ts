import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Countries } from '@shared/constants/countries';
import { FormFields } from '@shared/models/form-fields';
import { UtilityService } from '@shared/services/utility.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-personal-info',
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.scss']
})
export class PersonalInfoComponent implements OnInit {

  @Input() stepName!: string;
  private stepTrigger!: Subscription;
  grpInfoForm:FormGroup = new FormGroup({});
  formInfoFields!: FormFields[];
  formStepLabels:any;
  screenSize!:number;
  useFormWidth:boolean = true;
  maxDate!: Date;
  @Output() ageChange = new EventEmitter<number>();
  keepOrder = () => 0;
  
  constructor(private utilityService: UtilityService) {
    const today = new Date();
    this.maxDate = new Date(today.getFullYear() - 3, today.getMonth(), today.getDate());
  }
  
  ngOnInit(): void {
    this.screenSize = this.utilityService.getScreenWidth();
    this.useFormWidth = this.screenSize > 768;
    this.setUpForm();

    // 🔥 listen for trigger from parent
    this.stepTrigger = this.utilityService.trigger$.subscribe((stepName) => {
      //console.log('Step', stepName)
      this.grpInfoForm.markAllAsTouched();
      const stepKey = this.stepName == 'Group Lead Details' ? this.utilityService.mapStepName('Personal Details') : this.utilityService.mapStepName(this.stepName);
      if (stepName === 'Personal Details' || stepName === 'Group Lead Details') {
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
        controlName: 'firstName',
        controlType: 'text',
        controlLabel: 'First Name',
        controlWidth: '48%',
        initialValue: null,
        validators: [Validators.required],
        order: 1
      },
      {
        controlName: 'lastName',
        controlType: 'text',
        controlLabel: 'Last Name',
        controlWidth: '48%',
        initialValue: null,
        validators: [Validators.required],
        order: 2
      },
      {
        controlName: 'email',
        controlType: 'text',
        controlLabel: 'Email Address',
        controlWidth: '48%',
        initialValue: null,
        validators: [Validators.required, Validators.email],
        order: 3
      },
      {
        controlName: 'phoneNo',
        controlType: 'text',
        controlLabel: 'Phone Number',
        controlWidth: '48%',
        initialValue: null,
        validators: [Validators.required],
        order: 4
      },
      {
        controlName: 'dateOfBirth',
        controlType: 'date',
        controlLabel: 'Date of Birth',
        controlWidth: '48%',
        initialValue: null,
        validators: [Validators.required],
        order: 5
      },
      {
        controlName: 'placeOfBirth',
        controlType: 'select',
        controlLabel: 'Place of birth',
        controlWidth: '48%',
        initialValue: '',
        selectOptions: {},
        validators: [],
        order: 6
      },
      {
        controlName: 'gender',
        controlType: 'select',
        controlLabel: 'Gender',
        controlWidth: '48%',
        initialValue: '',
        selectOptions: {
          Male: 'Male',
          Female: 'Female'
        },
        validators: [Validators.required],
        order: 7
      },
      {
        controlName: 'maritalStatus',
        controlType: 'select',
        controlLabel: 'Marital Status',
        controlWidth: '48%',
        initialValue: '',
        selectOptions: {
          Single: 'Single',
          Married: 'Married'
        },
        validators: [],
        order: 8
      },
      {
        controlName: 'address',
        controlType: 'text',
        controlLabel: 'Address',
        controlWidth: '48%',
        initialValue: null,
        validators: [],
        order: 9
      },
      {
        controlName: 'state',
        controlType: 'text',
        controlLabel: 'State of Origin',
        controlWidth: '48%',
        initialValue: null,
        validators: [],
        order: 10
      },
      {
        controlName: 'lga',
        controlType: 'select',
        controlLabel: 'LGA',
        controlWidth: '48%',
        initialValue: '',
        selectOptions: {},
        validators: [],
        order: 11
      },
      {
        controlName: 'nationality',
        controlType: 'select',
        controlLabel: 'Nationality',
        controlWidth: '48%',
        initialValue: null,
        selectOptions: this.createCountryOptions(),
        validators: [],
        order: 12
      },
    ]

    this.formInfoFields.sort((a,b) => (a.order - b.order));

    this.formInfoFields.forEach(field => {
      const formControl = new FormControl(field.initialValue, field.validators)
      this.grpInfoForm.addControl(field.controlName, formControl)
    });

    // 🔥 Use the same map logic as parent
    const stepKey = this.stepName == 'Group Lead Details' ? this.utilityService.mapStepName('Personal Details') : this.utilityService.mapStepName(this.stepName);
    const saved = this.utilityService.getStep(stepKey);
    console.log('Restoring form for', stepKey, saved);

    if (saved?.value) {
      this.grpInfoForm.patchValue(saved.value);
    }

    this.formStepLabels = this.utilityService.generateFieldMapping(this.formInfoFields);

    this.grpInfoForm.get('dateOfBirth')?.valueChanges.subscribe((dob: Date) => {
      if (dob) {
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
          age--;
        }
        this.ageChange.emit(age);
      }
    });
  }

  //Converts an array to an Object of key value pairs
  arrayToObject(arrayVar:any, key:string) {
    let reqObj = {}
    reqObj = arrayVar.reduce((agg:any, item:any, index:any) => {
      agg[item['_id']] = item[key];
      return agg;
    }, {})
    console.log(reqObj);
    return reqObj;
  }

  createCountryOptions() {
    let reqObj = {}
    reqObj = Countries.reduce((agg:any, item:any, index:any) => {
      agg[item['label']] = item['label'];
      return agg;
    }, {})
    //console.log(reqObj);
    return reqObj;
  }

  
}
