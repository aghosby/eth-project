import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { BehaviorSubject, Subject } from 'rxjs';

interface StepForm {
  valid: boolean;
  value: any;
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

  constructor(private http: HttpClient) { }

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

  mapStepName(stepName: string): string {
    const map: { [key: string]: string } = {
      'Personal Details': 'personalInfo',
      'Group Lead Details': 'personalInfo',
      'Talent Details': 'talentInfo',
      'Group Details': 'groupInfo',
      'Media Upload': 'mediaInfo',
      'Guardian Details': 'guardianInfo',
      'Audition Details': 'auditionInfo',
      'Terms & Signatures': 'termsConditions',
      'Payment': 'payment',
      'Success': 'success',
    };
    return map[stepName] || stepName;
  }
}
