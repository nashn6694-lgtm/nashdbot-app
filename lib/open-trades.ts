
const STORAGE_KEY = 'open_deriv_trades';

export function saveOpenTrade(trade: any) {
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
      trades.filter((t: any) => t.contract_id !== contractId)
    )
  );
}

export function getOpenTrades() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) return [];

  return JSON.parse(raw);
}
