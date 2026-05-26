export interface StoredTrade {
  contract_id: number;
  symbol: string;
  stake: number;
}

const STORAGE_KEY = 'open_deriv_trades';

export function saveOpenTrade(trade: StoredTrade) {
  const trades = getOpenTrades();

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([...trades, trade])
  );
}

export function removeOpenTrade(contractId: number) {
  const trades = getOpenTrades();

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      trades.filter((t) => t.contract_id !== contractId)
    )
  );
}

export function getOpenTrades(): StoredTrade[] {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) return [];

  return JSON.parse(raw);
}
