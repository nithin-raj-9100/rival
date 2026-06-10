import { Router, Request, Response } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { addEventClient, removeEventClient } from '../services/taskService';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  let payload: JwtPayload;

  // Try Authorization header first, then query param (for EventSource)
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      payload = verifyToken(header.split(' ')[1]);
    } catch {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid token' } });
      return;
    }
  } else if (typeof req.query.token === 'string') {
    try {
      payload = verifyToken(req.query.token);
    } catch {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid token' } });
      return;
    }
  } else {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Missing token' } });
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  const sendEvent = (event: object) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  sendEvent({ type: 'connected' });

  addEventClient(payload.userId, sendEvent);

  req.on('close', () => {
    removeEventClient(payload.userId, sendEvent);
  });
});

export default router;
