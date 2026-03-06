import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly messageService = inject(MessageService);

  success(message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Succes',
      detail: message
    });
  }

  error(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: message
    });
  }
}
