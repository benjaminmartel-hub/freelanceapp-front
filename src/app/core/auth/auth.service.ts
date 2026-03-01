import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly tokenStorageKey = 'auth_token';
  private logoutTimeoutId: number | null = null;
  private readonly isAuthenticatedSignal = signal<boolean>(false);

  readonly isAuthenticated = this.isAuthenticatedSignal.asReadonly();

  constructor() {
    this.restoreAuthState();
  }

  login(token: string): void {
    if (!this.isBrowser()) {
      return;
    }

    if (this.isTokenExpired(token)) {
      this.logout();
      return;
    }

    sessionStorage.setItem(this.tokenStorageKey, token);
    this.isAuthenticatedSignal.set(true);
    this.scheduleAutoLogout(token);
  }

  logout(): void {
    if (!this.isBrowser()) {
      return;
    }

    this.clearAutoLogoutTimer();
    sessionStorage.removeItem(this.tokenStorageKey);
    this.isAuthenticatedSignal.set(false);
  }

  getToken(): string | null {
    if (!this.isBrowser()) {
      return null;
    }

    const token = sessionStorage.getItem(this.tokenStorageKey);
    if (!token) {
      return null;
    }

    if (this.isTokenExpired(token)) {
      this.logout();
      return null;
    }

    return token;
  }

  // Garde SSR (Angular Universal / pre-render / tests Node)
  // => Est on dans un navigateur ?
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private restoreAuthState(): void {
    if (!this.isBrowser()) {
      return;
    }

    const token = sessionStorage.getItem(this.tokenStorageKey);
    if (!token || this.isTokenExpired(token)) {
      this.logout();
      return;
    }

    this.isAuthenticatedSignal.set(true);
    this.scheduleAutoLogout(token);
  }

  private scheduleAutoLogout(token: string): void {
    this.clearAutoLogoutTimer();

    const expiresAt = this.getTokenExpirationTimestamp(token);
    if (expiresAt === null) {
      this.logout();
      return;
    }

    const msUntilExpiration = expiresAt - Date.now();
    if (msUntilExpiration <= 0) {
      this.logout();
      return;
    }

    this.logoutTimeoutId = window.setTimeout(() => this.logout(), msUntilExpiration);
  }

  private clearAutoLogoutTimer(): void {
    if (this.logoutTimeoutId !== null) {
      window.clearTimeout(this.logoutTimeoutId);
      this.logoutTimeoutId = null;
    }
  }

  private isTokenExpired(token: string): boolean {
    const expiresAt = this.getTokenExpirationTimestamp(token);
    if (expiresAt === null) {
      return true;
    }

    return Date.now() >= expiresAt;
  }

  private getTokenExpirationTimestamp(token: string): number | null {
    const payload = this.decodeJwtPayload(token);
    const exp = payload?.['exp'];
    if (typeof exp !== 'number') {
      return null;
    }

    return exp * 1000;
  }

  private decodeJwtPayload(token: string): Record<string, unknown> | null {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');

    try {
      const decoded = atob(padded);
      const parsed = JSON.parse(decoded);
      return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  }
}
