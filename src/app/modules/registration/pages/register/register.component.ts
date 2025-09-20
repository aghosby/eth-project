import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@shared/services/auth.service';
import { NotificationService } from '@shared/services/notification.service';
import { SharedService } from '@shared/services/shared.service';
import { UtilityService } from '@shared/services/utility.service';
import { BehaviorSubject } from 'rxjs';
import { log } from 'util';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  userId!: string;
  currentStep:number = 0;
  stepInView:any;
  regType!:number;
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
    private notifyService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loggedInUser = this.authService.loggedInUser;
    this.allFormSteps = this.utilityService.formSteps;
    if(this.loggedInUser.registrationInfo.currentStep == 0) {
      this.savedRegData = {};
      this.getCurrentStep()
    }
    else this.getRegistrationData();
  }

  viewStep(stepNo:number) {
    this.stepInView = this.formSteps.find(step => step.id === stepNo);
    this.currentStep = stepNo;
    // save current step in session storage
    sessionStorage.setItem('currentStep', String(stepNo));
    this.updateProgress();
    this.apiLoading = false;
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
      //console.log(step)

      // if(currentStepName == 'Review & Payment') {
      //   this.viewStep(nextStep);
      //   return;
      // }

      if(currentStepName == 'Success') {
        this.router.navigate(['/register/profile']);
        return;
      }

      if ((!step || !step.valid) && stepKey !== 'paymentInfo') {
        this.notifyService.showError('Please check that you have filled in all required fields')
        console.warn(`❌ Step "${currentStepName}" is invalid`, step?.value);
        return;
      }
      else {
        this.saveStepInfo(stepKey, step?.value, nextStep);        
      }      
    }, 200);
  }

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

  updateSavedRegData(key: string, value: any) {
    const saved = sessionStorage.getItem('savedRegData');
    if (!saved) return; // nothing saved yet

    // parse
    const savedObj = JSON.parse(saved);

    // update the section you want
    savedObj[key] = value;

    // save back
    sessionStorage.setItem('savedRegData', JSON.stringify(savedObj));
  }

  getRegistrationData() {
    this.sharedService.getUserRegistration().subscribe({
      next: res => {
        if(res.success) {
          this.savedRegData = res.data
          sessionStorage.setItem('savedRegData', JSON.stringify(res.data));
          this.getCurrentStep();
        }
      },
      error: err => {
        this.notifyService.showError(err.error.message);
        this.router.navigate(['/login']);
      }
    })
  }

  getCurrentStep() {
    this.apiLoading = false;
    const regData = sessionStorage.getItem('registrationData') || ''
    if(this.loggedInUser.registrationInfo) {
      const loggedInUserReg = this.loggedInUser.registrationInfo.registrationType
      this.regType = loggedInUserReg ? loggedInUserReg === 'individual' ? 1 : 2 : 1
    }
    else {
      this.regType = regData ? JSON.parse(regData).registrationType?.regType : 1
      //console.log('else')
    }    
    // fallback to session storage only
    const savedStep = this.loggedInUser.registrationInfo.completedSteps[0] ? this.loggedInUser.registrationInfo.completedSteps[0] : Number(sessionStorage.getItem('currentStep')) || 0;
    if(this.savedRegData && this.savedRegData.personalInfo) {
      const savedAge = this.savedRegData.personalInfo.dateOfBirth
      this.getUserAge(new Date(savedAge))
    }
    this.updateFormSteps();
    this.viewStep(savedStep);
  }

  getUserAge(dob: Date) {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    this.applicantAge = age;
    this.applicantAge$.next(age)
  }

  startRegistration() {
    this.apiLoading = true
    const alreadyStarted = this.loggedInUser.registrationInfo.registrationType
    if(alreadyStarted) {
      this.viewStep(1);
      this.apiLoading = false;
    }
    else {
      //console.log(this.utilityService.userCurrentStep)
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
    
  }

  successFn(apiRes:any, stepKey:string, payload:any, nextStep:number) {
    this.notifyService.showSuccess(apiRes.message)
    this.apiLoading = false;
    this.updateSavedRegData(stepKey, payload)
    //console.log('Next Step', nextStep, this.formSteps)
    this.viewStep(nextStep);
  }

  errorFn(apiRes:any) {
    this.apiLoading = false;
    this.notifyService.showError(apiRes.error.message)
  }

  saveStepInfo(stepKey:string, payload:any, nextStep:number) {
    this.apiLoading = true;
    const payloadData = {
      ...payload,
      nextStep: this.currentStep + 1
    }

    switch(stepKey) {
      case 'personalInfo':
        this.sharedService.createPersonalInfo(payloadData).subscribe({
          next: res => {
            if(res.success) {
              this.successFn(res, stepKey, payload, nextStep)
            }
          },
          error: err => {
            this.errorFn(err)
          }
        })
        break;
      case 'talentInfo':
        this.sharedService.createTalentInfo(payloadData).subscribe({
          next: res => {
            if(res.success) {
              this.successFn(res, stepKey, payload, nextStep)
            }
          },
          error: err => {
            this.errorFn(err)
          }
        })
        break;
      case 'mediaInfo':
        this.sharedService.createMediaInfo(payloadData).subscribe({
          next: res => {
            if(res.success) {
              this.successFn(res, stepKey, payload, nextStep)
            }
          },
          error: err => {
            this.errorFn(err)
          }
        })
        break;
      case 'guardianInfo':
        this.sharedService.createGuardianInfo(payloadData).subscribe({
          next: res => {
            if(res.success) {
              this.successFn(res, stepKey, payload, nextStep)
            }
          },
          error: err => {
            this.errorFn(err)
          }
        })
        break;
      case 'groupInfo':
        this.sharedService.createGroupInfo(payloadData).subscribe({
          next: res => {
            if(res.success) {
              this.successFn(res, stepKey, payload, nextStep)
            }
          },
          error: err => {
            this.errorFn(err)
          }
        })
        break;
      case 'auditionInfo':
        this.sharedService.createAuditionInfo(payloadData).subscribe({
          next: res => {
            if(res.success) {
              this.successFn(res, stepKey, payload, nextStep)
            }
          },
          error: err => {
            this.errorFn(err)
          }
        })
        break;
      case 'termsConditions':
        this.sharedService.createTermsConditionsInfo(payloadData).subscribe({
          next: res => {
            if(res.success) {
              this.successFn(res, stepKey, payload, nextStep)
            }
          },
          error: err => {
            this.errorFn(err)
          }
        })
        break;
      // case 'paymentInfo':
      //   console.log('I got here', payload)
      //   if(payload) this.successFn(payload, stepKey, payload, nextStep)
      //   // this.sharedService.createTermsConditionsInfo(payloadData).subscribe({
      //   //   next: res => {
      //   //     if(res.success) {
      //   //       this.successFn(res, stepKey, payload, nextStep)
      //   //     }
      //   //   },
      //   //   error: err => {
      //   //     this.errorFn(err)
      //   //   }
      //   // })
      //   break;
    }
  }

}
