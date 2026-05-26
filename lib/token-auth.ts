const DERIV_API = 'https://api.derivws.com/trading/v1/options';
const DERIV_APP_ID = '33mWPPBi2r253nbQqfC9b';

const DEFAULT_HEADERS: HeadersInit = {
  accept: '*/*',
  'accept-language': 'en-US,en;q=0.9',
  'deriv-app-id': DERIV_APP_ID,
  origin: 'https://nashdbot.space',
  priority: 'u=1, i',
  referer: 'https://nashdbot.space/',
  'sec-ch-ua': '"Chromium";v="148", "Google Chrome";v="148", "Not/A)Brand";v="99"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'cross-site',
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',
};

export interface TokenLoginResponse {
  accountId: string;
  wsUrl: string;
  accounts: any[];
}

export async function loginWithApiToken(token: string): Promise<TokenLoginResponse> {
  const authHeaders: HeadersInit = {
    ...DEFAULT_HEADERS,
    authorization: `Bearer ${token}`,
  };

  const accountsResponse = await fetch(`${DERIV_API}/accounts`, {
    method: 'GET',
    headers: authHeaders,
  });

  if (!accountsResponse.ok) {
    throw new Error(`Login failed (${accountsResponse.status})`);
  }

  const accountsData = await accountsResponse.json();

  const accounts = Array.isArray(accountsData)
    ? accountsData
    : accountsData.accounts || accountsData.data || [];

  const realAccount = accounts.find((account: any) => {
    const accountId =
      account.account_id || account.loginid || account.login_id || account.id || '';

    return String(accountId).startsWith('R');
  });

  if (!realAccount) {
    throw new Error('No real account ID found');
  }

  const accountId =
    realAccount.account_id ||
    realAccount.loginid ||
    realAccount.login_id ||
    realAccount.id;

  const otpResponse = await fetch(`${DERIV_API}/accounts/${accountId}/otp`, {
    method: 'POST',
    headers: {
      ...authHeaders,
      'content-length': '0',
    },
  });

  if (!otpResponse.ok) {
    throw new Error(`Failed to fetch WebSocket OTP (${otpResponse.status})`);
  }

  const otpData = await otpResponse.json();
  const wsUrl = otpData.url;

  if (!wsUrl) {
    throw new Error('WebSocket URL not found in OTP response');
  }

  localStorage.setItem('deriv_api_token', token);
  localStorage.setItem('deriv_ws_url', wsUrl);
  localStorage.setItem('deriv_account_id', accountId);

  return {
    accountId,
    wsUrl,
    accounts,
  };
}
