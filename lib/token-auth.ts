const DERIV_WS = 'wss://ws.derivws.com/websockets/v3';

export interface TokenAuthResponse {
  token: string;
  loginid: string;
  email?: string;
  balance?: number;
  currency?: string;
}

export async function loginWithApiToken(token: string): Promise<TokenAuthResponse> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`${DERIV_WS}?app_id=${process.env.NEXT_PUBLIC_DERIV_APP_ID}`);

    ws.onopen = () => {
      ws.send(JSON.stringify({
        authorize: token,
      }));
    };

    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);

      if (data.error) {
        reject(new Error(data.error.message));
        ws.close();
        return;
      }

      if (data.msg_type === 'authorize') {
        const auth = data.authorize;

        localStorage.setItem('deriv_api_token', token);

        resolve({
          token,
          loginid: auth.loginid,
          email: auth.email,
          balance: auth.balance,
          currency: auth.currency,
        });

        ws.close();
      }
    };

    ws.onerror = () => {
      reject(new Error('WebSocket connection failed'));
    };
  });
}
