import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./landing/landing').then(m => m.Landing)
  },
  {
    path: 'auth',
    loadComponent: () => import('./auth/auth.component').then(m => m.AuthComponent)
  },
  {
    path: 'onboarding',
    loadComponent: () => import('./onboarding/onboarding.component').then(m => m.OnboardingComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layout/app-layout.component').then(m => m.AppLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'budget',
        loadComponent: () => import('./budget/budget.component').then(m => m.BudgetComponent)
      },
      {
        path: 'expenses',
        loadComponent: () => import('./expenses/expenses.component').then(m => m.ExpensesComponent)
      },
      {
        path: 'savings',
        loadComponent: () => import('./savings/savings.component').then(m => m.SavingsComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
