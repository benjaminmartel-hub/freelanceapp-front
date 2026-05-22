import { MissionStatus } from './mission.model';

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';

export interface MissionClientResponse {
  id: number;
  name: string;
}

export interface MissionSummaryForInvoiceResponse {
  id: number;
  title: string;
  client: MissionClientResponse;
  status: MissionStatus;
  currency: string;
}

export interface InvoiceListResponse {
  id: number;
  number: string;
  issueDate: string;
  dueDate: string;
  totalHt: number;
  vatRate: number;
  totalTtc: number;
  status: InvoiceStatus;
  missionId: number;
  missionTitle: string;
  clientName: string;
}

export interface InvoiceStatsResponse {
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
}

export interface InvoiceDetailResponse {
  id: number;
  number: string;
  issueDate: string;
  dueDate: string;
  totalHt: number;
  vatRate: number;
  totalTtc: number;
  status: InvoiceStatus;
  mission: MissionSummaryForInvoiceResponse;
}
