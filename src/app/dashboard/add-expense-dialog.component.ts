import { Component, inject, signal, output, input, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { DashboardService, BudgetLine, Expense } from './dashboard.service';

@Component({
  selector: 'app-add-expense-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  template: `
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div class="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <!-- Header -->
        <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 class="font-display text-xl font-bold text-slate-900">
              {{ editExpense() ? 'Modifier' : (preselectedType() === 'SAVING' ? 'Nouveau dépôt' : 'Nouvelle dépense') }}
            </h2>
            <p class="text-xs text-slate-500">
              {{ editExpense() ? 'Mettez à jour les détails' : (preselectedType() === 'SAVING' ? 'Ajoutez à votre épargne' : 'Ajoutez une transaction rapidement') }}
            </p>
          </div>
          <button (click)="close()" class="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <!-- Form -->
        <form [formGroup]="expenseForm" (ngSubmit)="onSubmit()" class="p-6 space-y-5">
          <!-- Amount -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Montant ({{ dashboardService.getCurrencySymbol() }})</label>
            <div class="relative">
              <input 
                type="number" 
                formControlName="amount" 
                placeholder="0"
                class="w-full h-14 pl-12 pr-4 bg-slate-50 border-2 border-transparent focus:border-teal-500 focus:bg-white rounded-2xl text-xl font-bold transition-all outline-none"
              >
              <mat-icon class="absolute left-4 top-4 text-slate-400">payments</mat-icon>
            </div>
            @if (expenseForm.get('amount')?.touched && expenseForm.get('amount')?.invalid) {
              <p class="text-xs text-red-500 ml-1">Le montant est requis et doit être positif.</p>
            }
          </div>

          <!-- Category (Ligne budgétaire) -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Catégorie</label>
            <div class="relative">
              <select 
                formControlName="categoryIndex" 
                class="w-full h-14 pl-12 pr-10 bg-slate-50 border-2 border-transparent focus:border-teal-500 focus:bg-white rounded-2xl text-slate-700 font-medium transition-all outline-none appearance-none"
              >
                <option value="" disabled>Sélectionner une catégorie</option>
                @for (line of budgetLines(); track $index) {
                  <option [value]="$index">{{ line.name }} ({{ line.type }})</option>
                }
              </select>
              <mat-icon class="absolute left-4 top-4 text-slate-400">category</mat-icon>
              <mat-icon class="absolute right-4 top-4 text-slate-400 pointer-events-none">expand_more</mat-icon>
            </div>
          </div>

          <!-- Payment Method -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Moyen de paiement</label>
            <div class="flex gap-2">
              <label class="flex-1 cursor-pointer">
                <input type="radio" formControlName="paymentMethod" value="CASH" class="sr-only peer">
                <div class="h-12 flex flex-col items-center justify-center rounded-xl border-2 border-slate-100 bg-slate-50 text-slate-500 peer-checked:border-teal-500 peer-checked:bg-teal-50 peer-checked:text-teal-600 transition-all">
                  <mat-icon class="text-sm">payments</mat-icon>
                  <span class="text-[10px] font-bold">Cash</span>
                </div>
              </label>
              <label class="flex-1 cursor-pointer">
                <input type="radio" formControlName="paymentMethod" value="MOBILE_MONEY" class="sr-only peer">
                <div class="h-12 flex flex-col items-center justify-center rounded-xl border-2 border-slate-100 bg-slate-50 text-slate-500 peer-checked:border-teal-500 peer-checked:bg-teal-50 peer-checked:text-teal-600 transition-all">
                  <mat-icon class="text-sm">phonelink_ring</mat-icon>
                  <span class="text-[10px] font-bold">Mobile Money</span>
                </div>
              </label>
              <label class="flex-1 cursor-pointer">
                <input type="radio" formControlName="paymentMethod" value="BANK" class="sr-only peer">
                <div class="h-12 flex flex-col items-center justify-center rounded-xl border-2 border-slate-100 bg-slate-50 text-slate-500 peer-checked:border-teal-500 peer-checked:bg-teal-50 peer-checked:text-teal-600 transition-all">
                  <mat-icon class="text-sm">account_balance</mat-icon>
                  <span class="text-[10px] font-bold">Banque</span>
                </div>
              </label>
            </div>
          </div>

          <!-- Date & Notes -->
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Date</label>
              <input 
                type="date" 
                formControlName="date" 
                class="w-full h-12 px-4 bg-slate-50 border-2 border-transparent focus:border-teal-500 focus:bg-white rounded-xl text-sm transition-all outline-none"
              >
            </div>
            <div class="space-y-1.5 text-right">
              <label class="text-xs font-bold uppercase tracking-wider text-slate-500 mr-1 invisible">Action</label>
              <button 
                type="button" 
                (click)="isNotesOpen.set(!isNotesOpen())"
                class="h-12 w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50"
              >
                <mat-icon class="text-sm">notes</mat-icon>
                {{ isNotesOpen() ? 'Masquer Note' : 'Ajouter Note' }}
              </button>
            </div>
          </div>

          @if (isNotesOpen()) {
            <div class="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
              <label class="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Note / Libellé</label>
              <textarea 
                formControlName="notes" 
                placeholder="Ex: Taxi, Déjeuner, etc."
                class="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-teal-500 focus:bg-white rounded-xl text-sm transition-all outline-none h-20 resize-none font-medium"
              ></textarea>
              @if (expenseForm.get('notes')?.touched && expenseForm.get('notes')?.invalid) {
                <p class="text-xs text-red-500 ml-1">La note est obligatoire.</p>
              }
            </div>
          }

          <!-- Footer Actions -->
          <div class="pt-2 flex gap-3">
            <button 
              type="button" 
              (click)="close()"
              class="flex-1 h-12 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              [disabled]="expenseForm.invalid || isSaving()"
              class="flex-2 h-12 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10"
            >
              @if (isSaving()) {
                <mat-icon class="animate-spin text-sm">refresh</mat-icon>
                {{ editExpense() ? 'Mise à jour...' : 'Enregistrement...' }}
              } @else {
                <mat-icon class="text-sm">{{ editExpense() ? 'save' : 'check_circle' }}</mat-icon>
                {{ editExpense() ? 'Enregistrer' : 'Valider' }}
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class AddExpenseDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  public dashboardService = inject(DashboardService);

  editExpense = input<Expense | null>(null);
  preselectedType = input<'NEED' | 'WANT' | 'SAVING' | null>(null);
  preselectedCategory = input<string | null>(null);
  onClose = output<void>();
  isSaving = signal<boolean>(false);
  isNotesOpen = signal<boolean>(false);
  
  budgetLines = computed(() => {
    const lines = this.dashboardService.userConfig()?.budgetLines || [];
    const type = this.preselectedType();
    if (type) {
      return lines.filter(l => l.type === type);
    }
    return lines;
  });

  expenseForm = this.fb.group({
    amount: [null as number | null, [Validators.required, Validators.min(1)]],
    categoryIndex: ['', Validators.required],
    paymentMethod: ['CASH', Validators.required],
    date: [new Date().toISOString().split('T')[0], Validators.required],
    notes: ['', Validators.required]
  });

  ngOnInit() {
    const expense = this.editExpense();
    const type = this.preselectedType();
    const category = this.preselectedCategory();

    if (expense) {
      const catIndex = this.budgetLines().findIndex((l: BudgetLine) => l.name === expense.categoryName);
      this.expenseForm.patchValue({
        amount: expense.amount,
        categoryIndex: catIndex !== -1 ? String(catIndex) : '',
        paymentMethod: expense.paymentMethod,
        date: new Date(expense.date).toISOString().split('T')[0],
        notes: expense.notes || ''
      });
      if (expense.notes) this.isNotesOpen.set(true);
    } else if (category) {
      const catIndex = this.budgetLines().findIndex((l: BudgetLine) => l.name === category);
      if (catIndex !== -1) {
        this.expenseForm.patchValue({ categoryIndex: String(catIndex) });
      }
    }
  }

  close() {
    this.onClose.emit();
  }

  async onSubmit() {
    if (this.expenseForm.invalid || this.isSaving()) return;

    this.isSaving.set(true);
    const formValue = this.expenseForm.value;
    const selectedLine = this.budgetLines()[Number(formValue.categoryIndex)];
    
    const selectedDate = new Date(formValue.date!);
    const now = new Date();
    
    // Si la date choisie est aujourd'hui, on injecte l'heure actuelle pour la précision
    if (selectedDate.toDateString() === now.toDateString()) {
      selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
    }

    const expenseData: Omit<Expense, 'id'> = {
      amount: formValue.amount!,
      categoryName: selectedLine.name,
      type: selectedLine.type,
      paymentMethod: formValue.paymentMethod as any,
      date: selectedDate,
      notes: formValue.notes || ''
    };

    try {
      const existingExpense = this.editExpense();
      if (existingExpense?.id) {
        await this.dashboardService.updateExpense(existingExpense.id, expenseData);
      } else {
        await this.dashboardService.addExpense(expenseData);
      }
      this.close();
    } catch (e) {
      console.error(e);
    } finally {
      this.isSaving.set(false);
    }
  }
}
