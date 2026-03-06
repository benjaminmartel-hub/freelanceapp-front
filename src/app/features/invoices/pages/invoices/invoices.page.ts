import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-invoices-page',
  imports: [CardModule],
  template: `
    <p-card header="Invoices" subheader="Facturation">
      <p>Generez et consultez vos factures dans une interface unifiee.</p>
    </p-card>
  `
})
export class InvoicesPageComponent {}
