import React, { useState, useCallback } from 'react';
import './index.css';
import Canvas from './components/Canvas';
import FpsCounter from './components/FpsCounter/FpsCounter';
import LeftToolbar from './components/ui/LeftToolbar/LeftToolbar';
import BottomToolbar from './components/ui/BottomToolbar/BottomToolbar';
import RightToolbar from './components/ui/RightToolbar/RightToolbar';
import ContextMenu from './components/ContextMenu/ContextMenu';
import SnapSettingsPanel from './components/panels/SnapSettingsPanel/SnapSettingsPanel';
import Logo from './components/ui/Logo/Logo';
import ProjectControls from './components/ui/ProjectControls/ProjectControls';
import ZoomControl from './components/ui/ZoomControl/ZoomControl';
import UserActions from './components/ui/UserActions/UserActions';
import LayersButton from './components/ui/LayersButton/LayersButton';
import ExportPanel from './components/panels/ExportPanel/ExportPanel';
import TransformPanel from './components/panels/TransformPanel/TransformPanel';
import LayersPanel from './components/panels/LayersPanel/LayersPanel';
import TextPanel from './components/panels/TextPanel/TextPanel';
import { useEditor } from './context/EditorContext';
import { exportToRaster, exportToSVG } from './core/exporter';
import { rawElements } from './core/initial-data';
import usePanelManager from './hooks/usePanelManager';
import { initializeElementParents } from './modules/artboard/artboardAssociation';

const initialElements = initializeElementParents(rawElements);

function App() {
  const { 
    elements, 
    commit, 
    undo, 
    redo, 
    selectedElementIds, 
    setSelectedElementIds 
  } = useEditor();

  const {
    isSnapPanelOpen,
    setIsSnapPanelOpen,
    isExportPanelOpen,
    setIsExportPanelOpen,
    isTransformPanelOpen,
    setIsTransformPanelOpen,
    isLayersPanelOpen,
    setIsLayersPanelOpen,
    isTextPanelOpen,
    setIsTextPanelOpen,
    handlePanelToggle,
  } = usePanelManager();

  const [perfMetrics, setPerfMetrics] = useState({ fps: 0, ms: 0 });
  const [contextMenu, setContextMenu] = useState({ isVisible: false, x: 0, y: 0 });
  const [snapSettings, setSnapSettings] = useState({
    isEnabled: true,
    tolerance: 10,
    snapToObjects: true,
  });

  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    setContextMenu({ isVisible: true, x: e.clientX, y: e.clientY });
  }, []);

  const closeContextMenu = useCallback(() => {
    if (contextMenu.isVisible) {
      setContextMenu({ ...contextMenu, isVisible: false });
    }
  }, [contextMenu]);

  const updateElementProperties = (elementId, newProperties) => {
    const updatedElements = elements.map(el => {
      if (el.id === elementId) {
        return { ...el, ...newProperties };
      }
      return el;
    });
    commit(updatedElements);
  };

  const handleLayerToggleProperty = (elementId, property) => {
    const elementToUpdate = elements.find(el => el.id === elementId);
    if (elementToUpdate) {
      updateElementProperties(elementId, { [property]: !elementToUpdate[property] });
    }
  };

  const handleSelectElement = (elementId, metaKey) => {
    setSelectedElementIds(prevSelected => {
      if (metaKey) {
        return prevSelected.includes(elementId)
          ? prevSelected.filter(id => id !== elementId)
          : [...prevSelected, elementId];
      }
      return [elementId];
    });
  };

  const handleExport = (artboard, settings) => {
    if (!artboard) {
      alert("Please select an artboard to export.");
      return;
    }

    if (settings.type === 'svg') {
      exportToSVG(elements, artboard);
    } else if (settings.type === 'png' || settings.type === 'jpeg') {
      exportToRaster(elements, artboard, settings);
    }
    
    setIsExportPanelOpen(false);
  };

  const selectedElements = elements.filter(el => selectedElementIds.includes(el.id));
  const selectedArtboard = elements.find(el => el.id === selectedElementIds[0] && el.type === 'artboard') || elements.find(el => el.type === 'artboard');

  return (
    <div className="app-container" onClick={closeContextMenu}>
      <Logo />
      <ProjectControls onExportClick={() => setIsExportPanelOpen(true)} />
      <ZoomControl />
      <UserActions />
      <LeftToolbar />
      <RightToolbar 
        onSnapSettingsToggle={() => handlePanelToggle('snap')}
        isSnapSettingsOpen={isSnapPanelOpen}
        onAlignmentPanelToggle={() => handlePanelToggle('transform')}
        isAlignmentPanelOpen={isTransformPanelOpen}
        onLayersPanelToggle={() => handlePanelToggle('layers')}
        isLayersPanelOpen={isLayersPanelOpen}
        onTextPanelToggle={() => handlePanelToggle('text')}
        isTextPanelOpen={isTextPanelOpen}
      />
      <Canvas 
        setPerfMetrics={setPerfMetrics}
        onContextMenu={handleContextMenu}
        snapSettings={snapSettings}
      />

      <div className="right-panels-container">
        <TransformPanel 
          isOpen={isTransformPanelOpen}
          onClose={() => setIsTransformPanelOpen(false)} 
          selectedElements={selectedElements}
          updateElementProperties={updateElementProperties}
        />
        <LayersPanel 
          isOpen={isLayersPanelOpen}
          elements={elements}
          selectedElementIds={selectedElementIds}
          onSelectElement={handleSelectElement}
          onToggleProperty={handleLayerToggleProperty}
          onClose={() => setIsLayersPanelOpen(false)}
        />
        <TextPanel
            isOpen={isTextPanelOpen}
            onClose={() => setIsTextPanelOpen(false)}
            selectedElements={selectedElements}
            updateElementProperties={updateElementProperties}
        />
      <SnapSettingsPanel 
        isOpen={isSnapPanelOpen}
        settings={snapSettings}
        onChange={setSnapSettings}
        onClose={() => setIsSnapPanelOpen(false)}
      />
      </div>

      <ExportPanel 
        isOpen={isExportPanelOpen}
        artboard={selectedArtboard}
        onClose={() => setIsExportPanelOpen(false)}
        onExport={handleExport}
      />
      <BottomToolbar />
      <ContextMenu x={contextMenu.x} y={contextMenu.y} isVisible={contextMenu.isVisible} />
      <FpsCounter perfMetrics={perfMetrics} />
    </div>
  );
}

export default App;
