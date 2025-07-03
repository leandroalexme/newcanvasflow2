import { SNAP_STRENGTH_MODIFIER } from "../../core/constants";

/**
 * Gets the bounding box of an element.
 * @param {object} element - The element object.
 * @returns {object} The bounding box { x1, y1, x2, y2, width, height }.
 */
const getBoundingBox = (element) => {
    return {
        x1: element.x,
        y1: element.y,
        x2: element.x + element.width,
        y2: element.y + element.height,
        width: element.width,
        height: element.height,
    };
};

/**
 * Gets the potential snap lines for a given element.
 * These are the vertical and horizontal lines that pass through the element's
 * center and edges.
 * @param {object} element - The element for which to get snap lines.
 * @returns {object} An object with 'vertical' and 'horizontal' arrays of snap lines.
 */
export const getElementSnapLines = (element) => {
    const box = getBoundingBox(element);
    
    if (element.type === 'ellipse' || element.type === 'circle') {
        const cx = box.x1 + box.width / 2;
        const cy = box.y1 + box.height / 2;
        const rx = box.width / 2;
        const ry = box.height / 2;

        return {
            vertical: [
                { type: 'left', x: cx - rx },
                { type: 'centerX', x: cx },
                { type: 'right', x: cx + rx },
            ],
            horizontal: [
                { type: 'top', y: cy - ry },
                { type: 'centerY', y: cy },
                { type: 'bottom', y: cy + ry },
            ],
        };
    }
    
    // Default rectangular logic
    const halfWidth = box.width / 2;
    const halfHeight = box.height / 2;

    return {
        vertical: [
            { type: 'left', x: box.x1 },
            { type: 'centerX', x: box.x1 + halfWidth },
            { type: 'right', x: box.x2 },
        ],
        horizontal: [
            { type: 'top', y: box.y1 },
            { type: 'centerY', y: box.y1 + halfHeight },
            { type: 'bottom', y: box.y2 },
        ],
    };
};

/**
 * Finds snap adjustments for a moving element against a set of static elements.
 * This optimized version finds the best snap for each axis in a single pass
 * and then generates the necessary guideline.
 * @param {object} movingElement - The element being moved.
 * @param {Array<object>} staticElements - The elements to snap against.
 * @param {number} scale - The current canvas scale.
 * @param {number} snapThreshold - The pixel distance to trigger a snap.
 * @param {object} snapSettings - The detailed snap settings object.
 * @returns {object} An object containing the snap offset { x, y } and snap lines.
 */
export const findSnapAdjustments = (movingElement, staticElements, scale, snapThreshold, snapSettings) => {
    // If snapping is off via threshold or main setting, do nothing.
    if (snapThreshold === 0 || !snapSettings.isEnabled) {
        return { snapOffset: { x: 0, y: 0 }, snapLines: [] };
    }

    const snapOffset = { x: 0, y: 0 };
    const snapLines = [];
    const movingElementLines = getElementSnapLines(movingElement);
    const scaledSnapThreshold = snapThreshold / scale;

    let bestVSnap = null;
    let bestHSnap = null;

    // Only perform object snapping if it's enabled
    if (snapSettings.snapToObjects) {
        // Find the closest vertical and horizontal snap opportunities in one pass
        for (const staticElement of staticElements) {
            if (staticElement.id === movingElement.id) continue;

            const staticElementLines = getElementSnapLines(staticElement);

            // Check for best vertical snap
            for (const movingV of movingElementLines.vertical) {
                for (const staticV of staticElementLines.vertical) {
                    const d = staticV.x - movingV.x;
                    if (Math.abs(d) < scaledSnapThreshold) {
                        if (!bestVSnap || Math.abs(d) < Math.abs(bestVSnap.d)) {
                            bestVSnap = { d, staticLine: staticV, staticElement };
                        }
                    }
                }
            }

            // Check for best horizontal snap
            for (const movingH of movingElementLines.horizontal) {
                for (const staticH of staticElementLines.horizontal) {
                    const d = staticH.y - movingH.y;
                    if (Math.abs(d) < scaledSnapThreshold) {
                        if (!bestHSnap || Math.abs(d) < Math.abs(bestHSnap.d)) {
                            bestHSnap = { d, staticLine: staticH, staticElement };
                        }
                    }
                }
            }
        }
    }

    const finalMovingElement = { ...movingElement };

    // Apply snaps and generate corresponding guidelines
    if (bestVSnap) {
        snapOffset.x = bestVSnap.d;
        finalMovingElement.x += snapOffset.x;
        
        const movingBox = getBoundingBox(finalMovingElement);
        const staticBox = getBoundingBox(bestVSnap.staticElement);
        
        const yMin = Math.min(movingBox.y1, staticBox.y1);
        const yMax = Math.max(movingBox.y2, staticBox.y2);
        
        snapLines.push({ type: 'vertical', x: bestVSnap.staticLine.x, y1: yMin, y2: yMax });
    }
    
    if (bestHSnap) {
        snapOffset.y = bestHSnap.d;
        finalMovingElement.y += snapOffset.y;
        
        const movingBox = getBoundingBox(finalMovingElement);
        const staticBox = getBoundingBox(bestHSnap.staticElement);
        
        const xMin = Math.min(movingBox.x1, staticBox.x1);
        const xMax = Math.max(movingBox.x2, staticBox.x2);

        snapLines.push({ type: 'horizontal', y: bestHSnap.staticLine.y, x1: xMin, x2: xMax });
    }

    return { snapOffset, snapLines };
};
