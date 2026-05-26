type MessageHandler = (data: any) => void;

class DerivWSManager {
  private ws: WebSocket | null = null;
  private token: string | null = null;
  private reconnectAttempts = 0;
  private handlers: MessageHandler[] = [];
  private subscriptions: any[] = [];

  connect(token: string) {
    this.token = token;

    this.ws = new WebSocket(
      `wss://ws.derivws.com/websockets/v3?app_id=${process.env.NEXT_PUBLIC_DERIV_APP_ID}`
    );

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;

      this.send({
        authorize: token,
      });

      this.restoreSubscriptions();
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      this.handlers.forEach((handler) => handler(data));
    };

    this.ws.onclose = () => {
      this.reconnect();
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  reconnect() {
    const timeout = Math.min(1000 * 2 ** this.reconnectAttempts, 10000);

    setTimeout(() => {
      this.reconnectAttempts++;

      if (this.token) {
        this.connect(this.token);
      }
    }, timeout);
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  subscribe(data: any) {
    this.subscriptions.push(data);
    this.send(data);
  }

  restoreSubscriptions() {
    this.subscriptions.forEach((sub) => {
      this.send(sub);
    });
  }

  addHandler(handler: MessageHandler) {
    this.handlers.push(handler);
  }

  removeHandler(handler: MessageHandler) {
    this.handlers = this.handlers.filter((h) => h !== handler);
  }

  getSocket() {
    return this.ws;
  }
}

export const derivWS = new DerivWSManager();
