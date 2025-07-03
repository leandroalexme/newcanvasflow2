import React from 'react';
import {
  Copy, PaintBrush, Clipboard, CopySimple, Trash, AlignLeft,
  Stack, Lock, DownloadSimple, CaretRight
} from '@phosphor-icons/react';
import './ContextMenu.css';

const MenuItem = ({ icon: Icon, label, shortcut, hasSubmenu }) => (
  <div className="menu-item">
    <Icon size={20} weight="regular" />
    <span className="menu-label">{label}</span>
    {shortcut && <span className="menu-shortcut">{shortcut}</span>}
    {hasSubmenu && <CaretRight size={16} className="menu-submenu-arrow" />}
  </div>
);

const MenuDivider = () => <div className="menu-divider" />;

const ContextMenu = ({ x, y, isVisible }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="context-menu" style={{ top: y, left: x }}>
      <MenuItem icon={CopySimple} label="Copiar" shortcut="⌘C" />
      <MenuItem icon={PaintBrush} label="Copiar formatação" shortcut="⇧⌘C" />
      <MenuItem icon={Clipboard} label="Colar" shortcut="⌘V" />
      <MenuItem icon={Copy} label="Duplicar" shortcut="⌘D" />
      <MenuItem icon={Trash} label="Excluir" shortcut="DELETE" />
      <MenuDivider />
      <MenuItem icon={AlignLeft} label="Alinhar elementos" hasSubmenu />
      <MenuDivider />
      <MenuItem icon={Stack} label="Agrupar" shortcut="⌘G" />
      <MenuItem icon={Lock} label="Bloquear" hasSubmenu />
      <MenuDivider />
      <MenuItem icon={DownloadSimple} label="Seleção para download" />
    </div>
  );
};

export default ContextMenu; 