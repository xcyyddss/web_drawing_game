const express = require('express');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const { User, Word, sequelize } = require('./db');
const cors = require('cors'); // 导入 CORS 中间件
const app = express();
const http = require('http');
const WebSocket = require('ws');
const gameManager = require('./managers/GameManager');
const roomManager = require('./managers/RoomManager');
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const users = new Map();

(async () => {
  try {
    // 同步 User 模型到数据库
    await User.sync({ alter: true });
    await Word.sync({ alter: true });
    console.log('User model synchronized successfully');
  } catch (error) {
    console.error('Error synchronizing user model:', error);
  }
})();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// 使用 CORS 中间件
app.use(cors());

// 挂载认证相关路由
app.use('/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

// 其他路由和服务器设置...
wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', (message) => {
    const parsedMessage = JSON.parse(message);
    const { type, payload } = parsedMessage;

    switch (type) {
      case 'initLobby':
        users[payload.username] = ws;
        break;
      case 'joinRoom':
        roomManager.addClient(payload.username, payload.roomId, ws);
        //向users中的每个用户发送所有的房间信息，即roomManager.rooms
        Object.keys(users).forEach(user => {
          users[user].send(JSON.stringify({ type: 'updateLobby', payload: roomManager.rooms }));
        });
        break;
      case 'exitRoom':
        roomManager.removeClient(payload.username, payload.roomId);
        //向users中的每个用户发送所有的房间信息，即roomManager.rooms
        Object.keys(users).forEach(user => {
          users[user].send(JSON.stringify({ type: 'updateLobby', payload: roomManager.rooms }));
        });
        if(payload.inGame){
          roomManager.sendTerminateStatus(payload.roomId);
        }
        break;
      case 'createRoom':
        Object.keys(users).forEach(user => {
          users[user].send(JSON.stringify({ type: 'updateLobby', payload: roomManager.rooms }));
        });
        break;
      case 'ready':
        roomManager.ready(payload.username, payload.roomId);
        break;
      case 'unready':
        roomManager.unReady(payload.username, payload.roomId);
        break;
      case 'startGame':
        gameManager.startGame(payload.roomId);
        break;
      case 'draw':
        gameManager.draw(payload.username, payload.roomId, payload.drawing);
        roomManager.sendDrawing(payload.roomId, gameManager.getDrawing(payload.roomId));
        break;
      case 'undo':
        gameManager.undo(payload.username, payload.roomId);
        roomManager.sendDrawing(payload.roomId, gameManager.getDrawing(payload.roomId));
        break;
      default:
        console.log('Unknown message type:', type);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

const runGameTick = async () => {
  await gameManager.handleTick(); // 等待 handleTick 完成
  setTimeout(runGameTick, 1000);  // 递归调用，每次等待 1 秒
};

// 启动游戏循环
runGameTick();

// 启动服务器
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
