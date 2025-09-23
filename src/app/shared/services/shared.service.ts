import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { BehaviorSubject, Observable, startWith, Subject, switchMap } from 'rxjs';
import { AuthService } from './auth.service';
import { Paging } from '@shared/models/paging';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  private baseUrl = `${environment.apiBaseUrl}`;
  private userId = this.authService.loggedInUser.id ?? '';

  requestOptions:any = {
    headers: new HttpHeaders({
      Authorization: `Bearer ${this.authService.token}`
    })
  };
  
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  public getProfileDetails(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/user/profile`, this.requestOptions);
  }

  public startRegistration(payload:any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/registrations`, payload, this.requestOptions);
  }

  public getStates(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/locations/states`);
  }

  public getLgas(state:string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/locations/states/${state}/lgas`);
  }

  public getUserRegistration(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/registrations/${this.userId}`, this.requestOptions);
  }

  public createPersonalInfo(payload:any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/registrations/${this.userId}/personal-info`, payload, this.requestOptions);
  }

  public createTalentInfo(payload:any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/registrations/${this.userId}/talent-info`, payload, this.requestOptions);
  }

  public createMediaInfo(payload:any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/registrations/${this.userId}/media-info`, payload, this.requestOptions);
  }

  public createGroupInfo(payload:any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/registrations/${this.userId}/group-info`, payload, this.requestOptions);
  }

  public createGuardianInfo(payload:any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/registrations/${this.userId}/guardian-info`, payload, this.requestOptions);
  }

  public createAuditionInfo(payload:any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/registrations/${this.userId}/audition-info`, payload, this.requestOptions);
  }

  public createTermsConditionsInfo(payload:any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/registrations/${this.userId}/terms`, payload, this.requestOptions);
  }

  public confirmPayment(payload:any, userId:string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/payments/save-info/${userId}`, payload, this.requestOptions);
  }

  public getPaymentDetails(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/payments`, this.requestOptions);
  }

  public getBulkRegistrations(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/bulk-registrations`, this.requestOptions);
  }

  public purchaseBulkSlots(payload:any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/bulk-registrations`, payload, this.requestOptions);
  }

  public addBulkContestant(regId:any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/bulk-registrations/${regId}/participants`, this.requestOptions);
  }


  /*****************************ADMIN ENDPOINTS*******************************************************************************************/

  public getDashboardDetails(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/admin/dashboard`, this.requestOptions);
  }

  public getRegistrations(paging: Paging = { page: 1, limit: 10 }) {
    const url = `${this.baseUrl}/admin/registrations`;
    return this.paging$(url, paging, this.requestOptions);
  }

  public getUsers(paging: Paging = { page: 1, limit: 10 }) {
    const url = `${this.baseUrl}/admin/users`;
    return this.paging$(url, paging, this.requestOptions);
  }

  public getTransactions(paging: Paging = { page: 1, limit: 10 }) {
    const url = `${this.baseUrl}/admin/transactions`;
    return this.paging$(url, paging, this.requestOptions);
  }

  paging$(
    url: string,
    initialPaging: Paging = { page: 1, limit: 10 },
    requestOptions: any = this.requestOptions
  ) {
    const pagingSubject = new Subject<Paging>();
    let currentPaging: Paging = initialPaging;

    const data$: Observable<any> = pagingSubject.pipe(
      startWith(currentPaging),
      switchMap(paging => {
        currentPaging = { ...currentPaging, ...paging };
        let params = new HttpParams();
        Object.entries(currentPaging).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params = params.set(key, value.toString());
          }
        });

        const options = { ...requestOptions, params };
        return this.http.get<any>(url, options);
      })
    );

    const setPaging = (pagingUpdate: Partial<Paging>) => {
      // merge new values into the current state
      currentPaging = { ...currentPaging, ...pagingUpdate } as Paging;
      pagingSubject.next(currentPaging);
    };

    return { data$, setPaging };
  }

}
