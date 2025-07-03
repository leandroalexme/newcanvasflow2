import React from 'react';
import { SquaresFour, Image, FolderSimple, UploadSimple } from '@phosphor-icons/react';
import './LeftToolbar.css';

const IconButton = ({ icon: Icon, isActive }) => (
  <div className={`icon-button ${isActive ? 'active' : ''}`}>
    <Icon size={24} weight="fill" />
  </div>
);

const LeftToolbar = () => {
  return (
    <div className="left-toolbar">
      <IconButton icon={SquaresFour} isActive={true} />
      <div className="toolbar-divider" />
      <IconButton icon={Image} />
      <IconButton icon={FolderSimple} />
      <IconButton icon={UploadSimple} />
    </div>
  );
};

export default LeftToolbar; 