import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { EMPTY, catchError, finalize, forkJoin, of } from 'rxjs';
import { InvoiceCreateRequest, InvoiceDetailResponse, InvoiceListResponse, InvoiceStatsResponse } from '../../../../core/models/invoice.model';
import { Mission } from '../../../../core/models/mission.model';
import { InvoiceService } from '../../../../core/services/invoice.service';
import { MissionService } from '../../../../core/services/mission.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ClickOutsideDirective } from '../../../../shared/directives/click-outside.directive';
import { InvoiceFormComponent } from '../../components/invoice-form/invoice-form.component';
import { InvoiceListComponent } from '../../components/invoice-list/invoice-list.component';

interface InvoiceKpiCard {
  label: string;
  value: number;
  icon: string;
  tone: 'paid' | 'pending' | 'overdue';
}

@Component({
  selector: 'app-invoices-page',
  imports: [
    NgFor,
    NgIf,
    CardModule,
    ButtonModule,
    DialogModule,
    MessageModule,
    SkeletonModule,
    ClickOutsideDirective,
    InvoiceListComponent,
    InvoiceFormComponent
  ],
  templateUrl: './invoices.page.html',
  styleUrl: './invoices.page.scss'
})
export class InvoicesPageComponent implements OnInit {
  private readonly invoiceService = inject(InvoiceService);
  private readonly missionService = inject(MissionService);
  private readonly toastService = inject(ToastService);
  private readonly currencyFormatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  });

  protected readonly isLoading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly invoices = signal<InvoiceListResponse[]>([]);
  protected readonly missions = signal<Mission[]>([]);
  protected readonly dialogVisible = signal(false);
  protected readonly editingInvoice = signal<InvoiceDetailResponse | null>(null);
  protected readonly isSaving = signal(false);
  protected readonly downloadingInvoiceId = signal<number | null>(null);
  protected readonly clickOutsideEnabled = signal(false);
  protected readonly formKey = signal(0);
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

  protected openCreateDialog(): void {
    this.formKey.update((value) => value + 1);
    this.editingInvoice.set(null);
    this.loadMissions();
    this.dialogVisible.set(true);
    this.clickOutsideEnabled.set(false);
    setTimeout(() => this.clickOutsideEnabled.set(true));
  }

  protected openEditDialog(invoice: InvoiceListResponse): void {
    if (invoice.status !== 'DRAFT') {
      return;
    }

    this.formKey.update((value) => value + 1);
    this.editingInvoice.set(null);
    this.loadMissions();
    this.dialogVisible.set(true);
    this.clickOutsideEnabled.set(false);
    setTimeout(() => this.clickOutsideEnabled.set(true));

    this.invoiceService
      .getInvoiceById(invoice.id)
      .pipe(
        catchError(() => {
          this.toastService.error('Impossible de charger la facture.');
          this.closeDialog();
          return of(null);
        })
      )
      .subscribe((detail) => {
        if (detail) {
          this.editingInvoice.set(detail);
        }
      });
  }

  protected closeDialog(): void {
    this.dialogVisible.set(false);
    this.editingInvoice.set(null);
    this.clickOutsideEnabled.set(false);
  }

  protected saveInvoice(request: InvoiceCreateRequest): void {
    this.isSaving.set(true);
    const editing = this.editingInvoice();
    const save$ = editing
      ? this.invoiceService.updateInvoice(editing.id, request)
      : this.invoiceService.createInvoice(request);

    save$
      .pipe(
        finalize(() => this.isSaving.set(false)),
        catchError(() => {
          this.toastService.error("Impossible d'enregistrer la facture.");
          return of(null);
        })
      )
      .subscribe((invoice) => {
        if (!invoice) {
          return;
        }

        this.toastService.success('Facture enregistree avec succes.');
        this.closeDialog();
        this.loadInvoices();
      });
  }

  protected downloadInvoicePdf(invoice: InvoiceListResponse): void {
    if (invoice.status === 'DRAFT' || this.downloadingInvoiceId() !== null) {
      return;
    }

    this.downloadingInvoiceId.set(invoice.id);

    this.invoiceService
      .downloadInvoicePdf(invoice.id)
      .pipe(
        finalize(() => this.downloadingInvoiceId.set(null)),
        catchError(() => {
          this.toastService.error('Impossible de telecharger le PDF de la facture.');
          return EMPTY;
        })
      )
      .subscribe((pdfBlob) => {
        this.triggerPdfDownload(pdfBlob, invoice);
      });
  }

  protected loadMissions(): void {
    this.missionService
      .getMissions()
      .pipe(
        catchError(() => {
          this.toastService.error('Impossible de charger les missions.');
          return of([] as Mission[]);
        })
      )
      .subscribe((missions) => this.missions.set(missions));
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

  private triggerPdfDownload(pdfBlob: Blob, invoice: InvoiceListResponse): void {
    const downloadUrl = URL.createObjectURL(pdfBlob);
    const downloadLink = document.createElement('a');

    downloadLink.href = downloadUrl;
    downloadLink.download = `${this.buildInvoicePdfFileName(invoice)}.pdf`;
    downloadLink.style.display = 'none';

    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    URL.revokeObjectURL(downloadUrl);
  }

  private buildInvoicePdfFileName(invoice: InvoiceListResponse): string {
    const invoiceNumber = invoice.number.trim() || String(invoice.id);
    const sanitizedInvoiceNumber = invoiceNumber.replace(/[^a-zA-Z0-9_-]/g, '-');

    return `facture-${sanitizedInvoiceNumber}`;
  }
}
