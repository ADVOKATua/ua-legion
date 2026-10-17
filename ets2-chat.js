/* UA LEGION ETS2 — floating chat */
(() => {
  'use strict';
  const client = window.supabaseClient;
  if (!client || document.getElementById('ul-chat-launcher')) return;

  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  })[ch]);

  // Reuse the existing "Чат ETS2" sidebar link; do not add a duplicate floating button.
  const launcher = [...document.querySelectorAll('a')]
    .find(a => /Чат ETS2/i.test(a.textContent || '') || /ets2-chat\.html/i.test(a.getAttribute('href') || ''));
  if (!launcher) return;
  launcher.id = launcher.id || 'ul-chat-launcher';
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
  const form = panel.querySelector('[data-chat-form]');
  const input = panel.querySelector('textarea');
  let currentUser = null;
  let channel = null;
  let loading = false;
  let allowed = false;

  function openPanel() {
    panel.hidden = false;
    launcher.classList.add('is-open');
    if (!allowed) initialize();
    else input.focus();
  }
  function closePanel() {
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
      channel = client.channel('ets2-chat-live')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ets2_chat_messages' }, payload => {
          const row = payload.new;
          if (!row || messagesEl.querySelector(`[data-message-id="${row.id}"]`)) return;
          const wasAtBottom = messagesEl.scrollHeight - messagesEl.scrollTop - messagesEl.clientHeight < 80;
          const before = messagesEl.children.length;
          renderMessage({ ...row, display_name: row.user_id === currentUser?.id ? 'Ви' : 'Учасник UA LEGION' });
          const added = messagesEl.lastElementChild;
          if (added) added.dataset.messageId = String(row.id);
          if (wasAtBottom || before === 0) messagesEl.scrollTop = messagesEl.scrollHeight;
        })
        .subscribe((state) => {
          if (state === 'SUBSCRIBED') setStatus('Онлайн · повідомлення в реальному часі');
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

  client.auth.onAuthStateChange((_event, session) => {
    if (panel.hidden) return;
    if (!session?.user) showLogin('Увійди, щоб користуватися чатом');
    else initialize();
  });
})();
