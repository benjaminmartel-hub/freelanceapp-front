import { DecimalPipe, NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Component, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InvoiceListResponse, InvoiceStatus } from '../../../../core/models/invoice.model';

type InvoiceColumnType = 'text' | 'status' | 'money' | 'date' | 'rate';
type InvoiceStatusSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

interface InvoiceColumn {
  field: keyof InvoiceListResponse;
  header: string;
  type: InvoiceColumnType;
}

@Component({
  selector: 'app-invoice-list',
  imports: [
    DecimalPipe,
    NgFor,
    NgIf,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    FormsModule,
    TableModule,
    TagModule,
    SkeletonModule,
    InputTextModule,
    SelectModule
  ],
  templateUrl: './invoice-list.component.html',
  styleUrl: './invoice-list.component.scss'
})
export class InvoiceListComponent {
  readonly invoices = input<InvoiceListResponse[]>([]);
  readonly loading = input(false);

  readonly columns: InvoiceColumn[] = [
    { field: 'number', header: 'Numero', type: 'text' },
    { field: 'missionTitle', header: 'Mission', type: 'text' },
    { field: 'clientName', header: 'Client', type: 'text' },
    { field: 'totalTtc', header: 'Montant TTC', type: 'money' },
    { field: 'dueDate', header: 'Echeance', type: 'date' },
    { field: 'status', header: 'Statut', type: 'status' }
  ];

  readonly skeletonRows = Array.from({ length: 7 }, (_, index) => index);
  readonly globalFilterFields: (keyof InvoiceListResponse)[] = ['number', 'missionTitle', 'clientName', 'status'];
  readonly statusOptions = [
    { label: 'Brouillon', value: 'DRAFT' as InvoiceStatus },
    { label: 'Envoyee', value: 'SENT' as InvoiceStatus },
    { label: 'Payee', value: 'PAID' as InvoiceStatus },
    { label: 'En retard', value: 'OVERDUE' as InvoiceStatus }
  ];

  private readonly dateFormatter = new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  statusLabel(status: InvoiceStatus): string {
    const labels: Record<InvoiceStatus, string> = {
      DRAFT: 'Brouillon',
      SENT: 'Envoyee',
      PAID: 'Payee',
      OVERDUE: 'En retard'
    };

    return labels[status];
  }

  statusSeverity(status: InvoiceStatus): InvoiceStatusSeverity {
    const severities: Record<InvoiceStatus, InvoiceStatusSeverity> = {
      DRAFT: 'secondary',
      SENT: 'info',
      PAID: 'success',
      OVERDUE: 'danger'
    };

    return severities[status];
  }

  getFieldValue(invoice: InvoiceListResponse, field: keyof InvoiceListResponse): string | number {
    return invoice[field];
  }

  formatDate(date: string): string {
    return this.dateFormatter.format(new Date(date));
  }
}
