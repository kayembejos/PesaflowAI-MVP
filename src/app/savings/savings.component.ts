import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'app-savings',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 lg:p-8">
      <h1 class="font-display text-2xl font-bold text-slate-900 mb-2">Épargne</h1>
      <p class="text-slate-500 mb-8">Suivez vos objectifs de mise de côté.</p>
      
      <div class="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm text-center">
        <p class="text-slate-400">Contenu du module Épargne à venir...</p>
      </div>
    </div>
  `
})
export class SavingsComponent {}
