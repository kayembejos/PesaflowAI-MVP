import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface ExchangeRates {
  USD: number;
  CDF: number;
  RWF: number;
  XOF: number;
}

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  // Taux de base initial (Source MCP Test)
  private readonly initialRates: ExchangeRates = {
    USD: 1,
    CDF: 2309.12,
    RWF: 1465.01,
    XOF: 560.78
  };

  readonly rates = signal<ExchangeRates>(this.initialRates);
  readonly lastUpdated = signal<Date>(new Date());

  /**
   * Convertit un montant d'une devise à une autre
   */
  convert(amount: number, from: keyof ExchangeRates, to: keyof ExchangeRates): number {
    const currentRates = this.rates();
    // Convert to USD first (base)
    const inUsd = amount / currentRates[from];
    // Then to target
    return inUsd * currentRates[to];
  }

  /**
   * Met à jour les taux de change (à appeler via une action IA ou un trigger MCP)
   */
  updateRates(newRates: Partial<ExchangeRates>) {
    this.rates.update(current => ({ ...current, ...newRates }));
    this.lastUpdated.set(new Date());
  }
}
