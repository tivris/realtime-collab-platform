import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// WebSocket connection handling
io.on('connection', (socket: any) => {
  console.log('Client connected:', socket.id);

  socket.on('join-document', (documentId: string) => {
    socket.join(documentId);
    console.log(`Client ${socket.id} joined document: ${documentId}`);
  });

  socket.on('leave-document', (documentId: string) => {
    socket.leave(documentId);
    console.log(`Client ${socket.id} left document: ${documentId}`);
  });

  socket.on('document-change', ({ documentId, changes }: { documentId: string; changes: any }) => {
    socket.to(documentId).emit('document-changed', changes);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/collab-platform')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err: Error) => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});