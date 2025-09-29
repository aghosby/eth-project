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
  selector: 'app-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss']
})
export class ContactFormComponent  implements OnInit {
  loggedInUser: any;
  isLoading: boolean = false;
  formInfoFields!: FormFields[];
  grpInfoForm:FormGroup = new FormGroup({});
  useFormWidth:boolean = true;
  screenSize!:number;
  keepOrder = () => 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialogRef: MatDialogRef<ContactFormComponent>,
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
        controlName: 'email',
        controlType: 'text',
        controlLabel: 'Email Address',
        controlWidth: '48%',
        initialValue: this.dialogData ?? null,
        validators: [Validators.required, Validators.email],
        order: 1
      },
      {
        controlName: 'complaintType',
        controlType: 'select',
        controlLabel: 'Category',
        controlWidth: '48%',
        initialValue: null,
        selectOptions: {
          Registration: 'Registration',
          Payment: 'Payment',
          Technical: 'Technical Issue',
          Access: 'Portal Access',
          Observation: 'Observation',
          Enquiry: 'Enquiry',
          Other: 'Other'
        },
        validators: [Validators.required],
        order: 2
      },
      {
        controlName: 'description',
        controlType: 'textarea',
        controlLabel: 'Message',
        controlWidth: '100%',
        initialValue: null,
        validators: [Validators.required],
        order: 3
      }
    ]

    this.formInfoFields.sort((a,b) => (a.order - b.order));
    
    this.formInfoFields.forEach(field => {
      const formControl = new FormControl(field.initialValue, field.validators)
      this.grpInfoForm.addControl(field.controlName, formControl)
    });

  }

  sendMessage() {
    if(this.grpInfoForm.valid) {
      this.isLoading = true;
      let payload = this.grpInfoForm.value
      this.sharedService.sendMessage(payload).subscribe({
        next: res => {
          if(res.success) {
            this.isLoading = false
            this.notifyService.showSuccess('Your message has been sent successfully');
            this.closeDialog();
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
