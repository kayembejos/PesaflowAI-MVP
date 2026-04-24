import {Injectable, inject, signal} from '@angular/core';
import {AuthService} from '../auth/auth.service';
import {db} from '../firebase';
import {collection, doc, getDoc, getDocs, query, where, orderBy, addDoc, serverTimestamp, Timestamp, deleteDoc, updateDoc} from 'firebase/firestore';

export interface BudgetLine {
  name: string;
  type: 'NEED' | 'WANT' | 'SAVING';
  amount: number;
}

export interface UserConfig {
  monthlyIncome: number;
  budgetMode: string;
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

  userConfig = signal<UserConfig | null>(null);
  expenses = signal<Expense[]>([]);
  isLoading = signal<boolean>(true);

  async loadDashboardData() {
    this.isLoading.set(true);
    const user = this.authService.currentUser();
    if (!user) {
      this.isLoading.set(false);
      return;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        this.userConfig.set({
          monthlyIncome: data['monthlyIncome'] || 0,
          budgetMode: data['budgetMode'] || '',
          budgetLines: data['budgetLines'] || []
        });
      }

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const expensesRef = collection(db, 'users', user.uid, 'expenses');
      const q = query(
        expensesRef,
        where('date', '>=', Timestamp.fromDate(startOfMonth)),
        orderBy('date', 'desc')
      );
      
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
      
      this.expenses.set(loadedExpenses);
    } catch (e) {
      console.error("Error loading dashboard data:", e);
    } finally {
      this.isLoading.set(false);
    }
  }

  async addExpense(expense: Omit<Expense, 'id'>) {
    const user = this.authService.currentUser();
    if (!user) return;

    try {
      const expensesRef = collection(db, 'users', user.uid, 'expenses');
      await addDoc(expensesRef, {
        ...expense,
        date: Timestamp.fromDate(expense.date),
        createdAt: serverTimestamp()
      });
      await this.loadDashboardData();
    } catch (e) {
      console.error("Error adding expense:", e);
      throw e;
    }
  }

  async loadAllExpenses() {
    const user = this.authService.currentUser();
    if (!user) return [];

    try {
      const expensesRef = collection(db, 'users', user.uid, 'expenses');
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
      const expenseRef = doc(db, 'users', user.uid, 'expenses', expenseId);
      await deleteDoc(expenseRef);
      await this.loadDashboardData();
    } catch (e) {
      console.error("Error deleting expense:", e);
      throw e;
    }
  }

  async updateExpense(expenseId: string, expense: Partial<Omit<Expense, 'id'>>) {
    const user = this.authService.currentUser();
    if (!user) return;

    try {
      const expenseRef = doc(db, 'users', user.uid, 'expenses', expenseId);
      const updateData: any = { ...expense };
      if (expense.date) {
        updateData.date = Timestamp.fromDate(expense.date);
      }
      await updateDoc(expenseRef, updateData);
      await this.loadDashboardData();
    } catch (e) {
      console.error("Error updating expense:", e);
      throw e;
    }
  }
}
