
const DERIV_WS = 'wss://ws.derivws.com/websockets/v3';

export async function loginWithApiToken(token: string) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`${DERIV_WS}?app_id=${process.env.NEXT_PUBLIC_DERIV_APP_ID}`);

    ws.onopen = () => {
      ws.send(JSON.stringify({
        authorize: token
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
        localStorage.setItem('deriv_api_token', token);
        resolve(data.authorize);
        ws.close();
      }
    };

    ws.onerror = () => {
      reject(new Error('WebSocket failed'));
    };
  });
}
