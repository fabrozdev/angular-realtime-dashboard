/**
 * Mock WebSocket server that emits simulated market data every 400ms.
 * Usage: node server.js
 * Requires "ws" package: npm install ws
 */
const WebSocket = require('ws');
const port = 8085;
const wss = new WebSocket.Server({ port });

function rand(min, max) {
  return +(Math.random() * (max - min) + min).toFixed(2);
}

function symbol() {
  const syms = ['BTCUSD', 'ETHUSD', 'AAPL', 'MSFT', 'TSLA'];
  return syms[Math.floor(Math.random() * syms.length)];
}

wss.on('connection', function connection(ws) {
  console.log('Client connected');
  const interval = setInterval(() => {
    const msg = {
      symbol: symbol(),
      price: rand(100, 70000),
      time: Date.now(),
    };
    ws.send(JSON.stringify(msg));
  }, 400);

  ws.on('close', () => {
    clearInterval(interval);
    console.log('Client disconnected');
  });
});

console.log('Mock WS server running on ws://localhost:' + port);
