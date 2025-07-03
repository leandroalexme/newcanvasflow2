import React from 'react';
import { Cursor, PenNib, PencilSimple, Pentagon, TextT } from '@phosphor-icons/react';
import './BottomToolbar.css';

const ToolButton = ({ icon: Icon, isActive }) => (
  <button className={`tool-button ${isActive ? 'active' : ''}`}>
    <Icon size={24} weight="fill" />
  </button>
);

const BottomToolbar = () => {
  return (
    <div className="bottom-toolbar">
      <ToolButton icon={Cursor} isActive={true} />
      <ToolButton icon={PenNib} />
      <ToolButton icon={PencilSimple} />
      <ToolButton icon={Pentagon} />
      <ToolButton icon={TextT} />
    </div>
  );
};

export default BottomToolbar; 