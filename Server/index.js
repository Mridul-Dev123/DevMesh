import 'dotenv/config.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './src/app.js';
import { getUserRoom } from './src/utils/notifications.js';

const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
});

// Make io accessible inside controllers via req.app.get('io')
app.set('io', io);

io.on('connection', (socket) => {
  const userId = socket.handshake.auth?.userId;
  console.log(`Socket connected: ${socket.id} (user: ${userId})`);

  if (userId) {
    const room = getUserRoom(userId);
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
  }

  /**
   * Join a conversation room to receive real-time messages.
   * Client emits: { conversationId }
   */
  socket.on('join_conversation', async ({ conversationId }) => {
    if (!conversationId || !userId) return;
    try {
      const { default: chatService } = await import('./src/modules/chat/chat.service.js');
      await chatService.canAccessConversation(conversationId, userId);
      socket.join(conversationId);
      console.log(`Socket ${socket.id} joined room ${conversationId}`);
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  /**
   * Leave a conversation room.
   * Client emits: { conversationId }
   */
  socket.on('leave_conversation', ({ conversationId }) => {
    socket.leave(conversationId);
  });

  /**
   * Client sends a message via WebSocket.
   * Client emits: { conversationId, content }
   * Server broadcasts 'new_message' to everyone in the room.
   */
  socket.on('send_message', async ({ conversationId, content }) => {
    if (!userId || !conversationId || !content) return;
    try {
      const { default: chatService } = await import('./src/modules/chat/chat.service.js');
      await chatService.sendMessage(conversationId, userId, content, io);
      // sendMessage already emits to the room; no extra emit needed here.
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  socket.on('typing_start', async ({ conversationId }) => {
    if (!userId || !conversationId) return;
    try {
      const { default: chatService } = await import('./src/modules/chat/chat.service.js');
      await chatService.canAccessConversation(conversationId, userId);
      socket.to(conversationId).emit('conversation_typing', {
        conversationId,
        userId,
        isTyping: true,
      });
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  socket.on('typing_stop', async ({ conversationId }) => {
    if (!userId || !conversationId) return;
    try {
      const { default: chatService } = await import('./src/modules/chat/chat.service.js');
      await chatService.canAccessConversation(conversationId, userId);
      socket.to(conversationId).emit('conversation_typing', {
        conversationId,
        userId,
        isTyping: false,
      });
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  socket.on('conversation_seen', async ({ conversationId }) => {
    if (!userId || !conversationId) return;
    try {
      const { default: chatService } = await import('./src/modules/chat/chat.service.js');
      await chatService.markConversationRead(conversationId, userId, io);
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});
