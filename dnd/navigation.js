/* One navigation path for buttons, keyboard and touch; no animation locks. */
function journalItems() {
  return state.section === 'characters' ? data.characters : state.section === 'atlas' ? data.atlas : data.days;
}
function journalSelectionKey() {
  return state.section === 'characters' ? 'selectedCharacterId' : state.section === 'atlas' ? 'selectedAtlasId' : 'selectedDayId';
}
function pageNavigation() {
  const items = journalItems();
  const index = Math.max(0, items.findIndex(item => item.id === state[journalSelectionKey()]));
  return `<nav class="page-navigation" aria-label="Листание страниц">
    <button type="button" data-page-step="-1" aria-label="Предыдущая страница" ${index === 0 ? 'disabled' : ''}>‹</button>
    <button type="button" data-journal-back>К списку <span>${index + 1} / ${items.length}</span></button>
    <button type="button" data-page-step="1" aria-label="Следующая страница" ${index >= items.length - 1 ? 'disabled' : ''}>›</button>
  </nav>`;
}
function turnJournalPage(step) {
  const items = journalItems();
  const key = journalSelectionKey();
  const index = Math.max(0, items.findIndex(item => item.id === state[key]));
  const item = items[index + step];
  if (!item) return;
  state[key] = item.id;
  render();
  document.querySelector('.book-spread > article')?.scrollTo?.(0, 0);
  if (state.mobileDetail) window.scrollTo({ top: 0, behavior: 'instant' });
}
document.addEventListener('click', event => {
  const button = event.target.closest('[data-page-step], [data-journal-back]');
  if (!button || button.disabled) return;
  if (button.hasAttribute('data-page-step')) turnJournalPage(Number(button.dataset.pageStep));
  else {
    state.mobileDetail = false;
    render();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
});
function isJournalEditing(target) {
  return !!target.closest('input, textarea, select, [contenteditable="true"], [role="dialog"], form');
}
document.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey || isJournalEditing(event.target)) return;
  if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
  if (!event.target.closest('.book-shell')) return;
  event.preventDefault();
  turnJournalPage(event.key === 'ArrowLeft' ? -1 : 1);
});
let journalGesture = null;
document.addEventListener('pointerdown', event => {
  journalGesture = null;
  if (!event.isPrimary || event.pointerType !== 'touch' || !state.mobileDetail) return;
  if (!event.target.closest('.book-spread > article') || isJournalEditing(event.target) || event.target.closest('button, a')) return;
  journalGesture = { id: event.pointerId, x: event.clientX, y: event.clientY };
}, { passive: true });
document.addEventListener('pointercancel', () => { journalGesture = null; }, { passive: true });
document.addEventListener('pointerup', event => {
  const start = journalGesture;
  journalGesture = null;
  if (!start || start.id !== event.pointerId) return;
  const dx = event.clientX - start.x;
  const dy = event.clientY - start.y;
  if (Math.abs(dx) >= 65 && Math.abs(dx) > Math.abs(dy) * 1.8) turnJournalPage(dx < 0 ? 1 : -1);
}, { passive: true });
