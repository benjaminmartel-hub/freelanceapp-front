import { AsyncPipe, NgIf } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { catchError, defer, finalize, of, shareReplay } from 'rxjs';
import { DashboardData } from '../../../../core/models/dashboard.model';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { ActionTableComponent } from '../../components/action-table/action-table.component';
import { ClientDistributionChartComponent } from '../../components/client-distribution-chart/client-distribution-chart.component';
import { KpiCardComponent } from '../../components/kpi-card/kpi-card.component';
import { RevenueChartComponent } from '../../components/revenue-chart/revenue-chart.component';

@Component({
  selector: 'app-dashboard-feature',
  imports: [
    AsyncPipe,
    NgIf,
    CardModule,
    MessageModule,
    SkeletonModule,
    KpiCardComponent,
    RevenueChartComponent,
    ClientDistributionChartComponent,
    ActionTableComponent
  ],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss'
})
export class DashboardFeatureComponent {
  private readonly dashboardService = inject(DashboardService);

  private readonly annualCeiling = 77000;
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

  protected readonly isLoading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly dashboardData$ = defer(() => {
    this.error.set(null);
    this.isLoading.set(true);

    return this.dashboardService.getDashboardData().pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(() => {
        this.error.set('Impossible de charger les donnees du dashboard.');
        return of(null);
      })
    );
  }).pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  );

  protected formatCurrency(amount: number): string {
    return this.currencyFormatter.format(amount);
  }

  protected formatDate(date: Date): string {
    return this.dateFormatter.format(date);
  }

  protected annualProgress(annualTurnover: number): number {
    if (this.annualCeiling <= 0) {
      return 0;
    }

    return Math.min(100, Math.round((annualTurnover / this.annualCeiling) * 100));
  }

  protected annualProgressLabel(annualTurnover: number): string {
    return `${this.annualProgress(annualTurnover)}% du plafond (${this.formatCurrency(this.annualCeiling)})`;
  }

}
