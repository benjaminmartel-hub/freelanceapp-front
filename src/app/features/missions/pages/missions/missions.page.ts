import { HttpErrorResponse } from '@angular/common/http';
import { NgIf } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { catchError, finalize, map, of, switchMap } from 'rxjs';
import { Client } from '../../../../core/models/client.model';
import { Mission } from '../../../../core/models/mission.model';
import { ClientService } from '../../../../core/services/client.service';
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
  private readonly clientService = inject(ClientService);
  private readonly missionService = inject(MissionService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly isLoading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly missions = signal<Mission[]>([]);
  protected readonly clients = signal<Client[]>([]);
  protected readonly dialogVisible = signal(false);
  protected readonly editingMission = signal<Mission | null>(null);
  protected readonly isSaving = signal(false);
  protected readonly clickOutsideEnabled = signal(false);
  protected readonly formKey = signal(0);

  private buildMissionRequest(payload: Mission): MissionRequest | null {
    if (!this.isMissionPayloadValid(payload)) {
      return null;
    }

    return {
      title: payload.title,
      clientId: payload.clientId,
      dailyRate: payload.dailyRate,
      expectedDuration: payload.expectedDuration,
      totalBudgetEstimated: payload.dailyRate * payload.expectedDuration,
      billingType: payload.billingType ?? 'TJM',
      internalNotes: payload.internalNotes ?? null,
      status: payload.status,
      startDate: this.formatDate(payload.startDate),
      endDate: this.formatDate(payload.endDate),
      currency: payload.currency
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
        catchError((error: unknown) => {
          this.notifyServerError(error, 'Impossible de charger les missions.');
          this.error.set('Impossible de charger les missions.');
          return of([] as Mission[]);
        })
      )
      .subscribe((missions) => this.missions.set(missions));
  }

  protected openCreateDialog(): void {
    this.formKey.update((value) => value + 1);
    this.editingMission.set(null);
    this.loadClients();
    this.dialogVisible.set(true);
    this.clickOutsideEnabled.set(false);
    setTimeout(() => this.clickOutsideEnabled.set(true));
  }

  protected openEditDialog(mission: Mission): void {
    this.formKey.update((value) => value + 1);
    this.dialogVisible.set(true);
    this.editingMission.set(null);
    this.loadClients();
    this.clickOutsideEnabled.set(false);
    setTimeout(() => this.clickOutsideEnabled.set(true));
    if (mission.id == null) {
      return;
    }

    this.missionService
      .getMission(mission.id)
      .pipe(
        catchError((error: unknown) => {
          this.notifyServerError(error, 'Impossible de charger la mission.');
          return of(null);
        })
      )
      .subscribe((detail) => {
        if (detail) {
          this.editingMission.set(detail);
        }
      });
  }

  protected loadClients(): void {
    this.clientService
      .getClients()
      .pipe(
        catchError((error: unknown) => {
          this.notifyServerError(error, 'Impossible de charger les clients.');
          return of([] as Client[]);
        })
      )
      .subscribe((clients) => this.clients.set(clients));
  }

  protected closeDialog(): void {
    this.dialogVisible.set(false);
    this.editingMission.set(null);
    this.clickOutsideEnabled.set(false);
  }

  protected saveMission(payload: Mission): void {
    this.isSaving.set(true);
    const editing = this.editingMission();
    const clientId$ = payload.clientId
      ? of(payload.clientId)
      : this.clientService
          .createClient({
            name: payload.clientName,
            contactEmail: payload.clientContactEmail ?? null
          })
          .pipe(map((client) => client.id));

    clientId$
      .pipe(
        switchMap((clientId) => {
          const requestPayload = this.buildMissionRequest({
            ...payload,
            clientId
          });
          if (!requestPayload) {
            return of(null);
          }

          if (editing) {
            if (editing.id == null) {
              return of(null);
            }
            return this.missionService.updateMission(editing.id, requestPayload);
          }

          return this.missionService.createMission(requestPayload);
        }),
        finalize(() => this.isSaving.set(false)),
        catchError((error: unknown) => {
          if (error instanceof HttpErrorResponse && error.status === 409) {
            this.toastService.error(
              "Impossible d'enregistrer la mission : une mission est deja en cours sur cette periode"
            );
          } else {
            this.notifyServerError(error, "Impossible d'enregistrer la mission.");
          }
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

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private isMissionPayloadValid(
    payload: Mission
  ): payload is Mission & {
    startDate: Date;
    endDate: Date;
    title: string;
    clientId: number;
    dailyRate: number;
    expectedDuration: number;
    currency: string;
  } {
    return (
      payload.startDate != null &&
      payload.endDate != null &&
      Boolean(payload.title?.trim()) &&
      payload.clientId != null &&
      typeof payload.dailyRate === 'number' &&
      payload.dailyRate > 0 &&
      typeof payload.expectedDuration === 'number' &&
      payload.expectedDuration > 0 &&
      Boolean(payload.currency?.trim())
    );
  }

  private notifyServerError(error: unknown, message: string): void {
    if (error instanceof HttpErrorResponse && (error.status === 500 || error.status === 403)) {
      this.toastService.error(message);
    }
  }

  protected viewMission(mission: Mission): void {
    this.router.navigate(['/missions', mission.id]);
  }
}
