import test from 'node:test';
import assert from 'node:assert/strict';
import { styleScene } from './scene-style.mjs';

function fixture() {
  return { type: 'excalidraw', version: 2, elements: [
    { id: 'agent', type: 'rectangle', x: 200, y: 0, width: 200, height: 60, groupIds: ['g'], boundElements: [{ id: 'agent-text', type: 'text' }], backgroundColor: 'transparent' },
    { id: 'agent-text', type: 'text', text: 'Codex Agent', x: 210, y: 10, width: 180, height: 30, fontSize: 24, containerId: 'agent', groupIds: ['g'] },
    { id: 'skill', type: 'rectangle', x: 600, y: 0, width: 200, height: 60, boundElements: [{ id: 'skill-text', type: 'text' }], backgroundColor: 'transparent' },
    { id: 'skill-text', type: 'text', text: 'Skill', x: 620, y: 10, width: 160, height: 30, fontSize: 24, containerId: 'skill' },
    { id: 'return', type: 'arrow', x: 700, y: 250, width: 400, height: 0, points: [[0, 0], [-400, 0]], strokeStyle: 'dotted', startBinding: { elementId: 'skill', focus: 0, gap: 5 }, endBinding: { elementId: 'agent', focus: 0, gap: 5 }, boundElements: [{ id: 'result', type: 'text' }] },
    { id: 'result', type: 'text', text: '返回执行结果', x: 420, y: 230, width: 160, height: 24, fontSize: 18, containerId: 'return' },
  ], appState: { viewBackgroundColor: '#fff' } };
}

test('styling preserves source, element identities, groups, bindings and arrow direction', () => {
  const source = fixture(); const snapshot = structuredClone(source);
  const styled = styleScene(source, {}, { sequence: true });
  assert.deepEqual(source, snapshot);
  for (const old of source.elements) {
    const next = styled.elements.find(e => e.id === old.id);
    assert(next);
    assert.deepEqual(next.startBinding, old.startBinding);
    assert.deepEqual(next.endBinding, old.endBinding);
    assert.deepEqual(next.groupIds, old.groupIds);
    assert.deepEqual(next.boundElements, old.boundElements);
  }
  const arrow = styled.elements.find(e => e.id === 'return');
  assert(arrow.points.at(-1)[0] < 0);
  assert.equal(arrow.strokeStyle, 'dashed');
  assert.notEqual(styled.elements.find(e => e.id === 'agent').backgroundColor, styled.elements.find(e => e.id === 'skill').backgroundColor);
});

test('explicit flowchart colors survive default styling', () => {
  const source = fixture(); source.elements[0].backgroundColor = '#123456';
  assert.equal(styleScene(source).elements.find(e => e.id === 'agent').backgroundColor, '#123456');
});

test('phase and payload decoration remains native, finite and unique', () => {
  const styled = styleScene(fixture(), {
    title: '流程', phases: [{ title: '执行', from: '返回执行结果', to: '返回执行结果' }],
    cards: [{ anchor: '返回执行结果', title: '工具结果', body: '文件路径\n结构化数据', role: 'data' }],
  }, { sequence: true });
  assert.equal(new Set(styled.elements.map(e => e.id)).size, styled.elements.length);
  assert(styled.elements.every(e => [e.x, e.y, e.width, e.height].every(Number.isFinite) && e.width >= 0 && e.height >= 0));
  assert(!styled.elements.some(e => e.type === 'image'));
  assert.equal(styled.elements.filter(e => e.type === 'arrow').length, 1, 'Default explanation cards must not add apparent workflow steps.');
  // Negative return points must not expand the canvas into a large empty right margin.
  const title = styled.elements.find(e => e.text === '流程');
  assert(title.width < 1550);
});

test('default decision feedback stays inside its local panel', () => {
  const original = fixture();
  const styled = styleScene(original, { cards: [{ anchor: '返回执行结果', kind: 'decision', title: '通过？', body: '', retryTo: '返回执行结果', successTo: '返回执行结果' }] }, { sequence: true });
  const decision = styled.elements.find(e => e.type === 'diamond');
  const originalIds = new Set(original.elements.map(e => e.id));
  const addedArrows = styled.elements.filter(e => e.type === 'arrow' && !originalIds.has(e.id));
  assert.equal(addedArrows.length, 3);
  assert(addedArrows.every(e => e.points.every(([x]) => e.x + x >= decision.x - 80)), 'Feedback must not cross the main interaction lifelines.');
});

test('invalid semantic references fail explicitly instead of attaching to arbitrary messages', () => {
  assert.throws(() => styleScene(fixture(), { cards: [{ anchor: 'missing', title: 'x', body: 'x' }] }), /match one text/);
  assert.throws(() => styleScene(fixture(), { roles: [{ match: 'Agent', role: 'unknown' }] }), /Unknown design role/);
});
