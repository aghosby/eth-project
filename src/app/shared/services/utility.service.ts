import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { BehaviorSubject, Subject } from 'rxjs';
import { AuthService } from './auth.service';
import { FormFields } from '@shared/models/form-fields';
import { Validators } from '@angular/forms';
import { ContactFormComponent } from '@shared/components/blocks/contact-form/contact-form.component';
import { MatDialog } from '@angular/material/dialog';

interface StepForm {
  valid: boolean;
  value: any;
  formDataValue?: any
}

export interface FormStepButton {
  text: string;
  action: number | string;
}

export interface FormStep {
  id: number;
  stepName: string;
  description: string;
  buttons: FormStepButton[];
  key: string; // unique key like 'personalInfo', 'talentInfo' etc.
  formFields?: FormFields[];
}

@Injectable({
  providedIn: 'root'
})
export class UtilityService {
  private baseUrl = `${environment.apiBaseUrl}`;
  private forms: { [key: string]: StepForm } = {};

  private formsSubject = new BehaviorSubject<{ [key: string]: StepForm }>({});
  forms$ = this.formsSubject.asObservable();

  // 🔥 parent tells child to report its form
  private triggerSubject = new Subject<string>();
  trigger$ = this.triggerSubject.asObservable();

  public readonly formSteps: FormStep[] = [
    {
      id: 0,
      stepName: 'Registration Type',
      description: 'Are you registering as an individual, group or you are buying in bulk?',
      buttons: [{ text: 'Next', action: +1 }],
      key: 'registrationType'
    },
    {
      id: 1,
      stepName: 'Personal Details',
      description: '',
      buttons: [
        { text: 'Back', action: -1 },
        { text: 'Next', action: +1 }
      ],
      key: 'personalInfo',
      formFields: [
        {
          controlName: 'firstName',
          controlType: 'text',
          controlLabel: 'First Name',
          controlWidth: '48%',
          initialValue: this.authService.loggedInUser?.firstName ?? null,
          validators: [Validators.required],
          order: 1
        },
        {
          controlName: 'lastName',
          controlType: 'text',
          controlLabel: 'Last Name',
          controlWidth: '48%',
          initialValue: this.authService.loggedInUser?.lastName ?? null,
          validators: [Validators.required],
          order: 2
        },
        {
          controlName: 'email',
          controlType: 'text',
          controlLabel: 'Email Address',
          controlWidth: '48%',
          initialValue: this.authService.loggedInUser?.email ?? null,
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
          selectOptions: {},
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
    },
    {
      id: 2,
      stepName: 'Talent Details',
      description: '',
      buttons: [
        { text: 'Back', action: -1 },
        { text: 'Next', action: +1 }
      ],
      key: 'talentInfo',
      formFields: [
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
    },
    {
      id: 3,
      stepName: 'Group Details',
      description: '',
      buttons: [
        { text: 'Back', action: -1 },
        { text: 'Next', action: +1 }
      ],
      key: 'groupInfo'
    },
    {
      id: 4,
      stepName: 'Media Upload',
      description: '',
      buttons: [
        { text: 'Back', action: -1 },
        { text: 'Next', action: +1 }
      ],
      key: 'mediaInfo'
    },
    {
      id: 5,
      stepName: 'Guardian Details',
      description: '',
      buttons: [
        { text: 'Back', action: -1 },
        { text: 'Next', action: +1 }
      ],
      key: 'guardianInfo',
      formFields: [
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
    },
    {
      id: 6,
      stepName: 'Audition Details',
      description: '',
      buttons: [
        { text: 'Back', action: -1 },
        { text: 'Next', action: +1 }
      ],
      key: 'auditionInfo',
      formFields: [
        {
          controlName: 'auditionLocation',
          controlType: 'select',
          controlLabel: 'Audition Location',
          controlWidth: '48%',
          initialValue: '',
          selectOptions: {
            Lagos: 'Lagos',
            Benin: 'Benin'
          },
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
    },
    {
      id: 7,
      stepName: 'Terms & Signatures',
      description: '',
      buttons: [
        { text: 'Back', action: -1 },
        { text: 'Next', action: +1 }
      ],
      key: 'termsConditions'
    },
    {
      id: 8,
      stepName: 'Review & Payment',
      description: '',
      buttons: [
        { text: 'Back', action: -1 },
        { text: 'Make Payment', action: +1 }
      ],
      key: 'paymentInfo'
    },
    {
      id: 9,
      stepName: 'Success',
      description: 'Registration Successful!!!',
      buttons: [
        // { text: 'Back', action: -1 },
        { text: 'View Profile', action: +1 }
      ],
      key: 'success'
    }
  ];

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    public dialog: MatDialog,
  ) { }

  get userCurrentStep() {
    const storedStep = Number(sessionStorage.getItem('currentStep'));
    return this.savedRegStep.currentStep ?? storedStep;
  }

  get registrationData() {
    const storedData = sessionStorage.getItem('savedRegData')
    if(storedData) {
      return JSON.parse(storedData);
    }
  }

  get savedRegStep() {
    const storedData = sessionStorage.getItem('savedRegStep')
    if(storedData) {
      return JSON.parse(storedData);
    }
  }

  getScreenSize(): 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl' {
    const width = window.innerWidth;

    if (width < 576) {
      return 'xs'; // < 576 → extra small
    } 
    else if (width < 768) {
      return 'sm';
    } 
    else if (width < 992) {
      return 'md';
    } 
    else if (width < 1200) {
      return 'lg';
    } 
    else if (width < 1400) {
      return 'xl';
    } 
    else if (width < 1600) {
      return 'xxl';
    } 
    else {
      return 'xxxl';
    }
  }

  getScreenWidth(): number {
    return window.innerWidth;
  }

  requestFormReport(stepName: string): void {
    this.triggerSubject.next(stepName);
  }

  updateStep(stepName: string, form: StepForm): void {
    this.forms[stepName] = form;

    // Save to sessionStorage
    let savedData = JSON.parse(sessionStorage.getItem('registrationData') || '{}');
    savedData[stepName] = form.value;
    sessionStorage.setItem('registrationData', JSON.stringify(savedData));

    this.formsSubject.next(this.forms);

    console.log(`✅ Saved [${stepName}]`, form.value);
  }

  getStep(stepName: string): StepForm | undefined {
    //console.log('Step', stepName)
    // check in-memory first
    if (this.forms[stepName]) {
      return this.forms[stepName];
    }

    // fallback: check sessionStorage
    const savedData =
      (sessionStorage.getItem('savedRegData') 
        ? JSON.parse(sessionStorage.getItem('savedRegData') as string)
        : null) 
      ?? 
      (sessionStorage.getItem('registrationData') 
      ? JSON.parse(sessionStorage.getItem('registrationData') as string)
      : null);

      if (savedData && savedData[stepName]) {
        return {
          valid: true, // assume valid if it came from API/session
          value: savedData[stepName],
        };
      }

    return undefined;
  }

  // generate map object
  private readonly stepNameMap: { [stepName: string]: string } = this.formSteps.reduce((acc, step) => {
    acc[step.stepName] = step.key;
    return acc;
  }, {} as { [key: string]: string });

  // callable function
  public mapStepName(stepName: string): string {
    if(stepName == 'Group Lead Details') return 'personalInfo';
    return this.stepNameMap[stepName] || stepName;
  }

  // Generate mapping array from formFields array for a single step
  generateFieldMapping(formFields: any[]): { key: string; label: string; type: string }[] {
    return formFields.map(field => ({
      key: field.controlName,
      label: field.controlLabel,
      type: (field.controlType === 'date' || field.controlType === 'time') ? field.controlType : 'text'
    }));
  }

  // Save a step's field metadata to session storage under formStepLabels
  saveStepLabelsToSession(stepKey: string, fieldMapping: { key: string; label: string; type: string }[]) {
    const existing = JSON.parse(sessionStorage.getItem('formStepLabels') || '{}');
    existing[stepKey] = fieldMapping;
    sessionStorage.setItem('formStepLabels', JSON.stringify(existing));
  }


  //FOR ADMIN PURPOSES
  getFormStepsForUser(
    registrationType: string,
    dob: string | Date,
    allFormSteps: any[] = this.formSteps
  ): FormStep[] {
    const steps = [...allFormSteps];

    // Calculate age
    const birthDate = dob instanceof Date ? dob : new Date(dob);
    const today = new Date();
    let applicantAge = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      applicantAge--;
    }

    // Adjust stepName for step 1 based on registrationType
    steps.find(s => {
      if (s.id === 1) {
        s.stepName = registrationType === 'individual' ? 'Personal Details' : 'Group Lead Details';
      }
    });

    // Remove Group Details if registrationType is individual
    let filteredSteps = steps;
    if (registrationType === 'individual') {
      filteredSteps = filteredSteps.filter(s => s.stepName !== 'Group Details');
    }

    // Remove Guardian Details if applicant is 16 or older
    if (applicantAge >= 16) {
      filteredSteps = filteredSteps.filter(s => s.stepName !== 'Guardian Details');
    }

    // Reindex sequentially
    filteredSteps = filteredSteps.map((s, i) => ({ ...s, id: i }));

    return filteredSteps;
  }

  getCurrentStepName(
    stepIndex: number,
    registrationType: string,
    dob: string | Date,
  ): string {
    const steps = this.getFormStepsForUser(registrationType, dob, this.formSteps);
    const step = steps.find(s => s.id === stepIndex);
    return step ? step.stepName : '-';
  }

  contactForm() {
    const screenSize = this.getScreenWidth();
    let dialogRef = this.dialog.open(ContactFormComponent, {
      width: screenSize > 768 ? '45%' : '95%',
      height: 'auto',
    });
  }
}
