// src/app/registration-payment/registration-payment.component.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '@env/environment';
import { AuthService } from '@shared/services/auth.service';
import { NotificationService } from '@shared/services/notification.service';
import { SharedService } from '@shared/services/shared.service';
import { FormStep, UtilityService } from '@shared/services/utility.service';
import { Subscription } from 'rxjs';

declare var CredoWidget: any; // tell TypeScript about the global SDK

@Component({
  selector: 'app-registration-payment',
  templateUrl: './registration-payment.component.html',
  styleUrls: ['./registration-payment.component.scss'],
})
export class RegistrationPaymentComponent implements OnInit {
  @Input() stepName!: string;
  private stepTrigger!: Subscription;
  private handler: any;
  @Input() formSteps: FormStep[] = []; // steps passed from register component
  activeStepTab: number | null = null;
  toggleStepTab(index: number) {
    this.activeStepTab = this.activeStepTab === index ? null : index;
  }

  groupInfoData:any;
  amountDue:number = 10000;
  @Output() stepChange = new EventEmitter<number>();

  constructor(
    private authService: AuthService,
    private utilityService: UtilityService,
    private notifyService: NotificationService,
    private sharedService: SharedService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // this.route.queryParams.subscribe(params => {
    //   if (Object.keys(params).length > 0) {
    //     const paymentResult = {
    //       reference: params['reference'],
    //       transAmount: params['transAmount'],
    //       transRef: params['transRef'],
    //       processorFee: params['processorFee'],
    //       errorMessage: params['errorMessage'],
    //       currency: params['currency'],
    //       gateway: params['gateway'],
    //       status: params['status']
    //     };

    //     console.log('Payment result:', paymentResult);

    //     this.sharedService.confirmPayment(paymentResult, this.authService.loggedInUser.id).subscribe({
    //       next: res => {
    //         this.notifyService.showSuccess(res.message);
    //       },
    //       error: err => {
    //         this.notifyService.showInfo('Your payment was successful and payment status will be updated soon')
    //       }
    //     })
        
    //     this.utilityService.updateStep('payment', {
    //       valid: true,
    //       value: paymentResult,
    //     });

    //     this.router.navigate([], {
    //       relativeTo: this.route,
    //       queryParams: {},            // clear all params
    //       replaceUrl: true            // don’t keep old URL in history
    //     }).then(() => {
    //       const currentStep = Number(sessionStorage.getItem('currentStep'));
    //       this.goToStep(currentStep)
    //     });
    //   }
      

    // });
    this.setupPayment();

    this.groupInfoData = this.utilityService.getStep('groupInfo')?.value;

    // 🔥 listen for trigger from parent
    this.stepTrigger = this.utilityService.trigger$.subscribe((stepName) => {
      console.log('Step', stepName)
      if(stepName !== 'Success') this.makePayment();
    });
  }

  private generateRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min) + min);
  }

  goToStep(stepNo: number) {
    console.log('Sent Step', stepNo)
    this.stepChange.emit(stepNo);
  }

  private setupPayment(): void {
    const regNo = this.utilityService.registrationData.registrationNumber
    const transRef = `${regNo}${this.generateRandomNumber(10, 60)}hvc${this.generateRandomNumber(10, 90)}`;

    this.handler = CredoWidget.setup({
      key: environment.credoApiKey,
      customerFirstName: this.getStepDataValue('personalInfo', 'firstName'),
      customerLastName: this.getStepDataValue('personalInfo', 'lastName'),
      email: this.getStepDataValue('personalInfo', 'email'),
      amount: this.amountDue*100,
      currency: 'NGN',
      renderSize: 0,
      channels: ['card', 'bank'],
      reference: transRef,
      customerPhoneNumber: this.getStepDataValue('personalInfo', 'phoneNo'),
      // metadata: {
      //   bankAccount: '0114877128',
      //   customFields: [
      //     {
      //       variable_name: 'gender',
      //       value: 'Male',
      //       display_name: 'Gender',
      //     },
      //   ],
      // },
      // callbackUrl: window.location.hostname + '/register',
      callbackUrl: 'http://localhost:4200/register',
      onClose: () => {
        console.log('Widget Closed');
      },
      callBack: (response: any) => {
        const paymentResult = this.parsePaymentResult(response.callbackUrl);
        this.sharedService.confirmPayment(paymentResult, this.authService.loggedInUser.id).subscribe({
          next: res => {
            this.notifyService.showSuccess(res.message);
          },
          error: err => {
            this.notifyService.showInfo('Your payment was successful and payment status will be updated soon')
          }
        })

        this.utilityService.updateStep('payment', {
          valid: true,
          value: paymentResult,
        });

        const currentStep = Number(sessionStorage.getItem('currentStep'));
        this.goToStep(currentStep)
        
      },
    });
  }

  parsePaymentResult(url: string) {
    const parsedUrl = new URL(url);
    const params = Object.fromEntries(parsedUrl.searchParams.entries());

    return {
      reference: params['reference'] || '',
      transAmount: params['transAmount'] || '',
      transRef: params['transRef'] || '',
      processorFee: params['processorFee'] || '',
      errorMessage: params['errorMessage'] || '',
      currency: params['currency'] || '',
      gateway: params['gateway'] || '',
      status: params['status'] || ''
    };
  }

  makePayment(): void {
    if (this.handler) {
      this.handler.openIframe();
    }
  }

  // Retrieve labels for a step
  getStepLabels(stepKey: string): any[] {
    const formFields = this.utilityService.formSteps.find(step => step.key === stepKey)?.formFields;
    const formLabels = sessionStorage.getItem('formStepLabels') && JSON.parse(sessionStorage.getItem('formStepLabels') as string);
    const labels = this.utilityService.generateFieldMapping(<any>formFields);
    //  = JSON.parse(sessionStorage.getItem('formStepLabels') || '{}');
    return labels || formLabels;
  }

  getStepDataValue(stepKey: string, valueKey:string) {
    const savedData: any = this.utilityService.getStep(stepKey);
    if(stepKey == 'mediaInfo') {
      console.log(savedData)
    }
    return savedData.value[valueKey] ? savedData.value[valueKey] : '-';
  }

  get mediaInfo() {
    return this.utilityService.registrationData.mediaInfo
  }
  
}
