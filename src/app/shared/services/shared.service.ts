import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';

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
}
