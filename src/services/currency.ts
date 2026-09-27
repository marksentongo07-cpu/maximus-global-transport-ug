import { Currency } from '../types';

export const EXCHANGE_RATES: Record<Currency, { rateAgainstUGX: number; symbol: string; decimals: number }> = {
  UGX: { rateAgainstUGX: 1, symbol: 'UGX', decimals: 0 },
  USD: { rateAgainstUGX: 0.00027, symbol: '$', decimals: 2 },
  EUR: { rateAgainstUGX: 0.00025, symbol: '€', decimals: 2 },
  KES: { rateAgainstUGX: 0.035, symbol: 'KSh', decimals: 0 },
  TZS: { rateAgainstUGX: 0.70, symbol: 'TSh', decimals: 0 },
};

export function convertFromUGX(amountInUGX: number, targetCurrency: Currency): number {
  const config = EXCHANGE_RATES[targetCurrency];
  if (!config) return amountInUGX;
  return amountInUGX * config.rateAgainstUGX;
}

export function convertToUGX(amountInTargetCurrency: number, sourceCurrency: Currency): number {
  const config = EXCHANGE_RATES[sourceCurrency];
  if (!config || config.rateAgainstUGX === 0) return amountInTargetCurrency;
  return amountInTargetCurrency / config.rateAgainstUGX;
}

export function formatMoney(amountInUGX: number, currency: Currency = 'UGX'): string {
  const config = EXCHANGE_RATES[currency];
  const converted = convertFromUGX(amountInUGX, currency);
  
  if (currency === 'UGX') {
    return `${Math.round(converted).toLocaleString('en-US')} UGX`;
  }
  
  if (currency === 'USD') {
    return `$${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  if (currency === 'EUR') {
    return `€${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  return `${config.symbol} ${Math.round(converted).toLocaleString('en-US')}`;
}
