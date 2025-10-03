import { Component, Input, OnInit } from '@angular/core';
import { SharedService } from '@shared/services/shared.service';
import { UtilityService } from '@shared/services/utility.service';
import { debounceTime, distinctUntilChanged, map, merge, Observable, Subject, tap } from 'rxjs';

@Component({
  selector: 'app-registration-list',
  templateUrl: './registration-list.component.html',
  styleUrls: ['./registration-list.component.scss']
})
export class RegistrationListComponent implements OnInit {
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
  searchTerm = '';
  private searchEvent$ = new Subject<string>();
  private pagingController!: { data$: Observable<any>; setPaging: (paging: Partial<any>) => void };
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;

  tableColumns = [
    {
      label: 'Name',
      colWidth: '15%'
    },
    {
      label: 'Email',
      colWidth: '10%'
    },
    {
      label: 'Phone',
      colWidth: '10%'
    },
    {
      label: 'Age',
      colWidth: '5%'
    },
    {
      label: 'Gender',
      colWidth: '5%'
    },
    {
      label: 'Category',
      colWidth: '10%'
    },
    {
      label: 'Started',
      colWidth: '12%'
    },
    {
      label: 'Current Step',
      colWidth: '12%'
    },
    {
      label: 'Reg Status',
      colWidth: '10%'
    },
    {
      label: 'Payment Status',
      colWidth: '15%'
    },
  ]

  constructor(
    private sharedService: SharedService,
    public utilityService: UtilityService
  ) {}

  ngOnInit(): void {
    this.getStatusData();

    this.pagingController = this.sharedService.getRegistrations({ page: this.currentPage, limit: this.pageSize });
    this.tableData$ = this.pagingController.data$;

    this.tableData$ = merge(
      this.pagingController.data$,
      this.searchEvent$.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(term => {
          this.searchTerm = term;
          this.currentPage = 1; // reset to first page when searching
          this.pagingController.setPaging({
            page: this.currentPage,
            limit: this.pageSize,
            search: this.searchTerm
          });
        }),
        // Don't emit items here; only trigger paging updates
        // We return EMPTY to not mess with the stream
        map(() => null)
      )
    ).pipe(
      tap(() => (this.isLoading = true)),
      tap(res => {
        if (res) {
          this.totalItems = res.data.pagination.totalCount;
        }
      }),
      map(res => (res ? res.data.registrations : this.tableData)),
      tap(() => (this.isLoading = false))
    );

    this.tableData$.subscribe(res => {
      this.tableData = res
      //console.log('Registrations', res)
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

  onSearch(event: Event) {
    const term =(event.target as HTMLInputElement).value
    //console.log('Search', term)
    this.searchEvent$.next(term);
  }

  clearSearch() {
    //console.log('Clear')
    this.searchTerm = '';
    this.searchEvent$.next('');
  }

  getUserAge(dob: string | Date) {
    if (!dob) {
      return '-';
    }

    // ensure dob is a Date object
    const birthDate = dob instanceof Date ? dob : new Date(dob);

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  verifyPayment(registrationId:string) {
    this.utilityService.verifyFailedTransaction(registrationId);
  }
}
