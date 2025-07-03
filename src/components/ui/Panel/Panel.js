import React from 'react';
import './Panel.css';

const Panel = ({ isOpen, children, className = '' }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={`panel-container ${className}`}>
      {children}
    </div>
  );
};

export const PanelHeader = ({ children, className = '' }) => (
  <div className={`panel-header ${className}`}>
    {children}
  </div>
);

export const PanelBody = ({ children, className = '' }) => (
  <div className={`panel-body ${className}`}>
    {children}
  </div>
);

export default Panel; 