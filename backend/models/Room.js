// backend/models/Room.js

class Room {
    constructor(id, mode, name, maxPlayers, owner) {
      this.id = id;
      this.mode = mode; // 新增游戏模式属性
      this.name = name;
      this.maxPlayers = maxPlayers; // 新增最大玩家数属性
      this.owner = owner; // 新增房主属性
      this.players = [owner]; // 初始化玩家数组
      //玩家的准备状态记录
      this.ready = [owner];
      this.clients = new Map();
      this.drawTimes = new Map();
      this.drawTimes.set(owner, 0);
    }
  
    addPlayer(player) {
      if (this.players.length < this.maxPlayers) {
        this.players.push(player);
        this.drawTimes.set(player, 0);
        return true; // 返回添加成功
      }
      return false; // 返回添加失败
    }

    removePlayer(name) {
      this.players = this.players.filter(player => player !== name);
      this.ready = this.ready.filter(player => player !== name);
      this.clients.delete(name);
      this.drawTimes.delete(name);
      if(name === this.owner){
        if(this.players.length !== 0)
          this.owner = this.players[0]; // 如果房主退出，将房主转移给下一个玩家
      }
      return this.players.length !== 0;
    }

    addClient(player, ws){
      this.clients.set(player, ws);
    }
  
    removeClient(player){
      this.clients.delete(player);
    }

    addReady(player){
      if(this.players.includes(player) && !this.ready.includes(player))
        this.ready.push(player);
    }

    removeReady(player){
      if(this.players.includes(player) && this.ready.includes(player))
        this.ready = this.ready.filter(p => p !== player);
    }

    getReady(){
      //每位玩家均准备时返回true
      return this.ready.length === this.players.length && this.ready.length > 2;
    }

    getNextDrawer(){
      //选择具有最小画图次数的玩家
      let min = Number.MAX_VALUE;
      let next = '';
      this.drawTimes.forEach((value, key) => {
        if(value < min){
          min = value;
          next = key;
        }
      });
      this.drawTimes.set(next, min + 1);
      return next;
    }
  
    toJSON() {
      return {
        id: this.id,
        mode: this.mode, // 添加游戏模式到返回的 JSON 中
        name: this.name,
        maxPlayers: this.maxPlayers, // 添加最大玩家数到返回的 JSON 中
        owner: this.owner, // 添加房主到返回的 JSON 中
        players: this.players
      };
    }
  }
  
  module.exports = Room;
  