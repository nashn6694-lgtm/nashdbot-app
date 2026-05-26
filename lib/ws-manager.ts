
class DerivWSManager {
  private ws: WebSocket | null = null;
  private token: string | null = null;
  private subscriptions: any[] = [];

  connect(token: string) {
    this.token = token;

    this.ws = new WebSocket(
      `wss://ws.derivws.com/websockets/v3?app_id=${process.env.NEXT_PUBLIC_DERIV_APP_ID}`
    );

    this.ws.onopen = () => {
      this.send({
        authorize: token,
      });

      this.subscriptions.forEach((sub) => {
        this.send(sub);
      });
    };

    this.ws.onclose = () => {
      setTimeout(() => {
        if (this.token) {
          this.connect(this.token);
        }
      }, 3000);
    };
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

  getSocket() {
    return this.ws;
  }
}

export const derivWS = new DerivWSManager();
