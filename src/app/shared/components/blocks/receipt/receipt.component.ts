// receipt.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-receipt',
  templateUrl: './receipt.component.html',
  styleUrls: ['./receipt.component.scss']
})
export class ReceiptComponent {
  @Input() customer: any;
  @Input() transaction: any;
  @Input() payment: any;

  @Output() downloaded = new EventEmitter<void>(); // notify parent when done

  downloadReceipt() {
    const element = document.getElementById('receipt');
    if (!element) return;

    html2canvas(element).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('edo_talent_hunt_receipt.pdf');

      // ✅ Let parent know download is complete
      this.downloaded.emit();
    });
  }
}
