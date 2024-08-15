import React, { useState, useEffect, useRef } from 'react';
import '../styles/Sketchpad.css';

const Sketchpad = ({ setCurrentColor, currentColor, setCurrentWidth, currentWidth, handleUndo }) => {
  const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
  const widths = [2, 4, 6, 8, 10]; // 画笔宽度选项
  const [showWidthOptions, setShowWidthOptions] = useState(false);
  const widthButtonRef = useRef(null);

  const handleClickOutside = (event) => {
    if (widthButtonRef.current && !widthButtonRef.current.contains(event.target)) {
      setShowWidthOptions(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const logsomething = () => {
    console.log('current width is ', currentWidth);
  }

  return (
    <div className="sketchpad-container">
      {colors.map(color => (
        <div
          key={color}
          className={`color-option ${currentColor === color ? 'active' : ''}`} 
          style={{ backgroundColor: color }}
          onClick={() => setCurrentColor(color)}
        ></div>
      ))}
      <div
        className="color-option eraser"
        onClick={() => setCurrentColor('#FFFFFF')}
      ></div>
      <div className="width-button-container" ref={widthButtonRef}>
        {showWidthOptions ? (
          widths.map(width => (
            <button
              key={width}
              className={`width-option ${currentWidth === width ? 'active' : ''}`}
              onClick={() => {
                setCurrentWidth(width);
                setShowWidthOptions(false);
                logsomething();
              }}
            >{width}</button>
          ))
        ) : (
          <button className="sketchpad-button" onClick={() => setShowWidthOptions(true)}>宽度</button>
        )}
      </div>
      <button className="sketchpad-button" onClick={handleUndo}>撤销</button>
    </div>
  );
};

export default Sketchpad;
