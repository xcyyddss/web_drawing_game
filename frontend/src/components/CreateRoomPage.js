import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // 修改导入语句
import axios from 'axios';
import '../styles/CreateRoomPage.css';
import { useSelector } from 'react-redux';

const CreateRoomPage = () => {
  const [roomName, setRoomName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(4); // 默认最大玩家数为4
  const [roomMode, setRoomMode] = useState('');
  const navigate = useNavigate(); 
  
  const username = useSelector(state => state.username);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 向后端发送创建房间的请求
      const response = await axios.post('http://localhost:8080/api/rooms/create', {
        mode: roomMode,
        name: roomName,
        maxPlayers,
        username
      });
      // 成功创建房间后，跳转到房间页面
      navigate(`/rooms/${response.data.room.id.toString()}`); 
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  return (  
    <div className="create-room-container">  
      <h2>Create Room</h2>  
      <form onSubmit={handleSubmit}>  
        <div className="input-container">  
          <label htmlFor="roomName">房间名称:</label>  
          <input  
            type="text"  
            id="roomName"  
            value={roomName}  
            onChange={(e) => setRoomName(e.target.value)}  
          />  
        </div>  
        <div className="input-container">  
          <label htmlFor="maxPlayers">最大人数:</label>  
          <input  
            type="number"  
            id="maxPlayers"  
            value={maxPlayers}  
            onChange={(e) => setMaxPlayers(parseInt(e.target.value))}  
          />  
        </div>   
        <div className="input-container">  
          <label htmlFor="roomMode">游戏模式：</label>  
          <select  
            id="roomMode"  
            value={roomMode}  
            onChange={(e) => setRoomMode(e.target.value)}  
          >  
            <option value="">选择合作绘画模式</option>  
            <option value="joint">同区域</option>  
            <option value="divide">分割区域</option>  
          </select>  
        </div>  
        <button type="submit">创建房间</button>  
      </form>  
    </div>  
  );  
};  

export default CreateRoomPage;
