import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { InvoiceListResponse, InvoiceStatsResponse } from '../../../../core/models/invoice.model';
import { InvoiceService } from '../../../../core/services/invoice.service';
import { InvoiceListComponent } from '../../components/invoice-list/invoice-list.component';

interface InvoiceKpiCard {
  label: string;
  value: number;
  icon: string;
  tone: 'paid' | 'pending' | 'overdue';
}

@Component({
  selector: 'app-invoices-page',
  imports: [NgFor, NgIf, CardModule, MessageModule, SkeletonModule, InvoiceListComponent],
  templateUrl: './invoices.page.html',
  styleUrl: './invoices.page.scss'
})
export class InvoicesPageComponent implements OnInit {
  private readonly invoiceService = inject(InvoiceService);
  private readonly currencyFormatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  });

  protected readonly isLoading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly invoices = signal<InvoiceListResponse[]>([]);
  protected readonly stats = signal<InvoiceStatsResponse>({
    totalPaid: 0,
    totalPending: 0,
    totalOverdue: 0
  });

  protected readonly skeletonKpis = Array.from({ length: 3 }, (_, index) => index);

  ngOnInit(): void {
    this.loadInvoices();
  }

  protected loadInvoices(): void {
    this.isLoading.set(true);
    this.error.set(null);

    forkJoin({
      invoices: this.invoiceService.getInvoices(),
      stats: this.invoiceService.getInvoiceStats()
    })
      .pipe(
        finalize(() => this.isLoading.set(false)),
        catchError(() => {
          this.error.set('Impossible de charger les factures.');
          return of({
            invoices: [] as InvoiceListResponse[],
            stats: {
              totalPaid: 0,
              totalPending: 0,
              totalOverdue: 0
            } satisfies InvoiceStatsResponse
          });
        })
      )
      .subscribe(({ invoices, stats }) => {
        this.invoices.set(invoices);
        this.stats.set(stats);
      });
  }

  protected kpiCards(stats: InvoiceStatsResponse): InvoiceKpiCard[] {
    return [
      {
        label: 'Total paye',
        value: stats.totalPaid,
        icon: 'pi pi-check-circle',
        tone: 'paid'
      },
      {
        label: 'En attente',
        value: stats.totalPending,
        icon: 'pi pi-clock',
        tone: 'pending'
      },
      {
        label: 'En retard',
        value: stats.totalOverdue,
        icon: 'pi pi-exclamation-triangle',
        tone: 'overdue'
      }
    ];
  }

  protected formatCurrency(amount: number): string {
    return this.currencyFormatter.format(amount);
  }
}
