import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  InvoiceDetailResponse,
  InvoiceListResponse,
  InvoiceStatsResponse
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
}
