import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '@shared/services/auth.service';
import { UtilityService } from '@shared/services/utility.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';


@Component({
  selector: 'app-audition-pass',
  templateUrl: './audition-pass.component.html',
  styleUrls: ['./audition-pass.component.scss']
})
export class AuditionPassComponent implements OnInit {
  auditionDetails:any;
  auditionLabels:any = [
    {
      label: 'Registration Type',
      valueKey: 'registrationType',
      order: 1
    },
    {
      label: 'Email',
      parentKey: 'personalInfo',
      valueKey: 'email',
      order: 2
    },
    {
      label: 'Age',
      parentKey: 'personalInfo',
      valueKey: 'age',
      order: 3
    },
    {
      label: 'Registration Date',
      valueKey: 'submittedAt',
      order: 5,
      type: 'date'
    },
    {
      label: 'Audition Date',
      parentKey: 'auditionInfo',
      valueKey: 'auditionDate',
      order: 6,
      type: 'date'
    },
    {
      label: 'Audition Time',
      parentKey: 'auditionInfo',
      valueKey: 'auditionTime',
      order: 7,
    }
  ];

  constructor(
    private authService: AuthService,
    private utilityService: UtilityService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.auditionDetails = this.utilityService.registrationData
    this.auditionLabels = this.orderByProperty(this.auditionLabels, 'order')
    console.log(this.auditionDetails)
  }

  orderByProperty<T>(array: T[], property: keyof T): T[] {
    return [...array].sort((a, b) => {
      const valA = a[property] as number;
      const valB = b[property] as number;
      return valA - valB;
    });
  }

  goBack() {
    this.location.back()
  }

  downloadPass() {
    const element = document.getElementById('auditionPass');
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
        pdf.save('audition_pass.pdf');
      })
      .catch(err => {
        console.error('❌ Error creating pass PDF:', err);
      });
  }

}
