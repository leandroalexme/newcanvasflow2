import React from 'react';
import { Rows } from '@phosphor-icons/react';
import './LayersButton.css';

const LayersButton = () => {
  return (
    <button className="layers-button" title="Camadas (Alt+L)">
      <Rows size={24} weight="fill" />
    </button>
  );
};

export default LayersButton; 