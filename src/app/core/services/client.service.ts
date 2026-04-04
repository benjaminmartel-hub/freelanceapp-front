import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Client } from '../models/client.model';
import { ApiService } from './api.service';
import { ConfigService } from './config.service';

interface ClientResponse {
  id: number;
  name: string;
  contactEmail: string;
}

@Injectable({ providedIn: 'root' })
export class ClientService {
  private readonly apiUrl: string;

  constructor(
    private readonly api: ApiService,
    configService: ConfigService
  ) {
    this.apiUrl = `${configService.apiBaseUrl}/clients`;
  }

  getClients(): Observable<Client[]> {
    return this.api.get<ClientResponse[]>(this.apiUrl).pipe(
      map((clients) =>
        clients.map((client) => ({
          id: client.id,
          name: client.name,
          contactEmail: client.contactEmail
        }))
      )
    );
  }

  createClient(payload: { name: string; contactEmail?: string | null }): Observable<Client> {
    return this.api.post<typeof payload, ClientResponse>(this.apiUrl, payload).pipe(
      map((client) => ({
        id: client.id,
        name: client.name,
        contactEmail: client.contactEmail
      }))
    );
  }
}
