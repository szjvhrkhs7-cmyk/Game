const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../navigation.js'), 'utf8');
function fixture(section = 'chronicles') {
  const handlers = {};
  const context = {
    state: { section, mobileDetail: true, selectedDayId: 1, selectedCharacterId: 'a', selectedAtlasId: 'x' },
    data: { days: [{id:1},{id:2},{id:3}], characters: [{id:'a'},{id:'b'}], atlas: [{id:'x'},{id:'y'}] },
    renderCount: 0, render() { context.renderCount++; },
    document: { addEventListener(name, fn) { handlers[name] = fn; }, querySelector() { return null; } },
    window: { scrollTo() {} }
  };
  vm.createContext(context); vm.runInContext(source, context);
  return {context, handlers};
}
for (const [section, key, expected] of [['chronicles','selectedDayId',2],['characters','selectedCharacterId','b'],['atlas','selectedAtlasId','y']]) {
  test(`next and previous: ${section}`, () => {
    const {context:c}=fixture(section); const initial=c.state[key];
    c.turnJournalPage(1); assert.equal(c.state[key],expected);
    c.turnJournalPage(-1); assert.equal(c.state[key],initial);
    c.turnJournalPage(-1); assert.equal(c.state[key],initial);
  });
}
test('rapid repeated navigation has no stuck state', () => {
  const {context:c}=fixture();
  for(let i=0;i<100;i++){c.turnJournalPage(1);c.turnJournalPage(-1);}
  assert.equal(c.state.selectedDayId,1); assert.equal(c.renderCount,200);
});
const plainTarget={closest(selector){return selector === '.book-spread > article' || selector === '.book-shell' ? {} : null;}};
test('horizontal swipe navigates, vertical movement and cancellation do not', () => {
  const {context:c,handlers:h}=fixture();
  const down={target:plainTarget,isPrimary:true,pointerType:'touch',pointerId:1,clientX:220,clientY:30};
  h.pointerdown(down);h.pointerup({...down,clientX:100,clientY:35});assert.equal(c.state.selectedDayId,2);
  h.pointerdown(down);h.pointerup({...down,clientX:210,clientY:200});assert.equal(c.state.selectedDayId,2);
  h.pointerdown(down);h.pointercancel();h.pointerup({...down,clientX:100});assert.equal(c.state.selectedDayId,2);
});
test('editing text never triggers keyboard page navigation', () => {
  const {context:c,handlers:h}=fixture();
  h.keydown({key:'ArrowRight',target:{closest(){return {};}}}); assert.equal(c.state.selectedDayId,1);
});
test('return button works for character detail', () => {
  const {context:c,handlers:h}=fixture('characters');
  h.click({target:{closest(){return {disabled:false,hasAttribute(){return false;}};}}});
  assert.equal(c.state.mobileDetail,false); assert.equal(c.renderCount,1);
});
test('pager exposes disabled endpoints', () => {
  const {context:c}=fixture(); assert.match(c.pageNavigation(),/Предыдущая страница" disabled/);
  c.turnJournalPage(1);c.turnJournalPage(1);assert.match(c.pageNavigation(),/Следующая страница" disabled/);
});
