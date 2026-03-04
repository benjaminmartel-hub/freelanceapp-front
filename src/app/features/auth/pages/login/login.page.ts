import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss'
})
export class LoginPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly isLoading = signal(false);
  protected readonly oauthProviders = this.authService.getOauthProviders();
  protected readonly form = this.formBuilder.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  constructor() {
    const tokenFromCallback = this.route.snapshot.queryParamMap.get('token');
    const redirectUrl = this.route.snapshot.queryParamMap.get('redirectUrl') ?? '/dashboard';

    if (this.authService.tryLoginFromCallback(tokenFromCallback)) {
      this.toastService.success('Connexion OAuth reussie.');
      void this.router.navigateByUrl(redirectUrl);
    }
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    this.authService
      .loginWithPassword(this.form.getRawValue())
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.toastService.success('Connexion reussie.');
          const redirectUrl = this.route.snapshot.queryParamMap.get('redirectUrl') ?? '/dashboard';
          void this.router.navigateByUrl(redirectUrl);
        }
      });
  }

  protected loginWithOauth(provider: string): void {
    this.authService.loginWithOauth(provider);
  }

  protected hasError(controlName: 'username' | 'password', errorCode: string): boolean {
    const control = this.form.controls[controlName];
    return control.touched && control.hasError(errorCode);
  }
}
