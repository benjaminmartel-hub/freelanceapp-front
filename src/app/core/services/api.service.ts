import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

type ApiGetOptions = {
  responseType?: 'json';
};

type ApiGetBlobOptions = {
  responseType: 'blob';
};

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private readonly http: HttpClient) {}

  get<T>(url: string, options?: ApiGetOptions): Observable<T>;
  get(url: string, options: ApiGetBlobOptions): Observable<Blob>;
  get<T>(url: string, options?: ApiGetOptions | ApiGetBlobOptions): Observable<T> | Observable<Blob> {
    if (options?.responseType === 'blob') {
      return this.http.get(url, { responseType: 'blob' });
    }

    return this.http.get<T>(url);
  }

  post<TBody, TResponse>(url: string, body: TBody): Observable<TResponse> {
    return this.http.post<TResponse>(url, body);
  }

  put<TBody, TResponse>(url: string, body: TBody): Observable<TResponse> {
    return this.http.put<TResponse>(url, body);
  }

  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(url);
  }
}
