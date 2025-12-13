import { Component, Input, OnInit } from '@angular/core';
import { NotificationService } from '@shared/services/notification.service';
import { SharedService } from '@shared/services/shared.service';
import { debounceTime, distinctUntilChanged, map, merge, Observable, Subject, tap } from 'rxjs';

@Component({
  selector: 'app-contestant-list',
  templateUrl: './contestant-list.component.html',
  styleUrls: ['./contestant-list.component.scss']
})
export class ContestantListComponent implements OnInit {
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
      label: 'First Name',
      colWidth: '15%'
    },
    {
      label: 'Last Name',
      colWidth: '15%'
    },
    {
      label: 'Vote Code',
      colWidth: '10%'
    },
    {
      label: 'Email',
      colWidth: '12%'
    },
    {
      label: 'No of votes',
      colWidth: '8%'
    },
    {
      label: 'Total Vote Amount',
      colWidth: '10%'
    },
    {
      label: 'Status',
      colWidth: '10%'
    },
  ]

  constructor(
    private sharedService: SharedService,
    private notifyService: NotificationService
  ) {}

  ngOnInit(): void {
    this.pagingController = this.sharedService.getContestants({ page: this.currentPage, limit: this.pageSize });
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
            searchQuery: this.searchTerm
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
      map(res => (res ? res.data.contestants : this.tableData)),
      tap(() => (this.isLoading = false))
    );

    this.tableData$.subscribe(res => {
      this.tableData = res
      //console.log('Registrations', res)
    })
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
}
