import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormFields } from '@shared/models/form-fields';
import { AuthService } from '@shared/services/auth.service';
import { NotificationService } from '@shared/services/notification.service';
import { SharedService } from '@shared/services/shared.service';
import { UtilityService } from '@shared/services/utility.service';
import { environment } from '@env/environment';

@Component({
  selector: 'app-bulk-user-info',
  templateUrl: './bulk-user-info.component.html',
  styleUrls: ['./bulk-user-info.component.scss']
})
export class BulkUserInfoComponent implements OnInit {
  loggedInUser: any;
  isLoading: boolean = false;
  formInfoFields!: FormFields[];
  grpInfoForm:FormGroup = new FormGroup({});
  useFormWidth:boolean = true;
  screenSize!:number;

  constructor(
    public dialogRef: MatDialogRef<BulkUserInfoComponent>,
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

    // this.sharedService.purchaseBulkSlots({totalSlots: 2}).subscribe(res => {
    //   console.log('Res', res)
    // })
  }


  closeDialog() {
    this.dialogRef.close();
  }

  setUpForm = async () => {
    this.formInfoFields = [
      {
        controlName: 'firstName',
        controlType: 'text',
        controlLabel: 'First Name',
        controlWidth: '48%',
        initialValue: null,
        validators: [Validators.required],
        order: 1
      },
      {
        controlName: 'lastName',
        controlType: 'text',
        controlLabel: 'Last Name',
        controlWidth: '48%',
        initialValue: null,
        validators: [Validators.required],
        order: 2
      },
      {
        controlName: 'email',
        controlType: 'text',
        controlLabel: 'Email Address',
        controlWidth: '100%',
        initialValue: null,
        validators: [Validators.required, Validators.email],
        order: 3
      }
    ]

    this.formInfoFields.sort((a,b) => (a.order - b.order));
    
    this.formInfoFields.forEach(field => {
      const formControl = new FormControl(field.initialValue, field.validators)
      this.grpInfoForm.addControl(field.controlName, formControl)
    });

  }

  addContestant() {
    if(this.grpInfoForm.valid) {
      this.isLoading = true;
      let payload = this.grpInfoForm.value
      this.sharedService.addBulkContestant(payload).subscribe({
        next: res => {
          if(res.success) {
            this.isLoading = false
            this.notifyService.showSuccess(res.message)
          }
        },
        error: err => {
          this.notifyService.showError(err.error.message)
          this.isLoading = false
        }
      }) 
    }
    else {
      this.grpInfoForm.markAllAsTouched()
    }
     
  }

}
