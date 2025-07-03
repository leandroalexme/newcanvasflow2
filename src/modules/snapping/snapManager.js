import { findSnapAdjustments } from './snapUtils';

/**
 * Gerencia as operações de snapping (encaixe) entre elementos
 */
export const snapManager = {
  /**
   * Calcula os ajustes de snap para um elemento em relação a outros elementos
   * @param {Object} element - O elemento que está sendo movido/redimensionado
   * @param {Array} staticElements - Os elementos estáticos para verificar snap
   * @param {Number} scale - A escala atual da visualização
   * @param {Number} tolerance - A tolerância para o snap em pixels
   * @param {Object} settings - Configurações adicionais de snap
   * @returns {Object} Objeto contendo snapOffset e snapLines
   */
  calculateSnapAdjustments(element, staticElements, scale, tolerance, settings) {
    return findSnapAdjustments(element, staticElements, scale, tolerance, settings);
  }
}; 