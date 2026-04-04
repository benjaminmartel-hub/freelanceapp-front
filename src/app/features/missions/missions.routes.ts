import { Routes } from '@angular/router';
import { MissionDetailPageComponent } from './pages/mission-detail/mission-detail.page';
import { MissionFeatureComponent } from './pages/missions/missions.page';

export const MISSIONS_ROUTES: Routes = [
  {
    path: '',
    component: MissionFeatureComponent
  },
  {
    path: ':id',
    component: MissionDetailPageComponent
  }
];
