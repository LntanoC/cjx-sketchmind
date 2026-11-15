import { randomUUID } from 'node:crypto';

export const palette = {
  neutral: { fill: '#F8F7F4', stroke: '#B4B2A9' },
  agent: { fill: '#F0ECFA', stroke: '#9A82CF' },
  skill: { fill: '#FFF3DF', stroke: '#E9A34A' },
  tool: { fill: '#EDF4FE', stroke: '#4C8DDB' },
  data: { fill: '#E9F5F2', stroke: '#58AAA8' },
  result: { fill: '#EDF7EF', stroke: '#65B889' },
};
const ink = '#2C2C2A';
const flatten = text => String(text || '').replace(/\s+/g, '');
const roleFor = text => /skill|技能|规范|指令/i.test(text) ? 'skill'
  : /agent|推理|规划|协调|检查/i.test(text) ? 'agent'
    : /文件|数据|画布|\.mmd|\.png|\.json|结果路径|知识索引/i.test(text) ? 'data'
      : /成功|完成|交付|输出结果/i.test(text) ? 'result'
        : /cli|工具|浏览器|脚本|服务/i.test(text) ? 'tool' : 'neutral';
const chooseRole = (text, rules = []) => rules.find(rule => flatten(text).includes(flatten(rule.match)))?.role || roleFor(text);
// Arrows may have negative local points: x + width is not their actual right edge.
// Using point extents avoids large empty margins on returns and retry connectors.
const bounds = elements => {
  const extents = elements.map(e => e.points?.length ? {
    left: e.x + Math.min(...e.points.map(p => p[0])), right: e.x + Math.max(...e.points.map(p => p[0])),
    top: e.y + Math.min(...e.points.map(p => p[1])), bottom: e.y + Math.max(...e.points.map(p => p[1])),
  } : { left: e.x, right: e.x + e.width, top: e.y, bottom: e.y + e.height });
  return { left: Math.min(...extents.map(e => e.left)), right: Math.max(...extents.map(e => e.right)), top: Math.min(...extents.map(e => e.top)), bottom: Math.max(...extents.map(e => e.bottom)) };
};

function validateDesign(design) {
  if (!design || typeof design !== 'object' || Array.isArray(design)) throw new Error('Design must be a JSON object.');
  if (design.connectCards !== undefined && typeof design.connectCards !== 'boolean') throw new Error('connectCards must be a boolean.');
  if (design.decisionLayout && !['compact', 'external'].includes(design.decisionLayout)) throw new Error('decisionLayout must be compact or external.');
  for (const key of ['roles', 'phases', 'cards', 'emphasis']) {
    if (design[key] !== undefined && (!Array.isArray(design[key]) || design[key].length > 30)) throw new Error(`Design ${key} must be an array of at most 30 entries.`);
  }
  for (const item of [...(design.roles || []), ...(design.cards || []), ...(design.emphasis || [])]) {
    if (item.role && !palette[item.role]) throw new Error(`Unknown design role: ${item.role}`);
  }
  for (const rule of design.roles || []) if (typeof rule.match !== 'string' || !rule.match.trim()) throw new Error('Role matching requires nonempty text.');
  for (const phase of design.phases || []) if (!phase.from || !phase.to || !phase.title) throw new Error('A phase needs from, to and title.');
  for (const card of design.cards || []) if (!card.anchor || !card.title || typeof card.body !== 'string') throw new Error('A card needs anchor, title and body.');
}

// Conservative line estimates keep added Chinese text within its own card.
// Existing text is scaled uniformly instead of reflowed, preserving converter layout.
function wrap(text, width, fontSize) {
  return String(text).split('\n').flatMap(line => {
    const lines = []; let row = ''; let units = 0;
    for (const char of line) {
      const next = /[\u0000-\u007f]/.test(char) ? 0.62 : 1.04;
      if (row && (units + next) * fontSize > width) { lines.push(row); row = ''; units = 0; }
      row += char; units += next;
    }
    return [...lines, row];
  }).join('\n');
}

