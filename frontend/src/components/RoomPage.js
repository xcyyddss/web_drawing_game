import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sketchpad from './Sketchpad';
import GameStatus from './GameStatus';
import '../styles/RoomPage.css';
const RoomPage = ({ currentUser }) => {
  const [room, setRoom] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [currentColor, setCurrentColor] = useState('null');
  const [currentWidth, setCurrentWidth] = useState(2);
  const { roomId } = useParams();
  const [time, setTime] = useState(80);
  const [ready, setReady] = useState(false);
  const [canStart, setCanStart] = useState(false);
  const username = useSelector(state => state.username);
  const jwtToken = useSelector(state => state.jwtToken);
  const navigate = useNavigate();
  const drawingData = useRef([]); 
  const line = useRef([]); 
  const canDraw = useRef(false);
  const drawInLeft = useRef(false);
  const drawInRight = useRef(false);
  const word = useRef('');
  const [wordNew, setWordNew] = useState(false);
  const [inGame, setInGame] = useState(false);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/rooms/${roomId}`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`
          }
        });
        const data = await response.json();
        setRoom(data.room);
        setIsOwner(data.room.owner === username);
      } catch (error) {
        console.error('Error fetching room:', error);
      }
    };

    fetchRoom();

  }, [jwtToken, roomId, username]);

  useEffect(() => {
    const canvas = document.getElementById('canvas');
    if (!canvas) return;
    const context = canvas.getContext('2d');
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    const draw = (event) => {
      if (!isDrawing) return;
      const x = event.offsetX;
      const y = event.offsetY;
      if (drawInLeft.current && x > 400) {
        if(lastX === 400){
          return;
        }
        x = 400;
      }
      if (drawInRight.current && x < 400) {
        if(lastX === 400){
          return;
        }
        x = 400;
      }
      context.beginPath();
      context.moveTo(lastX, lastY);
      context.lineTo(x, y);
      context.strokeStyle = currentColor;
      context.lineWidth = currentWidth;
      context.stroke();
    
      line.current.push({ lastX, lastY, x, y, currentColor,currentWidth });

      lastX = x;
      lastY = y;
    };

    const mouseDownHandler = (event) => {
      //这里的canDraw总是true
      if(!canDraw.current) return;
      if(drawInLeft.current && event.offsetX > 400) return;
      if(drawInRight.current && event.offsetX < 400) return;
      isDrawing = true;
      lastX = event.offsetX;
      lastY = event.offsetY;
    };

    const mouseUpHandler = () => {
      if (!isDrawing || event.target !== canvas) return;
      sendDraw(line.current);
      drawingData.current.push([...line.current]);
      line.current = [];
      isDrawing = false;
    };

    canvas.addEventListener('mousedown', mouseDownHandler);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', mouseUpHandler);
    canvas.addEventListener('mouseout', mouseUpHandler);

    return () => {
      canvas.removeEventListener('mousedown', mouseDownHandler);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', mouseUpHandler);
      canvas.removeEventListener('mouseout', mouseUpHandler);
    };
  }, [currentColor,currentWidth]);

  const handleUndo = () => {
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawingData.current.pop();
    drawingData.current.forEach(line => {
      line.forEach(({ lastX, lastY, x, y, currentColor,currentWidth }) => {
        context.beginPath();
        context.moveTo(lastX, lastY);
        context.lineTo(x, y);
        context.strokeStyle = currentColor;
        context.lineWidth = currentWidth;
        context.stroke();
      });
    });
    sendUndo();
  };

  const drawAll = () => {
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawingData.current.forEach(line => {
      line.forEach(({ lastX, lastY, x, y, currentColor,currentWidth }) => {
        context.beginPath();
        context.moveTo(lastX, lastY);
        context.lineTo(x, y);
        context.strokeStyle = currentColor;
        context.lineWidth = currentWidth;
        context.stroke();
      });
    });
  };

  
  const handleUnReady = () => {
    sendUnReady();
    setReady(false);
  };

  const handleReady = () => {
    sendReady();
    setReady(true);
  };

  const handleStartGame = () => {
    sendStartGame();
  };
  
  const handleReturnToLobby = async () => {
    fetch('http://localhost:8080/api/rooms/exit', {
      method: 'POST',
      headers: {
          Authorization: `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, roomId }),
    });

    exitRoom();

    navigate('/lobby');
  };




  const [ws, setWs] = useState(null);

  useEffect(() => {
    const webSocket = new WebSocket('ws://localhost:8080');
    setWs(webSocket);
    
    webSocket.onopen = () => {
      setWs(webSocket);
      webSocket.send(JSON.stringify({
        type: 'joinRoom',
        payload: { username, roomId }
      }));
    };

    webSocket.onmessage = (message) => {
      const parsedMessage = JSON.parse(message.data);
      
      if(parsedMessage.type === 'ready') {
        setCanStart(true);
      }

      if(parsedMessage.type === 'unready') {
        setCanStart(false);
      }

      if(parsedMessage.type === 'terminate') {
        console.log('terminate');
        setInGame(false);
        setIsOwner(parsedMessage.payload.isOwner);
        setTime(80);
        setReady(false);
        setCanStart(parsedMessage.payload.canStart);
        setWordNew(!wordNew);
        word.current = '';
        canDraw.current = false;
        drawInLeft.current = false;
        drawInRight.current = false;
        line.current = [];
        drawingData.current = [];
        const canvas = document.getElementById('canvas');
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
      }

      if(parsedMessage.type === 'status') {
        setInGame(true);
        if(parsedMessage.payload === 'waiting') {
          canDraw.current = false;
          const canvas = document.getElementById('canvas');
          const context = canvas.getContext('2d');
          context.clearRect(0, 0, canvas.width, canvas.height);
          drawingData.current = [];
          line.current = [];
        }
        else if(parsedMessage.payload === 'waitingForNext') {
          canDraw.current = false;
        }
        else{
          canDraw.current = true;
          if(parsedMessage.payload === 'left') {
            drawInLeft.current = true;
            drawInRight.current = false;
            const canvas = document.getElementById('canvas');
            const context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = '#808080';
            context.fillRect(400, 0, 400, 500);
            drawingData.current = [];
            line.current = [];
          }
          if(parsedMessage.payload === 'right') {
            drawInRight.current = true;
            drawInLeft.current = false;
            const canvas = document.getElementById('canvas');
            const context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = '#808080';
            context.fillRect(0, 0, 400, 500);
            drawingData.current = [];
            line.current = [];
          }
          if(parsedMessage.payload === 'draw') {
            drawInLeft.current = false;
            drawInRight.current = false;
            const canvas = document.getElementById('canvas');
            const context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);
            drawingData.current = [];
            line.current = [];
          }
        }
      }

      if(parsedMessage.type === 'time') {
        setTime(parsedMessage.payload);
      } 
      //这里的canDraw总是false，为什么和上一处canDraw总是不同
      if(parsedMessage.type === 'draw' && !canDraw.current) {
        drawingData.current = parsedMessage.payload;
        drawAll();
      }

      if(parsedMessage.type === 'word') {
        setWordNew(!wordNew);
        word.current = parsedMessage.payload;
      }
    };

    return () => {
      webSocket.close();
    };
  }, []);

  const exitRoom = () => {
    ws.send(JSON.stringify({
      type: 'exitRoom',
      payload: { username, roomId, inGame }
    }));
  };

  const sendReady = () => {
    ws.send(JSON.stringify({
      type: 'ready',
      payload: { username, roomId }
    }));
  };

  const sendUnReady = () => {
    ws.send(JSON.stringify({
      type: 'unready',
      payload: { username, roomId }
    }));
  };
  
  const sendDraw = (drawing) => {
    ws.send(JSON.stringify({
      type: 'draw',
      payload: { username, roomId, drawing }
    }));
  };

  const sendUndo = () => {
    ws.send(JSON.stringify({
      type: 'undo',
      payload: { username, roomId }
    }));
  }

  const sendStartGame = () => {
    ws.send(JSON.stringify({
      type: 'startGame',
      payload: { roomId }
    }));
  };

  return (
    <div className="room-page-container">
      {room ? (
        <div>
          <div>
            <GameStatus isOwner={isOwner} handleStartGame={handleStartGame} handleReturnToLobby={handleReturnToLobby} handleUnReady={handleUnReady} handleReady={handleReady} ready={ready} room={room} time={time} status1={canDraw.current? '绘画中' :'等待中'} status2={word.current} canStart={canStart} inGame={inGame}/>
          </div>
          <div className="canvas-container">
            <canvas id="canvas" width="800" height="500"></canvas>
            <Sketchpad setCurrentColor={setCurrentColor} currentColor={currentColor} setCurrentWidth={setCurrentWidth} currentWidth={currentWidth} handleUndo={handleUndo} />
          </div>
        </div>
      ) : (
        <p>This room doesn't exsist...</p>
      )}
    </div>
  );
};

export default RoomPage;
