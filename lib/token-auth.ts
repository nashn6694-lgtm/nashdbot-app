const DERIV_API_BASE = 'https://api.derivws.com';

interface OptionsAccount {
  account_id: string;
  balance?: number;
  currency?: string;
  account_type?: string;
}

export interface TokenLoginResult {
  account: OptionsAccount;
  wsUrl: string;
  token: string;
}

const DEFAULT_HEADERS = {
  Accept: '*/*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Deriv-App-ID': process.env.NEXT_PUBLIC_DERIV_APP_ID || '33mWPPBi2r253nbQqfC9b',
};

export async function loginWithApiToken(token: string): Promise<TokenLoginResult> {
  // STEP 1: Get options accounts using PAT token
  const accountsResponse = await fetch(
    `${DERIV_API_BASE}/trading/v1/options/accounts`,
    {
      method: 'GET',
      headers: {
        ...DEFAULT_HEADERS,
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const accountsData = await accountsResponse.json();

  if (!accountsResponse.ok) {
    throw new Error(
      accountsData?.errors?.[0]?.message || 'PAT token authentication failed'
    );
  }

  if (!accountsData?.data || !Array.isArray(accountsData.data)) {
    throw new Error('Invalid accounts response from Deriv API');
  }

  // STEP 2: Find REAL account (starts with R)
  const realAccount = accountsData.data.find((acc: OptionsAccount) =>
    acc.account_id?.startsWith('R')
  );

  if (!realAccount) {
    throw new Error('No real account found for this PAT token');
  }

  // STEP 3: Generate OTP websocket URL
  const otpResponse = await fetch(
    `${DERIV_API_BASE}/trading/v1/options/accounts/${realAccount.account_id}/otp`,
    {
      method: 'POST',
      headers: {
        ...DEFAULT_HEADERS,
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const otpData = await otpResponse.json();

  if (!otpResponse.ok) {
    throw new Error(
      otpData?.errors?.[0]?.message || 'Failed to generate websocket OTP'
    );
  }

  const wsUrl = otpData?.data?.url;

  if (!wsUrl || !wsUrl.startsWith('wss://')) {
    throw new Error('Invalid websocket URL returned by Deriv');
  }

  // Save auth locally
  localStorage.setItem('deriv_api_token', token);
  localStorage.setItem('deriv_ws_url', wsUrl);
  localStorage.setItem('deriv_account_id', realAccount.account_id);

  return {
    account: realAccount,
    wsUrl,
    token,
  };
}
