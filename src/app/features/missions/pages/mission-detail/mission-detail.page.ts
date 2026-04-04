import { DecimalPipe, NgIf } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { ProgressBarModule } from 'primeng/progressbar';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Mission } from '../../../../core/models/mission.model';
import { getMissionStatusLabel, getMissionStatusSeverity } from '../../utils/mission-status.util';
import { MissionService } from '../../../../core/services/mission.service';

@Component({
  selector: 'app-mission-detail-page',
  imports: [
    NgIf,
    DecimalPipe,
    RouterLink,
    CardModule,
    MessageModule,
    ProgressBarModule,
    SkeletonModule,
    TagModule
  ],
  templateUrl: './mission-detail.page.html',
  styleUrl: './mission-detail.page.scss'
})
export class MissionDetailPageComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly missionService = inject(MissionService);

  protected readonly isLoading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly mission = signal<Mission | null>(null);

  protected readonly timeProgress = computed(() => {
    const mission = this.mission();
    if (!mission) {
      return 0;
    }

    if (typeof mission.timeProgressPercent === 'number') {
      return Math.min(100, Math.max(0, Math.round(mission.timeProgressPercent)));
    }

    if (!mission.startDate || !mission.endDate) {
      return 0;
    }

    const start = mission.startDate.getTime();
    const end = mission.endDate.getTime();
    if (end <= start) {
      return 100;
    }

    const now = Date.now();
    const elapsed = Math.min(Math.max(now - start, 0), end - start);
    return Math.round((elapsed / (end - start)) * 100);
  });

  protected readonly burnRateProgress = computed(() => {
    const mission = this.mission();
    const budget = this.totalBudgetEstimated();
    if (!mission || budget <= 0) {
      return 0;
    }

    return Math.min(100, Math.round((this.totalInvoicedAmount() / budget) * 100));
  });

  private readonly dateFormatter = new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  constructor() {
    this.route.paramMap
      .pipe(
        map((params) => Number(params.get('id'))),
        tap(() => {
          this.isLoading.set(true);
          this.error.set(null);
        }),
        switchMap((id) => {
          if (!Number.isFinite(id)) {
            this.error.set('Identifiant de mission invalide.');
            return of(null);
          }

          return this.missionService.getMission(id).pipe(
            catchError(() => {
              this.error.set('Impossible de charger la mission.');
              return of(null);
            })
          );
        }),
        tap(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((mission) => this.mission.set(mission));
  }

  protected formatDate(date?: Date | null): string {
    if (!date) {
      return '-';
    }
    return this.dateFormatter.format(date);
  }

  protected statusLabel(mission: Mission): string {
    return getMissionStatusLabel(mission.status);
  }

  protected statusSeverity(mission: Mission) {
    return getMissionStatusSeverity(mission.status);
  }

  protected totalBudgetEstimated(): number {
    const mission = this.mission();
    if (!mission) {
      return 0;
    }

    if (typeof mission.totalBudgetEstimated === 'number') {
      return mission.totalBudgetEstimated;
    }

    const duration = mission.expectedDuration ?? 0;
    return mission.dailyRate * duration;
  }

  protected billedEstimate(): number {
    const budget = this.totalBudgetEstimated();
    if (budget <= 0) {
      return 0;
    }

    return Math.round((this.timeProgress() / 100) * budget);
  }

  protected totalInvoicedAmount(): number {
    const mission = this.mission();
    if (!mission || typeof mission.totalInvoiced !== 'number') {
      return 0;
    }

    return mission.totalInvoiced;
  }

}
