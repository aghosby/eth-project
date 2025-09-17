import { Component, OnInit } from '@angular/core';
import { AuthService } from '@shared/services/auth.service';
import { NotificationService } from '@shared/services/notification.service';
import { SharedService } from '@shared/services/shared.service';
import { UtilityService } from '@shared/services/utility.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  userId!: string;
  currentStep:number = 0;
  stepInView:any;
  regType:number = 1;
  apiLoading:boolean = false;
  applicantAge: number = 18;
  applicantAge$ = new BehaviorSubject<number | null>(null);
  loggedInUser:any;

  formSteps:any[] = [];
  
  allFormSteps:any[] = [];
  savedRegData:any;

  _formProgress:number = 0;
  get formProgess() {
    return this._formProgress;
  }

  constructor(
    private authService: AuthService,
    private sharedService: SharedService,
    private utilityService: UtilityService,
    private notifyService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loggedInUser = this.authService.loggedInUser;
    this.allFormSteps = this.utilityService.formSteps
    // this.updateFormSteps();
    // this.viewStep(0);
    this.getRegistrationData();
    this.getCurrentStep()
    //this.getProfileDetails()
  }

  viewStep(stepNo:number) {
    this.stepInView = this.formSteps.find(step => step.id === stepNo);
    this.currentStep = stepNo;
    // save current step in session storage
    sessionStorage.setItem('currentStep', String(stepNo));
    this.updateProgress();
  }

  goToStep(next: number) {
    const nextStep = this.currentStep + next;
    const currentStepName = this.stepInView?.stepName;

    if(next < 0) {
      this.viewStep(nextStep);
      return;
    }

    if (this.currentStep === 0) {
      this.startRegistration();
      return;
    }

    if (!currentStepName) {
      return;
    }

    // map display step name → storage key
    const stepKey = this.utilityService.mapStepName(currentStepName);

    // 🔥 Ask the current child to report its form state
    this.utilityService.requestFormReport(currentStepName);

    // Wait for the child to respond before deciding
    setTimeout(() => {
      const step = this.utilityService.getStep(stepKey);
      console.log(step)

      if(currentStepName == 'Review & Payment') {
        this.viewStep(nextStep);
        return;
      }

      if (!step || !step.valid) {
        this.notifyService.showError('Please check that you have filled in all required fields')
        console.warn(`❌ Step "${currentStepName}" is invalid`, step?.value);
        return;
      }
      else {
        switch(stepKey) {
          case 'personalInfo' :
            this.savePersonalInfo(step.value, nextStep);
        }

        
      }

      //console.log(`✅ Step "${currentStepName}" valid, moving to next step...`);
      //console.log('Form Value:', step.value);

      
    }, 0);
  }

  // private mapStepName(stepName: string): string {
  //   const map: { [key: string]: string } = {
  //     'Personal Details': 'personalInfo',
  //     'Group Lead Details': 'personalInfo', // for group registration
  //     'Talent Details': 'talentInfo',
  //     'Group Details': 'groupInfo',
  //     'Media Upload': 'mediaInfo',
  //     'Guardian Details': 'guardianInfo',
  //     'Audition Details': 'auditionInfo',
  //     'Terms & Signatures': 'termsConditions',
  //     'Payment': 'payment',
  //     'Success': 'success',
  //   };
  //   return map[stepName] || stepName;
  // }

  private updateProgress(): void {
    this._formProgress = Math.ceil(
      (100 * (this.currentStep - 1)) / (this.formSteps.length - 1)
    );
  }

  setRegType(type:number) {
    this.regType = type;
    this.updateFormSteps();
  }

  updateFormSteps() {
    let steps = [...this.allFormSteps];

    steps.find(s => {
      if(s.id === 1) s.stepName = this.regType === 1 ? 'Personal Details' : 'Group Lead Details'
    })

    // remove Group Details if not a group
    if (this.regType !== 2) {
      steps = steps.filter(s => s.stepName !== 'Group Details');
    }

    // remove Guardian Details if applicant is 16 or older
    if (this.applicantAge >= 16) {
      steps = steps.filter(s => s.stepName !== 'Guardian Details');
    }

    // reindex sequentially
    this.formSteps = steps.map((s, i) => ({ ...s, id: i }));
    //console.log('Form Steps', this.formSteps)
  }

  onAgeChange(age: number) {
    this.applicantAge = age;
    this.applicantAge$.next(age);
    this.updateFormSteps();
  }

  private getProfileDetails(): void {
    this.apiLoading = true;
    this.sharedService.getProfileDetails().subscribe({
      next: (profile) => {
        this.apiLoading = false;

        // 🔥 Merge profile + session data
        const sessionData = JSON.parse(sessionStorage.getItem('registrationData') || '{}');
        const mergedData = { ...profile, ...sessionData };

        // Save merged into service
        Object.keys(mergedData).forEach((key) => {
          this.utilityService.updateStep(key, {
            valid: true, // assume profile data is valid
            value: mergedData[key],
          });
        });

        // Restore step
        const savedStep = Number(sessionStorage.getItem('currentStep')) || 0;
        this.updateFormSteps();
        this.viewStep(savedStep);
      },
      error: (err) => {
        this.apiLoading = false;
        console.error('Failed to fetch profile details', err);

        // fallback to session storage only
        const savedStep = Number(sessionStorage.getItem('currentStep')) || 0;
        this.updateFormSteps();
        this.viewStep(savedStep);
      }
    });
  }

  getRegistrationData() {
    this.sharedService.getUserRegistration().subscribe({
      next: res => {
        if(res.success) {
          this.savedRegData = res.data
          console.log(this.savedRegData)
        }
      },
      error: err => {}
    })
  }

  getCurrentStep() {
    this.apiLoading = false;
    const regData = sessionStorage.getItem('registrationData') || ''
    if(this.loggedInUser.registrationType) {
      this.regType = this.loggedInUser.registrationType === 'individual' ? 1 : 2 
    }
    else {
      this.regType = regData ? JSON.parse(regData).registrationType.regType : 1
    }    
    // fallback to session storage only
    const savedStep = this.loggedInUser.currentStep ? this.loggedInUser.currentStep : Number(sessionStorage.getItem('currentStep')) || 0;
    
    console.log(this.regType)
    this.updateFormSteps();
    this.viewStep(savedStep);
  }

  startRegistration() {
    this.apiLoading = true
    console.log(this.utilityService.userCurrentStep)
    if(this.utilityService.userCurrentStep < 1) {
      const payload = {
        registrationType: this.regType === 1 ? 'individual' : 'group'
      }
      this.sharedService.startRegistration(payload).subscribe({
        next: res => {
          if (res.success) {
            // 🔥 Step 0 is in parent → push regType directly
            this.utilityService.updateStep('registrationType', {
              valid: true, // or add more validation if needed
              value: { regType: this.regType },
            });

            //console.log('✅ Step "registrationType" saved:', { regType: this.regType });

            // Proceed to next step
            this.viewStep(1);
            this.apiLoading = false;
            // this.notifyService.showSuccess(res.message);
          }
        },
        error: err => {
          this.notifyService.showError(err.error.message);
          this.viewStep(1);
          this.apiLoading = false;  
        }
      })
    }
    else {
      // Proceed to next step
      this.viewStep(1);
      this.apiLoading = false;
    }
  }

  savePersonalInfo(payload:any, nextStep:number) {
    this.apiLoading = true;
    this.sharedService.createPersonalInfo(payload).subscribe({
      next: res => {
        if(res.success) {
          this.notifyService.showSuccess(res.message)
          this.apiLoading = false;
          // Move to next step
          this.viewStep(nextStep);
        }
      },
      error: err => {
        this.apiLoading = false;
        this.notifyService.showError(err.error.message)
      }
    })
  }

}
