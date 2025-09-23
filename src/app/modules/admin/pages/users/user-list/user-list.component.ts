import { Component, Input, OnInit } from '@angular/core';
import { SharedService } from '@shared/services/shared.service';
import { map, Observable, tap } from 'rxjs';


@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
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
      label: 'First Name',
      colWidth: '15%'
    },
    {
      label: 'Last Name',
      colWidth: '15%'
    },
    {
      label: 'Email',
      colWidth: '25%'
    },
    {
      label: 'Role',
      colWidth: '15%'
    },
    {
      label: 'Active Status',
      colWidth: '15%'
    },
    {
      label: 'Created At',
      colWidth: '15%'
    },
  ]

  constructor(
    private sharedService: SharedService
  ) {}

  ngOnInit(): void {
    this.getStatusData();

    this.pagingController = this.sharedService.getUsers({ page: this.currentPage, limit: this.pageSize });
    this.tableData$ = this.pagingController.data$;

    this.tableData$ = this.pagingController.data$.pipe(
      tap(res => {
        this.totalItems = res.data.pagination.totalCount;
      }),
      map(res => res.data.users) // only use items in the table
    );

    this.tableData$.subscribe(res => {
      this.tableData = res
      console.log('Users', res)
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
}
