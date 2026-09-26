// ==========================================
// UA LEGION — SUPPORT
// support.js
// VERSION 8
// ==========================================

document.addEventListener("DOMContentLoaded", async function () {

  const supabase = window.supabaseClient;

  if (!supabase) {
    console.error("UA LEGION: Supabase не підключений");
    return;
  }


  // ==========================================
  // STATE
  // ==========================================

  let currentUser = null;
  let isStaff = false;

  let directions = [];
  let categories = [];
  let dataFields = [];

  let activeDirectionData = {};
  let myTickets = [];
  let staffTickets = [];

  let currentTicket = null;

  let profileCurrentValues = {};

  const memberSummaryCache = new Map();
  const directionDataCache = new Map();
  const nicknameCache = new Map();
  const profileCache = new Map();


  // ==========================================
  // ELEMENTS
  // ==========================================

  const el = id => document.getElementById(id);

  const supportMessage = el("supportMessage");

  const ticketForm = el("ticketForm");
  const ticketDirection = el("ticketDirection");
  const ticketCategory = el("ticketCategory");
  const ticketSubject = el("ticketSubject");
  const ticketPriority = el("ticketPriority");
  const ticketMessage = el("ticketMessage");

  const dataChangeBuilder = el("dataChangeBuilder");
  const dataChangeRows = el("dataChangeRows");
  const addChangeButton = el("addChangeButton");

  const myTicketsList = el("myTicketsList");

  const staffPanel = el("staffPanel");
  const staffTicketsList = el("staffTicketsList");
  const staffSearch = el("staffSearch");
  const staffStatusFilter = el("staffStatusFilter");
  const staffDirectionFilter = el("staffDirectionFilter");

  const ticketModal = el("ticketModal");
  const closeTicketModal = el("closeTicketModal");

  const modalTitle = el("modalTitle");
  const modalMeta = el("modalMeta");
  const modalTicketBody = el("modalTicketBody");
  const modalChanges = el("modalChanges");
  const modalMessages = el("modalMessages");

  const replyMessage = el("replyMessage");

  const internalMessageWrap = el("internalMessageWrap");
  const internalMessage = el("internalMessage");

  const sendReplyButton = el("sendReplyButton");

  const staffDecision = el("staffDecision");
  const decisionComment = el("decisionComment");
  const approveTicketButton = el("approveTicketButton");
  const rejectTicketButton = el("rejectTicketButton");

  const ticketAssignmentPanel =
    el("ticketAssignmentPanel");

  const assignmentCurrent =
    el("assignmentCurrent");

  const assignmentHistory =
    el("assignmentHistory");

  const takeTicketButton =
    el("takeTicketButton");


  // ==========================================
  // HELPERS
  // ==========================================

  function escapeHtml(value) {

    return String(
      value == null ? "" : value
    )
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  }


  function formatDate(value) {

    if (!value) {
      return "—";
    }

    try {

      return new Date(value).toLocaleString(
        "uk-UA",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }
      );

    } catch {

      return String(value);

    }

  }


  function showMessage(
    message,
    type = "info"
  ) {

    if (!supportMessage) {
      return;
    }

    supportMessage.textContent =
      message || "";

    supportMessage.className =
      "support-message " + type;

    supportMessage.style.display =
      "block";

    clearTimeout(
      showMessage.timer
    );

    showMessage.timer =
      setTimeout(
        () => {

          supportMessage.style.display =
            "none";

        },
        5000
      );

  }


  function statusLabel(status) {

    return {

      new: "Нове",

      in_progress: "В роботі",

      resolved: "Вирішено",

      closed: "Закрито"

    }[status] || status || "—";

  }


  function priorityLabel(priority) {

    return {

      low: "Низький",

      normal: "Звичайний",

      high: "Високий",

      urgent: "Терміновий"

    }[priority] ||
      priority ||
      "—";

  }


  // ==========================================
  // USER
  // ==========================================

  async function loadUser() {

    const result =
      await supabase.auth.getUser();

    if (
      result.error ||
      !result.data?.user
    ) {

      window.location.href =
        "login.html";

      return false;

    }

    currentUser =
      result.data.user;

    return true;

  }


  // ==========================================
  // LOAD PROFILE
  // ==========================================

  async function loadProfile(
    userId
  ) {

    if (!userId) {
      return null;
    }


    if (
      profileCache.has(userId)
    ) {

      return profileCache.get(
        userId
      );

    }


    const result =
      await supabase
        .from("profiles")
        .select(
          `
          id,
          display_name,
          discord_username,
          discord_user_id,
          steam_id,
          game_nickname
          `
        )
        .eq(
          "id",
          userId
        )
        .maybeSingle();


    if (result.error) {

      console.error(
        "loadProfile:",
        result.error
      );

      return null;

    }


    const profile =
      result.data || null;


    if (profile) {

      profileCache.set(
        userId,
        profile
      );

    }


    return profile;

  }


  // ==========================================
  // LOAD MANY PROFILES
  //
  // ВАЖЛИВО:
  // окремий запит, щоб не було
  // ambiguous relationship
  // ==========================================

  async function loadProfiles(
    userIds
  ) {

    const ids =
      [
        ...new Set(
          (userIds || [])
            .filter(Boolean)
            .map(String)
        )
      ];


    const missing =
      ids.filter(
        id =>
          !profileCache.has(id)
      );


    if (!missing.length) {

      const result = {};

      ids.forEach(
        id => {

          result[id] =
            profileCache.get(id) ||
            null;

        }
      );

      return result;

    }


    const query =
      await supabase
        .from("profiles")
        .select(
          `
          id,
          display_name,
          discord_username,
          discord_user_id,
          steam_id,
          game_nickname
          `
        )
        .in(
          "id",
          missing
        );


    if (query.error) {

      console.error(
        "loadProfiles:",
        query.error
      );

    } else {

      (
        query.data || []
      ).forEach(
        profile => {

          profileCache.set(
            String(profile.id),
            profile
          );

        }
      );

    }


    const result = {};

    ids.forEach(
      id => {

        result[id] =
          profileCache.get(id) ||
          null;

      }
    );


    return result;

  }


  // ==========================================
  // PROFILE CURRENT VALUES
  // ==========================================

  async function loadProfileCurrentValues() {

    const profile =
      await loadProfile(
        currentUser.id
      );


    if (!profile) {
      return {};
    }


    return {

      "profile.display_name":
        profile.display_name ?? "",

      "profile.birth_date":
        profile.birth_date ?? "",

      "profile.discord_username":
        profile.discord_username ?? "",

      "profile.discord_user_id":
        profile.discord_user_id ?? "",

      "profile.steam_id":
        profile.steam_id ?? "",

      "profile.game_nickname":
        profile.game_nickname ?? ""

    };

  }


  // ==========================================
  // DIRECTIONS
  // ==========================================

  async function loadDirections() {

    const result =
      await supabase
        .from("directions")
        .select(
          "id,name,slug,code,is_active"
        )
        .eq(
          "is_active",
          true
        )
        .order("id");


    if (result.error) {

      console.error(
        "Directions:",
        result.error
      );

      showMessage(
        "Не вдалося завантажити напрямки.",
        "error"
      );

      return;

    }


    directions =
      result.data || [];


    const membership =
      await supabase
        .from("user_directions")
        .select(
          `
          direction_id,
          status,
          direction_data
          `
        )
        .eq(
          "user_id",
          currentUser.id
        );


    if (!membership.error) {

      activeDirectionData = {};


      (
        membership.data || []
      ).forEach(
        row => {

          if (
            row.status === "active"
          ) {

            activeDirectionData[
              String(
                row.direction_id
              )
            ] =
              row.direction_data ||
              {};

          }

        }
      );

    }


    if (ticketDirection) {

      ticketDirection.innerHTML =
        `
        <option value="">
          🇺🇦 UA LEGION / Загальне
        </option>
        `;


      directions.forEach(
        direction => {

          if (
            activeDirectionData[
              String(direction.id)
            ] !== undefined
          ) {

            ticketDirection.insertAdjacentHTML(
              "beforeend",
              `
              <option value="${escapeHtml(
                direction.id
              )}">
                ${escapeHtml(
                  direction.name
                )}
              </option>
              `
            );

          }

        }
      );

    }


    if (staffDirectionFilter) {

      staffDirectionFilter.innerHTML =
        `
        <option value="all">
          Усі напрямки
        </option>

        <option value="global">
          🇺🇦 UA LEGION / Загальні
        </option>
        `;


      directions.forEach(
        direction => {

          staffDirectionFilter.insertAdjacentHTML(
            "beforeend",
            `
            <option value="${escapeHtml(
              direction.id
            )}">
              ${escapeHtml(
                direction.name
              )}
            </option>
            `
          );

        }
      );

    }

  }


  // ==========================================
  // CATEGORIES
  // ==========================================

  async function loadCategories() {

    const result =
      await supabase
        .from("support_categories")
        .select(
          "id,code,name,icon,description"
        )
        .eq(
          "is_active",
          true
        )
        .order("id");


    if (result.error) {

      console.error(
        "Categories:",
        result.error
      );

      showMessage(
        "Не вдалося завантажити категорії.",
        "error"
      );

      return;

    }


    categories =
      result.data || [];


    if (ticketCategory) {

      ticketCategory.innerHTML =
        categories
          .map(
            category =>
              `
              <option value="${escapeHtml(
                category.code
              )}">
                ${escapeHtml(
                  (
                    category.icon ||
                    ""
                  ) +
                  " " +
                  category.name
                )}
              </option>
              `
          )
          .join("");


      updateDataChangeVisibility();

    }

  }


  // ==========================================
  // DATA FIELDS
  // ==========================================

  async function loadDataFields() {

    const result =
      await supabase
        .from(
          "support_data_fields"
        )
        .select(
          `
          field_key,
          field_name,
          direction_id,
          json_key,
          input_type,
          is_active
          `
        )
        .eq(
          "is_active",
          true
        )
        .order("id");


    if (result.error) {

      console.error(
        "Data fields:",
        result.error
      );

      return;

    }


    dataFields =
      result.data || [];

  }


  function fieldsForCurrentDirection() {

    const directionId =
      ticketDirection?.value || "";


    return dataFields.filter(
      field => {

        if (
          String(
            field.field_key || ""
          ).startsWith(
            "profile."
          )
        ) {

          return true;

        }


        return (
          directionId &&
          String(
            field.direction_id
          ) ===
          String(
            directionId
          )
        );

      }
    );

  }


  function getCurrentValue(
    field
  ) {

    if (!field) {
      return "";
    }


    if (
      String(
        field.field_key || ""
      ).startsWith(
        "profile."
      )
    ) {

      return (
        profileCurrentValues[
          field.field_key
        ] ?? ""
      );

    }


    const data =
      activeDirectionData[
        String(
          field.direction_id
        )
      ] || {};


    return (
      data[
        field.json_key
      ] ?? ""
    );

  }


  function addChangeRow(
    selectedKey
  ) {

    if (!dataChangeRows) {
      return;
    }


    const fields =
      fieldsForCurrentDirection();


    if (!fields.length) {

      showMessage(
        "Для вибраного напрямку немає доступних полів.",
        "error"
      );

      return;

    }


    const field =
      fields.find(
        item =>
          item.field_key ===
          selectedKey
      ) ||
      fields[0];


    const row =
      document.createElement(
        "div"
      );


    row.className =
      "change-row";


    row.innerHTML =
      `
      <div>

        <label>
          Поле
        </label>

        <select class="change-field">

          ${fields
            .map(
              item =>
                `
                <option
                  value="${escapeHtml(
                    item.field_key
                  )}"
                  ${
                    item.field_key ===
                    field.field_key
                      ? "selected"
                      : ""
                  }
                >
                  ${escapeHtml(
                    item.field_name
                  )}
                </option>
                `
            )
            .join("")}

        </select>

      </div>


      <div>

        <label>
          Поточне значення
        </label>

        <input
          class="change-current"
          type="text"
          readonly
        >

      </div>


      <div>

        <label>
          Нове значення
        </label>

        <input
          class="change-new"
          type="text"
          placeholder="Нове значення"
        >


        <textarea
          class="change-reason"
          rows="2"
          placeholder="Причина зміни"
        ></textarea>

      </div>


      <button
        class="remove-change"
        type="button"
        title="Видалити"
      >
        ✕
      </button>
      `;


    dataChangeRows.appendChild(
      row
    );


    const fieldSelect =
      row.querySelector(
        ".change-field"
      );


    const currentInput =
      row.querySelector(
        ".change-current"
      );


    function refreshCurrent() {

      const selected =
        dataFields.find(
          item =>
            item.field_key ===
            fieldSelect.value
        );


      currentInput.value =
        selected
          ? getCurrentValue(
              selected
            )
          : "";

    }


    fieldSelect.addEventListener(
      "change",
      refreshCurrent
    );


    row.querySelector(
      ".remove-change"
    ).addEventListener(
      "click",
      () => {

        row.remove();

      }
    );


    refreshCurrent();

  }


  function updateDataChangeVisibility() {

    if (
      !ticketCategory ||
      !dataChangeBuilder
    ) {

      return;

    }


    const active =
      ticketCategory.value ===
      "data_change";


    dataChangeBuilder.hidden =
      !active;


    if (!active) {

      if (dataChangeRows) {

        dataChangeRows.innerHTML =
          "";

      }

      return;

    }


    if (
      dataChangeRows &&
      !dataChangeRows.children.length
    ) {

      addChangeRow();

    }

  }


  function collectChanges() {

    if (!dataChangeRows) {
      return [];
    }


    return [
      ...dataChangeRows.querySelectorAll(
        ".change-row"
      )
    ].map(
      row => {

        const fieldKey =
          row.querySelector(
            ".change-field"
          )?.value ||
          "";


        const field =
          dataFields.find(
            item =>
              item.field_key ===
              fieldKey
          );


        const oldValue =
          row.querySelector(
            ".change-current"
          )?.value ||
          "";


        const newValue =
          row.querySelector(
            ".change-new"
          )?.value.trim() ||
          "";


        const reason =
          row.querySelector(
            ".change-reason"
          )?.value.trim() ||
          "";


        return {

          field_key:
            fieldKey,

          field_name:
            field?.field_name ||
            fieldKey,

          old_value:
            oldValue === ""
              ? null
              : oldValue,

          new_value:
            newValue === ""
              ? null
              : newValue,

          reason:
            reason ||
            null

        };

      }
    );

  }


  function validateChanges(
    changes
  ) {

    if (
      ticketCategory?.value !==
      "data_change"
    ) {

      return true;

    }


    if (!changes.length) {

      showMessage(
        "Додайте хоча б одну зміну.",
        "error"
      );

      return false;

    }


    const used =
      new Set();


    for (
      const change of changes
    ) {

      if (
        used.has(
          change.field_key
        )
      ) {

        showMessage(
          "Одне й те саме поле не можна додати двічі.",
          "error"
        );

        return false;

      }


      used.add(
        change.field_key
      );


      if (
        !change.new_value
      ) {

        showMessage(
          "Нове значення не може бути порожнім.",
          "error"
        );

        return false;

      }


      if (
        !change.reason
      ) {

        showMessage(
          "Для кожної зміни вкажіть причину.",
          "error"
        );

        return false;

      }

    }


    return true;

  }


  // ==========================================
  // CREATE TICKET
  // ==========================================

  async function createTicket(
    event
  ) {

    event.preventDefault();


    const subject =
      ticketSubject?.value.trim() ||
      "";


    const message =
      ticketMessage?.value.trim() ||
      "";


    if (
      !subject ||
      !message
    ) {

      showMessage(
        "Заповніть тему та повідомлення.",
        "error"
      );

      return;

    }


    const changes =
      collectChanges();


    if (
      !validateChanges(
        changes
      )
    ) {

      return;

    }


    const button =
      el(
        "submitTicketButton"
      );


    if (button) {

      button.disabled =
        true;

      button.textContent =
        "НАДСИЛАННЯ...";

    }


    const result =
      await supabase.rpc(
        "create_support_ticket",
        {

          p_direction_id:
            ticketDirection?.value
              ? Number(
                  ticketDirection.value
                )
              : null,

          p_category_code:
            ticketCategory.value,

          p_subject:
            subject,

          p_message:
            message,

          p_priority:
            ticketPriority.value,

          p_changes:
            changes

        }
      );


    if (button) {

      button.disabled =
        false;

      button.textContent =
        "📨 НАДІСЛАТИ ЗВЕРНЕННЯ";

    }


    if (result.error) {

      console.error(
        "create_support_ticket:",
        result.error
      );

      showMessage(
        "Не вдалося створити звернення: " +
        result.error.message,
        "error"
      );

      return;

    }


    ticketForm.reset();


    if (dataChangeRows) {

      dataChangeRows.innerHTML =
        "";

    }


    updateDataChangeVisibility();


    showMessage(
      "Звернення успішно створено.",
      "success"
    );


    await loadMyTickets();


    if (isStaff) {

      await loadStaffTickets();

    }

  }


  // ==========================================
  // NICKNAMES
  // ==========================================

  function getFallbackNickname(
    profile
  ) {

    if (!profile) {
      return "Користувач";
    }


    const displayName =
      String(
        profile.display_name ||
        ""
      ).trim();


    if (
      displayName &&
      !displayName.includes("@")
    ) {

      return displayName;

    }


    const discord =
      String(
        profile.discord_username ||
        ""
      ).trim();


    if (discord) {
      return discord;
    }


    const game =
      String(
        profile.game_nickname ||
        ""
      ).trim();


    if (game) {
      return game;
    }


    return "Користувач";

  }


  function getDirectionNicknameKey(
    direction
  ) {

    if (!direction) {
      return null;
    }


    const code =
      String(
        direction.code ||
        direction.slug ||
        ""
      )
        .toLowerCase()
        .trim();


    const name =
      String(
        direction.name ||
        ""
      )
        .toLowerCase()
        .trim();


    if (
      code === "ets2" ||
      name.includes("ets2") ||
      name.includes("truckersmp")
    ) {

      return "truckersmp_nick";

    }


    if (
      code === "wot" ||
      name.includes(
        "world of tanks"
      )
    ) {

      return "wot_nickname";

    }


    if (
      code === "dota2" ||
      code === "dota" ||
      name.includes("dota")
    ) {

      return "dota_nickname";

    }


    if (
      code === "wow" ||
      name.includes(
        "world of warcraft"
      )
    ) {

      return "wow_character";

    }


    return null;

  }


  async function loadUserDirectionData(
    userId,
    directionId
  ) {

    if (
      !userId ||
      directionId === null ||
      directionId === undefined
    ) {

      return {};

    }


    const cacheKey =
      `${userId}:${directionId}`;


    if (
      directionDataCache.has(
        cacheKey
      )
    ) {

      return directionDataCache.get(
        cacheKey
      );

    }


    const result =
      await supabase
        .from("user_directions")
        .select(
          `
          direction_id,
          direction_data,
          status
          `
        )
        .eq(
          "user_id",
          userId
        )
        .eq(
          "direction_id",
          directionId
        )
        .maybeSingle();


    if (result.error) {

      console.error(
        "Direction data:",
        result.error
      );

      directionDataCache.set(
        cacheKey,
        {}
      );

      return {};

    }


    const data =
      result.data?.direction_data ||
      {};


    directionDataCache.set(
      cacheKey,
      data
    );


    return data;

  }


  async function getTicketUserNickname(
    userId,
    directionId,
    profile = null
  ) {

    if (!userId) {
      return "Користувач";
    }


    const cacheKey =
      `${userId}:${
        directionId ??
        "global"
      }`;


    if (
      nicknameCache.has(
        cacheKey
      )
    ) {

      return nicknameCache.get(
        cacheKey
      );

    }


    const userProfile =
      profile ||
      await loadProfile(
        userId
      );


    // ========================================
    // GLOBAL
    // ========================================

    if (
      directionId === null ||
      directionId === undefined
    ) {

      const nickname =
        String(
          userProfile?.game_nickname ||
          ""
        ).trim();


      const result =
        nickname ||
        getFallbackNickname(
          userProfile
        );


      nicknameCache.set(
        cacheKey,
        result
      );


      return result;

    }


    // ========================================
    // DIRECTION
    // ========================================

    const direction =
      directions.find(
        item =>
          Number(item.id) ===
          Number(directionId)
      );


    const nicknameKey =
      getDirectionNicknameKey(
        direction
      );


    if (nicknameKey) {

      const directionData =
        await loadUserDirectionData(
          userId,
          directionId
        );


      const nickname =
        String(
          directionData?.[
            nicknameKey
          ] ||
          ""
        ).trim();


      if (nickname) {

        nicknameCache.set(
          cacheKey,
          nickname
        );


        return nickname;

      }

    }


    const fallback =
      getFallbackNickname(
        userProfile
      );


    nicknameCache.set(
      cacheKey,
      fallback
    );


    return fallback;

  }


  // ==========================================
  // PROFILE LINK
  // ==========================================

  function profileLink(
    userId,
    nickname
  ) {

    if (!userId) {

      return escapeHtml(
        nickname ||
        "Користувач"
      );

    }


    return `
      <a
        href="member.html?user_id=${encodeURIComponent(
          userId
        )}"
        class="support-profile-link"
        target="_blank"
        rel="noopener"
      >
        ${escapeHtml(
          nickname ||
          "Користувач"
        )}
      </a>
    `;

  }


  // ==========================================
  // MEMBER SUMMARY
  // ==========================================

  async function loadMemberSummary(
    userId
  ) {

    if (!userId) {
      return null;
    }


    if (
      memberSummaryCache.has(
        userId
      )
    ) {

      return memberSummaryCache.get(
        userId
      );

    }


    const profile =
      await loadProfile(
        userId
      );


    const rolesResult =
      await supabase
        .from("user_roles")
        .select(
          `
          role_id,
          direction_id,
          roles(
            id,
            name,
            level,
            is_active
          )
          `
        )
        .eq(
          "user_id",
          userId
        );


    if (rolesResult.error) {

      console.error(
        "Member roles:",
        rolesResult.error
      );

    }


    const roles =
      rolesResult.data || [];


    const activeRoles =
      roles
        .filter(
          row =>
            row.roles &&
            row.roles.is_active !== false
        )
        .sort(
          (a, b) =>
            Number(
              b.roles?.level ||
              0
            ) -
            Number(
              a.roles?.level ||
              0
            )
        );


    const role =
      activeRoles[0]?.roles ||
      null;


    const summary = {

      id: userId,

      displayName:
        profile?.display_name ||
        "",

      discordUsername:
        profile?.discord_username ||
        "",

      gameNickname:
        profile?.game_nickname ||
        "",

      roleName:
        role?.name ||
        "Користувач",

      roleLevel:
        Number(
          role?.level ||
          0
        )

    };


    memberSummaryCache.set(
      userId,
      summary
    );


    return summary;

  }


  // ==========================================
  // TICKET LIST
  // ==========================================

  async function renderTicketList(
    list,
    target,
    staffMode
  ) {

    if (!target) {
      return;
    }


    if (!list.length) {

      target.innerHTML =
        `
        <div class="support-empty">
          Звернень немає.
        </div>
        `;

      return;

    }


    const userIds =
      list.map(
        ticket =>
          ticket.user_id
      );


    const profiles =
      await loadProfiles(
        userIds
      );


    target.innerHTML =
      list
        .map(
          ticket => {

            const category =
              ticket.support_categories ||
              {};

            const direction =
              ticket.directions ||
              {};

            const profile =
              profiles[
                String(
                  ticket.user_id
                )
              ] ||
              {};

            const fallback =
              getFallbackNickname(
                profile
              );


            return `
              <div
                class="ticket-row"
                data-ticket-id="${escapeHtml(
                  ticket.id
                )}"
              >

                <div
                  class="ticket-row-top"
                >

                  <span
                    class="ticket-number"
                  >
                    #${escapeHtml(
                      ticket.ticket_number
                    )}
                  </span>


                  <span
                    class="ticket-status ${escapeHtml(
                      ticket.status
                    )}"
                  >
                    ${escapeHtml(
                      statusLabel(
                        ticket.status
                      )
                    )}
                  </span>

                </div>


                <div
                  class="ticket-subject"
                >
                  ${escapeHtml(
                    ticket.subject
                  )}
                </div>


                <div
                  class="ticket-row-bottom"
                >

                  <span>
                    ${escapeHtml(
                      (
                        category.icon ||
                        ""
                      ) +
                      " " +
                      (
                        category.name ||
                        "Категорія"
                      )
                    )}

                    ·

                    ${escapeHtml(
                      direction.name ||
                      "UA LEGION"
                    )}

                  </span>


                  <span>
                    ${escapeHtml(
                      formatDate(
                        ticket.updated_at ||
                        ticket.created_at
                      )
                    )}
                  </span>

                </div>


                ${
                  staffMode
                    ? `
                      <div
                        class="ticket-user"
                      >

                        Користувач:

                        <span
                          class="ticket-user-nickname"
                          data-user-id="${escapeHtml(
                            ticket.user_id
                          )}"
                          data-direction-id="${
                            ticket.direction_id ??
                            ""
                          }"
                        >
                          ${escapeHtml(
                            fallback
                          )}
                        </span>

                      </div>
                    `
                    : ""
                }

              </div>
            `;

          }
        )
        .join("");


    // ========================================
    // LOAD REAL NICKNAMES
    // ========================================

    if (staffMode) {

      list.forEach(
        async ticket => {

          const profile =
            profiles[
              String(
                ticket.user_id
              )
            ] ||
            null;


          const nickname =
            await getTicketUserNickname(
              ticket.user_id,
              ticket.direction_id,
              profile
            );


          target
            .querySelectorAll(
              ".ticket-user-nickname"
            )
            .forEach(
              element => {

                if (
                  element.dataset.userId ===
                  String(
                    ticket.user_id
                  )
                ) {

                  element.textContent =
                    nickname;

                }

              }
            );

        }
      );

    }


    target
      .querySelectorAll(
        ".ticket-row"
      )
      .forEach(
        row => {

          row.addEventListener(
            "click",
            () => {

              openTicket(
                Number(
                  row.dataset.ticketId
                )
              );

            }
          );

        }
      );

  }


  // ==========================================
  // MY TICKETS
  // ==========================================

  async function loadMyTickets() {

    if (!myTicketsList) {
      return;
    }


    const result =
      await supabase
        .from("support_tickets")
        .select(
          `
          id,
          ticket_number,
          user_id,
          direction_id,
          category_id,
          subject,
          status,
          priority,
          assigned_user_id,
          created_at,
          updated_at,
          resolved_at,
          support_categories(
            name,
            code,
            icon
          ),
          directions(
            name,
            code
          )
          `
        )
        .eq(
          "user_id",
          currentUser.id
        )
        .order(
          "updated_at",
          {
            ascending: false
          }
        );


    if (result.error) {

      console.error(
        "My tickets:",
        result.error
      );

      myTicketsList.innerHTML =
        `
        <div class="support-empty">
          Не вдалося завантажити звернення.
        </div>
        `;

      return;

    }


    myTickets =
      result.data || [];


    await renderTicketList(
      myTickets,
      myTicketsList,
      false
    );

  }


  // ==========================================
  // STAFF CHECK
  // ==========================================

  async function checkStaff() {

    const result =
      await supabase.rpc(
        "is_ua_legion_staff"
      );


    if (result.error) {

      console.error(
        "Staff check:",
        result.error
      );

      return false;

    }


    return result.data === true;

  }


  // ==========================================
  // STAFF TICKETS
  // ==========================================

  async function loadStaffTickets() {

    if (
      !isStaff ||
      !staffTicketsList
    ) {

      return;

    }


    const result =
      await supabase
        .from("support_tickets")
        .select(
          `
          id,
          ticket_number,
          user_id,
          direction_id,
          category_id,
          subject,
          status,
          priority,
          assigned_user_id,
          created_at,
          updated_at,
          resolved_at,
          support_categories(
            name,
            code,
            icon
          ),
          directions(
            name,
            code
          )
          `
        )
        .order(
          "updated_at",
          {
            ascending: false
          }
        );


    if (result.error) {

      console.error(
        "Staff tickets:",
        result.error
      );

      staffTicketsList.innerHTML =
        `
        <div class="support-empty">
          Не вдалося завантажити звернення.
        </div>
        `;

      return;

    }


    staffTickets =
      result.data || [];


    await applyStaffFilters();

  }


  // ==========================================
  // STAFF FILTERS
  // ==========================================

  async function applyStaffFilters() {

    if (!staffTicketsList) {
      return;
    }


    const search =
      (
        staffSearch?.value ||
        ""
      )
        .trim()
        .toLowerCase();


    const status =
      staffStatusFilter?.value ||
      "all";


    const direction =
      staffDirectionFilter?.value ||
      "all";


    const profiles =
      await loadProfiles(
        staffTickets.map(
          ticket =>
            ticket.user_id
        )
      );


    const filtered = [];


    for (
      const ticket of staffTickets
    ) {

      const profile =
        profiles[
          String(
            ticket.user_id
          )
        ] ||
        null;


      const nickname =
        await getTicketUserNickname(
          ticket.user_id,
          ticket.direction_id,
          profile
        );


      const matchesSearch =
        !search ||

        String(
          ticket.ticket_number
        )
          .toLowerCase()
          .includes(search) ||

        String(
          ticket.subject ||
          ""
        )
          .toLowerCase()
          .includes(search) ||

        String(
          profile?.display_name ||
          ""
        )
          .toLowerCase()
          .includes(search) ||

        String(
          profile?.discord_username ||
          ""
        )
          .toLowerCase()
          .includes(search) ||

        String(
          profile?.game_nickname ||
          ""
        )
          .toLowerCase()
          .includes(search) ||

        String(
          nickname ||
          ""
        )
          .toLowerCase()
          .includes(search);


      const matchesStatus =
        status === "all" ||
        ticket.status === status;


      const matchesDirection =
        direction === "all" ||

        (
          direction === "global" &&
          ticket.direction_id === null
        ) ||

        String(
          ticket.direction_id
        ) ===
        String(direction);


      if (
        matchesSearch &&
        matchesStatus &&
        matchesDirection
      ) {

        filtered.push(
          ticket
        );

      }

    }


    await renderTicketList(
      filtered,
      staffTicketsList,
      true
    );

  }


  // ==========================================
  // ASSIGNMENT HISTORY
  // ==========================================

  async function loadAssignmentHistory(
    ticketId
  ) {

    const result =
      await supabase
        .from(
          "support_assignment_history"
        )
        .select(
          `
          id,
          ticket_id,
          previous_user_id,
          new_user_id,
          changed_by,
          previous_role_name,
          previous_role_level,
          new_role_name,
          new_role_level,
          action,
          created_at
          `
        )
        .eq(
          "ticket_id",
          ticketId
        )
        .order(
          "created_at",
          {
            ascending: true
          }
        );


    if (result.error) {

      console.error(
        "Assignment history:",
        result.error
      );

      return [];

    }


    return result.data || [];

  }


  // ==========================================
  // ASSIGNMENT HISTORY RENDER
  // ==========================================

  async function renderAssignmentHistory(
    history
  ) {

    if (!assignmentHistory) {
      return;
    }


    if (!history.length) {

      assignmentHistory.innerHTML =
        `
        <div class="support-subtitle">

          <span>
            📜
          </span>

          <div>

            <h3>
              Історія відповідальних
            </h3>

            <p>
              Хто і коли брав звернення в роботу.
            </p>

          </div>

        </div>


        <div class="support-empty">
          Історії передачі ще немає.
        </div>
        `;

      return;

    }


    assignmentHistory.innerHTML =
      `
      <div class="support-subtitle">

        <span>
          📜
        </span>

        <div>

          <h3>
            Історія відповідальних
          </h3>

          <p>
            Хто і коли брав звернення в роботу.
          </p>

        </div>

      </div>
      `;


    const container =
      document.createElement(
        "div"
      );


    container.className =
      "assignment-history-list";


    assignmentHistory.appendChild(
      container
    );


    const directionId =
      currentTicket
        ?.ticket
        ?.direction_id;


    for (
      const item of history
    ) {

      const newNickname =
        await getTicketUserNickname(
          item.new_user_id,
          directionId
        );


      const changedNickname =
        await getTicketUserNickname(
          item.changed_by,
          directionId
        );


      let previousNickname =
        "";


      if (
        item.previous_user_id
      ) {

        previousNickname =
          await getTicketUserNickname(
            item.previous_user_id,
            directionId
          );

      }


      const card =
        document.createElement(
          "div"
        );


      card.className =
        "change-review-card";


      if (
        item.action ===
        "assigned"
      ) {

        card.innerHTML =
          `
          <div class="change-review-title">

            <span>
              🔵 Взяття в роботу
            </span>

            <span>
              ${escapeHtml(
                formatDate(
                  item.created_at
                )
              )}
            </span>

          </div>


          <div class="change-review-reason">

            <b>
              Новий відповідальний:
            </b>

            ${profileLink(
              item.new_user_id,
              newNickname
            )}

          </div>


          <div class="change-review-reason">

            <b>
              Змінив:
            </b>

            ${profileLink(
              item.changed_by,
              changedNickname
            )}

          </div>


          <div class="change-review-reason">

            <b>
              Посада:
            </b>

            ${escapeHtml(
              item.new_role_name ||
              "—"
            )}

          </div>
          `;

      } else {

        card.innerHTML =
          `
          <div class="change-review-title">

            <span>
              🔄 Передача звернення
            </span>

            <span>
              ${escapeHtml(
                formatDate(
                  item.created_at
                )
              )}
            </span>

          </div>


          <div class="change-review-reason">

            <b>
              Від:
            </b>

            ${profileLink(
              item.previous_user_id,
              previousNickname
            )}

          </div>


          <div class="change-review-reason">

            <b>
              До:
            </b>

            ${profileLink(
              item.new_user_id,
              newNickname
            )}

          </div>


          <div class="change-review-reason">

            <b>
              Змінив:
            </b>

            ${profileLink(
              item.changed_by,
              changedNickname
            )}

          </div>


          <div class="change-review-reason">

            <b>
              Попередня посада:
            </b>

            ${escapeHtml(
              item.previous_role_name ||
              "—"
            )}

          </div>


          <div class="change-review-reason">

            <b>
              Нова посада:
            </b>

            ${escapeHtml(
              item.new_role_name ||
              "—"
            )}

          </div>
          `;

      }


      container.appendChild(
        card
      );

    }

  }


  // ==========================================
  // CURRENT ASSIGNMENT
  // ==========================================

  async function renderAssignment() {

    if (!ticketAssignmentPanel) {
      return;
    }


    if (!isStaff) {

      ticketAssignmentPanel.hidden =
        true;

      return;

    }


    ticketAssignmentPanel.hidden =
      false;


    const ticket =
      currentTicket.ticket;


    const assignedUserId =
      ticket.assigned_user_id;


    if (!assignedUserId) {

      assignmentCurrent.innerHTML =
        `
        <div class="change-review-title">

          <span>
            👤 Відповідальний
          </span>

          <span>
            Не призначено
          </span>

        </div>


        <div class="change-review-reason">
          Звернення ще ніхто не взяв у роботу.
        </div>
        `;

    } else {

      const nickname =
        await getTicketUserNickname(
          assignedUserId,
          ticket.direction_id
        );


      const summary =
        await loadMemberSummary(
          assignedUserId
        );


      assignmentCurrent.innerHTML =
        `
        <div class="change-review-title">

          <span>
            👤 Відповідальний
          </span>

          <span>
            В роботі
          </span>

        </div>


        <div class="change-review-reason">

          <b>
            Працівник:
          </b>

          ${profileLink(
            assignedUserId,
            nickname
          )}

        </div>


        <div class="change-review-reason">

          <b>
            Посада:
          </b>

          ${escapeHtml(
            summary?.roleName ||
            "—"
          )}

        </div>
        `;

    }


    const resolved =
      [
        "resolved",
        "closed"
      ].includes(
        ticket.status
      );


    if (
      resolved ||
      assignedUserId ===
      currentUser.id
    ) {

      takeTicketButton.hidden =
        true;

    } else {

      takeTicketButton.hidden =
        false;


      takeTicketButton.textContent =
        assignedUserId
          ? "🔄 ПЕРЕБРАТИ ЗВЕРНЕННЯ"
          : "🔵 ВЗЯТИ В РОБОТУ";

    }


    const history =
      await loadAssignmentHistory(
        ticket.id
      );


    await renderAssignmentHistory(
      history
    );

  }


  // ==========================================
  // TAKE TICKET
  // ==========================================

  async function takeTicket() {

    if (
      !currentTicket ||
      !isStaff
    ) {

      return;

    }


    takeTicketButton.disabled =
      true;


    const oldAssigned =
      currentTicket
        .ticket
        .assigned_user_id;


    const result =
      await supabase.rpc(
        "take_support_ticket",
        {
          p_ticket_id:
            currentTicket.ticket.id
        }
      );


    takeTicketButton.disabled =
      false;


    if (result.error) {

      console.error(
        "take_support_ticket:",
        result.error
      );

      showMessage(
        "Не вдалося взяти звернення в роботу: " +
        result.error.message,
        "error"
      );

      return;

    }


    showMessage(
      oldAssigned
        ? "Звернення передано вам."
        : "Звернення взято в роботу.",
      "success"
    );


    await openTicket(
      currentTicket.ticket.id
    );


    await loadMyTickets();


    if (isStaff) {

      await loadStaffTickets();

    }

  }


  // ==========================================
  // OPEN TICKET
  // ==========================================

  async function openTicket(
    ticketId
  ) {

    // ========================================
    // ВАЖЛИВО:
    // НЕ робимо profiles(...) тут.
    // Це усуває ambiguous relationship.
    // ========================================

    const result =
      await supabase
        .from("support_tickets")
        .select(
          `
          id,
          ticket_number,
          user_id,
          direction_id,
          category_id,
          subject,
          status,
          priority,
          assigned_user_id,
          created_at,
          updated_at,
          resolved_at,
          reviewed_by,
          reviewed_at,

          support_categories(
            name,
            code,
            icon,
            description
          ),

          directions(
            name,
            code,
            slug
          )
          `
        )
        .eq(
          "id",
          ticketId
        )
        .maybeSingle();


    if (
      result.error ||
      !result.data
    ) {

      console.error(
        "Open ticket:",
        result.error
      );

      showMessage(
        "Не вдалося відкрити звернення.",
        "error"
      );

      return;

    }


    const ticket =
      result.data;


    // ========================================
    // LOAD TICKET USER PROFILE SEPARATELY
    // ========================================

    const ticketUserProfile =
      await loadProfile(
        ticket.user_id
      );


    ticket._profile =
      ticketUserProfile;


    // ========================================
    // MESSAGES
    // ========================================

    const messagesResult =
      await supabase
        .from("support_messages")
        .select(
          `
          id,
          ticket_id,
          sender_user_id,
          message,
          created_at,
          is_internal
          `
        )
        .eq(
          "ticket_id",
          ticketId
        )
        .order(
          "created_at",
          {
            ascending: true
          }
        );


    if (
      messagesResult.error
    ) {

      console.error(
        "Messages:",
        messagesResult.error
      );

      showMessage(
        "Не вдалося завантажити діалог.",
        "error"
      );

      return;

    }


    const messages =
      messagesResult.data ||
      [];


    // ========================================
    // LOAD MESSAGE PROFILES SEPARATELY
    // ========================================

    const messageProfiles =
      await loadProfiles(
        messages.map(
          message =>
            message.sender_user_id
        )
      );


    messages.forEach(
      message => {

        message._profile =
          messageProfiles[
            String(
              message.sender_user_id
            )
          ] ||
          null;

      }
    );


    // ========================================
    // CHANGES
    // ========================================

    const changesResult =
      await supabase
        .from(
          "support_data_changes"
        )
        .select(
          `
          id,
          ticket_id,
          field_key,
          field_name,
          old_value,
          new_value,
          reason,
          status,
          reviewed_by,
          reviewed_at,
          review_comment,
          created_at
          `
        )
        .eq(
          "ticket_id",
          ticketId
        )
        .order("id");


    if (
      changesResult.error
    ) {

      console.error(
        "Changes:",
        changesResult.error
      );

    }


    currentTicket = {

      ticket,

      messages,

      changes:
        changesResult.data ||
        []

    };


    // ========================================
    // MARK READ
    // ========================================

    try {

      await supabase.rpc(
        "mark_support_ticket_read",
        {
          p_ticket_id:
            ticketId
        }
      );


      if (
        typeof window
          .uaLegionRefreshSupportUnread ===
        "function"
      ) {

        window
          .uaLegionRefreshSupportUnread();

      }

    } catch (error) {

      console.warn(
        "mark_support_ticket_read:",
        error
      );

    }


    await renderModal();


    if (ticketModal) {

      ticketModal.classList.add(
        "active"
      );

      ticketModal.setAttribute(
        "aria-hidden",
        "false"
      );

    }

  }


  // ==========================================
  // RENDER MODAL
  // ==========================================

  async function renderModal() {

    if (!currentTicket) {
      return;
    }


    const ticket =
      currentTicket.ticket;


    const category =
      ticket.support_categories ||
      {};


    const direction =
      ticket.directions ||
      {};


    modalTitle.textContent =
      `#${ticket.ticket_number} — ${ticket.subject}`;


    modalMeta.textContent =
      `${category.icon || ""} ` +
      `${category.name || "Категорія"} · ` +
      `${direction.name || "UA LEGION"} · ` +
      `${priorityLabel(
        ticket.priority
      )} · ` +
      `${statusLabel(
        ticket.status
      )}`;


    // ========================================
    // USER NICKNAME
    // ========================================

    const userNickname =
      await getTicketUserNickname(
        ticket.user_id,
        ticket.direction_id,
        ticket._profile
      );


    // ========================================
    // REVIEWER
    // ========================================

    let reviewerNickname =
      "";


    if (
      ticket.reviewed_by
    ) {

      reviewerNickname =
        await getTicketUserNickname(
          ticket.reviewed_by,
          ticket.direction_id
        );

    }


    // ========================================
    // BASIC INFO
    // ========================================

    modalTicketBody.innerHTML =
      `
      <div class="modal-info-grid">


        <div class="modal-info-item">

          <span>
            Користувач
          </span>

          <strong>
            ${profileLink(
              ticket.user_id,
              userNickname
            )}
          </strong>

        </div>


        <div class="modal-info-item">

          <span>
            Створено
          </span>

          <strong>
            ${escapeHtml(
              formatDate(
                ticket.created_at
              )
            )}
          </strong>

        </div>


        <div class="modal-info-item full">

          <span>
            Тема
          </span>

          <strong>
            ${escapeHtml(
              ticket.subject
            )}
          </strong>

        </div>


        ${
          ticket.reviewed_by
            ? `
              <div class="modal-info-item">

                <span>
                  Розглянув
                </span>

                <strong>
                  ${profileLink(
                    ticket.reviewed_by,
                    reviewerNickname
                  )}
                </strong>

              </div>


              <div class="modal-info-item">

                <span>
                  Дата розгляду
                </span>

                <strong>
                  ${escapeHtml(
                    formatDate(
                      ticket.reviewed_at
                    )
                  )}
                </strong>

              </div>
            `
            : ""
        }

      </div>
      `;


    renderChanges();

    await renderMessages();

    await renderAssignment();


    const canReview =
      isStaff &&

      currentTicket.changes.some(
        change =>
          change.status ===
          "pending"
      ) &&

      ![
        "resolved",
        "closed"
      ].includes(
        ticket.status
      );


    if (staffDecision) {

      staffDecision.hidden =
        !canReview;

    }


    if (internalMessageWrap) {

      internalMessageWrap.hidden =
        !isStaff;

    }

  }


  // ==========================================
  // CHANGES
  // ==========================================

  function renderChanges() {

    const changes =
      currentTicket?.changes ||
      [];


    if (!changes.length) {

      modalChanges.innerHTML =
        "";

      return;

    }


    modalChanges.innerHTML =
      `
      <div class="support-subtitle">

        <span>
          📝
        </span>

        <div>

          <h3>
            Запропоновані зміни
          </h3>

          <p>
            Схвалення звернення автоматично
            застосовує всі зміни.
          </p>

        </div>

      </div>


      ${changes
        .map(
          change =>
            `
            <div
              class="change-review-card ${escapeHtml(
                change.status
              )}"
            >

              <div
                class="change-review-title"
              >

                <span>
                  ${escapeHtml(
                    change.field_name ||
                    change.field_key
                  )}
                </span>

                <span>
                  ${escapeHtml(
                    change.status
                  )}
                </span>

              </div>


              <div
                class="change-review-values"
              >

                <div
                  class="change-review-value"
                >

                  <span>
                    Було
                  </span>

                  <strong>
                    ${escapeHtml(
                      change.old_value ??
                      "—"
                    )}
                  </strong>

                </div>


                <div
                  class="change-review-value"
                >

                  <span>
                    Стане
                  </span>

                  <strong>
                    ${escapeHtml(
                      change.new_value ??
                      "—"
                    )}
                  </strong>

                </div>

              </div>


              <div
                class="change-review-reason"
              >

                <b>
                  Причина:
                </b>

                ${escapeHtml(
                  change.reason ||
                  "—"
                )}

              </div>


              ${
                change.review_comment
                  ? `
                    <div
                      class="change-review-reason"
                    >

                      <b>
                        Рішення:
                      </b>

                      ${escapeHtml(
                        change.review_comment
                      )}

                    </div>
                  `
                  : ""
              }

            </div>
            `
        )
        .join("")}
      `;

  }


  // ==========================================
  // MESSAGES
  // ==========================================

  async function renderMessages() {

    const messages =
      currentTicket?.messages ||
      [];


    if (!messages.length) {

      modalMessages.innerHTML =
        `
        <div class="support-empty">
          Повідомлень ще немає.
        </div>
        `;

      return;

    }


    const directionId =
      currentTicket
        .ticket
        .direction_id;


    const rendered = [];


    for (
      const message of messages
    ) {

      const mine =
        message.sender_user_id ===
        currentUser.id;


      const internal =
        message.is_internal ===
        true;


      let author;


      if (internal) {

        author =
          "🔒 Внутрішнє повідомлення";

      } else {

        author =
          await getTicketUserNickname(
            message.sender_user_id,
            directionId,
            message._profile
          );

      }


      rendered.push(
        `
        <div
          class="chat-message ${
            mine
              ? "mine"
              : ""
          } ${
            internal
              ? "internal"
              : ""
          }"
        >

          <div class="chat-author">

            ${
              internal
                ? escapeHtml(
                    author
                  )
                : profileLink(
                    message.sender_user_id,
                    author
                  )
            }

          </div>


          <div class="chat-text">
            ${escapeHtml(
              message.message
            )}
          </div>


          <div class="chat-time">
            ${escapeHtml(
              formatDate(
                message.created_at
              )
            )}
          </div>

        </div>
        `
      );

    }


    modalMessages.innerHTML =
      rendered.join("");


    modalMessages.scrollTop =
      modalMessages.scrollHeight;

  }


  // ==========================================
  // SEND REPLY
  // ==========================================

  async function sendReply() {

    if (!currentTicket) {
      return;
    }


    const message =
      replyMessage.value.trim();


    if (!message) {

      showMessage(
        "Напишіть повідомлення.",
        "error"
      );

      return;

    }


    const result =
      await supabase
        .from(
          "support_messages"
        )
        .insert({

          ticket_id:
            currentTicket.ticket.id,

          sender_user_id:
            currentUser.id,

          message,

          is_internal:
            isStaff &&
            internalMessage.checked

        })
        .select("id")
        .single();


    if (result.error) {

      console.error(
        "Send message:",
        result.error
      );

      showMessage(
        "Не вдалося надіслати повідомлення: " +
        result.error.message,
        "error"
      );

      return;

    }


    replyMessage.value =
      "";


    if (internalMessage) {

      internalMessage.checked =
        false;

    }


    await openTicket(
      currentTicket.ticket.id
    );


    await loadMyTickets();


    if (isStaff) {

      await loadStaffTickets();

    }

  }


  // ==========================================
  // REVIEW
  // ==========================================

  async function reviewTicket(
    decision
  ) {

    if (
      !currentTicket ||
      !isStaff
    ) {

      return;

    }


    const pending =
      currentTicket.changes.filter(
        change =>
          change.status ===
          "pending"
      );


    if (!pending.length) {

      showMessage(
        "У цьому зверненні немає змін, які очікують рішення.",
        "info"
      );

      return;

    }


    const comment =
      decisionComment.value.trim();


    if (
      decision === "rejected" &&
      !comment
    ) {

      showMessage(
        "Для відхилення вкажіть причину.",
        "error"
      );

      return;

    }


    approveTicketButton.disabled =
      true;

    rejectTicketButton.disabled =
      true;


    const result =
      await supabase.rpc(
        "review_support_ticket",
        {

          p_ticket_id:
            currentTicket.ticket.id,

          p_decision:
            decision,

          p_review_comment:
            comment || null

        }
      );


    approveTicketButton.disabled =
      false;

    rejectTicketButton.disabled =
      false;


    if (result.error) {

      console.error(
        "review_support_ticket:",
        result.error
      );

      showMessage(
        "Не вдалося обробити звернення: " +
        result.error.message,
        "error"
      );

      return;

    }


    decisionComment.value =
      "";


    showMessage(

      decision === "approved"

        ? "Зміни схвалено та автоматично застосовано."

        : "Зміни відхилено. Дані залишилися без змін.",

      "success"

    );


    await openTicket(
      currentTicket.ticket.id
    );


    await loadMyTickets();


    if (isStaff) {

      await loadStaffTickets();

    }

  }


  // ==========================================
  // EVENTS
  // ==========================================

  if (ticketCategory) {

    ticketCategory.addEventListener(
      "change",
      updateDataChangeVisibility
    );

  }


  if (ticketDirection) {

    ticketDirection.addEventListener(
      "change",
      () => {

        if (
          ticketCategory?.value ===
          "data_change"
        ) {

          dataChangeRows.innerHTML =
            "";

          addChangeRow();

        }

      }
    );

  }


  if (addChangeButton) {

    addChangeButton.addEventListener(
      "click",
      () =>
        addChangeRow()
    );

  }


  if (ticketForm) {

    ticketForm.addEventListener(
      "submit",
      createTicket
    );

  }


  const refreshMyTickets =
    el(
      "refreshMyTickets"
    );


  if (refreshMyTickets) {

    refreshMyTickets.addEventListener(
      "click",
      loadMyTickets
    );

  }


  const refreshStaffTickets =
    el(
      "refreshStaffTickets"
    );


  if (refreshStaffTickets) {

    refreshStaffTickets.addEventListener(
      "click",
      loadStaffTickets
    );

  }


  if (staffSearch) {

    staffSearch.addEventListener(
      "input",
      applyStaffFilters
    );

  }


  if (staffStatusFilter) {

    staffStatusFilter.addEventListener(
      "change",
      applyStaffFilters
    );

  }


  if (staffDirectionFilter) {

    staffDirectionFilter.addEventListener(
      "change",
      applyStaffFilters
    );

  }


  if (closeTicketModal) {

    closeTicketModal.addEventListener(
      "click",
      () => {

        ticketModal.classList.remove(
          "active"
        );

        ticketModal.setAttribute(
          "aria-hidden",
          "true"
        );

        currentTicket =
          null;

      }
    );

  }


  if (ticketModal) {

    ticketModal.addEventListener(
      "click",
      event => {

        if (
          event.target ===
          ticketModal
        ) {

          closeTicketModal.click();

        }

      }
    );

  }


  if (sendReplyButton) {

    sendReplyButton.addEventListener(
      "click",
      sendReply
    );

  }


  if (approveTicketButton) {

    approveTicketButton.addEventListener(
      "click",
      () =>
        reviewTicket(
          "approved"
        )
    );

  }


  if (rejectTicketButton) {

    rejectTicketButton.addEventListener(
      "click",
      () =>
        reviewTicket(
          "rejected"
        )
    );

  }


  if (takeTicketButton) {

    takeTicketButton.addEventListener(
      "click",
      takeTicket
    );

  }


  // ==========================================
  // INIT
  // ==========================================

  if (
    !await loadUser()
  ) {

    return;

  }


  profileCurrentValues =
    await loadProfileCurrentValues();


  await loadDirections();


  await loadCategories();


  await loadDataFields();


  isStaff =
    await checkStaff();


  if (isStaff) {

    staffPanel.hidden =
      false;

    await loadStaffTickets();

  }


  await loadMyTickets();


  updateDataChangeVisibility();


  console.log(
    "UA LEGION SUPPORT: готово"
  );

});
