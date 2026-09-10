/* Cloud sync for the local-first DnD journal. Only a publishable Supabase key is exposed here. */
(() => {
  'use strict';

  const SUPABASE_URL = 'https://cbhcfvbdeuntrjbhbdpq.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_KEfQWQNIMDusafNtee9VMQ_9Tsfq89C';
  const TABLE = 'traveler_journal_state';
  const META_KEY = 'traveler-journal-cloud-meta-v1';
  const DEVICE_KEY = 'traveler-journal-device-id-v1';
  const WATCHED_KEYS = new Set([
    'traveler-journal-days-v1',
    'traveler-journal-days-v2',
    'traveler-journal-days-v3',
    'traveler-journal-characters-v1',
    'traveler-journal-atlas-v1',
  ]);

  if (typeof data === 'undefined' || typeof state === 'undefined' || typeof render !== 'function') return;

  let client = null;
  let session = null;
  let applyingRemote = false;
  let syncTimer = null;
  let syncInFlight = false;
  let syncAgain = false;
  let authMessage = '';
  let status = { kind: 'local', label: 'Локально' };

  const originalSetItem = Storage.prototype.setItem;

  function readMeta() {
    try {
      const parsed = JSON.parse(localStorage.getItem(META_KEY) || 'null');
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  function writeMeta(patch) {
    const next = { ...readMeta(), ...patch };
    originalSetItem.call(localStorage, META_KEY, JSON.stringify(next));
    return next;
  }

  function deviceId() {
    let id = localStorage.getItem(DEVICE_KEY);
    if (id) return id;
    id = globalThis.crypto?.randomUUID?.() || `device-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    originalSetItem.call(localStorage, DEVICE_KEY, id);
    return id;
  }

  function snapshot() {
    return JSON.parse(JSON.stringify({
      version: 1,
      days: data.days,
      characters: data.characters,
      atlas: data.atlas,
    }));
  }

  function normalizeSnapshot(value) {
    if (!value || typeof value !== 'object') return null;
    if (!Array.isArray(value.days) || !Array.isArray(value.characters) || !Array.isArray(value.atlas)) return null;
    return {
      version: 1,
      days: value.days,
      characters: value.characters,
      atlas: value.atlas,
    };
  }

  function setStatus(kind, label) {
    status = { kind, label };
    refreshControls();
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function cloudIcon() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.2 18.3h9.1a4.2 4.2 0 0 0 .6-8.4A6 6 0 0 0 5.5 8.6a4.9 4.9 0 0 0 1.7 9.7Z"/><path d="m9.1 13.2 2.2 2.1 3.8-4.2"/></svg>';
  }

  function refreshControls() {
    document.querySelectorAll('[data-cloud-sync-control]').forEach((button) => {
      button.dataset.syncState = status.kind;
      button.setAttribute('aria-label', session ? `Облачная синхронизация: ${status.label}` : 'Настроить облачную синхронизацию');
      const label = button.querySelector('.cloud-sync-label');
      if (label) label.textContent = status.label;
    });

    const dialogStatus = document.querySelector('[data-cloud-dialog-status]');
    if (dialogStatus) dialogStatus.textContent = authMessage || status.label;
  }

  function ensureControls() {
    const hosts = document.querySelectorAll('.campaign-heading, .character-index .placeholder-header, .atlas-index .placeholder-header');
    hosts.forEach((host) => {
      if (host.querySelector('[data-cloud-sync-control]')) return;
      host.classList.add('has-cloud-sync');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'cloud-sync-control';
      button.dataset.cloudSyncControl = '1';
      button.dataset.syncState = status.kind;
      button.innerHTML = `${cloudIcon()}<span class="cloud-sync-label">${status.label}</span>`;
      button.addEventListener('click', openDialog);
      host.append(button);
    });
    refreshControls();
  }

  function closeDialog() {
    document.querySelector('.cloud-sync-overlay')?.remove();
    authMessage = '';
  }

  function dialogShell(content) {
    closeDialog();
    const overlay = document.createElement('div');
    overlay.className = 'cloud-sync-overlay';
    overlay.innerHTML = `<section class="cloud-sync-sheet" role="dialog" aria-modal="true" aria-labelledby="cloud-sync-title">${content}</section>`;
    document.body.append(overlay);
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) closeDialog();
    });
    overlay.querySelector('[data-cloud-close]')?.addEventListener('click', closeDialog);
    return overlay;
  }

  function openDialog() {
    if (!client) {
      dialogShell(`
        <button class="cloud-sheet-close" type="button" data-cloud-close aria-label="Закрыть">×</button>
        <p class="kicker">Облако</p>
        <h3 id="cloud-sync-title">Синхронизация недоступна</h3>
        <p>Не удалось загрузить модуль Supabase. Локальные записи продолжают работать.</p>
      `);
      return;
    }

    if (session?.user) {
      const email = escapeHtml(session.user.email || 'Аккаунт Supabase');
      const overlay = dialogShell(`
        <button class="cloud-sheet-close" type="button" data-cloud-close aria-label="Закрыть">×</button>
        <p class="kicker">Облако</p>
        <h3 id="cloud-sync-title">Синхронизация включена</h3>
        <p class="cloud-account-email">${email}</p>
        <p class="cloud-dialog-status" data-cloud-dialog-status>${status.label}</p>
        <div class="cloud-sheet-actions">
          <button type="button" class="cloud-sheet-button cloud-sheet-button--primary" data-cloud-sync-now>Синхронизировать сейчас</button>
          <button type="button" class="cloud-sheet-button cloud-sheet-button--ghost" data-cloud-sign-out>Выйти</button>
        </div>
      `);
      overlay.querySelector('[data-cloud-sync-now]').addEventListener('click', () => syncNow({ manual: true }));
      overlay.querySelector('[data-cloud-sign-out]').addEventListener('click', async () => {
        authMessage = 'Выходим…';
        refreshControls();
        const { error } = await client.auth.signOut();
        if (error) {
          authMessage = error.message;
          refreshControls();
          return;
        }
        closeDialog();
      });
      return;
    }

    const overlay = dialogShell(`
      <button class="cloud-sheet-close" type="button" data-cloud-close aria-label="Закрыть">×</button>
      <p class="kicker">Облако</p>
      <h3 id="cloud-sync-title">Облачная синхронизация</h3>
      <p>Войдите с одного и того же аккаунта на разных устройствах. Без входа дневник по-прежнему хранится только на этом устройстве.</p>
      <form class="cloud-auth-form" data-cloud-auth-form>
        <label><span>Email</span><input name="email" type="email" autocomplete="email" required></label>
        <label><span>Пароль</span><input name="password" type="password" autocomplete="current-password" minlength="8" required></label>
        <p class="cloud-dialog-status" data-cloud-dialog-status>${authMessage || 'Готово к входу'}</p>
        <div class="cloud-sheet-actions">
          <button type="submit" class="cloud-sheet-button cloud-sheet-button--primary" data-auth-action="signin">Войти</button>
          <button type="button" class="cloud-sheet-button cloud-sheet-button--ghost" data-auth-action="signup">Создать аккаунт</button>
        </div>
      </form>
    `);

    const form = overlay.querySelector('[data-cloud-auth-form]');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      await authenticate(form, 'signin');
    });
    overlay.querySelector('[data-auth-action="signup"]').addEventListener('click', () => authenticate(form, 'signup'));
    requestAnimationFrame(() => form.querySelector('input[name="email"]')?.focus());
  }

  async function authenticate(form, action) {
    const email = form.elements.email.value.trim();
    const password = form.elements.password.value;
    if (!email || password.length < 8) {
      authMessage = 'Введите email и пароль не короче 8 символов.';
      refreshControls();
      return;
    }

    authMessage = action === 'signup' ? 'Создаём аккаунт…' : 'Входим…';
    refreshControls();
    const response = action === 'signup'
      ? await client.auth.signUp({ email, password })
      : await client.auth.signInWithPassword({ email, password });

    if (response.error) {
      authMessage = response.error.message;
      refreshControls();
      return;
    }

    if (action === 'signup' && !response.data.session) {
      authMessage = 'Аккаунт создан. Подтвердите email, затем вернитесь и войдите.';
      refreshControls();
      return;
    }

    authMessage = 'Вход выполнен.';
    session = response.data.session || session;
    refreshControls();
    await syncNow({ manual: true });
    openDialog();
  }

  function applyRemoteSnapshot(remoteData, revision) {
    const next = normalizeSnapshot(remoteData);
    if (!next) throw new Error('Облачная копия имеет неподдерживаемый формат.');

    applyingRemote = true;
    try {
      data.days.splice(0, data.days.length, ...next.days);
      data.characters.splice(0, data.characters.length, ...next.characters);
      data.atlas.splice(0, data.atlas.length, ...next.atlas);

      if (!data.days.some((item) => Number(item.id) === Number(state.selectedDayId))) state.selectedDayId = data.days[0]?.id;
      if (!data.characters.some((item) => item.id === state.selectedCharacterId)) state.selectedCharacterId = data.characters[0]?.id;
      if (!data.atlas.some((item) => item.id === state.selectedAtlasId)) state.selectedAtlasId = data.atlas[0]?.id;

      const days = JSON.stringify(data.days);
      originalSetItem.call(localStorage, 'traveler-journal-days-v1', days);
      originalSetItem.call(localStorage, 'traveler-journal-days-v3', days);
      originalSetItem.call(localStorage, 'traveler-journal-characters-v1', JSON.stringify(data.characters));
      originalSetItem.call(localStorage, 'traveler-journal-atlas-v1', JSON.stringify(data.atlas));
      writeMeta({ updatedAt: revision, syncedAt: Date.now(), lastDirection: 'down' });
      render();
    } finally {
      applyingRemote = false;
    }
  }

  async function pushSnapshot(revision) {
    const row = {
      user_id: session.user.id,
      data: snapshot(),
      client_updated_at: revision,
      device_id: deviceId(),
      updated_at: new Date().toISOString(),
    };
    const { error } = await client.from(TABLE).upsert(row, { onConflict: 'user_id' });
    if (error) throw error;
    writeMeta({ updatedAt: revision, syncedAt: Date.now(), lastDirection: 'up' });
  }

  async function doSync() {
    if (!client || !session?.user) return;
    if (!navigator.onLine) {
      setStatus('offline', 'Офлайн');
      return;
    }

    setStatus('syncing', 'Синхронизация…');
    const userId = session.user.id;
    const { data: remote, error } = await client
      .from(TABLE)
      .select('data, client_updated_at, device_id')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;

    const meta = readMeta();
    let localRevision = Number(meta.updatedAt) || 0;
    const remoteRevision = Number(remote?.client_updated_at) || 0;

    if (!remote) {
      if (!localRevision) {
        localRevision = Date.now();
        writeMeta({ updatedAt: localRevision });
      }
      await pushSnapshot(localRevision);
      setStatus('synced', 'Синхронизировано');
      return;
    }

    if (!localRevision || remoteRevision > localRevision) {
      applyRemoteSnapshot(remote.data, remoteRevision);
      setStatus('synced', 'Получено из облака');
      return;
    }

    if (localRevision > remoteRevision) {
      await pushSnapshot(localRevision);
      setStatus('synced', 'Синхронизировано');
      return;
    }

    writeMeta({ syncedAt: Date.now() });
    setStatus('synced', 'Синхронизировано');
  }

  async function syncNow({ manual = false } = {}) {
    if (!session?.user) {
      if (manual) openDialog();
      return;
    }
    if (syncInFlight) {
      syncAgain = true;
      return;
    }
    syncInFlight = true;
    try {
      await doSync();
      authMessage = '';
    } catch (error) {
      console.warn('Не удалось синхронизировать дневник', error);
      authMessage = 'Не удалось синхронизировать. Локальные данные сохранены.';
      setStatus('error', 'Ошибка облака');
    } finally {
      syncInFlight = false;
      refreshControls();
      if (syncAgain) {
        syncAgain = false;
        queueMicrotask(() => syncNow());
      }
    }
  }

  function scheduleSync() {
    clearTimeout(syncTimer);
    if (!session?.user) {
      setStatus('local', 'Локально');
      return;
    }
    setStatus(navigator.onLine ? 'pending' : 'offline', navigator.onLine ? 'Есть изменения' : 'Офлайн');
    syncTimer = setTimeout(() => syncNow(), 900);
  }

  function markLocalChange() {
    if (applyingRemote) return;
    writeMeta({ updatedAt: Date.now() });
    scheduleSync();
  }

  Storage.prototype.setItem = function patchedSetItem(key, value) {
    const result = originalSetItem.call(this, key, value);
    if (this === localStorage && WATCHED_KEYS.has(String(key)) && !applyingRemote) {
      queueMicrotask(markLocalChange);
    }
    return result;
  };

  function handleSession(nextSession) {
    const previousUserId = session?.user?.id || null;
    const nextUserId = nextSession?.user?.id || null;
    session = nextSession;
    if (!nextUserId) {
      setStatus('local', 'Локально');
      ensureControls();
      return;
    }
    setStatus('syncing', 'Синхронизация…');
    ensureControls();
    if (previousUserId !== nextUserId) syncNow();
  }

  function initialize() {
    if (!window.supabase?.createClient) {
      setStatus('error', 'Облако недоступно');
      ensureControls();
      return;
    }

    client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });

    client.auth.onAuthStateChange((_event, nextSession) => {
      queueMicrotask(() => handleSession(nextSession));
    });

    client.auth.getSession().then(({ data: authData, error }) => {
      if (error) {
        console.warn('Не удалось восстановить облачную сессию', error);
        setStatus('error', 'Ошибка входа');
        return;
      }
      handleSession(authData.session);
    });

    window.addEventListener('online', () => syncNow());
    window.addEventListener('offline', () => session?.user && setStatus('offline', 'Офлайн'));
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') syncNow();
    });
    setInterval(() => {
      if (document.visibilityState === 'visible') syncNow();
    }, 45000);

    ensureControls();
  }

  const appRoot = document.querySelector('#app');
  if (appRoot) {
    const observer = new MutationObserver(() => queueMicrotask(ensureControls));
    observer.observe(appRoot, { childList: true, subtree: true });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeDialog();
  });

  initialize();
})();
