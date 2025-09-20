// receipt.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ContactDetails } from '@shared/constants/contact-details';
import { AuthService } from '@shared/services/auth.service';
import { NotificationService } from '@shared/services/notification.service';
import { SharedService } from '@shared/services/shared.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-receipt',
  templateUrl: './receipt.component.html',
  styleUrls: ['./receipt.component.scss']
})
export class ReceiptComponent implements OnInit {
  @Input() customer: any;
  @Input() transaction: any;
  @Input() payment: any;
  loggedInUser!: any
  contactDetails = ContactDetails
  receiptReady:boolean = false;
  paymentDetails:any;

  @Output() downloaded = new EventEmitter<void>(); // notify parent when done

  constructor(
    private authService: AuthService,
    private sharedService: SharedService,
    private notifyService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loggedInUser = this.authService.loggedInUser;
    this.sharedService.getPaymentDetails().subscribe({
      next: res => {
        if(res.success) {
          this.receiptReady = true;
          this.paymentDetails = res.data.payments[0]
        }
      },
      error: err => {
        this.receiptReady = false;
      }
    })
  }

  downloadReceipt() {
    if(this.receiptReady) {
      const element = document.getElementById('receipt');
      if (!element) {
        console.error('❌ Receipt element not found');
        return;
      }

      html2canvas(element, { backgroundColor: '#ffffff' })
        .then(canvas => {
          const imgData = canvas.toDataURL('image/png'); // force PNG
          //console.log(imgData.substring(0, 50)); // should start with data:image/png

          const pdf = new jsPDF('p', 'mm', 'a4');

          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight); // PNG type is required
          pdf.save('transaction_receipt.pdf');
        })
        .catch(err => {
          console.error('❌ Error creating receipt PDF:', err);
        });
    }
    else {
      this.notifyService.showError('Recipt download failed. Please reload page or try again later')
    }
    
  }

}
