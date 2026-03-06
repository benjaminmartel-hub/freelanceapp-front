import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-dashboard-page',
  imports: [CardModule],
  template: `
    <p-card header="Dashboard" subheader="Vue d'ensemble">
      <p>Retrouvez ici les indicateurs de votre activite.</p>
    </p-card>
  `
})
export class DashboardPageComponent {}
