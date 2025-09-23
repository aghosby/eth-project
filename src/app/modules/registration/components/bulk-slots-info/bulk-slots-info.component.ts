import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormFields } from '@shared/models/form-fields';
import { AuthService } from '@shared/services/auth.service';
import { NotificationService } from '@shared/services/notification.service';
import { SharedService } from '@shared/services/shared.service';
import { UtilityService } from '@shared/services/utility.service';
import { environment } from '@env/environment';


declare var CredoWidget: any; // tell TypeScript about the global SDK

@Component({
  selector: 'app-bulk-slots-info',
  templateUrl: './bulk-slots-info.component.html',
  styleUrls: ['./bulk-slots-info.component.scss']
})
export class BulkSlotsInfoComponent implements OnInit {
  loggedInUser: any;
  isLoading: boolean = false;
  formInfoFields!: FormFields[];
  grpInfoForm:FormGroup = new FormGroup({});
  amountDue: number = 0;
  singleFormPrice: number = 10000;
  noOfSlots!: number;
  useFormWidth:boolean = true;
  screenSize!:number;
  private handler: any;

  constructor(
    public dialogRef: MatDialogRef<BulkSlotsInfoComponent>,
    private authService: AuthService,
    private utilityService: UtilityService,
    private sharedService: SharedService,
    private notifyService: NotificationService,
  ){}

  ngOnInit(): void {
    this.screenSize = this.utilityService.getScreenWidth();
    this.useFormWidth = this.screenSize > 768;
    this.setUpForm();
    this.loggedInUser = this.authService.loggedInUser;
  }

  closeDialog() {
    this.dialogRef.close();
  }

  setUpForm = async () => {
    this.formInfoFields = [
      {
        controlName: 'noOfSlots',
        controlType: 'number',
        controlLabel: 'Number of Slots',
        controlWidth: '100%',
        initialValue: null,
        validators: [Validators.required],
        visible: true,
        order: 1
      }
    ]

    this.formInfoFields.sort((a,b) => (a.order - b.order));
    
    this.formInfoFields.forEach(field => {
      const formControl = new FormControl(field.initialValue, field.validators)
      this.grpInfoForm.addControl(field.controlName, formControl)
    });

    this.grpInfoForm.get('noOfSlots')?.valueChanges.subscribe(val => {
      this.amountDue = val * this.singleFormPrice;
    })
  }

  private generateRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min) + min);
  }

  private setupPayment(): void {
    const regNo = this.utilityService.registrationData ? this.utilityService.registrationData.registrationNumber : this.loggedInUser.registrationInfo.registrationNumber;
    const transRef = `${regNo}${this.generateRandomNumber(10, 60)}hvc${this.generateRandomNumber(10, 90)}`;

    this.handler = CredoWidget.setup({
      key: environment.credoApiKey,
      customerFirstName: this.loggedInUser.firstName,
      customerLastName: this.loggedInUser.lastName,
      email: this.loggedInUser.email,
      amount: this.amountDue*100,
      currency: 'NGN',
      renderSize: 0,
      channels: ['card', 'bank'],
      reference: transRef,
      customerPhoneNumber: '',
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
      //callbackUrl: window.location.hostname + '/register',
      callbackUrl: 'http://edotalenthunt.com/register',
      onClose: () => {
        //console.log('Widget Closed');
      },
      callBack: (response: any) => {
        const paymentResult = this.parsePaymentResult(response.callbackUrl);
        this.sharedService.confirmPayment(paymentResult, this.authService.loggedInUser.id).subscribe({
          next: res => {
            this.purchaseSlots();
            this.notifyService.showSuccess(res.message);
            this.isLoading = false;
            this.closeDialog();
          },
          error: err => {
            this.isLoading = false;
            this.notifyService.showInfo('Your payment was successful and payment status will be updated soon')
          }
        })           
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
    if (this.grpInfoForm.valid) {
      this.setupPayment();

      if (this.handler) {
        this.handler.openIframe();
      } 
      else {
        this.notifyService.showError('Payment widget could not be initialized');
      }
    } 
    else {
      this.grpInfoForm.markAllAsTouched();
    }
  }

  purchaseSlots() {
    this.isLoading = true;
    let payload = {
      totalSlots: this.grpInfoForm.value.noOfSlots
    }
    this.sharedService.purchaseBulkSlots(payload).subscribe({
      next: res => {
        if(res.success) {
          this.isLoading = false
        }
      },
      error: err => {
        this.notifyService.showInfo('Your purchase record is pending. Please check back for an updated status')
        this.isLoading = false
      }
    })  
  }
}
