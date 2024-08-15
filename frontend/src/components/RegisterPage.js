import React, { useState } from 'react';
import axios from 'axios';
import '../styles/RegisterPage.css';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/auth/register', { username, password });
      // 注册成功后可以跳转到登录页面
    } catch (error) {
      console.error('Error registering:', error);
    }
  };

  return (
    <div className="register-container"> 
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-container">
          <label>Username:</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className="input-container">
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default RegisterPage;
