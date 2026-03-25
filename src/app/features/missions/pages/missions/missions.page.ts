import { NgIf } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { catchError, finalize, of } from 'rxjs';
import { Mission } from '../../../../core/models/mission.model';
import { MissionService } from '../../../../core/services/mission.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ClickOutsideDirective } from '../../../../shared/directives/click-outside.directive';
import { MissionFormComponent } from '../../components/mission-form/mission-form.component';
import { MissionListComponent } from '../../components/mission-list/mission-list.component';

type MissionRequest = Parameters<MissionService['createMission']>[0];

@Component({
  selector: 'app-missions-page',
  imports: [
    NgIf,
    CardModule,
    ButtonModule,
    DialogModule,
    MessageModule,
    ClickOutsideDirective,
    MissionListComponent,
    MissionFormComponent
  ],
  templateUrl: './missions.page.html',
  styleUrl: './missions.page.scss'
})
export class MissionFeatureComponent {
  private readonly missionService = inject(MissionService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly isLoading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly missions = signal<Mission[]>([]);
  protected readonly dialogVisible = signal(false);
  protected readonly editingMission = signal<Mission | null>(null);
  protected readonly isSaving = signal(false);
  protected readonly clickOutsideEnabled = signal(false);

  private buildMissionRequest(payload: Mission): MissionRequest | null {
    if (!payload.startDate || !payload.endDate) {
      this.toastService.error('Les dates de debut et fin sont obligatoires.');
      return null;
    }

    if (!payload.title?.trim()) {
      this.toastService.error('Le titre de la mission est obligatoire.');
      return null;
    }

    return {
      title: payload.title,
      clientName: payload.clientName,
      clientContactEmail: payload.clientContactEmail ?? null,
      dailyRate: payload.dailyRate,
      expectedDuration: payload.expectedDuration ?? 0,
      billingType: payload.billingType ?? 'TJM',
      internalNotes: payload.internalNotes ?? null,
      status: payload.status,
      startDate: payload.startDate,
      endDate: payload.endDate
    };
  }

  constructor() {
    this.loadMissions();
  }

  protected loadMissions(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.missionService
      .getMissions()
      .pipe(
        finalize(() => this.isLoading.set(false)),
        catchError(() => {
          this.error.set('Impossible de charger les missions.');
          return of([] as Mission[]);
        })
      )
      .subscribe((missions) => this.missions.set(missions));
  }

  protected openCreateDialog(): void {
    this.editingMission.set(null);
    this.dialogVisible.set(true);
    this.clickOutsideEnabled.set(false);
    setTimeout(() => this.clickOutsideEnabled.set(true));
  }

  protected openEditDialog(mission: Mission): void {
    this.dialogVisible.set(true);
    this.editingMission.set(null);
    this.clickOutsideEnabled.set(false);
    setTimeout(() => this.clickOutsideEnabled.set(true));
    if (mission.id == null) {
      this.toastService.error("Identifiant mission manquant pour la mise a jour.");
      return;
    }

    this.missionService
      .getMission(mission.id)
      .pipe(
        catchError(() => {
          this.toastService.error('Impossible de charger la mission.');
          return of(null);
        })
      )
      .subscribe((detail) => {
        if (detail) {
          this.editingMission.set(detail);
        }
      });
  }

  protected closeDialog(): void {
    this.dialogVisible.set(false);
    this.editingMission.set(null);
    this.clickOutsideEnabled.set(false);
  }

  protected saveMission(payload: Mission): void {
    this.isSaving.set(true);
    const editing = this.editingMission();
    const requestPayload = this.buildMissionRequest(payload);
    if (!requestPayload) {
      this.isSaving.set(false);
      return;
    }
    let request$;
    if (editing) {
      if (editing.id == null) {
        this.isSaving.set(false);
        this.toastService.error("Identifiant mission manquant pour la mise a jour.");
        return;
      }
      request$ = this.missionService.updateMission(editing.id, requestPayload);
    } else {
      request$ = this.missionService.createMission(requestPayload);
    }

    request$
      .pipe(
        finalize(() => this.isSaving.set(false)),
        catchError(() => {
          this.toastService.error("Impossible d'enregistrer la mission.");
          return of(null);
        })
      )
      .subscribe((mission) => {
        if (!mission) {
          return;
        }

        if (editing) {
          const updated = this.missions().map((item) => (item.id === mission.id ? mission : item));
          this.missions.set(updated);
        } else {
          this.missions.set([mission, ...this.missions()]);
        }

        this.toastService.success('Mission enregistree avec succes.');
        this.closeDialog();
      });
  }

  protected viewMission(mission: Mission): void {
    this.router.navigate(['/missions', mission.id]);
  }
}
