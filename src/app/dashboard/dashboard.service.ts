import { Injectable, inject, signal, effect } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import {
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  serverTimestamp,
  Timestamp,
  deleteDoc,
  updateDoc,
  onSnapshot
} from '@angular/fire/firestore';

export interface BudgetLine {
  name: string;
  type: 'NEED' | 'WANT' | 'SAVING';
  amount: number;
}

export interface UserConfig {
  monthlyIncome: number;
  budgetMode: string;
  currency: 'USD' | 'CDF' | 'RWF' | 'XOF';
  budgetLines: BudgetLine[];
}

export interface Expense {
  id?: string;
  amount: number;
  categoryName: string;
  type: 'NEED' | 'WANT' | 'SAVING';
  paymentMethod: 'CASH' | 'MOBILE_MONEY' | 'BANK';
  date: Date;
  notes?: string;
}

@Injectable({providedIn: 'root'})
export class DashboardService {
  authService = inject(AuthService);
  private firestore = inject(Firestore);

  userConfig = signal<UserConfig | null>(null);
  expenses = signal<Expense[]>([]);
  isLoading = signal<boolean>(true);

  private unsubUser: any;
  private unsubExpenses: any;

  constructor() {
    // Automatically load data when user identity changes
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.setupRealtimeListeners(user.uid);
      } else {
        this.cleanup();
      }
    });
  }

  private cleanup() {
    if (this.unsubUser) this.unsubUser();
    if (this.unsubExpenses) this.unsubExpenses();
    this.userConfig.set(null);
    this.expenses.set([]);
  }

  private setupRealtimeListeners(userId: string) {
    this.isLoading.set(true);
    
    // User Config Listener
    const userRef = doc(this.firestore, 'users', userId);
    this.unsubUser = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        this.userConfig.set({
          monthlyIncome: data['monthlyIncome'] || 0,
          budgetMode: data['budgetMode'] || '',
          currency: data['currency'] || 'XOF',
          budgetLines: data['budgetLines'] || []
        });
      }
      this.isLoading.set(false);
    }, (error) => {
      console.error("User sub error:", error);
      this.isLoading.set(false);
    });

    // Expenses Listener (Current Month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const expensesRef = collection(this.firestore, 'users', userId, 'expenses');
    const q = query(
      expensesRef,
      where('date', '>=', Timestamp.fromDate(startOfMonth)),
      orderBy('date', 'desc')
    );

    this.unsubExpenses = onSnapshot(q, (snap) => {
      const loadedExpenses: Expense[] = [];
      snap.forEach(doc => {
        const data = doc.data();
        loadedExpenses.push({
          id: doc.id,
          amount: data['amount'],
          categoryName: data['categoryName'],
          type: data['type'],
          paymentMethod: data['paymentMethod'] || 'CASH',
          date: data['date'].toDate(),
          notes: data['notes']
        });
      });
      this.expenses.set(loadedExpenses);
    }, (error) => {
      console.error("Expenses sub error:", error);
    });
  }

  async updateCurrency(currency: 'USD' | 'CDF' | 'RWF' | 'XOF') {
    const user = this.authService.currentUser();
    if (!user) return;

    try {
      const userRef = doc(this.firestore, 'users', user.uid);
      await updateDoc(userRef, {
        currency,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      console.error("Error updating currency:", e);
      throw e;
    }
  }

  getCurrencySymbol(): string {
    const currency = this.userConfig()?.currency || 'XOF';
    switch (currency) {
      case 'USD': return '$';
      case 'CDF': return 'FC';
      case 'RWF': return 'FRw';
      case 'XOF': return 'FCFA';
      default: return 'FCFA';
    }
  }

  async loadDashboardData() {
    // This is now redundant thanks to realtime listeners in constructor
  }

  async addExpense(expense: Omit<Expense, 'id'>) {
    const user = this.authService.currentUser();
    if (!user) return;

    try {
      const expensesRef = collection(this.firestore, 'users', user.uid, 'expenses');
      await addDoc(expensesRef, {
        ...expense,
        date: Timestamp.fromDate(expense.date),
        createdAt: serverTimestamp()
      });
    } catch (e) {
      console.error("Error adding expense:", e);
      throw e;
    }
  }

  async loadAllExpenses() {
    const user = this.authService.currentUser();
    if (!user) return [];

    try {
      const expensesRef = collection(this.firestore, 'users', user.uid, 'expenses');
      const q = query(expensesRef, orderBy('date', 'desc'));
      const expensesSnap = await getDocs(q);
      const loadedExpenses: Expense[] = [];
      expensesSnap.forEach(doc => {
        const data = doc.data();
        loadedExpenses.push({
          id: doc.id,
          amount: data['amount'],
          categoryName: data['categoryName'],
          type: data['type'],
          paymentMethod: data['paymentMethod'] || 'CASH',
          date: data['date'].toDate(),
          notes: data['notes']
        });
      });
      return loadedExpenses;
    } catch (e) {
      console.error("Error loading all expenses:", e);
      return [];
    }
  }

  async deleteExpense(expenseId: string) {
    const user = this.authService.currentUser();
    if (!user) return;

    try {
      const expenseRef = doc(this.firestore, 'users', user.uid, 'expenses', expenseId);
      await deleteDoc(expenseRef);
    } catch (e) {
      console.error("Error deleting expense:", e);
      throw e;
    }
  }

  async updateExpense(expenseId: string, expense: Partial<Omit<Expense, 'id'>>) {
    const user = this.authService.currentUser();
    if (!user) return;

    try {
      const expenseRef = doc(this.firestore, 'users', user.uid, 'expenses', expenseId);
      const updateData: any = { ...expense };
      if (expense.date) {
        updateData.date = Timestamp.fromDate(expense.date);
      }
      await updateDoc(expenseRef, updateData);
    } catch (e) {
      console.error("Error updating expense:", e);
      throw e;
    }
  }
}
