import { Component, Input, OnInit } from '@angular/core';
import { NotificationService } from '@shared/services/notification.service';
import { SharedService } from '@shared/services/shared.service';
import { map, Observable, tap } from 'rxjs';

@Component({
  selector: 'app-transaction-list',
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.scss']
})
export class TransactionListComponent implements OnInit { 
  @Input() showFilters:boolean = false;
  dashboardDetails: any;
  paymentStats!:any;
  registrationDetails:any;
  activeTab = 'all';
  filterState: string = '';
  filterStartDate: any = null;
  filterEndDate: any = null;
  tableData:any = [];
  isLoading: boolean = false;

  tableData$!: Observable<any>;
  private pagingController!: { data$: Observable<any>; setPaging: (paging: Partial<any>) => void };
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;

  tableColumns = [
    {
      label: 'Name',
      colWidth: '10%'
    },
    {
      label: 'Email',
      colWidth: '10%'
    },
    // {
    //   label: 'Reference No',
    //   colWidth: '10%'
    // },
    {
      label: 'Amount',
      colWidth: '10%'
    },
    {
      label: 'Date',
      colWidth: '15%'
    },
    {
      label: 'Trans Reference',
      colWidth: '10%'
    },
    {
      label: 'Payment Status',
      colWidth: '10%'
    },
    {
      label: 'Actions',
      colWidth: '10%'
    }
  ]

  constructor(
    private sharedService: SharedService,
    private notifyService: NotificationService
  ) {}

  ngOnInit(): void {
    this.getStatusData();

    this.pagingController = this.sharedService.getTransactions({ page: this.currentPage, limit: this.pageSize });
    this.tableData$ = this.pagingController.data$;

    this.tableData$ = this.pagingController.data$.pipe(
      tap(res => {
        this.totalItems = res.data.pagination.totalCount;
      }),
      map(res => res.data.transactions) // only use items in the table
    );

    this.tableData$.subscribe(res => {
      this.tableData = res
      console.log('Transactions', res)
    })
    
  }

  getStatusData() {
    // this.sharedService.getDashboardDetails().subscribe({
    //   next: res => {
    //     this.dashboardDetails = res.data
    //     console.log(this.dashboardDetails)
    //     this.paymentStats = this.dashboardDetails.payments.byStatus.find((x: any) => x._id == 'successful')
    //     this.registrationDetails = this.dashboardDetails.payments.byStatus.find((x: any) => x._id == 'submitted')
    //   },
    //   error: err => {}
    // })
  }

  onPageChange(newPage: number) {
    this.currentPage = newPage;
    this.pagingController.setPaging({ page: newPage, limit: this.pageSize });
  }

  onPageSizeChange(newSize: number) {
    this.pageSize = newSize;
    this.currentPage = 1; // reset to first page
    this.pagingController.setPaging({ page: this.currentPage, limit: newSize });
  }

  onValueChange(value: Date, dateType?: string): void {
    if (dateType == 'start') {
      if(value != undefined) this.filterStartDate = value;
    }
    else {
      if(value != undefined) this.filterEndDate = value;
    }
  }

  verifyPayment(trxRef:string, internalRef:string) {
    this.sharedService.verifyCredoPayment(trxRef).subscribe({
      next: res => {
        console.log('Payment Res', res)
        this.transactionUpdate(internalRef, res.data)
      },
      error: err => {
        this.notifyService.showError('Payment verification failed')
      }
    })
  }

  transactionUpdate(internalRef:string, payload:any) {
    this.sharedService.verifyPaymentRef(internalRef, payload).subscribe({
      next: res => {
        //console.log('Payment Res', res)
        this.notifyService.showSuccess('Verification was successful')
      },
      error: err => {
        this.notifyService.showError('Payment verification failed. Try again later')
      }
    })
  }

}
