export const haveElementsChanged = (elementsA, elementsB) => {
  if (elementsA.length !== elementsB.length) return true;
  for (let i = 0; i < elementsA.length; i++) {
    const elA = elementsA[i];
    const elB = elementsB.find(b => b.id === elA.id);
    if (!elB) return true;
    // Compare all possible properties
    if (
      elA.x !== elB.x ||
      elA.y !== elB.y ||
      elA.width !== elB.width ||
      elA.height !== elB.height ||
      elA.rotation !== elB.rotation ||
      elA.radius !== elB.radius
    ) {
      return true;
    }
  }
  return false;
};
