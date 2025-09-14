import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {
  private baseUrl = `${environment.apiBaseUrl}`;

  constructor(private http: HttpClient) { }

  getScreenSize(): 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl' {
    const width = window.innerWidth;

    if (width < 576) {
      return 'xs'; // < 576 → extra small
    } 
    else if (width < 768) {
      return 'sm';
    } 
    else if (width < 992) {
      return 'md';
    } 
    else if (width < 1200) {
      return 'lg';
    } 
    else if (width < 1400) {
      return 'xl';
    } 
    else if (width < 1600) {
      return 'xxl';
    } 
    else {
      return 'xxxl';
    }
  }

  getScreenWidth(): number {
    return window.innerWidth;
  }
}
