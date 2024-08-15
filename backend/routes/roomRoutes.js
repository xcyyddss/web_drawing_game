// backend/routes/roomRoutes.js
const express = require('express');
const router = express.Router();
const roomManager = require('../managers/RoomManager');
const gameManager = require('../managers/GameManager');
const jwt = require('jsonwebtoken');

router.get('/lobby', async (req, res) => {
  try {
    // 查询所有房间信息
    //console.log('Fetching all rooms');
    const rooms = await roomManager.getAllRooms();
    res.json({ rooms });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 获取特定房间信息的路由
router.get('/:roomId', async (req, res) => {
  try {
    const roomId = req.params.roomId;
    // 根据 roomId 查询房间信息
    const room = await roomManager.getRoomById(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    // 返回房间信息
    res.json({ room });
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


// 获取特定房间信息的路由
router.post('/join', async (req, res) => {
  try {
    const { username, roomId } = req.body;
    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];
    jwt.verify(token, 'this0is0a0key', async (err, decoded) => {  
      if (err) {  
        // 令牌验证失败  
        return res.status(401).json({ error: 'Invalid token' });  
      }  
  
      const Username = decoded.username;  
  
      if (username !== Username) {  
        return res.status(401).json({ error: 'Username mismatch' });  
      }  
      roomManager.joinRoom(username, roomId);

      // 响应客户端
      res.status(200).json({ message: 'User exited successfully' });
    });  
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 获取特定房间信息的路由
router.post('/exit', async (req, res) => {
  try {
    const { username, roomId } = req.body;
    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];
    jwt.verify(token, 'this0is0a0key', async (err, decoded) => {  
      if (err) {  
        // 令牌验证失败  
        return res.status(401).json({ error: 'Invalid token' });  
      }  
  
      const Username = decoded.username;  
  
      if (username !== Username) {  
        return res.status(401).json({ error: 'Username mismatch' });  
      }  
      roomManager.exitRoom(username, roomId);
      gameManager.gameTerminate(roomId);
      // 响应客户端
      res.status(200).json({ message: 'User exited successfully' });
    });  
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


// 获取特定房间信息的路由
router.post('/ready', async (req, res) => {
  try {
    const { username, roomId } = req.body;
    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];
    jwt.verify(token, 'this0is0a0key', async (err, decoded) => {  
      if (err) {  
        // 令牌验证失败  
        return res.status(401).json({ error: 'Invalid token' });  
      }  
  
      const Username = decoded.username;  
  
      if (username !== Username) {  
        return res.status(401).json({ error: 'Username mismatch' });  
      }  
      
      roomManager.ready(username, roomId);
      
      // 响应客户端
      res.status(200).json({ message: 'User exited successfully' });
    });  
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


// 获取特定房间信息的路由
router.post('/unready', async (req, res) => {
  try {
    const { username, roomId } = req.body;
    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];
    jwt.verify(token, 'this0is0a0key', async (err, decoded) => {  
      if (err) {  
        // 令牌验证失败  
        return res.status(401).json({ error: 'Invalid token' });  
      }  
  
      const Username = decoded.username;  
  
      if (username !== Username) {  
        return res.status(401).json({ error: 'Username mismatch' });  
      }  
      
      roomManager.unready(username, roomId);
      
      // 响应客户端
      res.status(200).json({ message: 'User exited successfully' });
    });  
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 获取特定房间信息的路由
router.post('/start', async (req, res) => {
  try {
    const { username, roomId } = req.body;
    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];
    jwt.verify(token, 'this0is0a0key', async (err, decoded) => {  
      if (err) {  
        // 令牌验证失败  
        return res.status(401).json({ error: 'Invalid token' });  
      }  
  
      const Username = decoded.username;  
  
      if (username !== Username) {  
        return res.status(401).json({ error: 'Username mismatch' });  
      }  
      
      if(roomManager.getReady(roomId))
        gameManager.createGame(roomId);
      
      // 响应客户端
      res.status(200).json({ message: 'User exited successfully' });
    });  
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 创建新房间的路由
router.post('/create', async (req, res) => {
  try {
    const { mode, name, maxPlayers, username} = req.body;
    // 创建新房间
    const room = roomManager.createRoom(mode, name, maxPlayers, username); 
    res.status(201).json({ message: 'Room created successfully', room });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
