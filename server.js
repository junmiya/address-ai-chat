import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Next.js アプリケーションの準備
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Socket.io サーバーの初期化
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? 'https://your-domain.com' 
        : [`http://localhost:${port}`, `http://127.0.0.1:${port}`],
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Socket.io イベントハンドラーをインポート
  try {
    const { default: setupSocketHandlers } = await import('./src/lib/socket/socketHandlers.js');
    setupSocketHandlers(io);
    console.log('Socket.io handlers loaded successfully');
  } catch (error) {
    console.error('Failed to load Socket.io handlers:', error);
  }

  httpServer
    .once('error', (err) => {
      console.error('Server error:', err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> Socket.io server running on port ${port}`);
    });
});