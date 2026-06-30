import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  InvoiceCreateRequest,
  InvoiceDetailResponse,
  InvoiceListResponse,
  InvoiceStatsResponse,
  InvoiceUpdateRequest
} from '../models/invoice.model';
import { ApiService } from './api.service';
import { ConfigService } from './config.service';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private readonly apiUrl: string;

  constructor(
    private readonly api: ApiService,
    configService: ConfigService
  ) {
    this.apiUrl = `${configService.apiBaseUrl}/invoices`;
  }

  getInvoices(): Observable<InvoiceListResponse[]> {
    return this.api.get<InvoiceListResponse[]>(this.apiUrl);
  }

  getInvoiceStats(): Observable<InvoiceStatsResponse> {
    return this.api.get<InvoiceStatsResponse>(`${this.apiUrl}/stats`);
  }

  getInvoiceById(id: number): Observable<InvoiceDetailResponse> {
    return this.api.get<InvoiceDetailResponse>(`${this.apiUrl}/${id}`);
  }

  createInvoice(request: InvoiceCreateRequest): Observable<InvoiceDetailResponse> {
    return this.api.post<InvoiceCreateRequest, InvoiceDetailResponse>(this.apiUrl, request);
  }

  updateInvoice(id: number, request: InvoiceUpdateRequest): Observable<InvoiceDetailResponse> {
    return this.api.put<InvoiceUpdateRequest, InvoiceDetailResponse>(`${this.apiUrl}/${id}`, request);
  }

  downloadInvoicePdf(id: number): Observable<Blob> {
    return this.api.get(`${this.apiUrl}/${id}/download`, { responseType: 'blob' });
  }
}
