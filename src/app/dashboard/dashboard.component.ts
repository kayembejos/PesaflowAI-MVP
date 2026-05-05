import {ChangeDetectionStrategy, Component, inject, OnInit, computed} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {DashboardService} from './dashboard.service';
import {BudgetChartComponent, ChartDataPoint} from './budget-chart.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, BudgetChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      <!-- Header -->
      <header class="flex justify-between items-center">
        <div>
          <h1 class="font-display text-2xl font-bold text-slate-900">Tableau de bord</h1>
          <p class="text-slate-500 text-sm">Aperçu de vos finances ce mois-ci</p>
        </div>
      </header>

      @if (dashboardService.isLoading()) {
        <div class="flex flex-col items-center justify-center p-20 gap-4">
          <mat-icon class="animate-spin text-teal-600 text-[32px] w-8 h-8">refresh</mat-icon>
          <p class="text-slate-500 text-sm font-medium">Chargement des données...</p>
        </div>
      } @else {
        
        <!-- Alerts -->
        @if (isOverBudget()) {
          <div class="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 items-start animate-in fade-in slide-in-from-top-4">
            <mat-icon class="text-red-500 mt-0.5">error_outline</mat-icon>
            <div>
              <h3 class="font-bold text-red-800">Alerte Critique</h3>
              <p class="text-sm text-red-600">Vous avez dépassé votre revenu mensuel ! Il est urgent de revoir vos dépenses.</p>
            </div>
          </div>
        } @else if (usagePercent() > 70) {
          <div class="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex gap-3 items-start animate-in fade-in slide-in-from-top-4">
            <mat-icon class="text-orange-500 mt-0.5">warning_amber</mat-icon>
            <div>
              <h3 class="font-bold text-orange-800">Attention</h3>
              <p class="text-sm text-orange-600">Vous avez déjà utilisé {{ usagePercent() | number:'1.0-0' }}% de votre budget ce mois-ci.</p>
            </div>
          </div>
        } @else if (possibleSavings() < (monthlyIncome() * 0.1)) {
           <div class="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3 items-start animate-in fade-in slide-in-from-top-4">
            <mat-icon class="text-blue-500 mt-0.5">lightbulb</mat-icon>
            <div>
              <h3 class="font-bold text-blue-800">Suggestion</h3>
              <p class="text-sm text-blue-600">Votre capacité d'épargne estimée est faible. Essayez de réduire quelques "Envies" pour l'augmenter.</p>
            </div>
          </div>
        }

        <!-- Top Overview -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Main Card: Balance -->
          <div class="md:col-span-1 bg-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-900/10 flex flex-col justify-between relative overflow-hidden">
            <div class="absolute top-0 right-0 p-4 opacity-10">
              <mat-icon class="text-[120px] w-30 h-30 text-white">account_balance_wallet</mat-icon>
            </div>
            <div class="relative z-10">
              <p class="text-slate-400 text-sm font-medium mb-1">Solde restant</p>
              <h2 class="font-display text-4xl font-bold tracking-tight">{{ balance() | number }} <span class="text-xl text-slate-400 font-normal">{{ dashboardService.getCurrencySymbol() }}</span></h2>
              <div class="mt-4 pt-4 border-t border-slate-800 flex justify-between items-end gap-2">
                 <div class="min-w-0 text-slate-100">
                   <p class="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-0.5">Revenu</p>
                   <p class="font-semibold text-sm truncate">{{ monthlyIncome() | number }} {{ dashboardService.getCurrencySymbol() }}</p>
                 </div>
                 <div class="text-right min-w-0">
                   <p class="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-0.5">Épargne possible</p>
                   <p class="font-semibold text-teal-400 text-sm truncate">{{ possibleSavings() | number }} {{ dashboardService.getCurrencySymbol() }}</p>
                 </div>
              </div>
            </div>
          </div>

          <!-- Total Expenses & Progress -->
          <div class="md:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-center">
            <div class="flex justify-between items-end mb-4">
              <div>
                <p class="text-slate-500 text-sm font-medium mb-1">Dépenses totales</p>
                <div class="flex items-baseline gap-2">
                  <h3 class="font-display text-3xl font-bold text-slate-900">{{ totalExpenses() | number }}</h3>
                  <span class="text-slate-400 font-medium tracking-tight">{{ dashboardService.getCurrencySymbol() }}</span>
                </div>
              </div>
              <div class="text-right">
                <span class="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">
                  {{ usagePercent() | number:'1.0-0' }}% Utilisé
                </span>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all duration-1000 ease-out"
                   [ngClass]="getProgressBarColor(usagePercent())"
                   [style.width.%]="usagePercent() > 100 ? 100 : usagePercent()">
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- Category Summary -->
          <div class="lg:col-span-1 space-y-4">
            <h3 class="font-semibold text-slate-900 text-lg">Résumé par type</h3>
            <div class="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
              
              <!-- NEED -->
              <div>
                <div class="flex justify-between text-sm mb-1 line-clamp-1">
                  <span class="font-medium flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-teal-500"></span>Besoins</span>
                  <span class="text-slate-500 text-xs">{{ expensesByType().NEED | number }} / {{ budgetedByType().NEED | number }}</span>
                </div>
                <div class="h-1.5 w-full bg-slate-100 rounded-full">
                  <div class="h-full bg-teal-500 rounded-full" [style.width.%]="getPercent(expensesByType().NEED, budgetedByType().NEED)"></div>
                </div>
              </div>

              <!-- WANT -->
              <div>
                <div class="flex justify-between text-sm mb-1 line-clamp-1">
                  <span class="font-medium flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-orange-500"></span>Envies</span>
                  <span class="text-slate-500 text-xs">{{ expensesByType().WANT | number }} / {{ budgetedByType().WANT | number }}</span>
                </div>
                <div class="h-1.5 w-full bg-slate-100 rounded-full">
                  <div class="h-full bg-orange-500 rounded-full" [style.width.%]="getPercent(expensesByType().WANT, budgetedByType().WANT)"></div>
                </div>
              </div>

              <!-- SAVING -->
              <div>
                <div class="flex justify-between text-sm mb-1 line-clamp-1">
                  <span class="font-medium flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>Épargne</span>
                  <span class="text-slate-500 text-xs">{{ expensesByType().SAVING | number }} / {{ budgetedByType().SAVING | number }}</span>
                </div>
                <div class="h-1.5 w-full bg-slate-100 rounded-full">
                  <div class="h-full bg-blue-500 rounded-full" [style.width.%]="getPercent(expensesByType().SAVING, budgetedByType().SAVING)"></div>
                </div>
              </div>
            </div>
            
            <h3 class="font-semibold text-slate-900 text-lg pt-4">Dernières dépenses</h3>
            <div class="bg-white rounded-3xl p-2 border border-slate-100 shadow-sm">
              @if (recentExpenses().length === 0) {
                <div class="py-8 text-center text-slate-400 text-sm">Aucune dépense récente.</div>
              } @else {
                <div class="divide-y divide-slate-100">
                  @for (expense of recentExpenses(); track expense.id) {
                    <div class="p-3 flex items-center justify-between">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                             [ngClass]="{
                               'bg-teal-50 text-teal-600': expense.type === 'NEED',
                               'bg-orange-50 text-orange-600': expense.type === 'WANT',
                               'bg-blue-50 text-blue-600': expense.type === 'SAVING'
                             }">
                          <mat-icon class="text-[20px] w-5 h-5">
                            {{ expense.type === 'NEED' ? 'shopping_cart' : expense.type === 'WANT' ? 'star' : 'savings' }}
                          </mat-icon>
                        </div>
                        <div class="min-w-0">
                          <p class="font-medium text-slate-900 text-sm truncate">{{ expense.categoryName }}</p>
                          <p class="text-xs text-slate-500">{{ expense.date | date:'dd MMM, HH:mm' }}</p>
                        </div>
                      </div>
                      <div class="font-semibold text-slate-900 text-sm pl-2">
                        -{{ expense.amount | number }}
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Chart Area -->
          <div class="lg:col-span-2">
            <h3 class="font-semibold text-slate-900 text-lg mb-4">Évolution des catégories (Mois courant vs M-1)</h3>
            <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm min-h-[350px] flex flex-col relative w-full overflow-hidden">
               <!-- Legend -->
               <div class="flex flex-wrap gap-4 justify-end mb-4 text-xs font-medium text-slate-500">
                 <div class="flex items-center gap-1.5"><span class="w-4 h-1 bg-slate-300 border-t border-slate-300 border-dashed"></span> Mois PRÉCÉDENT</div>
                 <div class="flex items-center gap-1.5"><span class="w-4 h-1 bg-teal-600"></span> Mois COURANT</div>
               </div>
               
               <div class="flex-1 relative min-h-[300px] w-full">
                 @if (chartData() && chartData().length > 0) {
                   <app-budget-chart [data]="chartData()"></app-budget-chart>
                 } @else {
                   <div class="absolute inset-0 flex items-center justify-center text-center p-4">
                      <p class="text-slate-500 text-sm max-w-xs">Vous n'avez pas encore défini de lignes budgétaires ou nous manquons de données.</p>
                   </div>
                 }
               </div>
               
            </div>
          </div>

        </div>
      }
    </div>
  `
})
export class DashboardComponent implements OnInit {
  dashboardService = inject(DashboardService);

  ngOnInit() {
    this.dashboardService.loadDashboardData();
  }

  // Computed Values
  monthlyIncome = computed(() => this.dashboardService.userConfig()?.monthlyIncome || 0);
  
  totalExpenses = computed(() => {
    return this.dashboardService.expenses().reduce((sum, exp) => sum + exp.amount, 0);
  });

  balance = computed(() => this.monthlyIncome() - this.totalExpenses());

  usagePercent = computed(() => {
    const inc = this.monthlyIncome();
    if (inc <= 0) return 0;
    return (this.totalExpenses() / inc) * 100;
  });

  isOverBudget = computed(() => this.usagePercent() > 100);

  budgetedByType = computed(() => {
    const lines = this.dashboardService.userConfig()?.budgetLines || [];
    return {
      NEED: lines.filter(l => l.type === 'NEED').reduce((sum, l) => sum + l.amount, 0),
      WANT: lines.filter(l => l.type === 'WANT').reduce((sum, l) => sum + l.amount, 0),
      SAVING: lines.filter(l => l.type === 'SAVING').reduce((sum, l) => sum + l.amount, 0),
    };
  });

  expensesByType = computed(() => {
    const exps = this.dashboardService.expenses();
    return {
      NEED: exps.filter(e => e.type === 'NEED').reduce((sum, e) => sum + e.amount, 0),
      WANT: exps.filter(e => e.type === 'WANT').reduce((sum, e) => sum + e.amount, 0),
      SAVING: exps.filter(e => e.type === 'SAVING').reduce((sum, e) => sum + e.amount, 0),
    };
  });

  possibleSavings = computed(() => {
    const budgetedNeeds = this.budgetedByType().NEED;
    const spentNeeds = this.expensesByType().NEED;
    const remainingNeeds = Math.max(0, budgetedNeeds - spentNeeds);
    return Math.max(0, this.balance() - remainingNeeds);
  });

  recentExpenses = computed(() => {
    return this.dashboardService.expenses().slice(0, 5);
  });

  chartData = computed<ChartDataPoint[]>(() => {
    const lines = this.dashboardService.userConfig()?.budgetLines || [];
    if (lines.length === 0) return [];

    const exps = this.dashboardService.expenses();
    
    // Group expenses by category
    const expenseMap = new Map<string, number>();
    exps.forEach(e => {
      expenseMap.set(e.categoryName, (expenseMap.get(e.categoryName) || 0) + e.amount);
    });

    return lines.map(line => {
      const currentSpent = expenseMap.get(line.name) || 0;
      // Mock previous month data based on budget (realistic variation)
      const previousMock = Math.floor(Math.max(0, line.amount * (0.8 + Math.random() * 0.3))); 
      
      return {
        category: line.name,
        current: currentSpent,
        previous: previousMock
      };
    });
  });

  getPercent(value: number, total: number): number {
    if (total <= 0) return value > 0 ? 100 : 0;
    return Math.min(100, (value / total) * 100);
  }

  getProgressBarColor(percent: number): string {
    if (percent < 50) return 'bg-teal-500';
    if (percent < 80) return 'bg-orange-500';
    return 'bg-red-500';
  }
}

