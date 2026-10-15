
(() => {
  "use strict";

  const POSITIONS = [
    "Керівник ETS2 UA LEGION",
    "Заступник керівника ETS2 UA LEGION",
    "Топ-менеджер ETS2 UA LEGION",
    "HR-менеджер ETS2 UA LEGION",
    "Менеджер з логістики ETS2 UA LEGION",
    "Івент-менеджер ETS2 UA LEGION",
    "PR-менеджер ETS2 UA LEGION",
    "Технічний менеджер ETS2 UA LEGION",
    "Юрист ETS2 UA LEGION"
  ];

  const REFRESH_INTERVAL = 60000;

  const grid = document.getElementById("leadershipGrid");
  const count = document.getElementById("leadershipCount");
  const refreshButton = document.getElementById("leadershipRefresh");

  if (!grid || !count || !refreshButton) {
    console.error("[UA LEGION] Не знайдено елементи сторінки керівництва.");
    return;
  }

  let isLoading = false;
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
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function getClient() {
    return window.supabaseClient || window.supabase;
  }

  function getName(member) {
    return (
      member.display_name ||
      member.full_name ||
      member.name ||
      member.game_nickname ||
      member.nickname ||
      member.username ||
      "Учасник UA LEGION"
    );
  }

  function getNickname(member) {
    return (
      member.game_nickname ||
      member.nickname ||
      member.username ||
      member.discord_username ||
      ""
    );
  }

  function getAvatar(member) {
    return (
      member.avatar_url ||
      member.avatar ||
      member.photo_url ||
      member.profile_photo ||
      ""
    );
  }

  function getMemberId(member) {
    return String(
      member.user_id ||
      member.profile_id ||
      member.id ||
      member.member_id ||
      ""
    );
  }

  function getDirections(member) {
    if (Array.isArray(member.directions)) {
      return member.directions;
    }

    if (Array.isArray(member.user_directions)) {
      return member.user_directions;
    }

    if (Array.isArray(member.memberships)) {
      return member.memberships;
    }

    return [];
  }

  function getRoleNames(member) {
    const roles = [];

    if (Array.isArray(member.roles)) {
      roles.push(...member.roles);
    }

    for (const direction of getDirections(member)) {
      const directionName = normalize(
        direction.direction_name ||
        direction.direction ||
        direction.name ||
        direction.slug ||
        ""
      );

      // Не беремо ролі з інших ігрових напрямків.
      const isETS2 =
        directionName.includes("ets2") ||
        directionName.includes("euro truck") ||
        directionName.includes("eurotruck") ||
        directionName.includes("euro truck simulator");

      if (!isETS2) {
        continue;
      }

      if (Array.isArray(direction.roles)) {
        roles.push(...direction.roles);
      }

      if (direction.role_name) {
        roles.push(direction.role_name);
      }

      if (direction.role) {
        roles.push(direction.role);
      }
    }

    return roles
      .map(role => {
        if (typeof role === "string") {
          return role;
        }

        if (role && typeof role === "object") {
          return (
            role.role_name ||
            role.name ||
            role.title ||
            role.label ||
            ""
          );
        }

        return "";
      })
      .filter(Boolean);
  }

  function getMembersFromResponse(data) {
    if (Array.isArray(data)) {
      return data;
    }

    if (data && Array.isArray(data.members)) {
      return data.members;
    }

    if (data && Array.isArray(data.data)) {
      return data.data;
    }

    return [];
  }

  function renderAvatar(member) {
    const avatar = getAvatar(member);
    const name = getName(member);
    const initials = name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part.charAt(0))
      .join("")
      .toLocaleUpperCase("uk-UA");

    if (avatar) {
      return `
        <img
          class="leader-avatar"
          src="${escapeHTML(avatar)}"
          alt="Фото: ${escapeHTML(name)}"
          loading="lazy"
          referrerpolicy="no-referrer"
          onerror="this.outerHTML='<div class=&quot;leader-avatar-fallback&quot; aria-label=&quot;Фото недоступне&quot;>UA</div>'"
        >
      `;
    }

    return `
      <div class="leader-avatar-fallback" aria-label="Фото не додано">
        ${escapeHTML(initials || "UA")}
      </div>
    `;
  }

  function renderAssignedCard(position, member, index) {
    const name = getName(member);
    const nickname = getNickname(member);

    const nicknameHTML = nickname
      ? `<div class="leader-nickname">${escapeHTML(nickname)}</div>`
      : "";

    return `
      <article class="leader-card">
        <div class="leader-card-top">
          ${renderAvatar(member)}

          <div class="leader-identity">
            <span class="leader-rank">
              ПОСАДА ${String(index + 1).padStart(2, "0")}
            </span>

            <h3 class="leader-name">
              ${escapeHTML(name)}
            </h3>

            ${nicknameHTML}
          </div>
        </div>

        <div class="leader-card-body">
          <div class="leader-role-label">ПОСАДА В КЕРІВНИЦТВІ</div>

          <div class="leader-roles">
            <span class="leader-role">${escapeHTML(position)}</span>
          </div>

          <div class="leader-status">
            ✓ Посаду обіймає учасник
          </div>
        </div>
      </article>
    `;
  }

  function renderVacantCard(position, index) {
    return `
      <article class="leader-card vacant">
        <div class="leader-card-top">
          <div class="leader-avatar-fallback" aria-label="Посада вакантна">
            UA
          </div>

          <div class="leader-identity">
            <span class="leader-rank">
              ПОСАДА ${String(index + 1).padStart(2, "0")}
            </span>

            <h3 class="leader-name">ВАКАНТ</h3>

            <div class="leader-nickname">
              Очікує на призначення
            </div>
          </div>
        </div>

        <div class="leader-card-body">
          <div class="leader-role-label">ВІЛЬНА ПОСАДА</div>

          <div class="leader-roles">
            <span class="leader-role">${escapeHTML(position)}</span>
          </div>

          <div class="leader-status">
            ◇ Посада відкрита
          </div>
        </div>
      </article>
    `;
  }

  function renderError(message) {
    grid.innerHTML = `
      <div class="leadership-message error" style="grid-column:1/-1">
        <strong>Не вдалося завантажити склад керівництва.</strong>
        <p>${escapeHTML(message)}</p>
        <p>
          Посади не позначено як вакантні, оскільки актуальні
          дані не підтверджено.
        </p>
      </div>
    `;

    count.textContent = "Помилка завантаження";
  }

  function renderMembers(members) {
    const positionMembers = new Map(
      POSITIONS.map(position => [normalize(position), []])
    );

    for (const member of members) {
      const roles = getRoleNames(member);
      const memberId = getMemberId(member);

      for (const role of roles) {
        const key = normalize(role);

        if (!positionMembers.has(key)) {
          continue;
        }

        const assigned = positionMembers.get(key);

        // Не показуємо одного учасника двічі на тій самій посаді.
        const alreadyAdded = assigned.some(existing => {
          if (memberId && getMemberId(existing)) {
            return memberId === getMemberId(existing);
          }

          return getName(existing) === getName(member);
        });

        if (!alreadyAdded) {
          assigned.push(member);
        }
      }
    }

    let assignedCount = 0;
    let vacantCount = 0;
    const cards = [];

    POSITIONS.forEach((position, index) => {
      const assigned = positionMembers.get(normalize(position)) || [];

      if (assigned.length === 0) {
        vacantCount++;
        cards.push(renderVacantCard(position, index));
        return;
      }

      assignedCount++;

      assigned.forEach(member => {
        cards.push(renderAssignedCard(position, member, index));
      });
    });

    grid.innerHTML = cards.join("");

    count.textContent =
      `Посад: ${POSITIONS.length} · ` +
      `Зайнято: ${assignedCount} · ` +
      `Вакантних: ${vacantCount}`;
  }

  async function loadLeadership() {
    if (isLoading) {
      return;
    }

    isLoading = true;
    refreshButton.disabled = true;
    refreshButton.textContent = "Завантаження…";

    if (!grid.children.length) {
      count.textContent = "Завантаження складу керівництва…";
    }

    try {
      const client = getClient();

      if (!client || typeof client.rpc !== "function") {
        throw new Error(
          "Supabase не ініціалізовано. Перевір підключення supabase.js."
        );
      }

      const { data, error } = await client.rpc("get_ua_legion_members");

      if (error) {
        console.error("[UA LEGION] Помилка RPC:", error);

        throw new Error(
          "База даних не надала список учасників. " +
          "Перевір доступ до get_ua_legion_members."
        );
      }

      const members = getMembersFromResponse(data);

      if (!Array.isArray(members)) {
        throw new Error("Отримано невідомий формат даних учасників.");
      }

      renderMembers(members);

      console.info(
        `[UA LEGION] Завантажено учасників: ${members.length}`
      );
    } catch (error) {
      console.error("[UA LEGION] Не вдалося завантажити керівництво:", error);

      // Якщо це перше завантаження — показуємо помилку.
      // Якщо попередні дані вже були відображені, не стираємо їх
      // через тимчасовий збій мережі.
      if (!grid.children.length) {
        renderError(
          error instanceof Error
            ? error.message
            : "Невідома помилка."
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

  // Перевіряємо зміни призначень раз на хвилину.
  refreshTimer = window.setInterval(loadLeadership, REFRESH_INTERVAL);

  // Не запускаємо повторні запити, якщо вкладка прихована.
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
