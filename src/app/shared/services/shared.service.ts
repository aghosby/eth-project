import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  private baseUrl = `${environment.apiBaseUrl}`;
  
  constructor(private http: HttpClient) { }

  public getProfileDetails(id:any): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/profile/${id}`);
  }
}
