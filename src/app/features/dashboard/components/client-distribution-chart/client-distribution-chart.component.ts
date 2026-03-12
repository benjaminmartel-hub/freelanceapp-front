import { Component, computed, input } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { DashboardData } from '../../../../core/models/dashboard.model';

type ClientRevenueStat = DashboardData['clientDistribution'][number];

@Component({
  selector: 'app-client-distribution-chart',
  imports: [ChartModule],
  templateUrl: './client-distribution-chart.component.html',
  styleUrl: './client-distribution-chart.component.scss'
})
export class ClientDistributionChartComponent {
  readonly data = input<ClientRevenueStat[]>([]);

  private readonly currencyFormatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  readonly chartData = computed(() => {
    const items = this.data();
    const palette = ['#7cb3ff', '#5fdfb0', '#f6c26b', '#f48fb1', '#a98bff', '#9fb1c9'];

    if (!items.length) {
      return {
        labels: ['Aucun client'],
        datasets: [
          {
            data: [1],
            backgroundColor: ['rgba(159, 177, 201, 0.25)'],
            borderColor: ['rgba(159, 177, 201, 0.4)'],
            borderWidth: 1
          }
        ]
      };
    }

    return {
      labels: items.map((item) => item.clientName),
      datasets: [
        {
          data: items.map((item) => item.amount),
          backgroundColor: items.map((_, index) => palette[index % palette.length]),
          borderColor: items.map((_, index) => palette[index % palette.length]),
          borderWidth: 1,
          hoverOffset: 6
        }
      ]
    };
  });

  readonly chartOptions = {
    maintainAspectRatio: false,
    cutout: '62%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#9fb1c9'
        }
      },
      tooltip: {
        callbacks: {
          label: (context: { dataset: { data: Array<number | null> }; raw: number | null }) => {
            const dataset = context.dataset?.data ?? [];
            const total = dataset.reduce<number>((sum, value) => sum + (typeof value === 'number' ? value : 0), 0);
            const amount = typeof context.raw === 'number' ? context.raw : 0;
            const percent = total > 0 ? Math.round((amount / total) * 100) : 0;
            return `${this.currencyFormatter.format(amount)} (${percent}%)`;
          }
        }
      }
    }
  };
}
