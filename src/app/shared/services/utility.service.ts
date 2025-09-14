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
    console.log(stepName)
    return this.forms[stepName];
  }
}
