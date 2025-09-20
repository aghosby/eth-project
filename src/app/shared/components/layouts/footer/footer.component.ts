import { Component } from '@angular/core';
import { ContactDetails } from '@shared/constants/contact-details';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  contactDetails = ContactDetails
}
