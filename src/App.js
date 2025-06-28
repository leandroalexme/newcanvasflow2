import React, { useState } from 'react';
import './index.css';
import Canvas from './components/Canvas';
import FpsCounter from './components/FpsCounter';
import { useHistory } from './hooks/useHistory';
import { createArtboard } from './artboard/artboardUtils';
import { createElement } from './utils/element';

const initialElements = [
  createArtboard(0, 0, 500, 400, 'Artboard 1'),
  createArtboard(600, 0, 300, 400, 'Artboard 2'),
  createElement('rect', { x: 50, y: 50, width: 100, height: 100, rotation: 0, fill: '#FFC107' }),
  createElement('rect', { x: 200, y: 200, width: 150, height: 80, rotation: 0, fill: '#03A9F4' }),
  createElement('circle', { x: 400, y: 150, radius: 50, fill: '#4CAF50' }),
];

function App() {
  const { state: elements, setState: setElements, commit, undo, redo } = useHistory(initialElements);
  const [perfMetrics, setPerfMetrics] = useState({ fps: 0, ms: 0 });

  return (
    <div className="App">
      <h1>CanvasFlow Design Editor</h1>
      <FpsCounter perfMetrics={perfMetrics} />
      <Canvas 
        elements={elements} 
        setElements={setElements}
        commit={commit}
        undo={undo}
        redo={redo}
        setPerfMetrics={setPerfMetrics}
      />
    </div>
  );
}

export default App;
