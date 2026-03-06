import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-missions-page',
  imports: [CardModule],
  template: `
    <p-card header="Missions" subheader="Gestion des missions">
      <p>Creez, mettez a jour et suivez vos missions depuis cette page.</p>
    </p-card>
  `
})
export class MissionsPageComponent {}
