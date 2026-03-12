import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ConfigService } from './config.service';
import { DashboardData } from '../models/dashboard.model';

interface DashboardDataResponse {
  monthlyTurnover: number;
  annualTurnover: number;
  pendingPayments: number;
  revenueHistory: { month: string; paid: number; sent: number }[];
  clientDistribution: { clientName: string; amount: number }[];
  overdueInvoices: { id: number; clientName: string; amount: number; dueDate: string; daysOverdue: number }[];
  expiringMissions: { id: number; title: string; clientName: string; endDate: string }[];
  nextTaxDeadline: { amountToPay: number; deadline: string; label: string };
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly apiUrl: string;

  constructor(
    private readonly api: ApiService,
    configService: ConfigService
  ) {
    this.apiUrl = `${configService.apiBaseUrl}/dashboard`;
  }

  getDashboardData(): Observable<DashboardData> {
    return this.api
      .get<DashboardDataResponse>(`${this.apiUrl}/me`)
      .pipe(map((response) => this.mapDashboardData(response)));
  }

  private mapDashboardData(data: DashboardDataResponse): DashboardData {
    return {
      monthlyTurnover: data.monthlyTurnover,
      annualTurnover: data.annualTurnover,
      pendingPayments: data.pendingPayments,
      revenueHistory: data.revenueHistory,
      clientDistribution: data.clientDistribution,
      overdueInvoices: data.overdueInvoices.map((invoice) => ({
        ...invoice,
        dueDate: new Date(invoice.dueDate)
      })),
      expiringMissions: data.expiringMissions.map((mission) => ({
        ...mission,
        endDate: new Date(mission.endDate)
      })),
      nextTaxDeadline: {
        ...data.nextTaxDeadline,
        deadline: new Date(data.nextTaxDeadline.deadline)
      }
    };
  }

}
