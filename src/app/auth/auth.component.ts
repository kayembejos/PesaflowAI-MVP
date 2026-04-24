import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {RouterLink, Router} from '@angular/router';
import {ReactiveFormsModule, FormControl, Validators} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {AuthService} from './auth.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-auth',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, MatIconModule],
  template: `
    <div class="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <!-- Background decorative elements -->
      <div class="absolute -right-20 -top-20 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-20 -z-10 pointer-events-none"></div>
      <div class="absolute -left-20 -bottom-20 w-96 h-96 bg-teal-600 rounded-full mix-blend-multiply filter blur-[100px] opacity-10 -z-10 pointer-events-none"></div>

      <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <a routerLink="/" class="inline-flex items-center gap-2 mb-8 group">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-teal-900/10 group-hover:scale-105 transition-transform">
            <mat-icon class="material-icons-round text-[20px] w-5 h-5">account_balance_wallet</mat-icon>
          </div>
          <span class="font-display font-bold text-2xl tracking-tight text-slate-800">PesaFlow</span>
        </a>
        <h2 class="font-display text-3xl font-bold tracking-tight text-slate-900 mb-2">
          Bienvenue
        </h2>
        <p class="text-slate-500 text-sm">
          Connectez-vous ou créez un compte pour continuer
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-[440px]">
        <div class="bg-white py-10 px-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:rounded-3xl border border-slate-100">
          
          @if (emailSent()) {
            <div class="text-center">
              <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-teal-100 mb-4">
                <mat-icon class="text-teal-600 text-[24px]">mark_email_read</mat-icon>
              </div>
              <h3 class="text-lg font-medium text-slate-900 mb-2">Vérifiez votre boîte mail</h3>
              <p class="text-sm text-slate-500 mb-6">
                Nous avons envoyé un lien de connexion à <strong>{{ emailControl.value }}</strong>. Cliquez sur ce lien pour vous connecter.
              </p>
              <button
                (click)="emailSent.set(false)"
                class="text-teal-600 hover:text-teal-500 text-sm font-medium"
              >
                Utiliser une autre adresse ?
              </button>
            </div>
          } @else {
            <!-- Email Form -->
            <div class="space-y-6">
              <div>
                <label for="email" class="block text-sm font-medium text-slate-700 mb-2">
                  Adresse email
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <mat-icon class="text-[20px] w-5 h-5">mail_outline</mat-icon>
                  </div>
                  <input
                    id="email"
                    type="email"
                    [formControl]="emailControl"
                    class="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors sm:text-sm"
                    placeholder="vous@exemple.com"
                    (keydown.enter)="loginWithEmail()"
                  />
                </div>
                @if (emailControl.invalid && (emailControl.dirty || emailControl.touched)) {
                  <p class="mt-2 text-sm text-red-500 flex items-center gap-1">
                    <mat-icon class="text-[16px] w-4 h-4">error_outline</mat-icon>
                    Veuillez entrer un email valide.
                  </p>
                }
              </div>

              <button
                (click)="loginWithEmail()"
                [disabled]="authService.isLoading() || emailControl.invalid"
                class="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
              >
                @if (authService.isLoading()) {
                  <mat-icon class="animate-spin text-[20px] w-5 h-5">refresh</mat-icon>
                  Chargement...
                } @else {
                  Continuer avec l'email
                  <mat-icon class="text-[18px] w-[18px] h-[18px]">arrow_forward</mat-icon>
                }
              </button>
            </div>

            <div class="mt-8">
              <div class="relative">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-slate-200"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="px-3 bg-white text-slate-500 font-medium">Ou continuer avec</span>
                </div>
              </div>

              <div class="mt-6">
                <button
                  (click)="loginWithGoogle()"
                  [disabled]="authService.isLoading()"
                  class="w-full flex justify-center items-center gap-3 py-3 px-4 border border-slate-200 rounded-xl shadow-sm bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-100 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <!-- Google Icon SVG -->
                  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Compte Google
                </button>
              </div>
            </div>
          }
          
        </div>
        
        <p class="mt-8 text-center text-xs text-slate-500">
          En vous connectant, vous acceptez nos <a href="#" class="text-teal-600 hover:underline">Conditions d'utilisation</a> et notre <a href="#" class="text-teal-600 hover:underline">Politique de confidentialité</a>.
        </p>
      </div>
    </div>
  `
})
export class AuthComponent {
  authService = inject(AuthService);
  router = inject(Router);

  emailControl = new FormControl('', [Validators.required, Validators.email]);
  emailSent = signal<boolean>(false);

  async loginWithEmail() {
    if (this.emailControl.valid && this.emailControl.value) {
      try {
        await this.authService.sendEmailLink(this.emailControl.value);
        this.emailSent.set(true);
      } catch (error) {
        console.error("Erreur, impossible d'envoyer le lien:", error);
      }
    } else {
      this.emailControl.markAsTouched();
    }
  }

  async loginWithGoogle() {
    try {
      await this.authService.loginWithGoogle();
      // Navigation handled centrally in auth.service
    } catch (error) {
      console.error("L'authentification Google a échoué:", error);
    }
  }
}
