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

  const DUTIES = {
    head: {
      heading: "Керівник ETS2 UA LEGION",
      reports: "Вища керівна посада транспортного підрозділу.",
      summary: "Визначає напрям розвитку компанії та відповідає за загальний результат роботи ETS2.",
      tasks: [
        "Визначає стратегічні цілі, правила та принципи роботи підрозділу.",
        "Формує структуру керівництва, призначає відповідальних і переглядає їхню роботу.",
        "Контролює діяльність напрямків і ухвалює ключові організаційні рішення.",
        "Розглядає складні дисциплінарні питання та конфлікти, які не вдалося вирішити на нижчих рівнях.",
        "Представляє UA LEGION ETS2 у взаємодії з іншими компаніями та спільнотами.",
        "Затверджує важливі зміни, великі заходи й основні внутрішні ініціативи."
      ]
    },
    deputy: {
      heading: "Заступник керівника ETS2 UA LEGION",
      reports: "Підпорядковується керівнику ETS2.",
      summary: "Допомагає керівнику координувати команду та забезпечує виконання узгоджених рішень.",
      tasks: [
        "Координує роботу топ-менеджера й керівників напрямків.",
        "Перетворює рішення керівника на конкретні завдання та контролює їх виконання.",
        "За дорученням керівника представляє його та виконує визначені повноваження.",
        "Допомагає підтримувати єдині стандарти роботи, дисципліну й комунікацію.",
        "Допомагає врегульовувати конфлікти та проблеми між напрямками.",
        "Готує керівнику звіти про стан справ, ризики й завдання, що потребують рішення."
      ]
    },
    top: {
      heading: "Топ-менеджер ETS2 UA LEGION",
      reports: "Підпорядковується керівнику та заступнику.",
      summary: "Організовує щоденну роботу менеджерів і стежить, щоб домовленості перетворювалися на виконані завдання.",
      tasks: [
        "Доводить рішення керівництва до менеджерів у вигляді зрозумілих завдань.",
        "Координує HR, івент-, логістичний, PR- і технічний напрямки.",
        "Контролює строки, поточні завдання та якість роботи менеджерів.",
        "Виявляє проблеми в роботі підрозділу й узгоджує способи їх вирішення.",
        "Стежить за активністю водіїв, участю в заходах і загальним станом команди.",
        "Регулярно звітує керівництву про виконану роботу та питання, що потребують уваги."
      ]
    },
    hr: {
      heading: "HR-менеджер ETS2 UA LEGION",
      reports: "Підпорядковується топ-менеджеру та керівництву.",
      summary: "Відповідає за залучення учасників, адаптацію новачків і здорову атмосферу в команді.",
      tasks: [
        "Опрацьовує заявки на вступ, проводить співбесіди та допомагає кандидатам пройти вступні етапи.",
        "Пояснює новим учасникам правила, структуру та порядок роботи компанії.",
        "Допомагає вести актуальні списки учасників і відстежувати зміни в складі.",
        "Звертає увагу на дисципліну, поведінку та дотримання внутрішніх правил.",
        "Підтримує мотивацію учасників і допомагає розв’язувати побутові непорозуміння.",
        "Повідомляє керівництво про кадрові потреби, проблеми та результати роботи з учасниками."
      ]
    },
    event: {
      heading: "Івент-менеджер ETS2 UA LEGION",
      reports: "Підпорядковується топ-менеджеру та взаємодіє з логістикою і PR.",
      summary: "Планує та організовує конвої, внутрішні заходи й спільні події з партнерами.",
      tasks: [
        "Формує календар конвоїв, тренувань та інших заходів.",
        "Узгоджує дати й умови подій із партнерами та іншими компаніями.",
        "Готує план заходу: час збору, формат, порядок проведення та відповідальних.",
        "Координує учасників до початку події та під час її проведення.",
        "Спільно з логістичним напрямком погоджує маршрут і порядок руху, а з PR — анонси та підсумки.",
        "Після заходів збирає результати й пропозиції щодо покращення."
      ]
    },
    logistics: {
      heading: "Менеджер з логістики ETS2 UA LEGION",
      reports: "Підпорядковується топ-менеджеру; координує роботу логістів.",
      summary: "Організовує логістичну частину конвоїв і відповідає за злагоджений рух колони.",
      tasks: [
        "Розподіляє завдання між логістами та контролює їх виконання.",
        "Погоджує маршрути, точки збору, місця зупинок і кінцеві пункти.",
        "Спільно з івент-менеджером готує логістичний план заходів і конвоїв.",
        "Визначає порядок руху колони, допомагає підтримувати дистанцію та організованість.",
        "Розбирає логістичні труднощі й пропонує покращення маршрутів та процедур.",
        "Звітує топ-менеджеру про підготовку конвоїв, роботу логістів і проблемні ситуації."
      ]
    },
    pr: {
      heading: "PR-менеджер ETS2 UA LEGION",
      reports: "Підпорядковується топ-менеджеру та взаємодіє з івент-менеджером.",
      summary: "Відповідає за публічний образ компанії, інформаційні матеріали та висвітлення її діяльності.",
      tasks: [
        "Готує новини, оголошення, публікації та звіти про діяльність компанії.",
        "Створює або координує підготовку графіки, відео та інших медіаматеріалів.",
        "Дотримується єдиного стилю й використання бренду UA LEGION.",
        "Висвітлює конвої та події, узгоджуючи матеріали з відповідальними організаторами.",
        "Координує партнерські публікації та інформаційні обміни.",
        "Погоджує важливі публічні повідомлення з керівництвом і стежить за репутацією компанії."
      ]
    },
    technical: {
      heading: "Технічний менеджер ETS2 UA LEGION",
      reports: "Підпорядковується топ-менеджеру та співпрацює з організаторами подій.",
      summary: "Допомагає учасникам розв’язувати технічні питання, пов’язані з ETS2 та інструментами спільноти.",
      tasks: [
        "Допомагає з типовими проблемами ETS2 і TruckersMP у межах своїх знань.",
        "Готує зрозумілі інструкції щодо налаштувань, модифікацій і програм, потрібних команді.",
        "Підтримує технічні інструменти та ресурси спільноти в межах наданого доступу.",
        "Збирає повідомлення про помилки, визначає пріоритети й відстежує їх розв’язання.",
        "Допомагає організаторам підготувати технічну частину заходів.",
        "Повідомляє керівництво про системні проблеми та пропонує практичні рішення."
      ]
    },
    logistician: {
      heading: "Логіст ETS2 UA LEGION",
      reports: "Підпорядковується менеджеру з логістики.",
      summary: "Виконує практичні логістичні завдання під час підготовки та проведення конвоїв.",
      tasks: [
        "Виконує завдання менеджера з логістики й повідомляє про стан їх виконання.",
        "Перевіряє маршрут, точки збору, зупинки та місце призначення перед конвоєм.",
        "Допомагає водіям зорієнтуватися на маршруті й дотримуватися погодженого плану.",
        "Під час конвою допомагає підтримувати організований рух і взаємодію учасників.",
        "Повідомляє відповідального про затримки, перешкоди, інциденти та зміни ситуації.",
        "Після заходу надає короткий звіт і пропозиції щодо покращення організації."
      ]
    }
  };

  const grid = document.getElementById("leadershipGrid");
  if (!grid) return;

  let loading = false;
  let loaded = false;
  let selectedRole = null;

  const normalize = value => String(value ?? "")
    .normalize("NFKC")
    .toLocaleLowerCase("uk-UA")
    .replace(/[’‘`]/g, "'")
    .replace(/\s+/g, " ")
    .trim();

  const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
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
      const values = [direction?.slug, direction?.code, direction?.name].map(normalize);
      const isETS2 = values.some(value =>
        value === "ets2" || value.includes("euro truck simulator") || value.includes("eurotruck simulator")
      );
      if (!isETS2) continue;
      for (const role of asArray(direction.roles)) {
        if (typeof role === "string") result.push(role);
        else if (role && typeof role === "object") {
          result.push(role.code, role.name, role.title, role.label, role.role_name);
        }
      }
    }
    for (const role of asArray(member.roles)) {
      if (typeof role === "string") result.push(role);
      else if (role && typeof role === "object") {
        result.push(role.code, role.name, role.title, role.label, role.role_name);
      }
    }
    result.push(member.role, member.role_code, member.role_name);
    return new Set(result.filter(Boolean).map(normalize));
  }

  function matches(member, position) {
    const roles = getRoles(member);
    return roles.has(normalize(position.code)) || roles.has(normalize(position.title));
  }

  function nicknameOf(member) {
    return String(member.game_nickname ?? member.nickname ?? member.discord_username ?? "").trim();
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
    return String(member.user_id ?? member.profile_id ?? member.member_id ?? member.id ?? "");
  }

  function initials(name) {
    return (name.replace(/^@/, "").slice(0, 2) || "UA").toLocaleUpperCase("uk-UA");
  }

  function renderCard(position, members) {
    const duty = DUTIES[position.id];
    const selected = selectedRole === position.id;
    const baseAttrs = `class="leader-card role-card${members.length ? "" : " vacant"}${selected ? " is-selected" : ""}" data-role="${escapeHTML(position.id)}" tabindex="0" role="button" aria-expanded="${selected}" aria-controls="roleDetails-${escapeHTML(position.id)}" aria-label="Переглянути обов’язки: ${escapeHTML(position.title)}"`;
    if (!members.length) {
      return `<article ${baseAttrs}>
        <div class="leader-card-top">
          <div class="leader-avatar-fallback" aria-hidden="true">UA</div>
          <div class="leader-identity"><div class="leader-position">${escapeHTML(position.title)}</div><h3 class="leader-name">ВАКАНТ</h3></div>
        </div>
        <span class="leader-card-hint">НАТИСНІТЬ, ЩОБ ПЕРЕГЛЯНУТИ ОБОВ’ЯЗКИ</span>
      </article>`;
    }
    return members.map(member => {
      const name = nicknameOf(member) || "Нікнейм не вказано";
      const avatar = avatarOf(member);
      const avatarHTML = avatar
        ? `<img class="leader-avatar" src="${escapeHTML(avatar)}" alt="Аватар учасника" loading="lazy">`
        : `<div class="leader-avatar-fallback" aria-hidden="true">${escapeHTML(initials(name))}</div>`;
      return `<article ${baseAttrs}>
        <div class="leader-card-top">${avatarHTML}
          <div class="leader-identity"><div class="leader-position">${escapeHTML(position.title)}</div><h3 class="leader-name">${escapeHTML(name)}</h3></div>
        </div>
        <span class="leader-card-hint">НАТИСНІТЬ, ЩОБ ПЕРЕГЛЯНУТИ ОБОВ’ЯЗКИ</span>
      </article>`;
    }).join("");
  }

  function renderDetails() {
    grid.querySelectorAll(".role-details").forEach(panel => {
      const roleId = panel.dataset.roleDetails;
      if (!selectedRole || roleId !== selectedRole || !DUTIES[roleId]) {
        panel.hidden = true;
        panel.innerHTML = "";
      }
    });

    if (!selectedRole || !DUTIES[selectedRole]) return;
    const panel = grid.querySelector(`[data-role-details="${selectedRole}"]`);
    if (!panel) return;

    const duty = DUTIES[selectedRole];
    const tasks = duty.tasks.map(task => `<li>${escapeHTML(task)}</li>`).join("");
    panel.innerHTML = `
      <div class="role-details-header">
        <div><span class="role-details-eyebrow">UA LEGION ETS2 / ПОСАДА</span>
          <h2>${escapeHTML(duty.heading)}</h2><p>${escapeHTML(duty.summary)}</p>
        </div>
        <button class="role-details-close" type="button" aria-label="Закрити обов’язки">×</button>
      </div>
      <div class="role-details-content">
        <div class="role-duties"><h3>Основні обов’язки</h3><ul>${tasks}</ul></div>
        <aside class="role-reporting"><span>ПІДПОРЯДКУВАННЯ</span><p>${escapeHTML(duty.reports)}</p></aside>
      </div>`;
    panel.hidden = false;
    panel.querySelector(".role-details-close")?.addEventListener("click", closeDetails);
  }

  function closeDetails() {
    selectedRole = null;
    grid.querySelectorAll(".role-card").forEach(card => {
      card.classList.remove("is-selected");
      card.setAttribute("aria-expanded", "false");
    });
    renderDetails();
  }

  function toggleDetails(card) {
    const id = card?.dataset?.role;
    if (!id || !DUTIES[id]) return;

    // Повторне натискання на активну посаду закриває опис.
    if (selectedRole === id) {
      closeDetails();
      return;
    }

    // Вибір іншої посади перемикає опис без дублювання панелей.
    selectedRole = id;
    grid.querySelectorAll(".role-card").forEach(item => {
      const active = item.dataset.role === id;
      item.classList.toggle("is-selected", active);
      item.setAttribute("aria-expanded", String(active));
    });

    renderDetails();
    const panel = grid.querySelector(`[data-role-details="${id}"]`);
    if (panel) panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function renderTree(members) {
    const assigned = new Map(POSITIONS.map(position => [position.id, []]));
    for (const position of POSITIONS) {
      for (const member of members) {
        if (!matches(member, position)) continue;
        const list = assigned.get(position.id);
        const id = memberId(member);
        const duplicate = list.some(existing => {
          const existingId = memberId(existing);
          if (id && existingId) return id === existingId;
          return nicknameOf(member) && nicknameOf(member) === nicknameOf(existing);
        });
        if (!duplicate) list.push(member);
      }
    }

    const byId = id => POSITIONS.find(position => position.id === id);
    const card = id => `<div class="role-block role-block-${id}">${renderCard(byId(id), assigned.get(id))}<section class="role-details" id="roleDetails-${id}" data-role-details="${id}" hidden aria-live="polite" aria-label="Обов’язки посади"></section></div>`;
    const managerIds = ["hr", "event", "logistics", "pr", "technical"];
    const managerHTML = managerIds.map(id =>
      `<div class="tree-manager">${card(id)}</div>`
    ).join("");

    grid.className = "leadership-tree";
    grid.setAttribute("aria-busy", "false");
    grid.innerHTML = `
      <section class="tree-level tree-level-head" aria-label="Керівник">${card("head")}</section>
      <div class="tree-connector-main" aria-hidden="true"></div>
      <section class="tree-level tree-level-deputy" aria-label="Заступник">${card("deputy")}</section>
      <div class="tree-connector-main" aria-hidden="true"></div>
      <section class="tree-level tree-level-top" aria-label="Топ-менеджер">${card("top")}</section>
      <div class="tree-connector-branch" aria-hidden="true"></div>
      <section class="tree-managers" aria-label="Менеджери напрямків">${managerHTML}</section>
      <section class="tree-logistician-row" aria-label="Логіст">
        <div class="tree-connector-child" aria-hidden="true"></div>${card("logistician")}
      </section>`;
    renderDetails();
  }

  function showError(message) {
    grid.className = "leadership-tree";
    grid.setAttribute("aria-busy", "false");
    grid.innerHTML = `<div class="leadership-message error"><strong>Не вдалося завантажити керівний склад.</strong><p>${escapeHTML(message)}</p></div>`;
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
      if (!client?.rpc) throw new Error("Supabase не підключено.");
      const { data, error } = await client.rpc("get_ua_legion_members");
      if (error) throw error;
      renderTree(getMembers(data));
      loaded = true;
      console.info("[UA LEGION] Керівництво оновлено.");
    } catch (error) {
      console.error("[UA LEGION] Помилка завантаження:", error);
      if (!loaded) showError(error?.message || "Невідома помилка.");
    } finally {
      loading = false;
    }
  }

  grid.addEventListener("click", event => {
    const card = event.target.closest(".role-card");
    if (card) toggleDetails(card);
  });

  grid.addEventListener("keydown", event => {
    const card = event.target.closest(".role-card");
    if (!card || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    toggleDetails(card);
  });

  loadLeadership();
  window.setInterval(loadLeadership, 60000);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") loadLeadership();
  });
})();
