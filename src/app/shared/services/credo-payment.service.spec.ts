import { TestBed } from '@angular/core/testing';

import { CredoPaymentService } from './credo-payment.service';

describe('CredoPaymentService', () => {
  let service: CredoPaymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CredoPaymentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
