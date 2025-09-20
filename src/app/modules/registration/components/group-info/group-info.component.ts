import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Countries } from '@shared/constants/countries';
import { FormFields } from '@shared/models/form-fields';
import { UtilityService } from '@shared/services/utility.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-group-info',
  templateUrl: './group-info.component.html',
  styleUrls: ['./group-info.component.scss']
})
export class GroupInfoComponent implements OnInit {
  @Input() stepName!: string;
  @Input() formInitialValue!: any;
  private stepTrigger!: Subscription;
  maxDate!: Date;
  keepOrder = () => 0;

  constructor(
    private utilityService: UtilityService,
    private fb: FormBuilder
  ) {
    const today = new Date();
    this.maxDate = new Date(today.getFullYear() - 3, today.getMonth(), today.getDate());
  }

  grpInfoForm:FormGroup = new FormGroup({});
  formInfoFields!: FormFields[];
  formStepLabels:any;
  screenSize!:number;
  useFormWidth:boolean = true;
  grpCountSelectOptions:any = {
    2: '2',
    3: '3',
    4: '4',
    5: '5'
  };
  genderSelectOptions:any = {
    Male: 'Male',
    Female: 'Female'
  }
  tshirtSelectOptions:any = {
    XS: 'XS',
    S: 'S',
    M: 'M',
    L: 'L',
    XL: 'XL',
    XXL: 'XXL'
  }

  ngOnInit(): void {
    this.screenSize = this.utilityService.getScreenWidth();
    this.useFormWidth = this.screenSize > 768;
    this.setUpForm();

    // 🔥 listen for trigger from parent
    this.stepTrigger = this.utilityService.trigger$.subscribe((stepName) => {
      //console.log('Step', stepName)
      this.grpInfoForm.markAllAsTouched();
      const stepKey = this.utilityService.mapStepName(this.stepName);
      if (stepName === 'Group Details') {
        this.utilityService.updateStep(stepKey, {
          valid: this.grpInfoForm.valid,
          value: this.grpInfoForm.value,
        });

        this.utilityService.saveStepLabelsToSession(stepKey, this.formStepLabels);
      }
    });
  }

  get members(): FormArray {
    return this.grpInfoForm.get('members') as FormArray;
  }

  setUpForm = async () => {
    this.grpInfoForm = new FormGroup({
      groupName: new FormControl('', Validators.required),
      noOfGroupMembers: new FormControl('', Validators.required),
      members: new FormArray([], Validators.required)
    });

    // 🔥 Use the same map logic as parent
    const stepKey = this.utilityService.mapStepName(this.stepName);
    const saved = this.utilityService.getStep(stepKey);
    //console.log('Restoring form for', stepKey, saved);

    if (saved?.value) {
      this.grpInfoForm.patchValue({
        ...saved.value,
        members: []
      });

      if (saved.value.members && Array.isArray(saved.value.members)) {
        const membersArray = this.grpInfoForm.get('members') as FormArray;
        membersArray.clear();

        saved.value.members.forEach((member: any) => {
          const memberGroup = this.createMember(); // create empty group
          memberGroup.patchValue(member); // patch member values into it
          membersArray.push(memberGroup); // add to array
        });
      }
    }

    // this.formStepLabels = this.utilityService.generateFieldMapping(this.formInfoFields);

    this.grpInfoForm.get('noOfGroupMembers')?.valueChanges.subscribe((count: number) => {
      this.setMembers(count);
    });

    // initialize with default 2
    this.setMembers(2);
  }

  //Converts an array to an Object of key value pairs
  arrayToObject(arrayVar:any, key:string) {
    let reqObj = {}
    reqObj = arrayVar.reduce((agg:any, item:any, index:any) => {
      agg[item['_id']] = item[key];
      return agg;
    }, {})
    //console.log(reqObj);
    return reqObj;
  }

  private createMember(): FormGroup {
    return this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required],
      tshirtSize: ['', Validators.required]
    });
  }

  private setMembers(count: number) {
    const current = this.members.length;

    // if more members, add
    if (count > current) {
      for (let i = current; i < count; i++) {
        this.members.push(this.createMember());
      }
    } 
    // if fewer members, remove extras
    else if (count < current) {
      for (let i = current - 1; i >= count; i--) {
        this.members.removeAt(i);
      }
    }
  }

}
