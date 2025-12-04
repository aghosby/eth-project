import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CredoPaymentService } from '@shared/services/credo-payment.service';
import { NotificationService } from '@shared/services/notification.service';
import { SharedService } from '@shared/services/shared.service';
import { UtilityService } from '@shared/services/utility.service';

@Component({
  selector: 'app-voting',
  templateUrl: './voting.component.html',
  styleUrls: ['./voting.component.scss']
})
export class VotingComponent implements OnInit {

  contestants: any[] = [];

  /** The contestant currently being voted for */
  activeVote: number | null = null;

  /** Number of votes being purchased */
  voteCount: number = 0;

  /** voteCount × 100 */
  totalAmount: number = 0;

  isLoading: boolean = false;

  constructor(
    private utilityService: UtilityService,
    private sharedService: SharedService,
    private paymentService: CredoPaymentService,
    private notifyService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadContestants();
    this.listenForVoteCompletion();
  }

  /** Listen for updates from the payment service */
  private listenForVoteCompletion() {
    this.paymentService.votePayment$.subscribe(res => {
      if (res.status === 'success') {
        this.notifyService.showSuccess('Vote successful!');
        this.cancelVoting();
        this.loadContestants();
      }
      else if (res.status === 'failed') {
        this.notifyService.showError('Vote payment failed. Please try again.');
        this.cancelVoting();
      }
    });
  }

  /** Get contestants list from backend */
  loadContestants() {
    this.sharedService.getAllContestants().subscribe({
      next: res => this.contestants = res.data.contestants,
      error: () => this.notifyService.showError('Could not load contestants.')
    });
  }

  /** Fallback background for missing images */
  getBackgroundImage(c: any) {
    return c.profilePhoto
      ? `url('${c.profilePhoto.url}')`
      : `linear-gradient(to bottom, #444, #000)`;
  }

  /** When the "Vote" button is clicked */
  startVoting(contestant: any) {
    this.activeVote = contestant._id;
    this.voteCount = 0;
    this.totalAmount = 0;
  }

  updateVotesFromAmount() {
    if (this.totalAmount < 100 || this.totalAmount % 100 !== 0) {
      this.voteCount = 0;
      return;
    }
    this.voteCount = this.totalAmount / 100;
  }

  cancelVoting() {
    this.activeVote = null;
    this.voteCount = 0;
    this.totalAmount = 0;
  }

  /** Build payment metadata */
  private buildMetadata(contestant: any) {
    return {
      type: 'vote_payment',
      contestantId: contestant._id,
      contestantVoteCode: contestant.contestantNumber,
      contestantName: `${contestant.firstName} ${contestant.lastName}`,
      talent: contestant.talentCategory,
      votesPurchased: this.voteCount,
      amountPaid: this.totalAmount
    };
  }

  /** Start vote payment using the payment service */
  makeVotePayment(contestant: any) {
    if (this.totalAmount < 100 || this.totalAmount % 100 !== 0) {
      this.notifyService.showError('Enter a valid amount. Minimum is ₦100 and must be in multiples of 100.');
      return;
    }

    const metadata = this.buildMetadata(contestant);

    const customer = {
      firstName: contestant.firstName,
      lastName: contestant.lastName,
      email: contestant.email,
      phone: contestant.phone
    };

    this.paymentService.startPayment(
      customer,
      this.totalAmount,
      metadata,
      window.location.origin
    );
  }

  contactForm() {
    this.utilityService.contactForm();
  }

  goToLogin() {
    this.router.navigate(['/login'], { queryParams: { action: 'login' } });
  }

  goToRegister() {
    this.router.navigate(['/login'], { queryParams: { action: 'create' } });
  }
}