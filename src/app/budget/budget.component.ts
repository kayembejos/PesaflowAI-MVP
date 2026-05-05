import {ChangeDetectionStrategy, Component, inject, OnInit, computed} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {DashboardService} from '../dashboard/dashboard.service';

interface BudgetHistory {
  id: string;
  month: string;
  year: number;
  isActive: boolean;
  type: string;
  income: number;
}

@Component({
  selector: 'app-budget',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      <!-- Header & Actions -->
      <header class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="font-display text-2xl font-bold text-slate-900">Budget</h1>
          <p class="text-slate-500 text-sm">Gérez vos plans et répartitions mensuelles</p>
        </div>
        <div class="flex items-center gap-3 w-full sm:w-auto">
          <button class="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors shadow-sm">
            <mat-icon class="text-[18px] w-[18px] h-[18px]">content_copy</mat-icon>
            Dupliquer (M-1)
          </button>
          <a routerLink="/onboarding" class="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors shadow-md">
            <mat-icon class="text-[18px] w-[18px] h-[18px]">add</mat-icon>
            Nouveau
          </a>
        </div>
      </header>

      <!-- Main Content Card -->
      <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4">
        <div class="p-5 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 class="font-bold text-lg text-slate-900">Historique des budgets</h2>
        </div>
        
        <!-- Desktop Table View -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr class="bg-white text-slate-500 text-sm border-b border-slate-100">
                <th class="font-medium p-4 pl-6 uppercase tracking-wider text-xs">Période</th>
                <th class="font-medium p-4 uppercase tracking-wider text-xs">Type</th>
                <th class="font-medium p-4 uppercase tracking-wider text-xs">Revenu défini</th>
                <th class="font-medium p-4 uppercase tracking-wider text-xs">Statut</th>
                <th class="font-medium p-4 pr-6 text-right uppercase tracking-wider text-xs">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-sm">
              @for (budget of historyBudgets(); track budget.id) {
                <tr class="hover:bg-slate-50/80 transition-colors group">
                  <td class="p-4 pl-6 font-semibold text-slate-900">{{ budget.month }} {{ budget.year }}</td>
                  <td class="p-4 text-slate-600">
                    <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                          [ngClass]="budget.type === '50/30/20' ? 'bg-teal-50 text-teal-700' : 'bg-orange-50 text-orange-700'">
                      <mat-icon class="text-[14px] w-3.5 h-3.5">{{ budget.type === '50/30/20' ? 'pie_chart' : 'tune' }}</mat-icon>
                      {{ budget.type === '50/30/20' ? 'Modèle 50/30/20' : 'Personnalisé' }}
                    </span>
                  </td>
                  <td class="p-4 text-slate-600 font-medium">{{ budget.income | number }} {{ dashboardService.getCurrencySymbol() }}</td>
                  <td class="p-4">
                    @if (budget.isActive) {
                      <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-bold">
                        <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        Actif
                      </span>
                    } @else {
                      <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold">
                        Inactif
                      </span>
                    }
                  </td>
                  <td class="p-4 pr-6 text-right">
                    <button class="text-slate-400 hover:text-teal-600 transition-colors p-2 rounded-lg hover:bg-teal-50 opacity-0 group-hover:opacity-100 focus:opacity-100">
                      <mat-icon class="text-[20px] w-5 h-5 block">edit</mat-icon>
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Mobile Card View -->
        <div class="md:hidden divide-y divide-slate-100">
          @for (budget of historyBudgets(); track budget.id) {
            <div class="p-5 space-y-4 hover:bg-slate-50 transition-colors">
              <div class="flex justify-between items-start">
                <div class="font-bold text-slate-900 text-lg">{{ budget.month }} {{ budget.year }}</div>
                @if (budget.isActive) {
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wider">
                    <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Actif
                  </span>
                } @else {
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                    Inactif
                  </span>
                }
              </div>
              
              <div class="space-y-2">
                <div class="flex justify-between items-center text-sm">
                  <span class="text-slate-500">Type de budget</span>
                  <span class="font-medium text-slate-700 flex items-center gap-1">
                    <mat-icon class="text-[14px] w-3.5 h-3.5">{{ budget.type === '50/30/20' ? 'pie_chart' : 'tune' }}</mat-icon>
                    {{ budget.type === '50/30/20' ? '50/30/20' : 'Custom' }}
                  </span>
                </div>
                <div class="flex justify-between items-center text-sm">
                  <span class="text-slate-500">Revenu défini</span>
                  <span class="font-bold text-slate-900">{{ budget.income | number }} {{ dashboardService.getCurrencySymbol() }}</span>
                </div>
              </div>
              
              <button class="w-full mt-2 py-2 border border-slate-200 rounded-lg text-slate-600 font-medium text-sm flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors">
                <mat-icon class="text-[18px] w-[18px] h-[18px]">edit</mat-icon>
                Gérer les enveloppes
              </button>
            </div>
          }
        </div>

        @if (historyBudgets().length === 0) {
          <div class="p-12 border-t border-slate-100 flex flex-col items-center justify-center text-center">
            <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4">
              <mat-icon class="text-[32px] w-8 h-8 block">search_off</mat-icon>
            </div>
            <h3 class="font-semibold text-slate-900 mb-1">Aucun budget trouvé</h3>
            <p class="text-slate-500 text-sm max-w-xs">Vous n'avez pas encore d'historique budgétaire pour le moment.</p>
          </div>
        }
      </div>
    </div>
  `
})
export class BudgetComponent implements OnInit {
  dashboardService = inject(DashboardService);

  ngOnInit() {
    this.dashboardService.loadDashboardData();
  }

  // Simulated history combining actual active config and fake historical data for demo purposes
  historyBudgets = computed<BudgetHistory[]>(() => {
    const config = this.dashboardService.userConfig();
    if (!config) return [];
    
    return [
      {
        id: 'current',
        month: this.getCurrentMonthString(),
        year: new Date().getFullYear(),
        isActive: true,
        type: config.budgetMode || 'CUSTOM',
        income: config.monthlyIncome
      },
      {
        id: 'past-1',
        month: this.getPastMonthString(1),
        year: this.getPastYear(1),
        isActive: false,
        type: '50/30/20',
        income: Math.floor(config.monthlyIncome * 0.95)
      },
      {
        id: 'past-2',
        month: this.getPastMonthString(2),
        year: this.getPastYear(2),
        isActive: false,
        type: 'CUSTOM',
        income: Math.floor(config.monthlyIncome * 0.8)
      }
    ];
  });

  private getCurrentMonthString(): string {
    return new Date().toLocaleString('fr-FR', { month: 'long' });
  }

  private getPastMonthString(monthsBack: number): string {
    const date = new Date();
    date.setMonth(date.getMonth() - monthsBack);
    return date.toLocaleString('fr-FR', { month: 'long' });
  }

  private getPastYear(monthsBack: number): number {
    const date = new Date();
    date.setMonth(date.getMonth() - monthsBack);
    return date.getFullYear();
  }
}

