import { NgIf } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
  selector: 'app-kpi-card',
  imports: [NgIf, CardModule, ProgressBarModule],
  templateUrl: './kpi-card.component.html',
  styleUrl: './kpi-card.component.scss'
})
export class KpiCardComponent {
  readonly title = input.required<string>();
  readonly value = input.required<string>();
  readonly subtitle = input<string | null>(null);
  readonly icon = input<string | null>(null);
  readonly progress = input<number | null>(null);
  readonly progressLabel = input<string | null>(null);

  readonly showProgress = computed(() => typeof this.progress() === 'number');
}
