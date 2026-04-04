import { MissionStatus } from '../../../core/models/mission.model';

export type MissionStatusSeverity = 'success' | 'warn' | 'danger';

export function getMissionStatusSeverity(status: MissionStatus): MissionStatusSeverity | undefined {
  switch (status) {
    case 'ONGOING':
      return 'success';
    case 'PROSPECT':
      return 'warn';
    case 'FINISHED':
      return 'danger';
    case 'CANCELLED':
      return 'danger';
    default:
      return undefined;
  }
}

export function getMissionStatusLabel(status: MissionStatus): string {
  switch (status) {
    case 'ONGOING':
      return 'En cours';
    case 'PROSPECT':
      return 'Prospect';
    case 'FINISHED':
      return 'Terminee';
    case 'CANCELLED':
      return 'Annulee';
    default:
      return status;
  }
}
