import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  readonly apiBaseUrl = 'http://localhost:8080';
}
