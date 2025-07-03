import React from 'react';
import './SliderControl.css';

const SliderControl = ({ label, value, onChange, min = 0, max = 100 }) => {
  return (
    <div className="slider-control">
      <label>{label}</label>
      <div className="slider-track">
        <input 
          type="range" 
          min={min} 
          max={max} 
          value={value} 
          onChange={onChange} 
          className="slider-input"
        />
        <div className="slider-thumb-container" style={{ left: `${((value - min) / (max - min)) * 100}%` }}>
            <div className="slider-thumb-icon" />
        </div>
      </div>
      <span className="slider-value">{value}</span>
    </div>
  );
};

export default SliderControl; 