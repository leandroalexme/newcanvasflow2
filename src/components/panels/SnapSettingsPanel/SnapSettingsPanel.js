import React from 'react';
import './SnapSettingsPanel.css';
import { X } from '@phosphor-icons/react';
import Panel, { PanelHeader, PanelBody } from '../../ui/Panel/Panel';

const SnapSettingsPanel = ({ isOpen, settings, onChange, onClose }) => {
  const handleToggle = (key) => {
    onChange({ ...settings, [key]: !settings[key] });
  };

  const handleInputChange = (key, value) => {
    onChange({ ...settings, [key]: parseInt(value, 10) || 0 });
  };

  return (
    <Panel isOpen={isOpen} className="snap-settings-panel">
      <PanelHeader>
        <div className="header-title">Snap Settings</div>
        <button onClick={onClose} className="close-btn">
          <X size={20} />
        </button>
      </PanelHeader>
      <PanelBody>
        <div className="setting-row">
          <label htmlFor="enable-snapping">Enable snapping</label>
          <input
            type="checkbox"
            id="enable-snapping"
            checked={settings.isEnabled}
            onChange={(e) => handleToggle('isEnabled')}
          />
        </div>
        <div className="setting-row">
          <label htmlFor="snap-tolerance">Screen tolerance</label>
          <input
            type="number"
            id="snap-tolerance"
            value={settings.tolerance}
            onChange={(e) => handleInputChange('tolerance', e.target.value)}
            min="1"
            max="50"
          />
        </div>
        
        <div className="divider" />
        
        <div className="setting-group-header">Snap to</div>
        
        <div className="setting-row">
          <label htmlFor="snap-objects">Object bounding boxes</label>
          <input
            type="checkbox"
            id="snap-objects"
            checked={settings.snapToObjects}
            onChange={(e) => handleToggle('snapToObjects')}
          />
        </div>
      </PanelBody>
    </Panel>
  );
};

export default SnapSettingsPanel;
