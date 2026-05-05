import {ChangeDetectionStrategy, Component, inject, computed} from '@angular/core';
import {DashboardService} from '../dashboard/dashboard.service';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {AddExpenseDialogComponent} from '../dashboard/add-expense-dialog.component';

@Component({
  selector: 'app-savings',
  standalone: true,
  imports: [CommonModule, MatIconModule, AddExpenseDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 class="font-display text-3xl font-bold text-slate-900 mb-2">Épargne</h1>
        <p class="text-slate-500">Gérez vos objectifs financiers et vos mises de côté.</p>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div class="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 mb-4">
            <mat-icon>account_balance_wallet</mat-icon>
          </div>
          <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Épargne Mensuelle</p>
          <p class="text-2xl font-bold text-slate-900">{{ totalTargetSavings() | number }} {{ dashboardService.getCurrencySymbol() }}</p>
          <p class="text-[11px] text-slate-400 mt-2">Objectif basé sur votre budget</p>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div class="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 mb-4">
            <mat-icon>trending_up</mat-icon>
          </div>
          <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Déjà épargné</p>
          <p class="text-2xl font-bold text-teal-600">{{ totalCurrentSavings() | number }} {{ dashboardService.getCurrencySymbol() }}</p>
          <p class="text-[11px] text-slate-400 mt-2">Ce mois-ci</p>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div class="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
            <mat-icon>pie_chart</mat-icon>
          </div>
          <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Reste à épargner</p>
          <p class="text-2xl font-bold text-slate-900">{{ (totalTargetSavings() - totalCurrentSavings()) | number }} {{ dashboardService.getCurrencySymbol() }}</p>
          <p class="text-[11px] text-slate-400 mt-2">Pour atteindre vos objectifs</p>
        </div>
      </div>

      <!-- Goals List -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-slate-900">Vos objectifs d'épargne</h2>
          <button 
            (click)="isAddSavingsOpen = true"
            class="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-teal-700 transition-all">
            <mat-icon class="text-[18px] w-4.5 h-4.5">add</mat-icon>
            Épargner
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          @for (saving of savingsLines(); track saving.name) {
            <div class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:border-teal-200 transition-all group">
              <div class="flex justify-between items-start mb-6">
                <div>
                  <h3 class="font-bold text-slate-900 text-lg">{{ saving.name }}</h3>
                  <p class="text-xs text-slate-500 uppercase font-bold tracking-wider mt-1">Ligne Budgétaire</p>
                </div>
                <div class="p-2 bg-slate-50 rounded-lg group-hover:bg-teal-50 transition-colors">
                  <mat-icon class="text-slate-400 group-hover:text-teal-600">savings</mat-icon>
                </div>
              </div>

              <div class="space-y-4">
                <div class="flex justify-between items-end">
                  <span class="text-slate-500 text-sm">Progression ce mois</span>
                  <span class="text-slate-900 font-bold">
                    {{ getProgress(saving.name) | number }} / {{ saving.amount | number }}
                    <span class="text-[10px] text-slate-400 ml-1">{{ dashboardService.getCurrencySymbol() }}</span>
                  </span>
                </div>
                
                <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div class="h-full bg-teal-500 rounded-full transition-all duration-1000" 
                    [style.width.%]="getPercent(saving.name)"></div>
                </div>

                <div class="pt-4 border-t border-slate-50 flex justify-between items-center">
                  <span class="text-xs px-2 py-1 rounded bg-slate-100 text-slate-600 font-bold uppercase">
                    {{ getPercent(saving.name) | number:'1.0-0' }}%
                  </span>
                  <button 
                    (click)="openQuickSaving(saving.name)"
                    class="text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors uppercase tracking-wider">
                    Ajouter un dépôt
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Add Saving Dialog -->
      @if (isAddSavingsOpen) {
        <app-add-expense-dialog 
          [preselectedType]="'SAVING'"
          [preselectedCategory]="selectedCategory"
          (onClose)="isAddSavingsOpen = false; selectedCategory = ''"
        ></app-add-expense-dialog>
      }
    </div>
  `
})
export class SavingsComponent {
  dashboardService = inject(DashboardService);
  isAddSavingsOpen = false;
  selectedCategory = '';

  savingsLines = computed(() => {
    return this.dashboardService.userConfig()?.budgetLines.filter(l => l.type === 'SAVING') || [];
  });

  totalTargetSavings = computed(() => {
    return this.savingsLines().reduce((acc, l) => acc + l.amount, 0);
  });

  totalCurrentSavings = computed(() => {
    return this.dashboardService.expenses()
      .filter(e => e.type === 'SAVING')
      .reduce((acc, e) => acc + e.amount, 0);
  });

  getProgress(categoryName: string): number {
    return this.dashboardService.expenses()
      .filter(e => e.categoryName === categoryName)
      .reduce((acc, e) => acc + e.amount, 0);
  }

  getPercent(categoryName: string): number {
    const target = this.savingsLines().find(l => l.name === categoryName)?.amount || 0;
    if (target === 0) return 0;
    return Math.min(100, (this.getProgress(categoryName) / target) * 100);
  }

  openQuickSaving(categoryName: string) {
    this.selectedCategory = categoryName;
    this.isAddSavingsOpen = true;
  }
}
