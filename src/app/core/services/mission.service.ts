import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Mission, MissionStatus } from '../models/mission.model';
import { ApiService } from './api.service';
import { ConfigService } from './config.service';

interface MissionListResponse {
  id: number;
  title: string;
  client: {
    id: number;
    name: string;
  };
  dailyRate: number;
  currency: string;
  status: MissionStatus;
  endDate: string;
  timeProgressPercent: number;
}

interface MissionDetailResponse {
  id: number;
  title: string;
  status: MissionStatus;
  client: {
    id: number;
    name: string;
  };
  financials: {
    dailyRate: number;
    totalBudget: number;
    totalInvoiced: number;
    currency: string;
  };
  period: {
    startDate: string;
    endDate: string;
    progressPercent: number;
  };
  invoices: {
    id: number;
    number: string;
    amount: number;
    status: string;
  }[];
}

interface MissionRequest {
  title: string;
  clientName: string;
  clientContactEmail?: string | null;
  dailyRate: number;
  expectedDuration: number;
  billingType: string;
  internalNotes?: string | null;
  status: MissionStatus;
  startDate: Date;
  endDate: Date;
}

@Injectable({ providedIn: 'root' })
export class MissionService {
  private readonly apiUrl: string;

  constructor(
    private readonly api: ApiService,
    configService: ConfigService
  ) {
    this.apiUrl = `${configService.apiBaseUrl}/missions`;
  }

  getMissions(): Observable<Mission[]> {
    return this.api
      .get<MissionListResponse[]>(this.apiUrl)
      .pipe(map((missions) => missions.map((mission) => this.mapMissionList(mission))));
  }

  getMission(id: number): Observable<Mission> {
    return this.api.get<MissionDetailResponse>(`${this.apiUrl}/${id}`).pipe(
      map((mission) => this.mapMissionDetail(mission))
    );
  }

  createMission(payload: MissionRequest): Observable<Mission> {
    return this.api.post<MissionRequest, MissionDetailResponse>(this.apiUrl, payload).pipe(
      map((mission) => this.mapMissionDetail(mission))
    );
  }

  updateMission(id: number, payload: MissionRequest): Observable<Mission> {
    return this.api
      .put<MissionRequest, MissionDetailResponse>(`${this.apiUrl}/${id}`, payload)
      .pipe(map((mission) => this.mapMissionDetail(mission)));
  }

  deleteMission(id: number): Observable<void> {
    return this.api.delete<void>(`${this.apiUrl}/${id}`);
  }

  private mapMissionList(mission: MissionListResponse): Mission {
    return {
      id: mission.id,
      title: mission.title,
      clientName: mission.client.name,
      clientId: mission.client.id,
      dailyRate: mission.dailyRate,
      currency: mission.currency,
      status: mission.status,
      endDate: new Date(mission.endDate),
      timeProgressPercent: mission.timeProgressPercent
    };
  }

  private mapMissionDetail(mission: MissionDetailResponse): Mission {
    return {
      id: mission.id,
      title: mission.title,
      clientName: mission.client.name,
      clientId: mission.client.id,
      dailyRate: mission.financials.dailyRate,
      currency: mission.financials.currency,
      totalBudgetEstimated: mission.financials.totalBudget,
      totalInvoiced: mission.financials.totalInvoiced,
      status: mission.status,
      startDate: new Date(mission.period.startDate),
      endDate: new Date(mission.period.endDate),
      timeProgressPercent: mission.period.progressPercent,
      invoiceIds: mission.invoices?.map((invoice) => invoice.id) ?? null
    };
  }

}
