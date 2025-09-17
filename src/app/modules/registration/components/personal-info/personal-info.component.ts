import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Countries } from '@shared/constants/countries';
import { FormFields } from '@shared/models/form-fields';
import { AuthService } from '@shared/services/auth.service';
import { SharedService } from '@shared/services/shared.service';
import { UtilityService } from '@shared/services/utility.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-personal-info',
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.scss']
})
export class PersonalInfoComponent implements OnInit {

  @Input() stepName!: string;
  @Input() formInitialValue!: any;
  private stepTrigger!: Subscription;
  grpInfoForm:FormGroup = new FormGroup({});
  formInfoFields!: FormFields[];
  formStepLabels:any;
  screenSize!:number;
  useFormWidth:boolean = true;
  maxDate!: Date;
  @Output() ageChange = new EventEmitter<number>();
  keepOrder = () => 0;
  
  constructor(
    private utilityService: UtilityService,
    private authService: AuthService,
    private sharedService: SharedService
  ) {
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
    console.log('Personal Info', this.formInitialValue);
    this.formInfoFields = [
      {
        controlName: 'firstName',
        controlType: 'text',
        controlLabel: 'First Name',
        controlWidth: '48%',
        initialValue: this.authService.loggedInUser.firstName ?? null,
        validators: [Validators.required],
        order: 1
      },
      {
        controlName: 'lastName',
        controlType: 'text',
        controlLabel: 'Last Name',
        controlWidth: '48%',
        initialValue: this.authService.loggedInUser.lastName ?? null,
        validators: [Validators.required],
        order: 2
      },
      {
        controlName: 'email',
        controlType: 'text',
        controlLabel: 'Email Address',
        controlWidth: '48%',
        initialValue: this.authService.loggedInUser.email ?? null,
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
        controlWidth: '100%',
        initialValue: null,
        validators: [],
        order: 9
      },
      {
        controlName: 'state',
        controlType: 'select',
        controlLabel: 'State of Origin',
        controlWidth: '48%',
        initialValue: null,
        selectOptions: {},
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
      {
        controlName: 'tshirtSize',
        controlType: 'select',
        controlLabel: 'T-Shirt Size',
        controlWidth: '48%',
        initialValue: null,
        selectOptions: {
          XS: 'XS',
          S: 'S',
          M: 'M',
          L: 'L',
          XL: 'XL',
          XXL: 'XXL'
        },
        validators: [Validators.required],
        order: 13
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

    this.grpInfoForm.get('dateOfBirth')?.valueChanges.subscribe((dob: Date) => {
      if (dob) {
        const date = typeof dob === 'string' ? new Date(dob) : dob;
        this.handleDateOfBirthChange(date);
      }
    });

    this.grpInfoForm.get('state')?.valueChanges.subscribe(stateName => {
      if (stateName) {
        this.getLgas(stateName);
      }
    });
  }

  //Converts an array to an Object of key value pairs
  arrayToObject(arrayVar: any[], key: string) {
    return arrayVar.reduce((agg: any, item: any) => {
      agg[item.name] = item[key]; // ✅ use name instead of _id
      return agg;
    }, {});
  }

  handleDateOfBirthChange(dob: Date) {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    this.ageChange.emit(age);
  }

  // setCountryOptions() {
  //   const nationalityField = this.formInfoFields.find(f => f.controlName === 'nationality');
  //   if(nationalityField) {
  //     nationalityField.selectOptions = this.createCountryOptions();
  //   }
  // }

  createCountryOptions() {
    let reqObj = {}
    reqObj = Countries.reduce((agg:any, item:any, index:any) => {
      agg[item['label']] = item['label'];
      return agg;
    }, {})
    //console.log(reqObj);
    return reqObj;
  }

  getStates() {
    this.sharedService.getStates().subscribe((res: any) => {
      const stateOptions = this.arrayToObject(res.data.states, 'name');
      const stateField = this.formInfoFields.find(f => f.controlName === 'state');
      const placeOfBirthField = this.formInfoFields.find(f => f.controlName === 'placeOfBirth');
      if (stateField && placeOfBirthField) {
        stateField.selectOptions = stateOptions;
        placeOfBirthField.selectOptions = stateOptions;
      }
    });
  }

  getLgas(stateName: string) {
    this.sharedService.getLgas(stateName).subscribe((res: any) => {
      const lgaOptions = this.arrayToObject(res.data.lgas, 'name');
      const lgaField = this.formInfoFields.find(f => f.controlName === 'lga');
      if (lgaField) {
        lgaField.selectOptions = lgaOptions;
      }
    });
  }

  setInitialFormValues(initial: any) {
    if (!initial) return;

    const patch = { ...initial };

    // ✅ normalize dateOfBirth
    if (patch.dateOfBirth) {
      patch.dateOfBirth = new Date(patch.dateOfBirth);
    }

    // patch everything
    this.grpInfoForm.patchValue(patch);

    // ✅ trigger dob logic manually
    if (patch.dateOfBirth) {
      this.handleDateOfBirthChange(patch.dateOfBirth);
    }

    // ✅ trigger state -> lga logic manually
    if (patch.state) {
      this.getLgas(patch.state);
    }
  }


  getRegistrationData() {
    if (this.formInitialValue) {
      this.setInitialFormValues(this.formInitialValue)
      //console.log('Patched')
    }
    else {
      // 🔥 Use the same map logic as parent
      const stepKey = this.stepName == 'Group Lead Details' ? this.utilityService.mapStepName('Personal Details') : this.utilityService.mapStepName(this.stepName);
      const storedData = this.utilityService.registrationData.personalInfo;
      //console.log('Data', storedData)
      const savedData = this.utilityService.getStep(stepKey);
      //console.log('Restoring form for', stepKey, savedData);
      if(storedData) {
        this.setInitialFormValues(storedData);
      }
      else if (savedData?.value) {
        this.grpInfoForm.patchValue(savedData.value);
      }
    }
  }

  
}
