// 在登录成功后存储用户名数据到Redux store

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { setLoggedInUser, setJwtToken } from '../redux/actions';
import '../styles/LoginPage.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/auth/login', { username, password });
      const token = response.data.token;
      localStorage.setItem('token', token);
      dispatch(setLoggedInUser(username)); // 将用户名存储到Redux store
      dispatch(setJwtToken(token));
      navigate('/lobby');
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  return (
    <div className='background'>
      <div className="login-container">
        <h2>登录</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-container">
            <label>用户名:</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="input-container">
            <label>密码:</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit">登录</button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
