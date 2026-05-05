import {ChangeDetectionStrategy, Component, inject, signal, computed} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet, Router} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {AuthService} from '../auth/auth.service';
import {AddExpenseDialogComponent} from '../dashboard/add-expense-dialog.component';
import {CommonModule} from '@angular/common';
import {DashboardService} from '../dashboard/dashboard.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, MatIconModule, AddExpenseDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-[100dvh] w-full bg-slate-50 flex overflow-hidden">
      
      <!-- Side Navigation (Desktop/Tablet) -->
      <aside class="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-full flex-shrink-0">
        <div class="p-6">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center text-white">
              <mat-icon class="text-[18px] w-4.5 h-4.5 leading-none">account_balance_wallet</mat-icon>
            </div>
            <span class="font-display font-bold text-xl tracking-tight text-slate-900">PesaFlow</span>
          </div>
        </div>

        <nav class="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          <a routerLink="/dashboard" routerLinkActive="bg-teal-50 text-teal-700 font-semibold" [routerLinkActiveOptions]="{exact: true}"
             class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <mat-icon class="text-[20px] w-5 h-5 leading-none">dashboard</mat-icon>
            <span>Dashboard</span>
          </a>
          <a routerLink="/budget" routerLinkActive="bg-teal-50 text-teal-700 font-semibold"
             class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <mat-icon class="text-[20px] w-5 h-5 leading-none">pie_chart_outline</mat-icon>
            <span>Budget</span>
          </a>
          <a routerLink="/expenses" routerLinkActive="bg-teal-50 text-teal-700 font-semibold"
             class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <mat-icon class="text-[20px] w-5 h-5 leading-none">receipt_long</mat-icon>
            <span>Dépenses</span>
          </a>
          <a routerLink="/savings" routerLinkActive="bg-teal-50 text-teal-700 font-semibold"
             class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <mat-icon class="text-[20px] w-5 h-5 leading-none">savings</mat-icon>
            <span>Épargne</span>
          </a>
        </nav>

        <div class="px-4 py-6 border-t border-slate-100 space-y-4">
           <button 
             (click)="isAddDialogOpen.set(true)"
             class="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98]">
             <mat-icon class="text-[20px] w-5 h-5 leading-none">add_circle</mat-icon>
             Ajouter dépense
           </button>
           <button (click)="authService.logout()" class="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left">
            <mat-icon class="text-[20px] w-5 h-5 leading-none">logout</mat-icon>
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col h-full overflow-hidden relative pb-[4.5rem] md:pb-0">
        <!-- Top Toolbar -->
        <header class="h-16 flex-shrink-0 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white/80 backdrop-blur-md border-b border-slate-200 z-20">
          <div class="flex items-center md:hidden gap-2">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center text-white">
              <mat-icon class="text-[18px] w-4.5 h-4.5 leading-none">account_balance_wallet</mat-icon>
            </div>
            <span class="font-display font-bold text-xl tracking-tight text-slate-900">PesaFlow</span>
          </div>

          <div class="flex-1 md:flex-none"></div>

          <div class="flex items-center gap-4">
             <!-- Currency Switcher -->
             <div class="hidden sm:flex items-center bg-slate-100 rounded-full p-1 h-10">
               @for (cur of ['USD', 'CDF', 'RWF', 'XOF']; track cur) {
                 @let currency = $any(cur);
                 <button 
                   (click)="dashboardService.updateCurrency(currency)"
                   class="px-3 h-full rounded-full text-[10px] font-bold transition-all uppercase"
                   [ngClass]="dashboardService.userConfig()?.currency === currency ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'">
                   {{ currency }}
                 </button>
               }
             </div>

             <button class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors relative">
               <mat-icon class="text-[20px] w-5 h-5 leading-none">notifications_none</mat-icon>
               <span class="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-orange-500 border-2 border-slate-100"></span>
             </button>
             <button class="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 hover:bg-teal-200 transition-colors overflow-hidden">
                <mat-icon class="text-[20px] w-5 h-5 leading-none">person</mat-icon>
             </button>
          </div>
        </header>

        <!-- Page Content -->
        <main class="flex-1 overflow-y-auto custom-scrollbar">
          <router-outlet></router-outlet>
        </main>

        <!-- Desktop FAB (hidden on small mobile where bottom nav is) -->
        <button 
          (click)="isAddDialogOpen.set(true)"
          class="hidden md:flex fixed bottom-8 right-8 w-14 h-14 bg-slate-900 text-white rounded-2xl shadow-2xl items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group shadow-slate-900/20"
        >
          <mat-icon class="text-[28px] w-7 h-7">add</mat-icon>
        </button>
      </div>

       <!-- Bottom Navigation (Mobile) -->
       <nav class="md:hidden fixed bottom-0 inset-x-0 h-[4.5rem] bg-white border-t border-slate-200 z-[60] flex items-center justify-around px-2 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <a routerLink="/dashboard" routerLinkActive="text-teal-600" [routerLinkActiveOptions]="{exact: true}" class="flex flex-col items-center justify-center w-16 h-full text-slate-400 hover:text-slate-600">
          <mat-icon class="text-[24px] w-6 h-6 leading-none mb-1">dashboard</mat-icon>
          <span class="text-[10px] font-medium text-center leading-tight">Accueil</span>
        </a>
        <a routerLink="/budget" routerLinkActive="text-teal-600" class="flex flex-col items-center justify-center w-16 h-full text-slate-400 hover:text-slate-600">
          <mat-icon class="text-[24px] w-6 h-6 leading-none mb-1">pie_chart_outline</mat-icon>
          <span class="text-[10px] font-medium text-center leading-tight">Budget</span>
        </a>
        
        <!-- FAB Add button replacement for mobile -->
        <div class="relative -top-6">
           <button 
             (click)="isAddDialogOpen.set(true)"
             class="w-14 h-14 rounded-full bg-gradient-to-br from-teal-600 to-teal-700 text-white flex items-center justify-center shadow-lg shadow-teal-900/30 active:scale-95 transition-transform border-[6px] border-slate-50">
             <mat-icon class="text-[28px] w-7 h-7 leading-none">add</mat-icon>
           </button>
        </div>

        <a routerLink="/expenses" routerLinkActive="text-teal-600" class="flex flex-col items-center justify-center w-16 h-full text-slate-400 hover:text-slate-600">
          <mat-icon class="text-[24px] w-6 h-6 leading-none mb-1">receipt_long</mat-icon>
          <span class="text-[10px] font-medium text-center leading-tight">Dépenses</span>
        </a>
        <a routerLink="/savings" routerLinkActive="text-teal-600" class="flex flex-col items-center justify-center w-16 h-full text-slate-400 hover:text-slate-600">
          <mat-icon class="text-[24px] w-6 h-6 leading-none mb-1">savings</mat-icon>
          <span class="text-[10px] font-medium text-center leading-tight">Épargne</span>
        </a>
      </nav>

      <!-- Global Add Expense Dialog -->
      @if (isAddDialogOpen()) {
        <app-add-expense-dialog 
          [preselectedType]="isSavingsRoute() ? 'SAVING' : null"
          (onClose)="isAddDialogOpen.set(false)"
        ></app-add-expense-dialog>
      }

    </div>
  `,
  styles: `
    .pb-safe {
      padding-bottom: env(safe-area-inset-bottom);
    }
  `
})
export class AppLayoutComponent {
  authService = inject(AuthService);
  dashboardService = inject(DashboardService);
  router = inject(Router);
  
  isAddDialogOpen = signal(false);

  isSavingsRoute = computed(() => this.router.url.includes('/savings'));
}
