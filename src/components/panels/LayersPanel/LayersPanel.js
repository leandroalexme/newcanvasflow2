import React from 'react';
import './LayersPanel.css';
import { 
  DotsThree, Eye, EyeSlash, LockSimple, LockSimpleOpen, CaretDown, 
  Hash, Rectangle, Circle, TextT 
} from '@phosphor-icons/react';
import Panel, { PanelHeader, PanelBody } from '../../ui/Panel/Panel';

const capitalizeFirstLetter = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const getIconForElement = (element, isFilled = false) => {
  const iconProps = { weight: isFilled ? 'fill' : 'regular' };
  switch (element.type) {
    case 'artboard':
      return <Hash {...iconProps} />;
    case 'rect':
      return <Rectangle {...iconProps} />;
    case 'circle':
      return <Circle {...iconProps} />;
    case 'text':
      return <TextT {...iconProps} />;
    default:
      return null;
  }
};

const LayersPanel = ({ isOpen, elements, selectedElementIds, onSelectElement, onToggleProperty, onClose }) => {
  const renderLayer = (layer, isChild = false) => {
    const isSelected = selectedElementIds.includes(layer.id);
    const isVisible = layer.visible !== false;
    const isLocked = layer.locked === true;

    return (
      <div 
        key={layer.id} 
        className={`layer-row ${isSelected ? 'selected' : ''} ${isChild ? 'is-child' : ''}`}
        onClick={(e) => onSelectElement(layer.id, e.metaKey || e.ctrlKey)}
      >
        <div className="layer-info">
          <div className="layer-indent">
            {!isChild && layer.type === 'artboard' && <CaretDown size={16} />}
          </div>
          <div className="layer-icon">{getIconForElement(layer, isChild)}</div>
          <span className="text-body">{capitalizeFirstLetter(layer.name || layer.type)}</span>
        </div>
        <div className="layer-actions">
          <button 
            className={`action-button visibility-button ${isVisible ? 'is-visible' : 'is-hidden'}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleProperty(layer.id, 'visible');
            }}
          >
            {isVisible ? <Eye weight="fill" /> : <EyeSlash weight="fill" />}
          </button>
          <button 
            className={`action-button lock-button ${isLocked ? 'is-locked' : 'is-unlocked'}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleProperty(layer.id, 'locked');
            }}
          >
            {isLocked ? <LockSimple weight="fill" /> : <LockSimpleOpen weight="fill" />}
          </button>
        </div>
      </div>
    );
  };

  const renderHierarchicalList = () => {
    const elementsById = new Map(elements.map(el => [el.id, el]));
    const childrenByParentId = new Map();
    const rootElements = [];

    elements.forEach(el => {
      if (el.parentId && elementsById.has(el.parentId)) {
        const children = childrenByParentId.get(el.parentId) || [];
        children.push(el);
        childrenByParentId.set(el.parentId, children);
      } else {
        rootElements.push(el);
      }
    });

    const result = [];
    const buildList = (element, isChild) => {
      result.push(renderLayer(element, isChild));
      const children = childrenByParentId.get(element.id);
      if (children) {
        children.forEach(child => buildList(child, true));
      }
    };

    rootElements.forEach(el => buildList(el, false));
    return result;
  };

  return (
    <Panel isOpen={isOpen} className="layers-panel">
      <PanelHeader>
        <div className="header-tabs">
          <span className="tab-active">Layers</span>
          <span className="tab-inactive">Page</span>
        </div>
        <button className="more-options-button" onClick={onClose}>
          <DotsThree size={20} weight="bold" />
        </button>
      </PanelHeader>
      <PanelBody>
        <div className="layers-list">
          {renderHierarchicalList()}
        </div>
        <div className="panel-handle">
          <div className="handle-line"></div>
        </div>
      </PanelBody>
    </Panel>
  );
};

export default LayersPanel;
