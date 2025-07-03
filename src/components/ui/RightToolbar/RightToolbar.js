import React from 'react';
import {
  AlignRight, 
  BoundingBox, 
  Stack,
  Columns,
  Magnet,
  TextT
} from '@phosphor-icons/react';
import './RightToolbar.css';

const RightToolbarButton = ({ icon: Icon, isActive = false, title, shortcut, onClick }) => (
  <button className={`right-toolbar-button ${isActive ? 'active' : ''}`} data-tooltip={`${title} ${shortcut ? `(${shortcut})` : ''}`} onClick={onClick}>
    <Icon size={20} weight="fill" />
  </button>
);

const RightToolbar = ({ onSnapSettingsToggle, isSnapSettingsOpen, onAlignmentPanelToggle, isAlignmentPanelOpen, onLayersPanelToggle, isLayersPanelOpen, onTextPanelToggle, isTextPanelOpen }) => {
  return (
    <div className="right-toolbar-container">
      <RightToolbarButton 
        icon={AlignRight} 
        title="Posição e Alinhamento" 
        shortcut="Alt+A" 
        onClick={() => {
          console.log('Toggling alignment panel', !isAlignmentPanelOpen);
          onAlignmentPanelToggle();
        }}
        isActive={isAlignmentPanelOpen}
      />
      <RightToolbarButton 
        icon={Stack} 
        title="Camadas" 
        shortcut="Alt+L" 
        onClick={onLayersPanelToggle}
        isActive={isLayersPanelOpen}
      />
      <RightToolbarButton 
        icon={TextT} 
        title="Character" 
        shortcut="Alt+T" 
        onClick={onTextPanelToggle}
        isActive={isTextPanelOpen}
      />
      <RightToolbarButton 
        icon={Columns} 
        title="Guias e Colunas" 
        shortcut="Alt+G" 
      />
      <RightToolbarButton 
        icon={Magnet} 
        title="Snapping" 
        shortcut="Alt+S"
        onClick={onSnapSettingsToggle}
        isActive={isSnapSettingsOpen}
      />
    </div>
  );
};

export default RightToolbar; 