import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = `${environment.apiBaseUrl}`;
  private _isLoggedin$ = new BehaviorSubject<boolean>(false);
  public isLoggedIn = this._isLoggedin$.asObservable();
  
  constructor(private http: HttpClient) { }

  get loggedInUser() {
    const user = sessionStorage.getItem('loggedInUser');
    if (user) {
      return JSON.parse(user);
    }
    return null;
  }

  public createAccount(payload:any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/register`, payload);
  }

  public verifyEmail(payload:any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth//verify-email`, payload);
  }

  public verifyOtp(payload:any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/verify-otp`, payload);
  }

  public setPassword(payload:any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/set-password`, payload);
  }

  public login(payload:any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/login`, payload);
  }
}
