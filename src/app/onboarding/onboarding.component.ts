import {ChangeDetectionStrategy, Component, inject, signal, computed} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule, FormControl, Validators} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {Router} from '@angular/router';
import {doc, updateDoc, serverTimestamp} from 'firebase/firestore';
import {AuthService} from '../auth/auth.service';
import {db} from '../firebase';

interface BudgetLine {
  id: string; // unique local ID during creation
  name: string;
  type: 'NEED' | 'WANT' | 'SAVING';
  amount: number;
}

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-slate-50 flex flex-col pt-12 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <!-- Decorators -->
      <div class="fixed top-0 inset-x-0 h-1 bg-slate-200">
        <div class="h-full bg-teal-500 transition-all duration-500 ease-out" [style.width]="progressPercentage()"></div>
      </div>

      <div class="max-w-3xl w-full mx-auto relative z-10 flex-1 flex flex-col justify-center">
        
        <!-- Header -->
        <div class="text-center mb-10">
          <div class="inline-flex items-center gap-2 mb-2">
            <span class="text-sm font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full uppercase tracking-wider">Étape {{ step() }} sur 3</span>
          </div>
          <h1 class="font-display text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            {{ stepTitle() }}
          </h1>
          <p class="text-slate-500 text-base md:text-lg">
            {{ stepDescription() }}
          </p>
        </div>

        <!-- Cards Container -->
        <div class="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-900/5 p-6 md:p-10 relative overflow-hidden">
          
          <!-- STEP 1: Income -->
          @if (step() === 1) {
            <div class="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <label class="block text-sm font-semibold text-slate-700 mb-4 text-left">
                Revenu mensuel estimé
              </label>
              <div class="relative flex items-center">
                <input
                  type="number"
                  [formControl]="incomeControl"
                  class="block w-full pl-6 pr-20 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-2xl font-display font-bold text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                  placeholder="0"
                />
                <div class="absolute right-6 font-bold text-slate-400">
                  {{ currencyControl.value || 'FCFA' }}
                </div>
              </div>
              <p class="mt-4 text-sm text-slate-500 flex items-center gap-2">
                <mat-icon class="text-[18px] w-[18px] h-[18px]">info</mat-icon>
                Même si vos revenus varient, indiquez une moyenne réaliste. Vous pourrez ajuster cette valeur chaque mois.
              </p>
            </div>
          }

          <!-- STEP 2: Currency -->
          @if (step() === 2) {
            <div class="animate-in fade-in slide-in-from-right-8 duration-500">
               <label class="block text-sm font-semibold text-slate-700 mb-4 text-left">
                 Devise principale
               </label>
               <div class="grid grid-cols-2 gap-4">
                 @for (cur of ['XOF', 'USD', 'CDF', 'RWF']; track cur) {
                   <button 
                     (click)="currencyControl.setValue($any(cur))"
                     [class.border-teal-500]="currencyControl.value === cur"
                     [class.bg-teal-50]="currencyControl.value === cur"
                     class="flex items-center justify-between p-4 rounded-xl border-2 border-slate-100 font-bold text-slate-700 transition-all">
                     <span>{{ cur }}</span>
                     @if (currencyControl.value === cur) {
                       <mat-icon class="text-teal-600">check_circle</mat-icon>
                     }
                   </button>
                 }
               </div>
            </div>
          }

          <!-- STEP 3: Mode Selection -->
          @if (step() === 3) {
            <div class="animate-in fade-in slide-in-from-right-8 duration-500 grid gap-4 grid-cols-1 md:grid-cols-2">
              <button 
                (click)="selectMode('50/30/20')"
                [class.border-teal-500]="selectedMode() === '50/30/20'"
                [class.bg-teal-50]="selectedMode() === '50/30/20'"
                [class.ring-2]="selectedMode() === '50/30/20'"
                [class.ring-teal-500]="selectedMode() === '50/30/20'"
                class="text-left p-6 rounded-2xl border-2 border-slate-100 hover:border-teal-200 hover:bg-slate-50 transition-all group">
                <div class="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-teal-600 mb-4 group-hover:scale-110 transition-transform">
                  <mat-icon>pie_chart</mat-icon>
                </div>
                <h3 class="font-bold text-lg text-slate-900 mb-2">Modèle 50/30/20</h3>
                <p class="text-sm text-slate-500 leading-relaxed">
                  Idéal pour débuter. Vos revenus sont répartis automatiquement : 50% Besoins, 30% Envies, 20% Épargne.
                </p>
              </button>

              <button 
                (click)="selectMode('CUSTOM')"
                [class.border-teal-500]="selectedMode() === 'CUSTOM'"
                [class.bg-teal-50]="selectedMode() === 'CUSTOM'"
                [class.ring-2]="selectedMode() === 'CUSTOM'"
                [class.ring-teal-500]="selectedMode() === 'CUSTOM'"
                class="text-left p-6 rounded-2xl border-2 border-slate-100 hover:border-teal-200 hover:bg-slate-50 transition-all group">
                <div class="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-orange-500 mb-4 group-hover:scale-110 transition-transform">
                  <mat-icon>tune</mat-icon>
                </div>
                <h3 class="font-bold text-lg text-slate-900 mb-2">Personnalisé</h3>
                <p class="text-sm text-slate-500 leading-relaxed">
                  Créez vos propres catégories, ajustez tous les pourcentages, et concevez un plan sur-mesure.
                </p>
              </button>
            </div>
          }

          <!-- STEP 4: Categories & Validation -->
          @if (step() === 4) {
            <div class="animate-in fade-in slide-in-from-right-8 duration-500">
              
              <!-- Budget Info Bar -->
              <div class="flex items-center justify-between mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total à allouer</p>
                  <p class="font-display font-bold text-xl text-slate-900">{{ incomeControl.value | number }} {{ currencyControl.value }}</p>
                </div>
                <div class="text-right">
                  <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Reste à allouer</p>
                  <p class="font-display font-bold text-xl" [class.text-red-500]="remainingToAllocate() < 0" [class.text-teal-600]="remainingToAllocate() >= 0">
                    {{ remainingToAllocate() | number }} {{ currencyControl.value }}
                  </p>
                </div>
              </div>

              <!-- Lines List -->
              <div class="space-y-3 max-h-[50vh] overflow-y-auto pr-2 pb-6 custom-scrollbar">
                @for (line of budgetLines(); track line.id) {
                  <div class="flex flex-col sm:flex-row gap-3 sm:items-center p-3 bg-white border border-slate-200 rounded-xl shadow-sm group">
                    <div class="flex-1 min-w-0">
                      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between sm:justify-start gap-2 sm:gap-4">
                        <input 
                          type="text" 
                          [value]="line.name" 
                          (input)="updateLineName(line.id, $event)"
                          class="font-medium text-slate-900 bg-transparent border-none focus:ring-0 p-0 hover:bg-slate-50 flex-1 min-w-0 truncate rounded px-1 transition-colors w-full" 
                          placeholder="Nom de la ligne..."
                        />
                        <button (click)="cycleLineType(line.id)" class="text-[10px] sm:text-xs font-semibold px-2 py-1 rounded-md shrink-0 focus:outline-none transition-colors" 
                              [ngClass]="{
                                'bg-teal-100 text-teal-700 hover:bg-teal-200': line.type === 'NEED',
                                'bg-orange-100 text-orange-700 hover:bg-orange-200': line.type === 'WANT',
                                'bg-blue-100 text-blue-700 hover:bg-blue-200': line.type === 'SAVING'
                              }">
                          {{ getTypeName(line.type) }}
                        </button>
                      </div>
                    </div>
                    
                    <div class="flex items-center gap-3 w-full sm:w-auto">
                      <div class="relative flex-1 sm:w-32">
                        <input 
                          type="number" 
                          [value]="line.amount" 
                          (input)="updateLineAmount(line.id, $event)"
                          class="w-full text-right font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-3 pr-2 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                        />
                      </div>
                      <button (click)="removeLine(line.id)" class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                        <mat-icon class="text-[18px] w-[18px] h-[18px]">delete_outline</mat-icon>
                      </button>
                    </div>
                  </div>
                }

                <!-- Add Button -->
                <button (click)="addLine()" class="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:text-teal-600 hover:border-teal-300 hover:bg-teal-50 transition-colors flex items-center justify-center gap-2 font-medium">
                  <mat-icon class="text-[20px] w-5 h-5">add</mat-icon>
                  Ajouter une ligne budgétaire
                </button>
              </div>

            </div>
          }
        </div>

        <!-- Navigation Buttons -->
        <div class="mt-8 flex items-center" [class.justify-between]="step() > 1" [class.justify-end]="step() === 1">
          @if (step() > 1) {
            <button 
              (click)="prevStep()"
              class="px-6 py-3 rounded-xl border border-slate-200 font-medium text-slate-600 hover:bg-white hover:text-slate-900 transition-colors active:scale-95">
              Retour
            </button>
          }
          
          @if (step() < 4) {
            <button 
              (click)="nextStep()"
              [disabled]="!canProceed()"
              class="flex items-center gap-2 px-8 py-3 rounded-xl bg-slate-900 text-white font-semibold shadow-md hover:bg-slate-800 focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95">
              Continuer
              <mat-icon class="text-[18px] w-[18px] h-[18px]">arrow_forward</mat-icon>
            </button>
          } @else {
            <button 
              (click)="finishOnboarding()"
              [disabled]="isSaving() || remainingToAllocate() < 0"
              class="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 text-white font-semibold shadow-lg shadow-teal-900/20 hover:scale-[1.02] focus:ring-2 focus:ring-offset-2 focus:ring-teal-700 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed transition-all active:scale-95">
              @if (isSaving()) {
                <mat-icon class="animate-spin text-[18px] w-[18px] h-[18px]">refresh</mat-icon>
                Validation...
              } @else {
                <mat-icon class="text-[18px] w-[18px] h-[18px]">check</mat-icon>
                Valider mon budget
              }
            </button>
          }
        </div>

      </div>
    </div>
  `,
  styles: `
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background-color: #e2e8f0;
      border-radius: 20px;
    }
  `
})
export class OnboardingComponent {
  authService = inject(AuthService);
  router = inject(Router);

  // State
  step = signal<number>(1);
  incomeControl = new FormControl<number | null>(null, [Validators.required, Validators.min(100)]);
  currencyControl = new FormControl<'USD' | 'CDF' | 'RWF' | 'XOF'>('XOF', [Validators.required]);
  selectedMode = signal<'50/30/20' | 'CUSTOM' | null>(null);
  budgetLines = signal<BudgetLine[]>([]);
  isSaving = signal<boolean>(false);

  // Computed
  progressPercentage = computed(() => `${(this.step() / 4) * 100}%`);
  
  stepTitle = computed(() => {
    switch (this.step()) {
      case 1: return "Quel est votre revenu ?";
      case 2: return "Quelle est votre devise ?";
      case 3: return "Choisissez votre règle de gestion";
      case 4: return "Ajustez vos enveloppes";
      default: return "";
    }
  });

  stepDescription = computed(() => {
    switch (this.step()) {
      case 1: return "Cette base nous permettra de calculer vos enveloppes budgétaires automatiquement.";
      case 2: return "Sélectionnez la monnaie que vous utilisez au quotidien.";
      case 3: return "Nous avons besoin d'une méthode pour répartir votre argent de façon optimale.";
      case 4: return "Voici votre budget configuré. Modifiez les montants selon vos réalités pour être le plus précis possible.";
      default: return "";
    }
  });

  totalAllocated = computed(() => {
    return this.budgetLines().reduce((sum, line) => sum + line.amount, 0);
  });

  remainingToAllocate = computed(() => {
    const income = this.incomeControl.value || 0;
    return income - this.totalAllocated();
  });

  canProceed(): boolean {
    if (this.step() === 1) return this.incomeControl.valid && (this.incomeControl.value ?? 0) > 0;
    if (this.step() === 2) return this.currencyControl.valid;
    if (this.step() === 3) return this.selectedMode() !== null;
    return true;
  }

  nextStep() {
    if (this.canProceed() && this.step() < 4) {
      if (this.step() === 3) {
        this.generateInitialBudgetLines();
      }
      this.step.update(s => s + 1);
    }
  }

  prevStep() {
    if (this.step() > 1) {
      this.step.update(s => s - 1);
    }
  }

  selectMode(mode: '50/30/20' | 'CUSTOM') {
    this.selectedMode.set(mode);
  }

  generateInitialBudgetLines() {
    const income = this.incomeControl.value || 0;
    if (this.selectedMode() === '50/30/20') {
      const needsTotal = Math.floor(income * 0.50);
      const wantsTotal = Math.floor(income * 0.30);
      const savingsTotal = income - needsTotal - wantsTotal;

      this.budgetLines.set([
        { id: this.generateId(), name: 'Logement & Énergie', type: 'NEED', amount: Math.floor(needsTotal * 0.4) },
        { id: this.generateId(), name: 'Alimentation & Marché', type: 'NEED', amount: Math.floor(needsTotal * 0.4) },
        { id: this.generateId(), name: 'Transport', type: 'NEED', amount: needsTotal - Math.floor(needsTotal * 0.4) * 2 },
        { id: this.generateId(), name: 'Loisirs & Sorties', type: 'WANT', amount: Math.floor(wantsTotal * 0.5) },
        { id: this.generateId(), name: 'Shopping & Plaisirs', type: 'WANT', amount: Math.floor(wantsTotal * 0.3) },
        { id: this.generateId(), name: 'Soutien Familial', type: 'WANT', amount: wantsTotal - Math.floor(wantsTotal * 0.5) - Math.floor(wantsTotal * 0.3) },
        { id: this.generateId(), name: 'Fonds d\'urgence', type: 'SAVING', amount: Math.floor(savingsTotal * 0.5) },
        { id: this.generateId(), name: 'Projets', type: 'SAVING', amount: savingsTotal - Math.floor(savingsTotal * 0.5) },
      ]);
    } else {
      this.budgetLines.set([
        { id: this.generateId(), name: 'Nouvelle dépense', type: 'NEED', amount: 0 }
      ]);
    }
  }

  addLine() {
    this.budgetLines.update(lines => [
      ...lines,
      { id: this.generateId(), name: 'Nouvelle dépense', type: 'NEED', amount: 0 }
    ]);
  }

  removeLine(id: string) {
    this.budgetLines.update(lines => lines.filter(l => l.id !== id));
  }

  updateLineName(id: string, event: Event) {
    const input = event.target as HTMLInputElement;
    this.budgetLines.update(lines => lines.map(l => l.id === id ? { ...l, name: input.value } : l));
  }

  updateLineAmount(id: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseInt(input.value || '0', 10);
    this.budgetLines.update(lines => lines.map(l => l.id === id ? { ...l, amount: isNaN(value) ? 0 : value } : l));
  }

  cycleLineType(id: string) {
    this.budgetLines.update(lines => lines.map(l => {
      if (l.id !== id) return l;
      const nextType = l.type === 'NEED' ? 'WANT' : l.type === 'WANT' ? 'SAVING' : 'NEED';
      return { ...l, type: nextType };
    }));
  }

  getTypeName(type: string): string {
    switch (type) {
      case 'NEED': return 'Besoin';
      case 'WANT': return 'Envie';
      case 'SAVING': return 'Épargne';
      default: return type;
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  async finishOnboarding() {
    const user = this.authService.currentUser();
    if (!user) return;

    this.isSaving.set(true);
    
    try {
      const userRef = doc(db, 'users', user.uid);
      
      const linesWithoutIds = this.budgetLines().map((l: BudgetLine) => ({
        name: l.name,
        type: l.type,
        amount: l.amount
      }));

      await updateDoc(userRef, {
        hasCompletedOnboarding: true,
        monthlyIncome: this.incomeControl.value,
        budgetMode: this.selectedMode(),
        currency: this.currencyControl.value,
        budgetLines: linesWithoutIds,
        updatedAt: serverTimestamp()
      });

      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de l'onboarding:", error);
    } finally {
      this.isSaving.set(false);
    }
  }
}
