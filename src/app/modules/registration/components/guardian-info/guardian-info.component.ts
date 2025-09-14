import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FormFields } from '@shared/models/form-fields';
import { UtilityService } from '@shared/services/utility.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-guardian-info',
  templateUrl: './guardian-info.component.html',
  styleUrls: ['./guardian-info.component.scss']
})
export class GuardianInfoComponent implements OnInit {

  @Input() stepName!: string;
  private stepTrigger!: Subscription;
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
    this.setupConditionalLogic();

    // 🔥 listen for trigger from parent
    this.stepTrigger = this.utilityService.trigger$.subscribe((stepName) => {
      //console.log('Step', stepName)
      this.grpInfoForm.markAllAsTouched();
      if (stepName === 'Guardian Details') {
        this.utilityService.updateStep('guardianInfo', {
          valid: this.grpInfoForm.valid,
          value: this.grpInfoForm.value,
        });
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
        controlType: 'text',
        controlLabel: 'Guardian State',
        controlWidth: '48%',
        initialValue: null,
        validators: [],
        visible: true,
        order: 7
      }
    ]

    this.formInfoFields.sort((a,b) => (a.order - b.order));

    this.formInfoFields.forEach(field => {
      const formControl = new FormControl(field.initialValue, field.validators)
      this.grpInfoForm.addControl(field.controlName, formControl)
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
  arrayToObject(arrayVar:any, key:string) {
    let reqObj = {}
    reqObj = arrayVar.reduce((agg:any, item:any, index:any) => {
      agg[item['_id']] = item[key];
      return agg;
    }, {})
    console.log(reqObj);
    return reqObj;
  }

}
