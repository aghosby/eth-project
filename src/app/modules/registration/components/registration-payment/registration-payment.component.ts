// src/app/registration-payment/registration-payment.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { environment } from '@env/environment';
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

  constructor(private utilityService: UtilityService) {}

  ngOnInit(): void {
    this.setupPayment();

    this.groupInfoData = this.utilityService.getStep('groupInfo')?.value;

    // 🔥 listen for trigger from parent
    this.stepTrigger = this.utilityService.trigger$.subscribe((stepName) => {
      console.log('Step', stepName)
      this.makePayment();
      this.utilityService.updateStep('payment', {
        valid: true,
        value: {paymentSuccessful: true},
      });
    });
  }

  private generateRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min) + min);
  }

  private setupPayment(): void {
    const transRef = `iy67f${this.generateRandomNumber(10, 60)}hvc${this.generateRandomNumber(10, 90)}`;

    this.handler = CredoWidget.setup({
      key: environment.credoApiKey, // ⚠️ Move this to environment.ts
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
      callbackUrl: 'https://merchant-test-line.netlify.app/successful',
      onClose: () => {
        console.log('Widget Closed');
      },
      callBack: (response: any) => {
        console.log('Successful Payment');
        console.log(response);
        window.location.href = response.callbackUrl;
      },
    });
  }

  makePayment(): void {
    if (this.handler) {
      this.handler.openIframe();
    }
  }

  // Retrieve labels for a step
  getStepLabels(stepKey: string): { key: string; label: string; type: string }[] {
    const labels = JSON.parse(sessionStorage.getItem('formStepLabels') || '{}');
    return labels[stepKey] || [];
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
