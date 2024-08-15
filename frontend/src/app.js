import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import reducer from './redux/reducer';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import LobbyPage from './components/LobbyPage';
import CreateRoomPage from './components/CreateRoomPage';
import RoomPage from './components/RoomPage';
import GameStatus from './components/GameStatus';

const store = createStore(reducer);

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/lobby/" element={<LobbyPage />} />
          <Route path="/create-room/" element={<CreateRoomPage />} />
          <Route path="/rooms/:roomId" element={<RoomPage />} />
        </Routes>
      </Router>
    </Provider>
  );
};

export default App;
