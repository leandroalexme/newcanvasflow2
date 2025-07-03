import React, { useState, useEffect } from 'react';
import './TransformPanel.css';
import {
  DotsThree,
  LockSimple,
  LockSimpleOpen
} from '@phosphor-icons/react';
import Panel, { PanelHeader, PanelBody } from '../../ui/Panel/Panel';

// New custom icon components
const CornerIcon = ({ angle = 0 }) => (
  <div className="prop-icon-circle">
    <div className="rotation-line" style={{ transform: `translateX(-50%) rotate(${angle}deg)` }}></div>
  </div>
);
  
const ShearIcon = ({ value = 0 }) => (
  <div className="prop-icon-circle">
    <div className="shear-line" style={{ transform: `translate(-50%, -50%) rotate(${value}deg)` }}></div>
  </div>
);

const NewPropertyInput = ({ label, value, onChange, icon: Icon, iconProps }) => (
  <div className="new-property-input">
    {Icon ? <div className="prop-icon"><Icon {...iconProps} /></div> : <span className="prop-label">{label}</span>}
    <input 
      type="text" 
      value={value} 
      onChange={onChange}
      onFocus={(e) => e.target.select()}
    />
  </div>
);

const TransformPanel = ({ isOpen, onClose, selectedElements, updateElementProperties }) => {
  const element = selectedElements?.[0];
  const [rotationAngle, setRotationAngle] = useState(0);
  const [shearValue, setShearValue] = useState(0);
  const [isLocked, setIsLocked] = useState(true);

  useEffect(() => {
    if (element) {
      // Convert rotation from radians to degrees for display
      const angleInRadians = element.rotation || 0;
      const angleInDegrees = angleInRadians * (180 / Math.PI);

      // Normalize angle to display it in a user-friendly way (-180 to 180)
      let normalizedAngle = angleInDegrees % 360;
      if (normalizedAngle > 180) {
        normalizedAngle -= 360;
      } else if (normalizedAngle <= -180) {
        normalizedAngle += 360;
      }
      setRotationAngle(Math.round(normalizedAngle));

      // Also handle shear, assuming it's in radians too
      const shearInRadians = element.shear || 0;
      const shearInDegrees = shearInRadians * (180 / Math.PI);
      setShearValue(Math.round(shearInDegrees));
    } else {
      // Reset values when no element is selected
      setRotationAngle(0);
      setShearValue(0);
    }
  }, [element]);

  const handlePropertyChange = (prop, value) => {
    if (element) {
      updateElementProperties(element.id, { [prop]: parseFloat(value) || 0 });
    }
  };

  const handleRotationChange = (e) => {
    const rawValue = e.target.value.replace('°', '');
    let angle = parseInt(rawValue, 10);

    if (isNaN(angle)) {
      angle = 0;
    }

    // Clamp the angle to the range [-150, 150]
    const clampedAngleInDegrees = Math.max(-150, Math.min(angle, 150));
    setRotationAngle(clampedAngleInDegrees);

    if (element) {
      // Convert degrees back to radians for the core logic
      const angleInRadians = clampedAngleInDegrees * (Math.PI / 180);
      updateElementProperties(element.id, { rotation: angleInRadians });
    }
};

  const handleShearChange = (e) => {
    const rawValue = e.target.value.replace('°', '');
    let shear = parseInt(rawValue, 10);

    if (isNaN(shear)) {
      shear = 0;
    }
    
    const clampedShearInDegrees = Math.max(-150, Math.min(shear, 150));
    setShearValue(clampedShearInDegrees);

    if (element) {
      const shearInRadians = clampedShearInDegrees * (Math.PI / 180);
      updateElementProperties(element.id, { shear: shearInRadians });
    }
  };

  const toggleLock = () => {
    setIsLocked(!isLocked);
  };

  return (
    <Panel isOpen={isOpen} className="new-alignment-panel">
      <PanelHeader>
        <div className="header-tabs">
          <span className="tab-active">Position</span>
          <span className="tab-inactive">Align</span>
        </div>
        <button className="more-options-button" onClick={onClose}>
          <DotsThree size={20} weight="bold" />
        </button>
      </PanelHeader>
      <PanelBody>
        <div className="new-panel-content-grid">
          <div className="main-content-area">
            <div className="position-grid">
              <NewPropertyInput 
                label="X" 
                value={element ? Math.round(element.x) : 0} 
                onChange={e => handlePropertyChange('x', e.target.value)}
              />
              <NewPropertyInput 
                label="Y" 
                value={element ? Math.round(element.y) : 0} 
                onChange={e => handlePropertyChange('y', e.target.value)}
              />
              <NewPropertyInput 
                label="W" 
                value={element ? Math.round(element.width) : 0} 
                onChange={e => handlePropertyChange('width', e.target.value)}
              />
              <NewPropertyInput 
                label="H" 
                value={element ? Math.round(element.height) : 0} 
                onChange={e => handlePropertyChange('height', e.target.value)}
              />
            </div>
            
            <div className="rotation-grid">
               <NewPropertyInput 
                icon={CornerIcon}
                iconProps={{ angle: rotationAngle }}
                value={`${rotationAngle}°`} 
                onChange={handleRotationChange}
              />
               <NewPropertyInput 
                icon={ShearIcon}
                iconProps={{ value: shearValue }}
                value={`${shearValue}°`} 
                onChange={handleShearChange}
              />
            </div>
          </div>

          <div className={`constraint-area ${!isLocked ? 'unlocked' : ''}`} onClick={toggleLock}>
            {/* Top Connector */}
            <svg className="lock-connector" viewBox="0 0 15 49">
              <path d="M0.75,1.5 Q14.25,1.5 14.25,15.5 L14.25,48.25" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <div className="lock-icon-wrapper">
              {isLocked ? (
                <LockSimple size={18} weight="fill" />
              ) : (
                <LockSimpleOpen size={18} weight="fill" />
              )}
      </div>
            {/* Bottom Connector */}
            <svg className="lock-connector" viewBox="0 0 15 49">
              <path d="M14.25,0.75 L14.25,33.5 Q14.25,47.5 0.75,47.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
      </div>
    </div>
      </PanelBody>
    </Panel>
  );
};

export default TransformPanel; 