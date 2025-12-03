import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SharedService } from './shared.service';
import { AuthService } from './auth.service';
import { UtilityService } from './utility.service';
import { NotificationService } from './notification.service';

declare var CredoWidget: any;

@Injectable({
  providedIn: 'root'
})
export class CredoPaymentService {

  private handler: any;

  constructor(
    private sharedService: SharedService,
    private notifyService: NotificationService,
    private authService: AuthService,
    private utilityService: UtilityService
  ) {}

  /** Generate transaction reference */
  private generateRef(): string {
    const regNo = this.utilityService.registrationData 
      ? this.utilityService.registrationData.registrationNumber 
      : 'ETH202500003';

    const rand1 = this.generateRandom(10, 60);
    const rand2 = this.generateRandom(10, 90);

    return `${regNo}${rand1}hvc${rand2}`;
  }

  private generateRandom(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /** Parse callback result */
  private parsePaymentResult(url: string) {
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

  /** Start a payment (tickets, votes, etc.) */
  startPayment(
    customer: { firstName: string; lastName: string; email: string; phone?: string },
    amount: number,
    metadata?: any,
    callbackUrl: string = window.location.origin
  ) {
    const transRef = this.generateRef();

    this.handler = CredoWidget.setup({
      key: environment.credoApiKey,
      customerFirstName: customer.firstName,
      customerLastName: customer.lastName,
      email: customer.email,
      customerPhoneNumber: customer.phone || '',
      amount: amount * 100, // convert to kobo
      currency: 'NGN',
      renderSize: 0,
      channels: ['card', 'bank'],
      reference: transRef,
      metadata: metadata || {},
      callbackUrl,
      onClose: () => {},

      callBack: (response: any) => {
        const result = this.parsePaymentResult(response.callbackUrl);
        this.verifyPayment(transRef, metadata);
      }
    });

    this.handler.openIframe();
  }

  /** Verify payment with backend */
  private verifyPayment(ref: string, metadata?:any) {
    this.sharedService.verifyCredoPayment(ref).subscribe({
      next: res => {
        if(metadata?.type === 'ticket_purchase') {
          this.confirmTicketPayment(res.data, metadata)
        }
        else {
          this.confirmPayment(res.data);
        }
      },
      error: () => {
        this.notifyService.showError('Payment verification failed.');
      }
    });
  }

  /** Registration Purchase confirmation */
  private confirmPayment(paymentResult: any) {
    const userId = this.authService.loggedInUser?.id;
    this.sharedService.confirmPayment(paymentResult, userId).subscribe({
      next: res => {
        this.notifyService.showSuccess(res.message);
      },
      error: () => {
        this.notifyService.showInfo('Payment was successful. Status will be updated soon.');
      }
    });
  }

  /** Ticket Purchase confirmation */
  private confirmTicketPayment(paymentResult: any, metadata: any) {

    // 1️⃣ Verify the payment first
    this.sharedService.verifyTicketPurchase(paymentResult, paymentResult.transRef)
      .subscribe({
        next: verifyRes => {

          // 2️⃣ If the transaction is verified → create the ticket
          if (verifyRes?.data?.status === 'success' || verifyRes?.status === true) {

            this.sharedService.purchaseTicket(metadata)
              .subscribe({
                next: purchaseRes => {
                  this.notifyService.showSuccess(
                    purchaseRes.message || 'Ticket purchase successful.'
                  );
                },
                error: () => {
                  this.notifyService.showInfo(
                    'Payment verified but ticket registration failed. Support will resolve this shortly.'
                  );
                }
              });

          } else {
            // Payment NOT verified
            this.notifyService.showInfo(
              'Payment verification failed. If you were debited, please contact support.'
            );
          }

        },

        error: () => {
          this.notifyService.showInfo(
            'Payment verification could not be completed. If you were debited, your ticket will be confirmed shortly.'
          );
        }
      });
  }


}
