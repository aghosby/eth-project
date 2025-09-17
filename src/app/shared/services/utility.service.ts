import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { BehaviorSubject, Subject } from 'rxjs';
import { AuthService } from './auth.service';

interface StepForm {
  valid: boolean;
  value: any;
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
      description: 'Are you registering as an individual or a group?',
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
      key: 'personalInfo'
    },
    {
      id: 2,
      stepName: 'Talent Details',
      description: '',
      buttons: [
        { text: 'Back', action: -1 },
        { text: 'Next', action: +1 }
      ],
      key: 'talentInfo'
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
      key: 'guardianInfo'
    },
    {
      id: 6,
      stepName: 'Audition Details',
      description: '',
      buttons: [
        { text: 'Back', action: -1 },
        { text: 'Next', action: +1 }
      ],
      key: 'auditionInfo'
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
      key: 'payment'
    },
    {
      id: 9,
      stepName: 'Success',
      description: 'Registration Successful!!!',
      buttons: [
        { text: 'Back', action: -1 },
        { text: 'View Profile', action: +1 }
      ],
      key: 'success'
    }
  ];

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  get userCurrentStep() {
    const storedStep = Number(sessionStorage.getItem('currentStep'));
    return this.authService.loggedInUser.currentStep ?? storedStep;
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
    const savedData = JSON.parse(sessionStorage.getItem('registrationData') || '{}');

    if (savedData[stepName]) {
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
}
