import {ChangeDetectionStrategy, Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  template: `
    <div class="min-h-screen bg-slate-50 flex flex-col pt-20">
      
      <!-- Navbar (Fixed) -->
      <nav class="fixed top-0 inset-x-0 bg-white/80 backdrop-blur-sm z-50 border-b border-slate-200">
        <div class="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-teal-900/10">
              <mat-icon class="material-icons-round text-[20px] w-5 h-5">account_balance_wallet</mat-icon>
            </div>
            <span class="font-display font-bold text-2xl tracking-tight text-slate-800">PesaFlow</span>
          </div>
          
          <div class="hidden md:flex items-center gap-8 font-medium text-slate-600">
            <a href="#features" class="hover:text-teal-600 transition-colors">Fonctionnalités</a>
            <a href="#how-it-works" class="hover:text-teal-600 transition-colors">Comment ça marche</a>
          </div>
          
          <div class="flex items-center gap-4">
            <a routerLink="/auth" class="hidden md:flex items-center justify-center px-4 py-2 font-medium text-slate-600 hover:text-slate-900 transition-colors">Connexion</a>
            <a routerLink="/auth" class="flex items-center justify-center bg-slate-900 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-slate-800 transition-all shadow-md">
              Commencer
            </a>
          </div>
        </div>
      </nav>

      <main class="flex-grow flex flex-col">
        <!-- Hero Section -->
        <section class="relative pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden flex-1 flex flex-col justify-center">
          <div class="absolute -right-4 top-24 w-64 h-64 bg-teal-400 rounded-full mix-blend-multiply filter blur-[80px] opacity-20 -z-10 pointer-events-none"></div>
          <div class="absolute -left-12 bottom-24 w-80 h-80 bg-teal-600 rounded-full mix-blend-multiply filter blur-[100px] opacity-10 -z-10 pointer-events-none"></div>
          
          <div class="max-w-7xl mx-auto px-6 lg:px-12 text-center">
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 text-teal-700 text-sm font-semibold border border-teal-100 mb-8 shadow-sm">
              ✨ Solution FinTech Adaptée
            </div>
            
            <h1 class="font-display max-w-4xl mx-auto text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
              Maîtrisez votre argent, <br class="hidden md:block"/>
              <span class="text-transparent bg-clip-text bg-gradient-to-br from-teal-600 to-teal-700">sans effort.</span>
            </h1>
            
            <p class="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 mb-10 leading-relaxed">
              L'application de gestion financière personnelle conçue pour vos réalités. Suivez vos dépenses hors-ligne, gérez vos revenus irréguliers et atteignez vos objectifs.
            </p>
            
            <div class="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a routerLink="/auth" class="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 text-white text-lg font-bold hover:scale-[1.02] transition-transform shadow-xl shadow-teal-600/20">
                Ouvrir PesaFlow
              </a>
              <div class="flex flex-col py-2 sm:py-0 text-sm text-slate-400 font-medium items-center sm:items-start">
                <div class="flex items-center gap-1.5">
                  <mat-icon class="text-teal-500 text-[18px] w-[18px] h-[18px]">verified</mat-icon>
                   10k+ Utilisateurs
                </div>
                <span>Pas de CB requise</span>
              </div>
            </div>
            
            <!-- App Preview Mockup Container -->
            <div class="mt-20 relative max-w-5xl mx-auto flex items-center justify-center">
              
              <div class="bg-white/80 backdrop-blur-xl rounded-[3rem] border border-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.1)] relative overflow-hidden flex items-center justify-center w-full max-w-lg aspect-[3/4] md:aspect-auto md:h-[650px] mx-auto z-20">
                <!-- Mobile View Mock (Design from HTML) -->
                <div class="w-72 h-[550px] bg-slate-900 rounded-[3rem] border-[8px] border-slate-800 shadow-2xl relative overflow-hidden flex flex-col mx-auto shrink-0 z-20">
                  <!-- Notch -->
                  <div class="h-6 w-32 bg-slate-800 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-xl"></div>
                  
                  <div class="p-6 pt-10 flex-1 flex flex-col gap-4 text-white">
                    <div class="h-28 w-full rounded-2xl bg-teal-600/20 border border-teal-500/30 p-4 flex flex-col justify-end">
                      <span class="text-xs opacity-80 uppercase tracking-widest font-bold mb-1">Solde actuel</span>
                      <span class="text-2xl font-bold font-display">145 500 <span class="text-lg opacity-80 font-normal">FCFA</span></span>
                    </div>
                    
                    <div class="space-y-3 mt-4">
                      <div class="h-12 w-full rounded-xl bg-slate-800/50 flex items-center px-4 justify-between border border-white/5">
                        <div class="flex items-center gap-3">
                          <div class="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
                            <mat-icon class="text-[16px] w-4 h-4">shopping_cart</mat-icon>
                          </div>
                          <span class="text-xs font-medium">Courses</span>
                        </div>
                        <span class="text-xs font-bold">-4 500</span>
                      </div>
                      
                      <div class="h-12 w-full rounded-xl bg-slate-800/50 flex items-center px-4 justify-between border border-white/5">
                        <div class="flex items-center gap-3">
                          <div class="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                            <mat-icon class="text-[16px] w-4 h-4">directions_bus</mat-icon>
                          </div>
                          <span class="text-xs font-medium">Transport</span>
                        </div>
                        <span class="text-xs font-bold">-1 000</span>
                      </div>
                      
                      <div class="h-12 w-full rounded-xl bg-slate-800/50 flex items-center px-4 justify-between border border-white/5">
                        <div class="flex items-center gap-3">
                          <div class="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                            <mat-icon class="text-[16px] w-4 h-4">payments</mat-icon>
                          </div>
                          <span class="text-xs font-medium">Paiement Client</span>
                        </div>
                        <span class="text-xs font-bold text-teal-400">+25 000</span>
                      </div>
                    </div>
                    
                    <div class="mt-auto h-14 w-full bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl flex items-center justify-center gap-2 font-bold text-sm shadow-lg shadow-teal-900/40 hover:opacity-90 active:scale-95 transition-all cursor-pointer">
                      <mat-icon class="text-[18px] w-[18px] h-[18px]">add</mat-icon>
                      Ajouter dépense
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </section>

        <!-- Features Section -->
        <section id="features" class="py-20 lg:py-28 bg-white border-y border-slate-100">
          <div class="max-w-7xl mx-auto px-6 lg:px-12">
            
            <div class="grid md:grid-cols-3 gap-10 lg:gap-14">
              <!-- Feature 1 -->
              <div class="space-y-4">
                <div class="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 shadow-sm border border-teal-100/50">
                  <mat-icon>bolt_filled</mat-icon>
                </div>
                <h3 class="font-display text-xl font-bold text-slate-800">Zéro friction</h3>
                <p class="text-slate-500 leading-relaxed">
                  Ajoutez une dépense en exactement 2 clics. Plus c'est simple, plus vous resterez discipliné sur le long terme.
                </p>
              </div>

              <!-- Feature 2 -->
              <div class="space-y-4">
                <div class="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 shadow-sm border border-teal-100/50">
                  <mat-icon>wifi_off</mat-icon>
                </div>
                <h3 class="font-display text-xl font-bold text-slate-800">100% Hors-ligne</h3>
                <p class="text-slate-500 leading-relaxed">
                  Pas de données ? Aucun problème. L'application fonctionne entièrement hors-ligne et se synchronise quand vous retrouvez du réseau.
                </p>
              </div>

              <!-- Feature 3 -->
              <div class="space-y-4">
                <div class="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 shadow-sm border border-teal-100/50">
                  <mat-icon>trending_up</mat-icon>
                </div>
                <h3 class="font-display text-xl font-bold text-slate-800">Revenus irréguliers</h3>
                <p class="text-slate-500 leading-relaxed">
                  Gérez vos entrées d'argent variables avec des prévisions adaptées à votre activité réelle.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      <!-- Footer -->
      <footer class="bg-white border-t border-slate-100 py-8">
        <div class="max-w-7xl mx-auto px-6 lg:px-12">
          <div class="flex flex-col md:flex-row items-center justify-between text-sm text-slate-400 font-medium gap-4">
            <div class="flex items-center gap-6">
              <span class="text-slate-500">&copy; 2026 PesaFlow.</span>
              <a href="#" class="hover:text-slate-600 transition-colors">Confidentialité</a>
              <a href="#" class="hover:text-slate-600 transition-colors">Conditions</a>
            </div>
            
            <div class="flex items-center gap-4">
              <span class="flex items-center gap-2">
                <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </span>
                Système Opérationnel
              </span>
              <span class="text-slate-200">|</span>
              <span>Conçu avec ❤️ pour l'Afrique</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    
    html {
      scroll-behavior: smooth;
    }
  `
})
export class Landing {}
