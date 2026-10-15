
(() => {
  "use strict";

  const POSITIONS = [
    {
      id: "head",
      title: "Керівник ETS2 UA LEGION",
      level: 1
    },
    {
      id: "deputy",
      title: "Заступник керівника ETS2 UA LEGION",
      level: 2
    },
    {
      id: "top",
      title: "Топ-менеджер ETS2 UA LEGION",
      level: 3
    },
    {
      id: "hr",
      title: "HR-менеджер ETS2 UA LEGION",
      level: 3
    },
    {
      id: "logistics",
      title: "Менеджер з логістики ETS2 UA LEGION",
      level: 3
    },
    {
      id: "event",
      title: "Івент-менеджер ETS2 UA LEGION",
      level: 3
    },
    {
      id: "pr",
      title: "PR-менеджер ETS2 UA LEGION",
      level: 3
    },
    {
      id: "technical",
      title: "Технічний менеджер ETS2 UA LEGION",
      level: 3
    },
    {
      id: "lawyer",
      title: "Юрист ETS2 UA LEGION",
      level: 3
    }
  ];

  const REFRESH_INTERVAL = 60000;

  const grid = document.getElementById("leadershipGrid");
  const count = document.getElementById("leadershipCount");
  const refreshButton = document.getElementById("leadershipRefresh");

  if (!grid || !count || !refreshButton) {
    console.error("[UA LEGION] Не знайдені елементи керівництва.");
    return;
  }

  let isLoading = false;
  let hasLoaded = false;
  let refreshTimer = null;

  function normalize(value) {
    return String(value ?? "")
      .normalize("NFKC")
      .toLocaleLowerCase("uk-UA")
      .replace(/[’‘`]/g, "'")
      .replace(/\s+/g, " ")
      .trim();
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[character]);
  }

  function getClient() {
    return window.supabaseClient;
  }

  // Не використовуємо email або ім'я профілю як ігровий нікнейм.
  function getNickname(member) {
    return String(member.game_nickname ?? "").trim();
  }

  function getAvatar(member) {
    const value = String(
      member.avatar_url ||
      member.avatar ||
      ""
    ).trim();

    if (!value) return "";

    try {
      const url = new URL(value, window.location.origin);

      if (!["https:", "http:"].includes(url.protocol)) {
        return "";
      }

      return url.href;
    } catch {
      return "";
    }
  }

  function getMemberId(member) {
    return String(
      member.user_id ||
      member.profile_id ||
      member.member_id ||
      member.id ||
      ""
    );
  }

  function toArray(value) {
    if (Array.isArray(value)) return value;

    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }

    return [];
  }

  function getDirections(member) {
    return toArray(member.directions);
  }

  function isETS2Direction(direction) {
    const values = [
      direction.slug,
      direction.code,
      direction.name
    ].map(normalize);

    return values.some(value =>
      value === "ets2" ||
      value.includes("euro truck simulator") ||
      value.includes("eurotruck simulator")
    );
  }

  function getRoleValues(role) {
    if (typeof role === "string") {
      return [role];
    }

    if (!role || typeof role !== "object") {
      return [];
    }

    return [
      role.name,
      role.code,
      role.title,
      role.label,
      role.role_name
    ].filter(Boolean);
  }

  function getMemberRoles(member) {
    const roles = [];

    // Формат, який використовується в members.js:
    // member.directions[].roles[].
    for (const direction of getDirections(member)) {
      if (!isETS2Direction(direction)) continue;

      for (const role of toArray(direction.roles)) {
        roles.push(...getRoleValues(role));
      }
    }

    // Підтримка RPC-відповідей, де ролі передані окремо.
    for (const role of toArray(member.roles)) {
      roles.push(...getRoleValues(role));
    }

    return [...new Set(roles.map(normalize).filter(Boolean))];
  }

  function matchesPosition(member, position) {
    const roles = getMemberRoles(member);
    const expected = normalize(position.title);

    return roles.includes(expected);
  }

  function getMembersFromResponse(data) {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.members)) return data.members;
    if (data && Array.isArray(data.data)) return data.data;

    throw new Error(
      "Невідомий формат відповіді get_ua_legion_members."
    );
  }

  function initialsFor(nickname) {
    const nicknameValue = nickname.trim();

    if (!nicknameValue) return "UA";

    return nicknameValue
      .replace(/^@/, "")
      .slice(0, 2)
      .toLocaleUpperCase("uk-UA");
  }

  function renderAvatar(member) {
    const avatar = getAvatar(member);
    const nickname = getNickname(member);
    const initials = escapeHTML(initialsFor(nickname));

    if (!avatar) {
      return `
        <div class="leader-avatar-fallback" aria-label="Фото не додано">
          ${initials}
        </div>
      `;
    }

    return `
      <img
        class="leader-avatar"
        src="${escapeHTML(avatar)}"
        alt="Аватар учасника"
        loading="lazy"
        referrerpolicy="no-referrer"
        onerror="
          const fallback = document.createElement('div');
          fallback.className = 'leader-avatar-fallback';
          fallback.textContent = '${initials}';
          fallback.setAttribute('aria-label', 'Фото недоступне');
          this.replaceWith(fallback);
        "
      >
    `;
  }

  function renderMemberCard(position, member) {
    const nickname = getNickname(member);
    const nicknameHTML = nickname
      ? `<h3 class="leader-name">${escapeHTML(nickname)}</h3>`
      : `<h3 class="leader-name">Нікнейм не вказано</h3>`;

    return `
      <article class="leader-card">
        <div class="leader-card-top">
          ${renderAvatar(member)}

          <div class="leader-identity">
            ${nicknameHTML}
            <div class="leader-nickname">
              ${escapeHTML(position.title)}
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function renderVacantCard(position) {
    return `
      <article class="leader-card vacant">
        <div class="leader-card-top">
          <div class="leader-avatar-fallback" aria-hidden="true">UA</div>

          <div class="leader-identity">
            <h3 class="leader-name">ВАКАНТ</h3>
            <div class="leader-nickname">
              ${escapeHTML(position.title)}
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function renderPosition(position, assignedMembers) {
    if (assignedMembers.length === 0) {
      return renderVacantCard(position);
    }

    return assignedMembers
      .map(member => renderMemberCard(position, member))
      .join("");
  }

  function buildTree(members) {
    const assignedByPosition = new Map(
      POSITIONS.map(position => [position.id, []])
    );

    for (const member of members) {
      for (const position of POSITIONS) {
        if (!matchesPosition(member, position)) continue;

        const assigned = assignedByPosition.get(position.id);
        const memberId = getMemberId(member);

        const duplicate = assigned.some(existing => {
          const existingId = getMemberId(existing);

          if (memberId && existingId) {
            return memberId === existingId;
          }

          return (
            getNickname(existing) &&
            getNickname(existing) === getNickname(member)
          );
        });

        if (!duplicate) assigned.push(member);
      }
    }

    const head = POSITIONS.find(position => position.id === "head");
    const deputy = POSITIONS.find(position => position.id === "deputy");
    const managers = POSITIONS.filter(position => position.level === 3);

    let occupied = 0;
    let vacant = 0;

    for (const position of POSITIONS) {
      if (assignedByPosition.get(position.id).length) {
        occupied++;
      } else {
        vacant++;
      }
    }

    const headHTML = renderPosition(
      head,
      assignedByPosition.get(head.id)
    );

    const deputyHTML = renderPosition(
      deputy,
      assignedByPosition.get(deputy.id)
    );

    const managersHTML = managers.map(position => `
      <div class="tree-manager" data-position="${escapeHTML(position.id)}">
        ${renderPosition(position, assignedByPosition.get(position.id))}
      </div>
    `).join("");

    grid.className = "leadership-tree";

    grid.innerHTML = `
      <section class="tree-level tree-level-head" aria-label="Керівник">
        ${headHTML}
      </section>

      <div class="tree-connector tree-connector-main" aria-hidden="true"></div>

      <section class="tree-level tree-level-deputy" aria-label="Заступник керівника">
        ${deputyHTML}
      </section>

      <div class="tree-connector tree-connector-branch" aria-hidden="true"></div>

      <section class="tree-managers" aria-label="Менеджери напрямків">
        ${managersHTML}
      </section>
    `;

    count.textContent =
      `Керівних посад: ${POSITIONS.length} · ` +
      `Зайнято: ${occupied} · Вакантних: ${vacant}`;
  }

  function renderError(message) {
    grid.className = "leadership-tree";
    grid.innerHTML = `
      <div class="leadership-message error">
        <strong>Не вдалося завантажити склад керівництва.</strong>
        <p>${escapeHTML(message)}</p>
        <p>
          Список вакансій не сформовано, оскільки актуальні
          призначення не підтверджені.
        </p>
      </div>
    `;

    count.textContent = "Помилка завантаження";
  }

  async function loadLeadership() {
    if (isLoading) return;

    isLoading = true;
    refreshButton.disabled = true;
    refreshButton.textContent = "Завантаження…";

    try {
      const client = getClient();

      if (!client || typeof client.rpc !== "function") {
        throw new Error(
          "Supabase не підключено. Перевір файл supabase.js."
        );
      }

      const { data, error } = await client.rpc(
        "get_ua_legion_members"
      );

      if (error) {
        console.error("[UA LEGION] RPC:", error);

        throw new Error(
          "Не вдалося отримати учасників. Перевір права доступу " +
          "до get_ua_legion_members."
        );
      }

      const members = getMembersFromResponse(data);

      buildTree(members);
      hasLoaded = true;

      console.info(
        `[UA LEGION] Склад оновлено. Учасників: ${members.length}`
      );
    } catch (error) {
      console.error("[UA LEGION] Помилка:", error);

      if (!hasLoaded) {
        renderError(
          error instanceof Error ? error.message : "Невідома помилка."
        );
      } else {
        count.textContent =
          "Не вдалося оновити дані. Показано попередній список.";
      }
    } finally {
      isLoading = false;
      refreshButton.disabled = false;
      refreshButton.textContent = "↻ Оновити список";
    }
  }

  refreshButton.addEventListener("click", loadLeadership);

  loadLeadership();

  refreshTimer = window.setInterval(
    loadLeadership,
    REFRESH_INTERVAL
  );

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      loadLeadership();
    }
  });

  window.addEventListener("beforeunload", () => {
    if (refreshTimer !== null) {
      window.clearInterval(refreshTimer);
    }
  });
})();
