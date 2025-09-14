// src/app/registration-payment/registration-payment.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { UtilityService } from '@shared/services/utility.service';
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

  constructor(private utilityService: UtilityService) {}

  ngOnInit(): void {
    this.setupPayment();

    // 🔥 listen for trigger from parent
    this.stepTrigger = this.utilityService.trigger$.subscribe((stepName) => {
      //console.log('Step', stepName)
      if (stepName === 'Terms & Signatures') {
        this.utilityService.updateStep('termsConditions', {
          valid: true,
          value: {paymentSuccessful: true},
        });
      }
    });
  }

  private generateRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min) + min);
  }

  private setupPayment(): void {
    const transRef = `iy67f${this.generateRandomNumber(10, 60)}hvc${this.generateRandomNumber(10, 90)}`;

    this.handler = CredoWidget.setup({
      key: '0PUB0024x8k5w4TU1dq570Jb8zJn0dLH', // ⚠️ Move this to environment.ts
      customerFirstName: 'Ciroma',
      customerLastName: 'Chukwuma',
      email: 'aghogho@yopmail.com',
      amount: 109000,
      currency: 'NGN',
      renderSize: 0,
      channels: ['card', 'bank'],
      reference: transRef,
      customerPhoneNumber: '08032698425',
      metadata: {
        bankAccount: '0114877128',
        customFields: [
          {
            variable_name: 'gender',
            value: 'Male',
            display_name: 'Gender',
          },
        ],
      },
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

  startPayment(): void {
    if (this.handler) {
      this.handler.openIframe();
    }
  }
}
