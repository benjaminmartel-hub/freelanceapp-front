import { Component, computed, input } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { DashboardData } from '../../../../core/models/dashboard.model';
import { formatMonthLabel } from '../../../../shared/utils/date-format.util';

type MonthlyStat = DashboardData['revenueHistory'][number];

@Component({
  selector: 'app-revenue-chart',
  imports: [ChartModule],
  templateUrl: './revenue-chart.component.html',
  styleUrl: './revenue-chart.component.scss'
})
export class RevenueChartComponent {
  readonly data = input<MonthlyStat[]>([]);

  readonly chartData = computed(() => {
    const history = this.data();
    return {
      labels: history.map((item) => formatMonthLabel(item.month)),
      datasets: [
        {
          label: 'Paiements recus',
          data: history.map((item) => item.paid),
          backgroundColor: 'rgba(95, 223, 176, 0.7)',
          borderColor: 'rgba(95, 223, 176, 0.95)',
          borderWidth: 1,
          borderRadius: 6
        },
        {
          label: 'Factures envoyees',
          data: history.map((item) => item.sent),
          backgroundColor: 'rgba(124, 179, 255, 0.65)',
          borderColor: 'rgba(124, 179, 255, 0.95)',
          borderWidth: 1,
          borderRadius: 6
        }
      ]
    };
  });

  readonly chartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#e6edf7'
        }
      }
    },
    scales: {
      x: {
        stacked: true,
        ticks: {
          color: '#9fb1c9'
        },
        grid: {
          color: 'rgba(43, 58, 83, 0.4)'
        }
      },
      y: {
        stacked: true,
        ticks: {
          color: '#9fb1c9'
        },
        grid: {
          color: 'rgba(43, 58, 83, 0.4)'
        }
      }
    }
  };
}
