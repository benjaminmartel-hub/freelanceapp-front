export type MissionStatus = 'ONGOING' | 'PROSPECT' | 'FINISHED' | 'CANCELLED';

export interface Mission {
  id?: number;
  title: string;
  clientName: string;
  clientId?: number | null;
  clientContactEmail?: string | null;
  dailyRate: number;
  currency?: string | null;
  expectedDuration?: number | null;
  totalBudgetEstimated?: number | null;
  totalInvoiced?: number | null;
  status: MissionStatus;
  startDate?: Date | null;
  endDate?: Date | null;
  billingType?: string | null;
  internalNotes?: string | null;
  invoiceIds?: number[] | null;
  timeProgressPercent?: number | null;
}
