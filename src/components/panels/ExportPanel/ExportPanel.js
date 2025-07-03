import React, { useState } from 'react';
import { X } from '@phosphor-icons/react';
import './ExportPanel.css';
import Panel, { PanelHeader, PanelBody } from '../../ui/Panel/Panel';

const ExportPanel = ({ isOpen, artboard, onClose, onExport }) => {
  const [settings, setSettings] = useState({
    type: 'png',
    scale: 1,
  });

  const handleExportClick = () => {
    onExport(artboard, settings);
  };
  
  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Panel isOpen={isOpen} className="export-panel-overlay">
      <div onClick={(e) => e.stopPropagation()}>
        <PanelHeader>
          <h2>Export</h2>
          <button onClick={onClose} className="close-button">
            <X size={24} />
          </button>
        </PanelHeader>
        <PanelBody>
          <div className="preview-area">
            <div className="preview-placeholder">
              Preview
            </div>
          </div>
          <div className="settings-area">
            <h4>Resource</h4>
            <select
              className="resource-selector"
              defaultValue={artboard?.id}
            >
              <option value={artboard?.id}>{artboard?.name || 'Selected Artboard'}</option>
            </select>
            
            <h4>Settings</h4>
            <select 
              className="settings-select" 
              value={settings.type}
              onChange={(e) => handleSettingChange('type', e.target.value)}
            >
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
              <option value="svg">SVG</option>
            </select>
            
            <button className="export-button" onClick={handleExportClick}>Export</button>
          </div>
        </PanelBody>
      </div>
    </Panel>
  );
};

export default ExportPanel;
