import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = `${environment.apiBaseUrl}`;
  
  constructor(private http: HttpClient) { }

  public createAccount(payload:any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/create`, payload);
  }

  public verifyEmail(payload:any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/verify-email`, payload);
  }

  public verifyOtp(payload:any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/verify-otp`, payload);
  }

  public resetPassword(payload:any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/reset-password`, payload);
  }

  public login(payload:any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, payload);
  }
}
