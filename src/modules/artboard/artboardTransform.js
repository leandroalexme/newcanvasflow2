/**
 * Redimensiona um Artboard com base na alça arrastada, com suporte a Shift e Ctrl/Cmd.
 * @param {object} artboard - O artboard a ser redimensionado.
 * @param {{x: number, y: number}} pivot - O ponto de pivô (o canto oposto à alça).
 * @param {{x: number, y: number}} worldPos - A posição atual do mouse.
 * @param {string} handleType - A alça que está sendo arrastada.
 * @param {boolean} isShiftPressed - Se a tecla Shift está pressionada.
 * @param {boolean} isCtrlPressed - Se a tecla Ctrl/Cmd está pressionada.
 * @returns {object} O artboard com as novas dimensões e posição.
 */
export const resizeArtboard = (artboard, pivot, worldPos, handleType, isShiftPressed = false, isCtrlPressed = false) => {
  const aspectRatio = artboard.width / artboard.height;

  let newX = artboard.x;
  let newY = artboard.y;
  let newWidth = artboard.width;
  let newHeight = artboard.height;

  const center = {
    x: artboard.x + artboard.width / 2,
    y: artboard.y + artboard.height / 2,
  };

  const isCornerHandle = !handleType.includes('middle') && !handleType.includes('center');
  const isHorizontalSideHandle = handleType === 'middle-left' || handleType === 'middle-right';
  
  if (isCtrlPressed) {
    // Redimensionamento a partir do centro
    if (isCornerHandle) {
      newWidth = Math.abs(worldPos.x - center.x) * 2;
      newHeight = Math.abs(worldPos.y - center.y) * 2;
    } else if (isHorizontalSideHandle) {
      newWidth = Math.abs(worldPos.x - center.x) * 2;
    } else { // Vertical
      newHeight = Math.abs(worldPos.y - center.y) * 2;
    }
    
    if (isShiftPressed) {
      if (newWidth / aspectRatio > newHeight) {
        newHeight = newWidth / aspectRatio;
      } else {
        newWidth = newHeight * aspectRatio;
      }
    }
    
    newX = center.x - newWidth / 2;
    newY = center.y - newHeight / 2;

  } else {
    // Redimensionamento a partir do pivô (canto oposto)
    if (handleType.includes('right')) newWidth = Math.max(1, worldPos.x - newX);
    if (handleType.includes('left')) {
      newWidth = Math.max(1, artboard.x + artboard.width - worldPos.x);
      newX = worldPos.x;
    }
    if (handleType.includes('bottom')) newHeight = Math.max(1, worldPos.y - newY);
    if (handleType.includes('top')) {
      newHeight = Math.max(1, artboard.y + artboard.height - worldPos.y);
      newY = worldPos.y;
    }

    if (isShiftPressed) {
      if (handleType.includes('left') || handleType.includes('right')) {
        const adjustedHeight = newWidth / aspectRatio;
        if (handleType.includes('top')) newY += newHeight - adjustedHeight;
        newHeight = adjustedHeight;
      } else {
        const adjustedWidth = newHeight * aspectRatio;
        if (handleType.includes('left')) newX += newWidth - adjustedWidth;
        newWidth = adjustedWidth;
      }
    }
  }

  return { ...artboard, x: newX, y: newY, width: newWidth, height: newHeight };
}; 