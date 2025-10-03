import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormFields } from '@shared/models/form-fields';
import { AuthService } from '@shared/services/auth.service';
import { NotificationService } from '@shared/services/notification.service';
import { SharedService } from '@shared/services/shared.service';
import { UtilityService } from '@shared/services/utility.service';
import { environment } from '@env/environment';

@Component({
  selector: 'app-payment-verification',
  templateUrl: './payment-verification.component.html',
  styleUrls: ['./payment-verification.component.scss']
})
export class PaymentVerificationComponent implements OnInit {
  loggedInUser: any;
  isLoading: boolean = false;
  formInfoFields!: FormFields[];
  grpInfoForm:FormGroup = new FormGroup({});
  useFormWidth:boolean = true;
  screenSize!:number;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialogRef: MatDialogRef<PaymentVerificationComponent>,
    private authService: AuthService,
    private utilityService: UtilityService,
    private sharedService: SharedService,
    private notifyService: NotificationService,
  ){}

  ngOnInit(): void {
    this.screenSize = this.utilityService.getScreenWidth();
    this.useFormWidth = this.screenSize > 768;
    this.setUpForm();
    //this.loggedInUser = this.authService.loggedInUser;
  }

  closeDialog() {
    this.dialogRef.close();
  }

  setUpForm = async () => {
    this.formInfoFields = [
      {
        controlName: 'reference',
        controlType: 'text',
        controlLabel: 'Transaction Reference',
        controlWidth: '48%',
        initialValue: null,
        validators: [Validators.required],
        order: 1
      }
    ]

    this.formInfoFields.sort((a,b) => (a.order - b.order));
    
    this.formInfoFields.forEach(field => {
      const formControl = new FormControl(field.initialValue, field.validators)
      this.grpInfoForm.addControl(field.controlName, formControl)
    });

  }

  verifyPayment() {
    if(this.grpInfoForm.valid) {
      this.isLoading = true;
      const trxRef = this.grpInfoForm.value.reference;
      this.sharedService.verifyCredoPayment(trxRef).subscribe({
        next: res => {
          if(res) this.verifyFailedTransaction(this.dialogData, res.data);
        },
        error: err => {
          this.notifyService.showError('This payment could not be verified')
          this.isLoading = false
        }
      }) 
    }
    else {
      this.grpInfoForm.markAllAsTouched()
    }  
  }

  verifyFailedTransaction(registrationId:string, payload:any) {
    this.sharedService.verifyFailedTransaction(registrationId, payload).subscribe({
      next: res => {
        this.isLoading = false;
        this.notifyService.showSuccess('Verification was successful');
        this.closeDialog();
      },
      error: err => {
        this.isLoading = false;
        this.notifyService.showError('Payment verification failed. Try again later')
      }
    })
  }

}
