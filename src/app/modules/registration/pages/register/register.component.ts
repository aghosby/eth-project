import { Component, OnInit } from '@angular/core';
import { UtilityService } from '@shared/services/utility.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  currentStep:number = 0;
  stepInView:any;
  regType:number = 1;
  apiLoading:boolean = false;
  applicantAge: number = 18;
  applicantAge$ = new BehaviorSubject<number | null>(null);

  formSteps:any[] = [];
  
  allFormSteps:any[] = [
    {
      id: 0,
      stepName: 'Registration Type',
      description: 'Are you registering as an individual or a group ?',
      buttons: [
        {
          text: 'Next',
          action: +1
        }
      ]
    },
    {
      id: 1,
      stepName: 'Personal Details',
      description: '',
      buttons: [
        {
          text: 'Back',
          action: -1
        },
        {
          text: 'Next',
          action: +1
        }
      ]
    },
    {
      id: 2,
      stepName: 'Talent Details',
      description: '',
      buttons: [
        {
          text: 'Back',
          action: -1
        },
        {
          text: 'Next',
          action: +1
        }
      ]
    },
    {
      id: 3,
      stepName: 'Group Details',
      description: '',
      buttons: [
        {
          text: 'Back',
          action: -1
        },
        {
          text: 'Next',
          action: +1
        }
      ]
    },
    {
      id: 4,
      stepName: 'Media Upload',
      description: '',
      buttons: [
        {
          text: 'Back',
          action: -1
        },
        {
          text: 'Next',
          action: +1
        }
      ]
    },
    {
      id: 5,
      stepName: 'Guardian Details',
      description: '',
      buttons: [
        {
          text: 'Back',
          action: -1
        },
        {
          text: 'Next',
          action: +1
        }
      ]
    },
    {
      id: 6,
      stepName: 'Audition Details',
      description: '',
      buttons: [
        {
          text: 'Back',
          action: -1
        },
        {
          text: 'Next',
          action: +1
        }
      ]
    },
    {
      id: 7,
      stepName: 'Terms & Signatures',
      description: '',
      buttons: [
        {
          text: 'Back',
          action: -1
        },
        {
          text: 'Next',
          action: +1
        }
      ]
    },
    {
      id: 8,
      stepName: 'Payment',
      description: '',
      buttons: [
        {
          text: 'Back',
          action: -1
        },
        {
          text: 'Make Payment',
          action: +1
        }
      ]
    },
    {
      id: 9,
      stepName: 'Success',
      description: '',
      buttons: [
        {
          text: 'View Profile',
          action: +1
        }
      ]
    }
  ]

  _formProgress:number = 0;
  get formProgess() {
    return this._formProgress;
  }

  constructor(private utilityService: UtilityService) {}

  ngOnInit(): void {
    this.updateFormSteps();
    this.viewStep(0);
  }

  viewStep(stepNo:number) {
    this.stepInView = this.formSteps.find(step => step.id === stepNo);
    this.currentStep = stepNo;
    this.updateProgress();
  }

  goToStep(next: number) {
    const nextStep = this.currentStep + next;
    const currentStepName = this.stepInView?.stepName;

    if (this.currentStep === 0) {
      // 🔥 Step 0 is in parent → push regType directly
      this.utilityService.updateStep('registrationType', {
        valid: true, // or add more validation if needed
        value: { regType: this.regType },
      });

      //console.log('✅ Step "registrationType" saved:', { regType: this.regType });

      // proceed to next step
      this.viewStep(nextStep);
      return;
    }

    if (!currentStepName) {
      return;
    }

    // map display step name → storage key
    const stepKey = this.mapStepName(currentStepName);

    // 🔥 Ask the current child to report its form state
    this.utilityService.requestFormReport(currentStepName);

    // Wait for the child to respond before deciding
    setTimeout(() => {
      const step = this.utilityService.getStep(stepKey);
      //console.log(step)

      if (!step || !step.valid) {
        console.warn(`❌ Step "${currentStepName}" is invalid`, step?.value);
        return;
      }

      //console.log(`✅ Step "${currentStepName}" valid, moving to next step...`);
      //console.log('Form Value:', step.value);

      // Move to next step
      this.viewStep(nextStep);
    }, 0);
  }

  private mapStepName(stepName: string): string {
    const map: { [key: string]: string } = {
      'Personal Details': 'personalInfo',
      'Group Lead Details': 'personalInfo', // for group registration
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

}
