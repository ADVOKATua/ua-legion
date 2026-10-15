
(() => {
  "use strict";

  const POSITIONS = [
    { id: "head", code: "ets2_director", title: "Керівник ETS2 UA LEGION" },
    { id: "deputy", code: "ets2_deputy_director", title: "Заступник керівника ETS2 UA LEGION" },
    { id: "top", code: "ets2_top_manager", title: "Топ-менеджер ETS2 UA LEGION" },
    { id: "hr", code: "ets2_hr_manager", title: "HR-менеджер ETS2 UA LEGION" },
    { id: "event", code: "ets2_event_manager", title: "Івент-менеджер ETS2 UA LEGION" },
    { id: "logistics", code: "ets2_logistics_manager", title: "Менеджер з логістики ETS2 UA LEGION" },
    { id: "pr", code: "ets2_pr_manager", title: "PR-менеджер ETS2 UA LEGION" },
    { id: "technical", code: "ets2_technical_manager", title: "Технічний менеджер ETS2 UA LEGION" },
    { id: "logistician", code: "ets2_logistician", title: "Логіст ETS2 UA LEGION" }
  ];

  const grid = document.getElementById("leadershipGrid");
  if (!grid) return;

  let loading = false;
  let loaded = false;

  const normalize = value => String(value ?? "")
    .normalize("NFKC")
    .toLocaleLowerCase("uk-UA")
    .replace(/[’‘`]/g, "'")
    .replace(/\s+/g, " ")
    .trim();

  const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[ch]);

  function asArray(value) {
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [value];
      } catch {
        return value.trim() ? [value] : [];
      }
    }
    return value && typeof value === "object" ? [value] : [];
  }

  function getRoles(member) {
    const result = [];

    for (const direction of asArray(member.directions)) {
      const values = [
        direction?.slug,
        direction?.code,
        direction?.name
      ].map(normalize);

      const isETS2 = values.some(value =>
        value === "ets2" ||
        value.includes("euro truck simulator") ||
        value.includes("eurotruck simulator")
      );

      if (!isETS2) continue;

      for (const role of asArray(direction.roles)) {
        if (typeof role === "string") {
          result.push(role);
        } else if (role && typeof role === "object") {
          result.push(
            role.code,
            role.name,
            role.title,
            role.label,
            role.role_name
          );
        }
      }
    }

    for (const role of asArray(member.roles)) {
      if (typeof role === "string") {
        result.push(role);
      } else if (role && typeof role === "object") {
        result.push(
          role.code,
          role.name,
          role.title,
          role.label,
          role.role_name
        );
      }
    }

    result.push(member.role, member.role_code, member.role_name);

    return new Set(result.filter(Boolean).map(normalize));
  }

  function matches(member, position) {
    const roles = getRoles(member);
    return roles.has(normalize(position.code)) ||
      roles.has(normalize(position.title));
  }

  function nicknameOf(member) {
    return String(
      member.game_nickname ??
      member.nickname ??
      member.discord_username ??
      ""
    ).trim();
  }

  function avatarOf(member) {
    const value = String(member.avatar_url ?? member.avatar ?? "").trim();
    if (!value) return "";

    try {
      const url = new URL(value, window.location.origin);
      return ["https:", "http:"].includes(url.protocol) ? url.href : "";
    } catch {
      return "";
    }
  }

  function memberId(member) {
    return String(
      member.user_id ??
      member.profile_id ??
      member.member_id ??
      member.id ??
      ""
    );
  }

  function initials(name) {
    return (name.replace(/^@/, "").slice(0, 2) || "UA")
      .toLocaleUpperCase("uk-UA");
  }

  function renderCard(position, members) {
    if (!members.length) {
      return `
        <article class="leader-card vacant">
          <div class="leader-card-top">
            <div class="leader-avatar-fallback">UA</div>
            <div class="leader-identity">
              <div class="leader-position">${escapeHTML(position.title)}</div>
              <h3 class="leader-name">ВАКАНТ</h3>
            </div>
          </div>
        </article>`;
    }

    return members.map(member => {
      const name = nicknameOf(member) || "Нікнейм не вказано";
      const avatar = avatarOf(member);

      const avatarHTML = avatar
        ? `<img class="leader-avatar"
             src="${escapeHTML(avatar)}"
             alt="Аватар учасника"
             loading="lazy">`
        : `<div class="leader-avatar-fallback">${escapeHTML(initials(name))}</div>`;

      return `
        <article class="leader-card">
          <div class="leader-card-top">
            ${avatarHTML}
            <div class="leader-identity">
              <div class="leader-position">${escapeHTML(position.title)}</div>
              <h3 class="leader-name">${escapeHTML(name)}</h3>
            </div>
          </div>
        </article>`;
    }).join("");
  }

  function renderTree(members) {
    const assigned = new Map(
      POSITIONS.map(position => [position.id, []])
    );

    for (const position of POSITIONS) {
      for (const member of members) {
        if (!matches(member, position)) continue;

        const list = assigned.get(position.id);
        const id = memberId(member);

        const duplicate = list.some(existing => {
          const existingId = memberId(existing);

          if (id && existingId) return id === existingId;

          return nicknameOf(member) &&
            nicknameOf(member) === nicknameOf(existing);
        });

        if (!duplicate) list.push(member);
      }
    }

    const get = id => POSITIONS.find(position => position.id === id);
    const card = id => renderCard(get(id), assigned.get(id));

    // Порядок з фото: HR, івенти, логістика, PR, технічний.
    const managerIds = [
      "hr",
      "event",
      "logistics",
      "pr",
      "technical"
    ];

    const managerHTML = managerIds.map(id => {
      if (id !== "logistics") {
        return `
          <div class="tree-manager">
            ${card(id)}
          </div>`;
      }

      return `
        <div class="tree-manager tree-manager-logistics">
          ${card("logistics")}
          <div class="tree-logistician">
            <div class="tree-connector-child" aria-hidden="true"></div>
            ${card("logistician")}
          </div>
        </div>`;
    }).join("");

    grid.className = "leadership-tree";
    grid.innerHTML = `
      <section class="tree-level tree-level-head" aria-label="Керівник">
        ${card("head")}
      </section>

      <div class="tree-connector tree-connector-main" aria-hidden="true"></div>

      <section class="tree-level tree-level-deputy" aria-label="Заступник">
        ${card("deputy")}
      </section>

      <div class="tree-connector tree-connector-main" aria-hidden="true"></div>

      <section class="tree-level tree-level-top" aria-label="Топ-менеджер">
        ${card("top")}
      </section>

      <div class="tree-connector tree-connector-branch" aria-hidden="true"></div>

      <section class="tree-managers" aria-label="Менеджери напрямків">
        ${managerHTML}
      </section>`;
  }

  function showError(message) {
    grid.className = "leadership-tree";
    grid.innerHTML = `
      <div class="leadership-message error">
        <strong>Не вдалося завантажити керівний склад.</strong>
        <p>${escapeHTML(message)}</p>
      </div>`;
  }

  function getMembers(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.members)) return data.members;
    if (Array.isArray(data?.data)) return data.data;

    throw new Error("RPC повернув невідомий формат даних.");
  }

  async function loadLeadership() {
    if (loading) return;
    loading = true;

    try {
      const client = window.supabaseClient;
      if (!client?.rpc) {
        throw new Error("Supabase не підключено.");
      }

      const { data, error } = await client.rpc("get_ua_legion_members");
      if (error) throw error;

      renderTree(getMembers(data));
      loaded = true;

      console.info("[UA LEGION] Керівництво оновлено.");
    } catch (error) {
      console.error("[UA LEGION] Помилка завантаження:", error);

      if (!loaded) {
        showError(error?.message || "Невідома помилка.");
      }
    } finally {
      loading = false;
    }
  }

  loadLeadership();

  // Оновлення призначень і фото раз на хвилину.
  window.setInterval(loadLeadership, 60000);

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      loadLeadership();
    }
  });
})();
