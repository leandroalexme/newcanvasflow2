import { useState } from 'react';

const usePanelManager = () => {
  const [isSnapPanelOpen, setIsSnapPanelOpen] = useState(false);
  const [isExportPanelOpen, setIsExportPanelOpen] = useState(false);
  const [isTransformPanelOpen, setIsTransformPanelOpen] = useState(false);
  const [isLayersPanelOpen, setIsLayersPanelOpen] = useState(true);
  const [isTextPanelOpen, setIsTextPanelOpen] = useState(false);

  const handlePanelToggle = (panelToToggle) => {
    const panelStates = {
      transform: isTransformPanelOpen,
      layers: isLayersPanelOpen,
      snap: isSnapPanelOpen,
      text: isTextPanelOpen,
    };
    const panelSetters = {
      transform: setIsTransformPanelOpen,
      layers: setIsLayersPanelOpen,
      snap: setIsSnapPanelOpen,
      text: setIsTextPanelOpen,
    };

    if (panelStates[panelToToggle]) {
      panelSetters[panelToToggle](false);
      return;
    }

    const openCount = Object.values(panelStates).filter(Boolean).length;

    if (openCount < 2) {
      panelSetters[panelToToggle](true);
    } else {
      const closePriority = ['transform', 'snap', 'text', 'layers'];
      for (const panelNameToClose of closePriority) {
        if (panelStates[panelNameToClose] && panelNameToClose !== panelToToggle) {
          panelSetters[panelNameToClose](false);
          break;
        }
      }
      panelSetters[panelToToggle](true);
    }
  };

  return {
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
  };
};

export default usePanelManager; 