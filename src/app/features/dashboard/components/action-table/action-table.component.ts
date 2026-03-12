import { NgIf } from '@angular/common';
import { Component, input } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DashboardData } from '../../../../core/models/dashboard.model';

type OverdueInvoice = DashboardData['overdueInvoices'][number];
type ExpiringMission = DashboardData['expiringMissions'][number];

type ActionTableType = 'overdue-invoices' | 'expiring-missions';

@Component({
  selector: 'app-action-table',
  imports: [NgIf, CardModule, TableModule, TagModule],
  templateUrl: './action-table.component.html',
  styleUrl: './action-table.component.scss'
})
export class ActionTableComponent {
  readonly title = input.required<string>();
  readonly type = input.required<ActionTableType>();
  readonly rows = input<OverdueInvoice[] | ExpiringMission[]>([]);

  private readonly currencyFormatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  });

  private readonly dateFormatter = new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  formatCurrency(amount: number): string {
    return this.currencyFormatter.format(amount);
  }

  formatDate(date: Date): string {
    return this.dateFormatter.format(date);
  }

  overdueRows(): OverdueInvoice[] {
    return this.type() === 'overdue-invoices' ? (this.rows() as OverdueInvoice[]) : [];
  }

  expiringRows(): ExpiringMission[] {
    return this.type() === 'expiring-missions' ? (this.rows() as ExpiringMission[]) : [];
  }
}
