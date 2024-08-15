// frontend/src/components/GameStatus.js

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import '../styles/GameStatus.css';

const GameStatus = ({isOwner,handleStartGame,handleReturnToLobby,handleUnReady,handleReady,ready,room,time,status1,status2,canStart,inGame}) => {
    const username = useSelector(state => state.username);
    const jwtToken = useSelector(state => state.jwtToken);

    return (
        <div className="GameStatus-container">
            <div className="text-box">{room.name}</div>
            <div className="text-box">{status1}</div>
            <div className="text-box">{status2}</div>
            <div className="timer-circle">{time}</div>
            {  
                isOwner ? (  
                    canStart ? (
                        inGame ? (  
                            <button className="start-button" disabled>游戏中</button>  
                        ) : (  
                            <button className="start-button" onClick={handleStartGame}>开始游戏</button>  
                        )
                    ) : (  
                        inGame ? (
                            <button className="start-button" disabled>游戏中</button>  
                        ) : (
                            <button className="start-button" disabled>开始游戏</button>  
                        )
                    )
                ) : (  
                    ready ? (  
                        inGame ? (
                            <button className="ready-button" disabled>游戏中</button>  
                        ) : (
                            <button className="ready-button" onClick={handleUnReady}>取消准备</button>  
                        )
                    ) : (  
                        inGame ? (
                            <button className="ready-button" disabled>游戏中</button>  
                        ) : (
                            <button className="start-button" onClick={handleReady}>准备</button>  
                        )
                    )  
                )  
            }
            <button className="exit-button" onClick={handleReturnToLobby}>退出房间</button>
        </div>
    );
};

export default GameStatus;
