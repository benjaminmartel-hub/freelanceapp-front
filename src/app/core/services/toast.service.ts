import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  success(message: string): void {
    console.info(`[SUCCESS] ${message}`);
  }

  error(message: string): void {
    console.error(`[ERROR] ${message}`);
  }
}