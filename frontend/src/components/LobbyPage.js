import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/LobbyPage.css';
import { useSelector } from 'react-redux';

const LobbyPage = () => {
  const [rooms, setRooms] = useState([]);
  const username = useSelector(state => state.username);
  const jwtToken = useSelector(state => state.jwtToken);
  const navigate = useNavigate();
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/rooms/lobby');
        setRooms(response.data.rooms);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };

    fetchRooms();
  }, [rooms]);

  useEffect(() => {
    const webSocket = new WebSocket('ws://localhost:8080');
    
    webSocket.onopen = () => {
      setWs(webSocket);
      webSocket.send(JSON.stringify({
        type: 'initLobby',
        payload: { username }
      }));
    };

    webSocket.onmessage = (message) => {
      const parsedMessage = JSON.parse(message.data);
      
      if (parsedMessage.type === 'updateLobby') {
        setRooms(parsedMessage.payload);
      }
    };

    webSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    webSocket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      webSocket.close();
    };
  }, [username]);

  const handleJoin = async (roomId) => {
    if (!username) return;
    try {
      await fetch(`http://localhost:8080/api/rooms/join`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, roomId }),
      });
      navigate(`/rooms/${roomId}`);
    } catch (error) {
      console.error('Error joining room:', error);
    }
  };

  return (
    <div className="lobby-container">
      <h2>游戏大厅</h2>
      <div>
        <h3>房间</h3>
        <ul>
          {rooms.length === 0 ? (
            <li>没有房间</li>
          ) : (
            rooms.map(room => (
              <li key={room.id}>
                <div className="text">房间名：{room.name}</div>
                <div className="text">人数：{room.players.length + "/" + room.maxPlayers}</div>
                <div className="text">模式：{room.mode}</div>
                <button className="join-button" onClick={() => handleJoin(room.id)}>加入</button>
              </li>
            ))
          )}
        </ul>
      </div>
      <Link to={`/create-room/`} className="create-room-link">创建房间</Link>
    </div>
  );
};

export default LobbyPage;
