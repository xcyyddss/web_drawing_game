const Game = require('../models/Game');
const roomManager = require('./RoomManager');
const WebSocket = require('ws');

class GameManager {
  constructor() {
    if(GameManager.instance) {
      return GameManager.instance;
    }
    GameManager.instance = this;
    this.games = [];
    this.nextGameId = 0; // 下一个游戏的 id
  }

  startGame(roomId) {
    const game = new Game(
      (this.nextGameId++).toString(), // 分配自增的 id
      roomId
    );
    this.games.push(game);
  }

  gameTerminate(roomId) {
    const game = this.getGameByRoomId(roomId);
    if(game){
      this.games = this.games.filter(g => g.roomId !== roomId);
    }
  }

  getGameByRoomId(roomId) {
    return this.games.find(game => game.roomId === roomId);
  }

  draw(username, roomId, drawing) {
    const game = this.getGameByRoomId(roomId);
    if(game){
      game.addDrawing(username, drawing);
    }
  }

  undo(username, roomId) {
    const game = this.getGameByRoomId(roomId);
    if(game){
      game.undo(username);
    }
  }

  getDrawing(roomId) {
    const game = this.getGameByRoomId(roomId);
    if(game){
      return game.getDrawing();
    }
    return [];
  }

  async handleTick() {
    for (const game of this.games) {
      const status = await game.continue(); // 等待 continue 方法完成
      
      if (status === 'begin') {
        const drawerOne = roomManager.getNextDrawer(game.roomId);
        const drawerTwo = roomManager.getNextDrawer(game.roomId);
        
        game.assignDrawer(drawerOne, drawerTwo);
        roomManager.sendBeginStatus(game.roomId, drawerOne, drawerTwo);
        roomManager.sendWord(game.roomId, game.getWord());
      }
      
      if (status === 'end') {
        roomManager.sendEndStatus(game.roomId);
        roomManager.sendDrawing(game.roomId, game.getDrawing());
        
        if (game.shouldOver(roomManager.getRoomById(game.roomId).players.length)) {
          this.gameTerminate(game.roomId);
        }
      }
      
      roomManager.sendTime(game.roomId, game.time);
    }
  }
  
}

GameManager.instance = new GameManager();
module.exports = GameManager.instance;
