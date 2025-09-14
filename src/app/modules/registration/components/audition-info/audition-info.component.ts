import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FormFields } from '@shared/models/form-fields';
import { UtilityService } from '@shared/services/utility.service';

@Component({
  selector: 'app-audition-info',
  templateUrl: './audition-info.component.html',
  styleUrls: ['./audition-info.component.scss']
})
export class AuditionInfoComponent implements OnInit {
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
  }

  setUpForm = async () => {
    this.formInfoFields = [
      {
        controlName: 'auditionLocation',
        controlType: 'select',
        controlLabel: 'Audition Location',
        controlWidth: '48%',
        initialValue: '',
        selectOptions: {},
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
        validators: [Validators.required],
        visible: true,
        order: 4
      },
      {
        controlName: 'otherRequirement',
        controlType: 'text',
        controlLabel: 'Other Requirement',
        controlWidth: '48%',
        initialValue: null,
        validators: [Validators.required],
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
        validators: [Validators.required],
        visible: true,
        order: 5
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

}
