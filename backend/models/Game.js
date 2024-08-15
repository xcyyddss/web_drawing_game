// backend/models/Game.js
const { Word, sequelize } = require('../db'); // 导入 User 模型对象

class Game {
    constructor(id, roomId) {
      this.id = id;
      this.roomId = roomId;
      this.turn = 1;
      this.time = 1;
      this.word = '';
      this.words = [];
      this.drawerNameOne = '';
      this.drawerNameTwo = '';
      this.drawingOne = [];
      this.drawingTwo = [];
      this.drawingSequence = 0;
      this.drawingSequenceOne = [];
      this.drawingSequenceTwo = [];
    }
    async continue() {
      this.time--;
      
      if (this.time === 0 && this.turn % 2 === 0) {
        this.time = 30;
        this.turn++;
        return 'end';
      }
      
      if (this.time === 0 && this.turn % 2 === 1) {
        this.time = 80;
        this.turn++;
        await this.newWord();  // 等待 newWord 函数完成
        this.clearDrawing();
        return 'begin';
      }
      
      return 'continue';
    }
    
    shouldOver(playerNumber){
      return this.turn/2 === playerNumber*(playerNumber-1)/2;
    }
    getWord(){
      return this.word;
    }
    async newWord() {
      try {
        const word = await Word.findOne({ order: sequelize.literal('RAND()') });
        if (word && !this.words.includes(word.word)) {
          this.word = word.word;
          this.words.push(word.word);
        } else {
          await this.newWord();
        }
      } catch (err) {
        console.error('Error fetching word:', err);
      }
    }
    getTurn(){
      return this.turn;
    }
    getDrawingOne(){
      return this.drawingOne;
    }
    getDrawingTwo(){
      return this.drawingTwo;
    }
    addDrawing(username, drawing){
      if(username === this.drawerNameOne){
        this.drawingOne.push(drawing);
        this.drawingSequenceOne.push(this.drawingSequence);
        this.drawingSequence++;
      }
      if(username === this.drawerNameTwo){
        this.drawingTwo.push(drawing);
        this.drawingSequenceTwo.push(this.drawingSequence);
        this.drawingSequence++;
      }
    }
    undo(username){
      if(username === this.drawerNameOne){
        this.drawingOne.pop();
        this.drawingSequenceOne.pop();
      }
      if(username === this.drawerNameTwo){
        this.drawingTwo.pop();
        this.drawingSequenceTwo.pop();
      }
    }
    getDrawing(){
      let drawing = [];
      let indexOne = 0;
      let indexTwo = 0;

      while (indexOne < this.drawingSequenceOne.length && indexTwo < this.drawingSequenceTwo.length) {
        if (this.drawingSequenceOne[indexOne] < this.drawingSequenceTwo[indexTwo]) {
            drawing.push(this.drawingOne[indexOne]);
            indexOne++;
        } else {
            drawing.push(this.drawingTwo[indexTwo]);
            indexTwo++;
        }
      }

      // Add remaining drawings from drawingOne
      while (indexOne < this.drawingSequenceOne.length) {
        drawing.push(this.drawingOne[indexOne]);
        indexOne++;
      }

      // Add remaining drawings from drawingTwo
      while (indexTwo < this.drawingSequenceTwo.length) {
        drawing.push(this.drawingTwo[indexTwo]);
        indexTwo++;
      }

      return drawing;
    
    }

    assignDrawer(nameOne, nameTwo){
      this.drawerNameOne = nameOne;
      this.drawerNameTwo = nameTwo;
    }

    clearDrawing(){
      this.drawingOne = [];
      this.drawingTwo = [];
      this.drawingSequenceOne = [];
      this.drawingSequenceTwo = [];
      this.drawingSequence = 0;
    }
  }
  
  module.exports = Game;
  