export function styleScene(original, design = {}, { sequence = false } = {}) {
  validateDesign(design);
  const scene = structuredClone(original);
  const live = scene.elements.filter(e => !e.isDeleted);
  if (!live.length) throw new Error('Cannot style an empty scene.');
  const baseShape = live.find(e => ['rectangle', 'diamond', 'ellipse'].includes(e.type));
  const baseText = live.find(e => e.type === 'text');
  const baseArrow = live.find(e => e.type === 'arrow');
  if (!baseShape || !baseText) throw new Error('Styling needs native shapes and text.');
  const byId = new Map(live.map(e => [e.id, e]));
  const originalIds = new Set(live.map(e => e.id));
  const backgrounds = [], additions = [];
  const id = () => `cjx-${randomUUID()}`;
  const cloneElement = (base, patch) => ({ ...structuredClone(base), id: id(), groupIds: [], boundElements: null, containerId: null, startBinding: null, endBinding: null, version: 1, versionNonce: 0, isDeleted: false, locked: false, updated: Date.now(), ...patch });
  const addShape = (x, y, width, height, role = 'neutral', patch = {}) => {
    const colors = palette[role];
    const e = cloneElement(baseShape, { type: 'rectangle', x, y, width, height, strokeColor: colors.stroke, backgroundColor: colors.fill, fillStyle: 'solid', strokeWidth: 1.4, strokeStyle: 'solid', roughness: 1, opacity: 100, roundness: { type: 3 }, ...patch });
    additions.push(e); return e;
  };
  const addText = (text, x, y, width, size = 18, color = ink) => {
    const content = wrap(text, width, size);
    const e = cloneElement(baseText, { type: 'text', text: content, originalText: content, x, y, width, height: content.split('\n').length * size * 1.3, fontSize: size, fontFamily: 2, lineHeight: 1.3, textAlign: 'left', verticalAlign: 'top', autoResize: false, strokeColor: color, backgroundColor: 'transparent', opacity: 100 });
    additions.push(e); return e;
  };
  const addArrow = (points, role, label, dashed = false) => {
    if (!baseArrow) throw new Error('Design connectors require an arrow in the original scene.');
    const [first] = points;
    const local = points.map(([x, y]) => [x - first[0], y - first[1]]);
    const e = cloneElement(baseArrow, { type: 'arrow', x: first[0], y: first[1], width: Math.max(...local.map(p => p[0])) - Math.min(...local.map(p => p[0])), height: Math.max(...local.map(p => p[1])) - Math.min(...local.map(p => p[1])), points: local, strokeColor: palette[role].stroke, backgroundColor: 'transparent', strokeWidth: 1.8, strokeStyle: dashed ? 'dashed' : 'solid', startArrowhead: null, endArrowhead: 'arrow', elbowed: false, roundness: null });
    additions.push(e);
    if (label) addText(label, first[0] + 8, first[1] - 26, 130, 16, palette[role].stroke);
    return e;
  };

  // IDs and bindings survive a uniform expansion, so manual editing remains possible.
  const scale = 1.15;
  for (const e of live) {
    for (const key of ['x', 'y', 'width', 'height']) e[key] *= scale;
    if (e.points) e.points = e.points.map(([x, y]) => [x * scale, y * scale]);
    if (e.type === 'text') e.fontSize *= scale;
  }
  const textOf = e => e.boundElements?.filter(b => b.type === 'text').map(b => byId.get(b.id)?.text || '').join(' ') || '';
  const texts = live.filter(e => e.type === 'text');
  const findText = query => {
    const matched = texts.filter(e => flatten(e.text).includes(flatten(query)));
    if (matched.length !== 1) throw new Error(`Design anchor must match one text element: ${query} (${matched.length} matches).`);
    return matched[0];
  };
  const content = bounds(live);
  const topActors = sequence ? live.filter(e => ['rectangle', 'ellipse'].includes(e.type) && e.y < content.top + 40) : [];
  for (const e of live) {
    if (['rectangle', 'ellipse', 'diamond'].includes(e.type)) {
      const role = chooseRole(textOf(e), design.roles);
      const c = palette[role];
      // Preserve explicit Mermaid class colors on generic flowcharts.
      if (sequence || !e.backgroundColor || ['transparent', '#ffffff', '#fff'].includes(e.backgroundColor.toLowerCase())) {
        e.backgroundColor = c.fill; e.strokeColor = c.stroke; e.fillStyle = 'solid';
      }
      if (e.type === 'rectangle') e.roundness = { type: 3 };
      e.strokeWidth = 1.5; e.roughness = 1;
    } else if (e.type === 'line' && sequence && e.width < 2) {
      e.strokeColor = '#B4B2A9'; e.strokeStyle = 'dashed'; e.strokeWidth = 1;
    } else if (e.type === 'arrow') {
      e.strokeWidth = 1.6;
      if (sequence) {
        const actor = [...topActors].sort((a, b) => Math.abs(a.x + a.width / 2 - e.x) - Math.abs(b.x + b.width / 2 - e.x))[0];
        e.strokeColor = palette[e.strokeStyle === 'solid' ? chooseRole(textOf(actor || {}), design.roles) : 'data'].stroke;
        if (e.strokeStyle !== 'solid') e.strokeStyle = 'dashed';
      }
    } else if (e.type === 'text') e.strokeColor = ink;
  }

  // Sequence note boxes become document/content cards, with a readable smaller tier.
  if (sequence) for (const e of live.filter(e => e.type === 'rectangle' && e.strokeStyle === 'dashed')) {
    e.fillStyle = 'solid'; e.backgroundColor = palette.skill.fill; e.strokeColor = palette.skill.stroke;
    for (const bound of e.boundElements || []) {
      const text = byId.get(bound.id);
      if (text?.type !== 'text') continue;
      const ratio = 18 / text.fontSize;
      text.x += text.width * (1 - ratio) / 2; text.y += text.height * (1 - ratio) / 2;
      text.width *= ratio; text.height *= ratio; text.fontSize = 18;
    }
  }

  const phased = design.phases || [];
  for (let i = 0; i < phased.length; i++) {
    const phase = phased[i];
    const from = findText(phase.from), to = findText(phase.to);
    const top = from.y - 20, bottom = to.y + to.height + 24;
    if (bottom <= top) throw new Error('Design phase ends before it starts.');
    const box = addShape(content.left - 30, top, content.right - content.left + 60, bottom - top, 'neutral', { strokeStyle: 'dashed', strokeWidth: 1, opacity: 55 });
    additions.splice(additions.indexOf(box), 1); backgrounds.push(box);
    addShape(content.left - 275, top, 225, 62, 'neutral', { strokeColor: '#B4B2A9' });
    addText(`${i + 1 < 10 ? '0' : ''}${i + 1}  ${phase.title}`, content.left - 259, top + 15, 194, 22);
  }
  for (const marker of design.emphasis || []) {
    const text = findText(marker.match);
    const container = text.containerId ? byId.get(text.containerId) : null;
    const role = marker.role || 'skill';
    if (container && ['rectangle', 'diamond', 'ellipse'].includes(container.type)) {
      container.strokeWidth = 2.5; container.strokeColor = palette[role].stroke; container.backgroundColor = palette[role].fill;
    } else text.strokeColor = palette[role].stroke;
  }

  let cardBottom = content.top;
  const sidebar = content.right + 110;
  for (const card of design.cards || []) {
    const anchor = findText(card.anchor);
    const y = Math.max(anchor.y - 20, cardBottom + 24);
    const role = card.role || 'data';
    const body = wrap(card.body, 320, 18);
    const title = wrap(card.title, 320, 22);
    const titleHeight = title.split('\n').length * 22 * 1.3;
    const height = 40 + titleHeight + body.split('\n').length * 24;
    if (card.kind === 'decision') {
      // Keep explanatory feedback inside its own panel by default. Crossing the
      // lifelines with annotation arrows obscures the real Agent/tool exchanges.
      if (design.decisionLayout !== 'external') {
        if (card.retryTo) findText(card.retryTo);
        if (card.successTo) findText(card.successTo);
        addShape(sidebar + 80, y, 192, 96, role, { type: 'diamond', roundness: null });
        addText(card.title, sidebar + 112, y + 33, 150, 20);
        if (card.successTo) {
          addArrow([[sidebar + 80, y + 48], [sidebar + 18, y + 48], [sidebar + 18, y + 144]], 'result', '');
          addText('通过', sidebar + 26, y + 105, 80, 16, palette.result.stroke);
          addShape(sidebar, y + 144, 142, 58, 'result');
          addText(card.successLabel || '继续下一步', sidebar + 18, y + 162, 120, 18);
        }
        if (card.retryTo) {
          addArrow([[sidebar + 272, y + 48], [sidebar + 326, y + 48], [sidebar + 326, y + 144]], 'skill', '');
          addText('需修正', sidebar + 246, y + 105, 90, 16, palette.skill.stroke);
          addShape(sidebar + 190, y + 144, 162, 80, 'skill');
          addText(card.retryLabel || '局部修正\n重新检查', sidebar + 208, y + 158, 134, 17);
          addArrow([[sidebar + 352, y + 184], [sidebar + 378, y + 184], [sidebar + 378, y - 20], [sidebar + 176, y - 20], [sidebar + 176, y]], 'skill', '', true);
        }
        cardBottom = y + 224;
      } else {
        // Keep the decision separate from the imported sequence; its connectors show the retry branch.
        addShape(sidebar, y, 340, 136, role, { type: 'diamond', roundness: null });
        addText(card.title, sidebar + 94, y + 44, 170, 22);
        if (card.retryTo) {
          const target = findText(card.retryTo);
          const gutter = sidebar + 395;
          const exchange = byId.get(target.containerId);
          const endpoint = exchange?.points?.at(-1);
          const targetX = endpoint ? exchange.x + endpoint[0] : target.x;
          const targetY = endpoint ? exchange.y + endpoint[1] : target.y;
          addArrow([[sidebar + 340, y + 68], [gutter, y + 68], [gutter, targetY - 32], [targetX, targetY - 32], [targetX, targetY]], 'skill', '需修正', true);
          addText('局部修改源文件\n再生成与检查', gutter + 18, y - 32, 180, 17, palette.skill.stroke);
        }
        if (card.successTo) {
          const target = findText(card.successTo);
          addArrow([[sidebar, y + 68], [content.right + 30, y + 68], [content.right + 30, target.y], [target.x + target.width + 8, target.y]], 'result', '通过');
        }
        cardBottom = y + 136;
      }
    } else {
      addShape(sidebar, y, 352, height, role, { roundness: card.kind === 'file' ? null : { type: 3 }, strokeWidth: card.emphasis ? 2.5 : 1.4 });
      addText(title, sidebar + 16, y + 14, 320, 22, palette[role].stroke);
      addText(body, sidebar + 16, y + 24 + titleHeight, 320, 18);
      cardBottom = y + height;
    }
    // Numbered cards and vertical alignment provide the default association.
    // Leaders are explicit opt-in, rather than extra apparent steps in the flow.
    if (design.connectCards === true) addArrow([[anchor.x + anchor.width + 12, anchor.y + anchor.height / 2], [sidebar - 18, y + 24]], role, '', true);
  }

  const all = bounds([...live, ...backgrounds, ...additions]);
  if (design.title) addText(design.title, all.left, all.top - 115, all.right - all.left, 34);
  if (design.subtitle) addText(design.subtitle, all.left, all.top - 62, all.right - all.left, 20, '#66645E');
  if (design.legend !== false && (design.title || phased.length)) {
    const y = Math.max(all.bottom, cardBottom) + 45;
    const labels = [['agent', 'Agent：规划与判断'], ['skill', 'Skill：指引与修正'], ['tool', '工具：执行'], ['data', '数据：文件与结果'], ['result', '通过：交付']];
    labels.forEach(([role, label], i) => { addShape(all.left + i * 310, y, 20, 20, role); addText(label, all.left + i * 310 + 30, y - 2, 270, 17); });
    addText(`实线：读取 / 调用 / 通过    虚线：返回 / 局部修正    说明卡片按编号对应${design.connectCards ? '（含关联线）' : ''}`, all.left, y + 43, 1500, 17, '#66645E');
  }
  scene.elements = [...backgrounds, ...scene.elements, ...additions];
  scene.appState = { ...scene.appState, viewBackgroundColor: '#FFFEFA', exportBackground: true, exportWithDarkMode: false };
  scene.cjxStyle = { version: 1, profile: 'teaching', sequence, originalElementCount: originalIds.size, phases: phased.length, cards: design.cards?.length || 0 };
  return scene;
}
