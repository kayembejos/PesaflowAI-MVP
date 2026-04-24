import {ChangeDetectionStrategy, Component, inject, OnInit, signal, computed} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {DashboardService, Expense, BudgetLine} from '../dashboard/dashboard.service';
import {AddExpenseDialogComponent} from '../dashboard/add-expense-dialog.component';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, MatIconModule, AddExpenseDialogComponent, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto relative h-full min-h-[calc(100vh-140px)]">
      
      <!-- Header -->
      <header class="flex justify-between items-center">
        <div>
          <h1 class="font-display text-2xl font-bold text-slate-900">Dépenses</h1>
          <p class="text-slate-500 text-sm">Gestion détaillée de vos transactions</p>
        </div>
      </header>

      <!-- Filters -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-4">
        <!-- Category Filter -->
        <div class="bg-white rounded-2xl border border-slate-100 p-1 shadow-sm">
          <select 
            [(ngModel)]="selectedCategory"
            class="w-full h-10 px-3 bg-transparent text-sm font-medium text-slate-600 outline-none"
          >
            <option value="">Toutes les catégories</option>
            @for (line of budgetLines(); track line.name) {
              <option [value]="line.name">{{ line.name }}</option>
            }
          </select>
        </div>

        <!-- Month Filter (Simplified for demo) -->
        <div class="bg-white rounded-2xl border border-slate-100 p-1 shadow-sm">
          <select 
            [(ngModel)]="selectedMonth"
            class="w-full h-10 px-3 bg-transparent text-sm font-medium text-slate-600 outline-none"
          >
            <option [value]="currentMonthYear">{{ currentMonthYearLabel }}</option>
            <option value="2026-03">Mars 2026</option>
            <option value="2026-02">Février 2026</option>
          </select>
        </div>
      </div>

      <!-- Expenses Table Card -->
      <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-100">
                <th class="p-4 pl-6 text-xs font-bold uppercase tracking-wider text-slate-500">Date</th>
                <th class="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Libellé</th>
                <th class="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Ligne budgétaire</th>
                <th class="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Méthode</th>
                <th class="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Montant</th>
                <th class="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Solde Ligne</th>
                <th class="p-4 pr-6 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (expense of filteredExpenses(); track expense.id) {
                <tr class="hover:bg-slate-50/80 transition-colors group">
                  <td class="p-4 pl-6">
                    <div class="flex flex-col">
                      <span class="font-semibold text-slate-900 text-sm">{{ expense.date | date:'dd MMM yyyy' }}</span>
                      <span class="text-[10px] text-slate-400 font-medium">{{ expense.date | date:'HH:mm' }}</span>
                    </div>
                  </td>
                  <td class="p-4 text-sm text-slate-600 font-medium">{{ expense.notes }}</td>
                  <td class="p-4">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide"
                          [ngClass]="{
                            'bg-teal-50 text-teal-700': expense.type === 'NEED',
                            'bg-orange-50 text-orange-700': expense.type === 'WANT',
                            'bg-blue-50 text-blue-700': expense.type === 'SAVING'
                          }">
                       {{ expense.categoryName }}
                    </span>
                  </td>
                  <td class="p-4">
                    <div class="flex items-center gap-1.5 text-slate-500">
                       <mat-icon class="text-[16px] w-4 h-4">{{ getPaymentIcon(expense.paymentMethod) }}</mat-icon>
                       <span class="text-[11px] font-medium">{{ getPaymentLabel(expense.paymentMethod) }}</span>
                    </div>
                  </td>
                  <td class="p-4 font-bold text-slate-900 text-sm">-{{ expense.amount | number }} FCFA</td>
                  <td class="p-4 text-right">
                    <div class="flex flex-col items-end">
                       <span class="text-sm font-bold" [ngClass]="getRemainingColor(expense.categoryName)">
                         {{ getRemainingBudget(expense.categoryName) | number }} FCFA
                       </span>
                       <div class="w-16 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                          <div class="h-full bg-teal-500 rounded-full" 
                               [ngClass]="getRemainingColor(expense.categoryName, true)"
                               [style.width.%]="getRemainingPercent(expense.categoryName)"></div>
                       </div>
                    </div>
                  </td>
                  <td class="p-4 pr-6 text-right">
                    <div class="flex items-center justify-end gap-2">
                       <button 
                         (click)="openEditDialog(expense)"
                         class="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                         title="Modifier"
                       >
                         <mat-icon class="text-[18px] w-4.5 h-4.5">edit</mat-icon>
                       </button>
                       <button 
                         (click)="onDeleteExpense(expense)"
                         class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                         title="Supprimer"
                       >
                         <mat-icon class="text-[18px] w-4.5 h-4.5">delete</mat-icon>
                       </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="p-12 text-center">
                    <div class="flex flex-col items-center gap-3">
                      <div class="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                        <mat-icon class="text-[28px] w-7 h-7">search_off</mat-icon>
                      </div>
                      <p class="text-slate-400 text-sm font-medium">Aucune dépense ne correspond à vos critères.</p>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
      <!-- Edit Expense Dialog -->
      @if (expenseToEdit()) {
        <app-add-expense-dialog 
          [editExpense]="expenseToEdit()" 
          (onClose)="expenseToEdit.set(null)"
        ></app-add-expense-dialog>
      }
    </div>
  `
})
export class ExpensesComponent implements OnInit {
  dashboardService = inject(DashboardService);

  selectedCategory = signal('');
  selectedMonth = signal('');
  expenseToEdit = signal<Expense | null>(null);

  currentMonthYear = new Date().toISOString().slice(0, 7);
  currentMonthYearLabel = new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' });

  ngOnInit() {
    this.dashboardService.loadDashboardData();
    this.selectedMonth.set(this.currentMonthYear);
  }

  budgetLines = computed(() => this.dashboardService.userConfig()?.budgetLines || []);
  expenses = computed(() => this.dashboardService.expenses());

  filteredExpenses = computed(() => {
    let exps = this.expenses();
    const cat = this.selectedCategory();
    const month = this.selectedMonth();

    if (cat) {
      exps = exps.filter(e => e.categoryName === cat);
    }
    
    // Month filter is simplified here as we only fetch current month in dashboardService
    // In a real app, this would trigger a new fetch if needed.

    return exps;
  });

  getRemainingBudget(categoryName: string): number {
    const line = this.budgetLines().find(l => l.name === categoryName);
    if (!line) return 0;
    
    const spent = this.expenses()
      .filter(e => e.categoryName === categoryName)
      .reduce((sum, e) => sum + e.amount, 0);
      
    return line.amount - spent;
  }

  getRemainingPercent(categoryName: string): number {
    const line = this.budgetLines().find(l => l.name === categoryName);
    if (!line || line.amount <= 0) return 0;
    
    const spent = this.expenses()
      .filter(e => e.categoryName === categoryName)
      .reduce((sum, e) => sum + e.amount, 0);
      
    return Math.max(0, Math.min(100, ((line.amount - spent) / line.amount) * 100));
  }

  getRemainingColor(categoryName: string, isBg = false): string {
    const percent = this.getRemainingPercent(categoryName);
    if (percent > 40) return isBg ? 'bg-teal-500' : 'text-teal-600';
    if (percent > 10) return isBg ? 'bg-orange-500' : 'text-orange-600';
    return isBg ? 'bg-red-500' : 'text-red-600';
  }

  getPaymentIcon(method: string): string {
    switch (method) {
      case 'CASH': return 'payments';
      case 'MOBILE_MONEY': return 'phonelink_ring';
      case 'BANK': return 'account_balance';
      default: return 'help_outline';
    }
  }

  getPaymentLabel(method: string): string {
    switch (method) {
      case 'CASH': return 'Cash';
      case 'MOBILE_MONEY': return 'M-Money';
      case 'BANK': return 'Banque';
      default: return method;
    }
  }

  openEditDialog(expense: Expense) {
    this.expenseToEdit.set(expense);
  }

  async onDeleteExpense(expense: Expense) {
    if (!expense.id) return;
    
    const confirmDelete = confirm(`Voulez-vous vraiment supprimer cette dépense de ${expense.amount} FCFA ?`);
    if (confirmDelete) {
      try {
        await this.dashboardService.deleteExpense(expense.id);
      } catch (e) {
        alert("Erreur lors de la suppression de la dépense.");
      }
    }
  }
}
