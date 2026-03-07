import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private readonly http: HttpClient) {}

  get<T>(url: string): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(url);
  }

  post<TBody, TResponse>(url: string, body: TBody): Observable<ApiResponse<TResponse>> {
    return this.http.post<ApiResponse<TResponse>>(url, body);
  }

  put<TBody, TResponse>(url: string, body: TBody): Observable<ApiResponse<TResponse>> {
    return this.http.put<ApiResponse<TResponse>>(url, body);
  }

  delete<T>(url: string): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(url);
  }
}