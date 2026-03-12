import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, ButtonModule, MenubarModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'pi pi-home', routerLink: '/dashboard' },
    { label: 'Missions', icon: 'pi pi-briefcase', routerLink: '/missions' },
    { label: 'Invoices', icon: 'pi pi-file', routerLink: '/invoices' }
  ];

  protected logout(): void {
    this.authService.logout();
    void this.router.navigateByUrl('/auth/login');
  }
}
