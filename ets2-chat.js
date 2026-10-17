/* UA LEGION ETS2 — floating chat */
(() => {
  'use strict';
  const client = window.supabaseClient;
  if (!client || document.getElementById('ul-chat-launcher')) return;

  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  })[ch]);

  // Reuse the existing "Чат ETS2" sidebar link; do not add a duplicate floating button.
  const existingChatLink = [...document.querySelectorAll('a')]
    .find(a => /Чат ETS2/i.test(a.textContent || '') || /ets2-chat\.html/i.test(a.getAttribute('href') || ''));
  const launcher = existingChatLink || document.createElement('button');
  if (!existingChatLink) {
    launcher.id = 'ul-chat-launcher';
    launcher.type = 'button';
    launcher.innerHTML = '<span aria-hidden="true">💬</span><span>Чат ETS2</span>';
    document.body.appendChild(launcher);
  } else {
    launcher.id = launcher.id || 'ul-chat-launcher';
  }
  launcher.setAttribute('aria-label', 'Відкрити чат ETS2');

  const panel = document.createElement('section');
  panel.id = 'ul-chat-panel';
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Чат UA LEGION ETS2');
  panel.innerHTML = `
    <header class="ul-chat-head">
      <div><strong>Чат ETS2</strong><small>UA LEGION · Спільнота</small></div>
      <div class="ul-chat-head-actions">
        <button type="button" data-chat-min aria-label="Згорнути чат" title="Згорнути">—</button>
        <button type="button" data-chat-close aria-label="Закрити чат" title="Закрити">×</button>
      </div>
    </header>
    <div class="ul-chat-status" data-chat-status>Перевірка доступу…</div>
    <div class="ul-chat-presence" data-chat-presence hidden><strong>У чаті зараз</strong><span data-chat-presence-list></span></div>
    <div class="ul-chat-typing" data-chat-typing hidden aria-live="polite"></div>
    <div class="ul-chat-toast" data-chat-toast hidden role="status" aria-live="polite"></div>
    <div class="ul-chat-login" data-chat-login hidden>
      <p>Чат доступний лише учасникам ETS2 та користувачам з активною глобальною роллю UA LEGION.</p>
      <a href="login.html">Увійти / Реєстрація</a>
    </div>
    <div class="ul-chat-messages" data-chat-messages aria-live="polite"></div>
    <form class="ul-chat-form" data-chat-form hidden>
      <label class="ul-chat-sr" for="ul-chat-input">Повідомлення</label>
      <textarea id="ul-chat-input" name="message" maxlength="2000" rows="2" placeholder="Напиши повідомлення…" required></textarea>
      <button type="submit">Надіслати</button>
    </form>
  `;
  document.body.append(panel);

  const statusEl = panel.querySelector('[data-chat-status]');
  const loginEl = panel.querySelector('[data-chat-login]');
  const messagesEl = panel.querySelector('[data-chat-messages]');
  const presenceEl = panel.querySelector('[data-chat-presence]');
  const presenceListEl = panel.querySelector('[data-chat-presence-list]');
  const typingEl = panel.querySelector('[data-chat-typing]');
  const toastEl = panel.querySelector('[data-chat-toast]');
  const form = panel.querySelector('[data-chat-form]');
  const input = panel.querySelector('textarea');
  let currentUser = null;
  let channel = null;
  let loading = false;
  let allowed = false;
  let typingTimer = null;
  let lastTypingSent = 0;
  let toastTimer = null;
  let unreadCount = 0;
  let pageTitle = document.title;
  let presenceUsers = new Map();
  let typingUsers = new Map();

  const OPEN_KEY = 'ua_legion_ets2_chat_open';
  function openPanel(persist = true) {
    if (persist) {
      try { window.sessionStorage.setItem(OPEN_KEY, '1'); } catch (_) {}
    }
    panel.hidden = false;
    launcher.classList.add('is-open');
    if (!allowed) initialize();
    else input.focus();
  }
  function closePanel() {
    try { window.sessionStorage.removeItem(OPEN_KEY); } catch (_) {}
    panel.hidden = true;
    launcher.classList.remove('is-open');
  }
  launcher.addEventListener('click', (event) => {
    event.preventDefault();
    panel.hidden ? openPanel() : closePanel();
  });
  panel.querySelector('[data-chat-close]').addEventListener('click', closePanel);
  panel.querySelector('[data-chat-min]').addEventListener('click', closePanel);

  function setStatus(text) { statusEl.textContent = text; }

  function renderPresence() {
    const users = [...presenceUsers.values()];
    presenceEl.hidden = !allowed;
    presenceListEl.textContent = users.length
      ? users.map((u, i) => u.user_id === currentUser?.id ? 'Ви' : (u.display_name || `Учасник ${i + 1}`)).join(' · ')
      : 'Поки нікого немає';
  }
  function renderTyping() {
    const names = [...typingUsers.values()]
      .filter(t => t.user_id !== currentUser?.id && Date.now() - t.at < 5000)
      .map(t => t.display_name || 'Учасник');
    typingEl.hidden = names.length === 0;
    typingEl.textContent = names.length === 1
      ? `${names[0]} пише повідомлення…`
      : names.length > 1 ? `${names.slice(0, 2).join(', ')} пишуть повідомлення…` : '';
  }
  function showMessageNotification(row) {
    const text = String(row.message || '');
    const author = row.user_id === currentUser?.id ? 'Ви' : 'Учасник UA LEGION';
    if (!panel.hidden) {
      toastEl.textContent = `${author}: ${text.length > 100 ? text.slice(0, 100) + '…' : text}`;
      toastEl.hidden = false;
      if (toastTimer) window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(() => { toastEl.hidden = true; }, 4500);
    }
    if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('UA LEGION · Чат ETS2', {
          body: `${author}: ${text.length > 140 ? text.slice(0, 140) + '…' : text}`,
          tag: `ets2-chat-${row.id || Date.now()}`
        });
      } catch (_) {}
    }
    if (panel.hidden || document.hidden) {
      unreadCount++;
      launcher.classList.add('has-unread');
      launcher.setAttribute('data-unread', unreadCount > 9 ? '9+' : String(unreadCount));
    }
  }
  function clearUnread() {
    unreadCount = 0;
    launcher.classList.remove('has-unread');
    launcher.removeAttribute('data-unread');
    if (document.title !== pageTitle) document.title = pageTitle;
  }
  function renderMessage(row) {
    const item = document.createElement('article');
    item.className = 'ul-chat-message';
    const date = row.created_at ? new Date(row.created_at) : null;
    const time = date && !Number.isNaN(date.getTime())
      ? date.toLocaleString('uk-UA', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })
      : '';
    item.innerHTML = `<div class="ul-chat-message-meta"><strong>${esc(row.display_name || 'Учасник UA LEGION')}</strong><time>${esc(time)}</time></div><p>${esc(row.message)}</p>`;
    messagesEl.appendChild(item);
  }
  function showLogin(message) {
    allowed = false;
    form.hidden = true;
    messagesEl.hidden = true;
    presenceEl.hidden = true;
    typingEl.hidden = true;
    loginEl.hidden = false;
    setStatus(message || 'Потрібен вхід');
  }
  async function initialize() {
    if (loading) return;
    loading = true;
    messagesEl.replaceChildren();
    loginEl.hidden = true;
    messagesEl.hidden = false;
    setStatus('Перевірка доступу…');
    try {
      const { data: { user }, error: authError } = await client.auth.getUser();
      if (authError || !user) {
        showLogin('Увійди, щоб користуватися чатом');
        return;
      }
      currentUser = user;
      const { data: hasAccess, error: accessError } = await client.rpc('can_access_ets2_chat');
      if (accessError) throw accessError;
      if (hasAccess !== true) {
        showLogin('Чат доступний лише активним учасникам ETS2 або користувачам з активною глобальною роллю');
        return;
      }
      allowed = true;
      loginEl.hidden = true;
      messagesEl.hidden = false;
      form.hidden = false;
      setStatus('Підключення до чату…');

      const { data, error } = await client
        .from('ets2_chat_messages')
        .select('id,user_id,message,created_at')
        .order('created_at', { ascending: true })
        .limit(100);
      if (error) throw error;
      const rows = data || [];
      // Profile lookup is intentionally omitted until a public profile table is confirmed.
      rows.forEach(row => renderMessage({ ...row, display_name: row.user_id === user.id ? 'Ви' : 'Учасник UA LEGION' }));
      messagesEl.scrollTop = messagesEl.scrollHeight;
      setStatus('Онлайн · останні 100 повідомлень');

      if (channel) await client.removeChannel(channel);
      presenceUsers = new Map();
      typingUsers = new Map();
      channel = client.channel('ets2-chat-live', {
        config: { presence: { key: user.id }, broadcast: { self: false } }
      })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ets2_chat_messages' }, payload => {
          const row = payload.new;
          if (!row || messagesEl.querySelector(`[data-message-id="${row.id}"]`)) return;
          const wasAtBottom = messagesEl.scrollHeight - messagesEl.scrollTop - messagesEl.clientHeight < 80;
          const before = messagesEl.children.length;
          renderMessage({ ...row, display_name: row.user_id === currentUser?.id ? 'Ви' : 'Учасник UA LEGION' });
          if (row.user_id !== currentUser?.id) showMessageNotification(row);
          const added = messagesEl.lastElementChild;
          if (added) added.dataset.messageId = String(row.id);
          if (wasAtBottom || before === 0) messagesEl.scrollTop = messagesEl.scrollHeight;
        })
        .on('presence', { event: 'sync' }, () => {
          presenceUsers = new Map();
          const state = channel.presenceState();
          Object.values(state).flat().forEach(p => {
            if (p.user_id) presenceUsers.set(p.user_id, p);
          });
          renderPresence();
        })
        .on('broadcast', { event: 'typing' }, ({ payload }) => {
          if (!payload?.user_id || payload.user_id === currentUser?.id) return;
          typingUsers.set(payload.user_id, { ...payload, at: Date.now() });
          renderTyping();
          window.setTimeout(() => {
            const entry = typingUsers.get(payload.user_id);
            if (entry && Date.now() - entry.at >= 4500) {
              typingUsers.delete(payload.user_id);
              renderTyping();
            }
          }, 4800);
        })
        .subscribe(async (state) => {
          if (state === 'SUBSCRIBED') {
            setStatus('Онлайн · повідомлення в реальному часі');
            await channel.track({
              user_id: user.id,
              display_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Учасник',
              online_at: new Date().toISOString()
            });
          }
          if (state === 'CHANNEL_ERROR' || state === 'TIMED_OUT') setStatus('Зв’язок перервано. Спробуй закрити й відкрити чат.');
        });
    } catch (err) {
      console.error('[UA LEGION chat]', err);
      setStatus('Не вдалося завантажити чат. Перевір налаштування Supabase.');
      form.hidden = true;
    } finally {
      loading = false;
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const message = input.value.trim();
    if (!message || !currentUser || !allowed) return;
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    try {
      const { error } = await client.from('ets2_chat_messages').insert({
        user_id: currentUser.id,
        message
      });
      if (error) throw error;
      input.value = '';
      input.focus();
    } catch (err) {
      console.error('[UA LEGION chat send]', err);
      setStatus('Не вдалося надіслати. Перевір підключення й права доступу.');
    } finally {
      submit.disabled = false;
    }
  });

  input.addEventListener('input', async () => {
    if (!channel || !currentUser || !allowed) return;
    const now = Date.now();
    if (now - lastTypingSent < 900) return;
    lastTypingSent = now;
    try {
      await channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          user_id: currentUser.id,
          display_name: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || 'Учасник'
        }
      });
    } catch (_) {}
    typingUsers.set(currentUser.id, { user_id: currentUser.id, at: now });
    if (typingTimer) window.clearTimeout(typingTimer);
    typingTimer = window.setTimeout(() => {
      typingUsers.delete(currentUser.id);
      renderTyping();
    }, 1600);
  });

  // Restore the open window after navigation to another page in this tab.
  try {
    if (window.sessionStorage.getItem(OPEN_KEY) === '1') {
      openPanel(false);
    }
  } catch (_) {}

  client.auth.onAuthStateChange((_event, session) => {
    if (panel.hidden) return;
    if (!session?.user) showLogin('Увійди, щоб користуватися чатом');
    else initialize();
  });
})();
