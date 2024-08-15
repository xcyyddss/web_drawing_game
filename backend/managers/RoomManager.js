const Room = require('../models/Room');

const WebSocket = require('ws');

class RoomManager {
  constructor() {
    if(RoomManager.instance) {
      return RoomManager.instance;
    }
    RoomManager.instance = this;
    this.rooms = [];
    this.nextRoomId = 0; // 下一个房间的 id
  }

  createRoom(mode, name, maxPlayers, owner) {
    const room = new Room(
      (this.nextRoomId++).toString(), // 分配自增的 id
      mode,
      name,
      maxPlayers,
      owner // 将房主加入房间
    );
    this.rooms.push(room);
    return room;
  }

  getReady(roomId){
    const room = this.getRoomById(roomId);
    if(room){
      return room.getReady();
    }
    return false;
  }

  ready(player, roomId){
    const room = this.getRoomById(roomId);
    if(room){
      room.addReady(player);
    }
    if(room.getReady()){
      this.sendReady(roomId);
    }
  }

  unReady(player, roomId){
    const room = this.getRoomById(roomId);
    if(room){
      room.removeReady(player);
    }
    if(!room.getReady()){
      this.sendUnReady(roomId);
    }
  }

  joinRoom(player, roomId) {
    const room = this.getRoomById(roomId);
    if (room && room.players.length < room.maxPlayers) {
      if(room.players.find(p => p.username === player)){
        return true;
      }
      else room.addPlayer(player);
      return true;
    }
    return false;
  }

  exitRoom(player, roomId) {
    const room = this.getRoomById(roomId);
    if (room) {
      if(!room.removePlayer(player)){
        this.rooms = this.rooms.filter(r => r.id !== room.id);
      }
    }
  }

  getRoomById(id) {
    return this.rooms.find(room => room.id === id);
  }

  getAllRooms() {
    return this.rooms;
  }

  getNextDrawer(roomId){
    const room = this.getRoomById(roomId);
    if(room){
      return room.getNextDrawer();
    }
    return '';
  }
  
  sendBeginStatus(roomId, drawerOne, drawerTwo) {
    const mode = this.getRoomById(roomId).mode;
    if(mode === 'joint'){
      this.getRoomById(roomId).clients.forEach((client, name) => {
        if (client.readyState === WebSocket.OPEN) {
          if(name === drawerOne || name === drawerTwo){
            client.send(JSON.stringify({ type: 'status', payload: 'draw' }));
          }
          else{
            client.send(JSON.stringify({ type: 'status', payload: 'waiting' }));
          }
        }
      });
    }
    if(mode === 'divide'){
      this.getRoomById(roomId).clients.forEach((client, name) => {
        if (client.readyState === WebSocket.OPEN) {
          if(name === drawerOne)
            client.send(JSON.stringify({ type: 'status', payload: 'left' }));
          else if(name === drawerTwo)
            client.send(JSON.stringify({ type: 'status', payload: 'right' }));
          else 
            client.send(JSON.stringify({ type: 'status', payload: 'waiting' }));
        }
      });
    }
  }

  sendEndStatus(roomId) {
    this.getRoomById(roomId).clients.forEach((client, name) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'status', payload: 'waitingForNext' }));
      }
    });
  }

  sendTerminateStatus(roomId) {
    this.getRoomById(roomId).clients.forEach((client, name) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'terminate', payload: {isOwner: name === this.getRoomById(roomId).owner, canStart: this.getReady(roomId)}}));
      }
    });
  }

  sendWord(roomId, word) {
    const message = JSON.stringify({ type: 'word', payload: word });
    this.getRoomById(roomId).clients.forEach((client, name) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  sendReady(roomId) {
    const message = JSON.stringify({ type: 'ready' });
    const onwername = this.getRoomById(roomId).owner;
    const client = this.getRoomById(roomId).clients.get(onwername);
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
  
  sendUnReady(roomId) {
    const message = JSON.stringify({ type: 'unready' });
    const onwername = this.getRoomById(roomId).owner;
    const client = this.getRoomById(roomId).clients.get(onwername);
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }

  sendDrawing(roomId, drawing) {
    const message = JSON.stringify({ type: 'draw', payload: drawing });
    this.getRoomById(roomId).clients.forEach((client, name) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  sendTime(roomId, time) {
    const message = JSON.stringify({ type: 'time', payload: time });
    this.getRoomById(roomId).clients.forEach((client, name) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  addClient(name, roomId, client) {
    const room = this.getRoomById(roomId);
    if(room){
      room.clients.set(name, client);
    }
  }

  // 移除客户端连接
  removeClient(name, roomId) {
    const room = this.getRoomById(roomId);
    this.unReady(name, roomId);
    if(room){
      room.clients.delete(name);
    }
  }
}

RoomManager.instance = new RoomManager();
module.exports = RoomManager.instance;
