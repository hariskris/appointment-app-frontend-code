import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api'; // Update to your endpoint

  constructor(private router: Router, private http: HttpClient) {}

  isAuthenticated(): boolean {
    return sessionStorage.getItem('token') !== null;
  }

  canAccess() {
    if (!this.isAuthenticated()) {
      this.router.navigate(['/login']);
    }
  }

  canAuthenticate() {
    if (this.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  register(name: string, email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/users/signup`, { name, email, password });
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/users/signin`, { email, password });
  }

  deleteAccount(): Observable<any> {
    const headers = this.getHeadersWithAuthorization();
    console.log('headers',headers);
    return this.http.delete<any>(`${this.apiUrl}/users/deleteUser`, { headers });
  }

  storeToken(token: string) {
    sessionStorage.setItem('token', token);
  }

  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  removeToken() {
    sessionStorage.removeItem('token');
  }

  detail(page: number = 1, limit: number = 10): Observable<any> {
    const headers = this.getHeadersWithAuthorization();
    return this.http.get<any>(`${this.apiUrl}/appointments?page=${page}&limit=${limit}`, { headers }).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          this.handleUnauthorized();
        }
        return throwError(error);
      })
    );
  }

  searchAppointments(title: string, page: number = 1, limit: number = 10): Observable<any> {
    const headers = this.getHeadersWithAuthorization();
    return this.http.get<any>(`${this.apiUrl}/appointments/?title=${title}&page=${page}&limit=${limit}`, { headers }).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          this.handleUnauthorized();
        }
        return throwError(error);
      })
    );
  }

  createAppointment(appointment: { _id: number; title: string; date: string; startTime: string; endTime: string; }): Observable<any> {
    const headers = this.getHeadersWithAuthorization();
    return this.http.post<any>(`${this.apiUrl}/appointments`, appointment, { headers }).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          this.handleUnauthorized();
        }
        return throwError(error);
      })
    );
  }

  updateAppointment(appointment: any): Observable<any> {
    const headers = this.getHeadersWithAuthorization();
    return this.http.put<any>(`${this.apiUrl}/appointments/${appointment._id}`, appointment, { headers }).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          this.handleUnauthorized();
        }
        return throwError(error);
      })
    );
  }

  deleteAppointment(id: number): Observable<any> {
    const headers = this.getHeadersWithAuthorization();
    return this.http.delete<any>(`${this.apiUrl}/appointments/${id}`, { headers }).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          this.handleUnauthorized();
        }
        return throwError(error);
      })
    );
  }

  private getHeadersWithAuthorization(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders().set('Authorization', `${token}`);
  }

  private handleUnauthorized() {
    console.log('Token expired or invalid. Logging out...');
    this.removeToken();
    this.router.navigate(['/login']);
  }
}
