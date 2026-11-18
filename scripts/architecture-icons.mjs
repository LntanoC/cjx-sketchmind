import { randomInt, randomUUID } from 'node:crypto';
import { icons } from './architecture-icon-definitions.mjs';

export function createArchitectureIcon(kind, { x, y, size = 32, strokeColor = '#315EA1', groupId = randomUUID() } = {}) {
  if (!Object.hasOwn(icons, kind)) throw new Error(`Unknown architecture icon: ${kind}`);
  if (![x, y, size].every(Number.isFinite) || size <= 0) {
    throw new Error('Architecture icons need finite coordinates and a positive size.');
  }
  const scale = size / 32;
  const updated = Date.now();

  return icons[kind].map(part => {
    const geometry = part.type === 'line' ? lineGeometry(part.points) : part;
    const element = {
      id: randomUUID(), type: part.type,
      x: x + geometry.x * scale, y: y + geometry.y * scale,
      width: geometry.width * scale, height: geometry.height * scale,
      angle: 0, strokeColor, backgroundColor: 'transparent', fillStyle: 'solid',
      strokeWidth: Math.max(1, 1.8 * scale), strokeStyle: 'solid', roughness: 0, opacity: 100,
      groupIds: [groupId], frameId: null, index: null, roundness: null,
      seed: randomInt(1, 2 ** 31), version: 1, versionNonce: 0, isDeleted: false,
      boundElements: null, updated, link: null, locked: false,
    };
    if (part.type === 'line') {
      const [firstX, firstY] = part.points[0];
      element.points = part.points.map(([px, py]) => [(px - firstX) * scale, (py - firstY) * scale]);
      element.lastCommittedPoint = null;
      element.startBinding = element.endBinding = null;
      element.startArrowhead = element.endArrowhead = null;
    }
    return element;
  });
}

function lineGeometry(points) {
  const [x, y] = points[0];
  const xs = points.map(([px]) => px);
  const ys = points.map(([, py]) => py);
  return { x, y, width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) };
}
