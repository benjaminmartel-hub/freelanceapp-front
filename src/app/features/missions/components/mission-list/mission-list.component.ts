import { DecimalPipe, NgFor, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { ContextMenuModule } from 'primeng/contextmenu';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressBarModule } from 'primeng/progressbar';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { Mission } from '../../../../core/models/mission.model';
import { getMissionStatusLabel, getMissionStatusSeverity } from '../../utils/mission-status.util';

type MissionColumnType = 'text' | 'status' | 'money' | 'progress' | 'date';

interface MissionColumn {
  field: string;
  header: string;
  type: MissionColumnType;
}

@Component({
  selector: 'app-mission-list',
  imports: [
    DecimalPipe,
    NgFor,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    FormsModule,
    TableModule,
    TagModule,
    SkeletonModule,
    InputTextModule,
    ContextMenuModule,
    ProgressBarModule,
    SelectModule
  ],
  templateUrl: './mission-list.component.html',
  styleUrl: './mission-list.component.scss'
})
export class MissionListComponent {
  readonly missions = input<Mission[]>([]);
  readonly loading = input(false);
  readonly edit = output<Mission>();
  readonly view = output<Mission>();

  readonly columns: MissionColumn[] = [
    { field: 'title', header: 'Titre', type: 'text' },
    { field: 'clientName', header: 'Client', type: 'text' },
    { field: 'dailyRate', header: 'TJM', type: 'money' },
    { field: 'status', header: 'Statut', type: 'status' },
    { field: 'timeProgressPercent', header: 'Progression', type: 'progress' },
    { field: 'endDate', header: 'Fin', type: 'date' }
  ];

  readonly skeletonRows = Array.from({ length: 6 }, (_, index) => index);
  readonly globalFilterFields = ['title', 'clientName', 'status'];
  readonly statusOptions = [
    { label: 'Prospect', value: 'PROSPECT' as Mission['status'] },
    { label: 'En cours', value: 'ONGOING' as Mission['status'] },
    { label: 'Terminee', value: 'FINISHED' as Mission['status'] },
    { label: 'Annulee', value: 'CANCELLED' as Mission['status'] }
  ];
  readonly contextMenuItems: MenuItem[] = [
    {
      label: 'Voir le detail',
      icon: 'pi pi-eye',
      command: () => {
        if (this.selectedMission) {
          this.view.emit(this.selectedMission);
        }
      }
    },
    {
      label: 'Modifier',
      icon: 'pi pi-pencil',
      command: () => {
        if (this.selectedMission) {
          this.edit.emit(this.selectedMission);
        }
      }
    }
  ];

  protected selectedMission: Mission | null = null;

  private readonly dateFormatter = new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  statusLabel(status: Mission['status']): string {
    return getMissionStatusLabel(status);
  }

  statusSeverity(status: Mission['status']) {
    return getMissionStatusSeverity(status);
  }

  getFieldValue(mission: Mission, field: string): string | number {
    const value = mission[field as keyof Mission];
    if (value === null || value === undefined) {
      return '-';
    }
    return value as string | number;
  }

  formatDate(date?: Date | null): string {
    if (!date) {
      return '-';
    }
    return this.dateFormatter.format(date);
  }

  protected onContextMenuSelect(mission: Mission | null): void {
    this.selectedMission = mission;
  }
}
