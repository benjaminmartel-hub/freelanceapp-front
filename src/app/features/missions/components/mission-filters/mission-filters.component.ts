import { Component, DestroyRef, effect, inject, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MissionStatus } from '../../../../core/models/mission.model';

export interface MissionFilters {
  searchTerm: string;
  status: MissionStatus | 'ALL';
}

@Component({
  selector: 'app-mission-filters',
  imports: [ReactiveFormsModule, InputTextModule, SelectModule],
  templateUrl: './mission-filters.component.html',
  styleUrl: './mission-filters.component.scss'
})
export class MissionFiltersComponent {
  private readonly destroyRef = inject(DestroyRef);

  readonly searchTerm = input('');
  readonly status = input<MissionStatus | 'ALL'>('ALL');
  readonly statusOptions = input<{ label: string; value: MissionStatus | 'ALL' }[]>([]);

  readonly filtersChange = output<MissionFilters>();

  readonly form = new FormGroup({
    searchTerm: new FormControl('', { nonNullable: true }),
    status: new FormControl<MissionStatus | 'ALL'>('ALL', { nonNullable: true })
  });

  constructor() {
    effect(() => {
      this.form.setValue(
        {
          searchTerm: this.searchTerm(),
          status: this.status()
        },
        { emitEvent: false }
      );
    });

    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      this.filtersChange.emit({
        searchTerm: value.searchTerm ?? '',
        status: value.status ?? 'ALL'
      });
    });
  }
}
