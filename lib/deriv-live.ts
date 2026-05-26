
export function subscribeBalance(ws: WebSocket, callback: (balance: number) => void) {
  ws.send(JSON.stringify({
    balance: 1,
    subscribe: 1,
  }));

  ws.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);

    if (data.msg_type === 'balance') {
      callback(data.balance.balance);
    }
  });
}

export function subscribeOpenContract(
  ws: WebSocket,
  contractId: number,
  callback: (contract: any) => void
) {
  ws.send(JSON.stringify({
    proposal_open_contract: 1,
    contract_id: contractId,
    subscribe: 1,
  }));

  ws.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);

    if (data.msg_type === 'proposal_open_contract') {
      callback(data.proposal_open_contract);
    }
  });
}
