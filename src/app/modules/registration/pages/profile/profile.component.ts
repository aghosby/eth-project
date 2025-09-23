import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ReceiptComponent } from '@shared/components/blocks/receipt/receipt.component';
import { AuthService } from '@shared/services/auth.service';
import { NotificationService } from '@shared/services/notification.service';
import { SharedService } from '@shared/services/shared.service';
import { FormStep, UtilityService } from '@shared/services/utility.service';
import { BulkSlotsInfoComponent } from '../../components/bulk-slots-info/bulk-slots-info.component';
import { MatDialog } from '@angular/material/dialog';
import { BulkUserInfoComponent } from '../../components/bulk-user-info/bulk-user-info.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  allFormSteps:any[] = [];
  savedRegData:any;
  formSteps: FormStep[] = [];
  regType!:number;
  apiLoading:boolean = false;
  applicantAge!: number;
  loggedInUser:any;
  groupInfoData:any;
  @ViewChild(ReceiptComponent) receiptComp!: ReceiptComponent;
  screenSize!:number;
  bulkRegistrationData: any;
  availableSlots!:number;

  activeStepTab: number | null = null;
  toggleStepTab(index: number) {
    this.activeStepTab = this.activeStepTab === index ? null : index;
  }

  constructor(
    private authService: AuthService,
    private utilityService: UtilityService,
    private sharedService: SharedService,
    private notifyService: NotificationService,
    public dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.screenSize = this.utilityService.getScreenWidth();
    this.allFormSteps = this.utilityService.formSteps;
    this.loggedInUser = this.authService.loggedInUser;
    this.getRegistrationData();
  }

  getRegistrationData() {
    this.sharedService.getUserRegistration().subscribe({
      next: res => {
        if(res.success) {
          this.savedRegData = res.data
          console.log(this.savedRegData)
          console.log('loggedIn', this.loggedInUser)
          console.log('Registration Type', this.regType)
          sessionStorage.setItem('savedRegData', JSON.stringify(res.data));
          this.regType = this.savedRegData.registrationType === 'bulk' ? 3 : this.loggedInUser.registrationInfo.registrationType === 'individual' ? 1 : 2 
          if(this.regType !== 3) {
            this.applicantAge = this.getUserAge(this.savedRegData.personalInfo.dateOfBirth)
            this.groupInfoData = this.savedRegData.groupInfo;
            this.updateFormSteps();
          }
          else {
            this.getBulkRegistrationData();
          }
          //this.getCurrentStep();
        }
      },
      error: err => {
        this.notifyService.showError(err.error.message);
        this.router.navigate(['login'])
      }
    })
  }

  getBulkRegistrationData() {
    this.sharedService.getBulkRegistrations().subscribe(res => {
      this.bulkRegistrationData = res.data
      console.log('Bulk Data', res.data)
      if(this.bulkRegistrationData.length > 0) {
        this.availableSlots = this.countAvailableSlots(this.bulkRegistrationData)
      }
    })
  }

  countAvailableSlots(registrations: any[]): number {
    return registrations.reduce((sum, reg) => sum + (reg.availableSlots || 0), 0);
  }


  updateFormSteps() {
    let steps = [...this.allFormSteps];

    steps.find(s => {
      if(s.id === 1) s.stepName = this.regType === 1 ? 'Personal Details' : 'Group Lead Details'
    })

    steps = steps.filter(s => s.stepName !== 'Media Upload');
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

  // Retrieve labels for a step
  getStepLabels(stepKey: string): any[] {
    const formFields = this.utilityService.formSteps.find(step => step.key === stepKey)?.formFields;
    const labels = this.utilityService.generateFieldMapping(<any>formFields);
    //  = JSON.parse(sessionStorage.getItem('formStepLabels') || '{}');
    return labels || [];
  }

  getStepDataValue(stepKey: string, valueKey:string) {
    const savedData: any = this.utilityService.getStep(stepKey);
    if(stepKey == 'mediaInfo') {
      //console.log(savedData)
    }
    return savedData.value[valueKey] ? savedData.value[valueKey] : '-';
  }

  get mediaInfo() {
    if (this.utilityService.registrationData) {
      return this.utilityService.registrationData.mediaInfo;
    } else {
      const stored = sessionStorage.getItem('mediaUpload');
      return stored ? JSON.parse(stored) : null;
    }
  }

  getUserAge(date: Date) {
    const dob = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age
  }

  triggerDownload() {
    this.receiptComp.downloadReceipt();
  }

  // called after child finishes download
  onReceiptDownloaded() {
    console.log('✅ Receipt has been downloaded!');
  }

  viewAuditionPass() {
    this.router.navigate(['register/audition-pass'])
  }

  purchaseSlots() {
    let dialogRef = this.dialog.open(BulkSlotsInfoComponent, {
      width: this.screenSize > 768 ? '35%' : '95%',
      height: 'auto',
    });
    dialogRef.afterClosed().subscribe(() => {
      this.getRegistrationData();
    }); 
  }

  addContestant() {
    let dialogRef = this.dialog.open(BulkUserInfoComponent, {
      width: this.screenSize > 768 ? '45%' : '95%',
      height: 'auto',
    });
    dialogRef.afterClosed().subscribe(() => {
      this.getRegistrationData();
    }); 
  }
}
