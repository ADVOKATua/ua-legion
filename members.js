// ==========================================
// UA LEGION
// MEMBERS SYSTEM
// members.js
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

  // ======================================
  // SUPABASE
  // ======================================

  const supabase = window.supabaseClient;

  if (!supabase) {

    console.error("Supabase не підключений");

    return;

  }


  // ======================================
  // ELEMENTS
  // ======================================

  const membersList =
    document.getElementById("membersList");

  const membersSearch =
    document.getElementById("membersSearch");

  const membersCount =
    document.getElementById("membersCount");

  const membersMessage =
    document.getElementById("membersMessage");


  // ======================================
  // DATA
  // ======================================

  let allMembers = [];


  // ======================================
  // MESSAGE
  // ======================================

  function showMessage(
    message,
    type = "info"
  ) {

    if (!membersMessage) {

      return;

    }

    membersMessage.textContent =
      message;

    membersMessage.className =
      "members-message " + type;

  }


  // ======================================
  // ESCAPE HTML
  // ======================================

  function escapeHtml(value) {

    if (
      value === null ||
      value === undefined
    ) {

      return "";

    }

    const div =
      document.createElement("div");

    div.textContent =
      String(value);

    return div.innerHTML;

  }


  // ======================================
  // NORMALIZE ARRAY
  // ======================================

  function normalizeArray(value) {

    if (
      value === null ||
      value === undefined
    ) {

      return [];

    }


    // Already array
    if (Array.isArray(value)) {

      return value
        .filter(item =>
          item !== null &&
          item !== undefined &&
          String(item).trim() !== ""
        )
        .map(item =>
          String(item).trim()
        );

    }


    // String
    if (typeof value === "string") {

      const trimmed =
        value.trim();

      if (!trimmed) {

        return [];

      }


      // JSON array
      try {

        const parsed =
          JSON.parse(trimmed);

        if (Array.isArray(parsed)) {

          return parsed
            .filter(item =>
              item !== null &&
              item !== undefined &&
              String(item).trim() !== ""
            )
            .map(item =>
              String(item).trim()
            );

        }

      } catch (error) {

        // Not JSON

      }


      // PostgreSQL array
      if (
        trimmed.startsWith("{") &&
        trimmed.endsWith("}")
      ) {

        return trimmed
          .slice(1, -1)
          .split(",")
          .map(item =>
            item
              .trim()
              .replace(/^"|"$/g, "")
          )
          .filter(Boolean);

      }


      // Comma separated
      if (trimmed.includes(",")) {

        return trimmed
          .split(",")
          .map(item =>
            item.trim()
          )
          .filter(Boolean);

      }


      return [trimmed];

    }


    // Object
    if (typeof value === "object") {

      return Object
        .values(value)
        .filter(item =>
          item !== null &&
          item !== undefined &&
          String(item).trim() !== ""
        )
        .map(item =>
          String(item).trim()
        );

    }


    return [
      String(value)
    ];

  }


  // ======================================
  // AUTH CHECK
  // ======================================

  const {
    data: {
      user
    },
    error: userError
  } = await supabase
    .auth
    .getUser();


  if (
    userError ||
    !user
  ) {

    window.location.href =
      "login.html";

    return;

  }


  // ======================================
  // CHECK ACCESS
  // ======================================

  async function checkAccess() {

    const {
      data,
      error
    } = await supabase
      .rpc(
        "can_view_ua_legion_members"
      );


    if (error) {

      console.error(
        "Помилка перевірки доступу:",
        error
      );

      return false;

    }


    return data === true;

  }


  const hasAccess =
    await checkAccess();


  // ======================================
  // NO ACCESS
  // ======================================

  if (!hasAccess) {

    if (membersList) {

      membersList.innerHTML = `

        <div class="members-empty">

          🔒 Доступ до списку учасників
          доступний тільки учасникам
          UA LEGION.

        </div>

      `;

    }

    return;

  }


  // ======================================
  // LOAD MEMBERS
  // ======================================

  async function loadMembers() {

    if (!membersList) {

      return;

    }


    membersList.innerHTML = `

      <div class="members-loading">

        ⏳ Завантаження учасників...

      </div>

    `;


    const {
      data,
      error
    } = await supabase
      .rpc(
        "get_ua_legion_members"
      );


    if (error) {

      console.error(
        "Помилка завантаження учасників:",
        error
      );


      showMessage(
        "❌ Не вдалося завантажити список учасників.",
        "error"
      );


      membersList.innerHTML = "";

      return;

    }


    allMembers =
      Array.isArray(data)
        ? data
        : [];


    renderMembers();

  }


  // ======================================
  // MEMBER ROLES
  // ======================================

  function getMemberRoles(member) {

    return normalizeArray(
      member.roles
    );

  }


  // ======================================
  // MEMBER DIRECTIONS
  // ======================================

  function getMemberDirections(member) {

    return normalizeArray(
      member.directions
    );

  }


  // ======================================
  // DIRECTION ICON
  // ======================================

  function getDirectionIcon(direction) {

    const value =
      String(direction || "")
        .trim()
        .toLowerCase();


    const icons = {

      "ets2": "🚛",

      "euro truck simulator 2": "🚛",

      "ats": "🇺🇸🚛",

      "american truck simulator": "🇺🇸🚛",

      "wot": "🛡",

      "world of tanks": "🛡",

      "wow": "⚔️",

      "world of warcraft": "⚔️",

      "dota": "🎯",

      "dota 2": "🎯",

      "cs2": "🔫",

      "counter-strike 2": "🔫",

      "minecraft": "⛏️",

      "fortnite": "🏗️",

      "stream": "📺",

      "streaming": "📺",

      "youtube": "▶️",

      "tiktok": "🎵"

    };


    return (
      icons[value] ||
      "🎮"
    );

  }


  // ======================================
  // AVATAR LETTER
  // ======================================

  function getAvatarLetter(member) {

    const name =
      String(
        member.name ||
        member.game_nickname ||
        "U"
      )
        .trim();


    return (
      name.charAt(0)
        .toUpperCase() ||
      "U"
    );

  }


  // ======================================
  // GET AVATAR
  // ======================================

  function renderAvatar(member) {

    const avatarUrl =
      member.avatar_url ||
      member.avatar ||
      "";


    if (avatarUrl) {

      return `

        <img
          src="${escapeHtml(avatarUrl)}"
          alt="${escapeHtml(
            member.name ||
            "Учасник"
          )}"
          class="member-avatar-image"
        >

      `;

    }


    return `

      <span
        class="member-avatar-letter"
      >

        ${escapeHtml(
          getAvatarLetter(member)
        )}

      </span>

    `;

  }


  // ======================================
  // FILTER MEMBERS
  // ======================================

  function getFilteredMembers() {

    const search =
      (
        membersSearch?.value ||
        ""
      )
        .trim()
        .toLowerCase();


    if (!search) {

      return allMembers;

    }


    return allMembers.filter(
      member => {

        const name =
          String(
            member.name ||
            ""
          )
            .toLowerCase();


        const nickname =
          String(
            member.game_nickname ||
            ""
          )
            .toLowerCase();


        const roles =
          getMemberRoles(member)
            .join(" ")
            .toLowerCase();


        const directions =
          getMemberDirections(member)
            .join(" ")
            .toLowerCase();


        return (

          name.includes(search) ||

          nickname.includes(search) ||

          roles.includes(search) ||

          directions.includes(search)

        );

      }
    );

  }


  // ======================================
  // ROLE BADGES
  // ======================================

  function renderRoleBadges(items) {

    if (
      !items ||
      items.length === 0
    ) {

      return `

        <span
          class="member-role member-role-empty"
        >

          🛡 Без ролі

        </span>

      `;

    }


    return items
      .map(
        item => `

          <span
            class="member-role"
          >

            🛡

            ${escapeHtml(item)}

          </span>

        `
      )
      .join("");

  }


  // ======================================
  // DIRECTION BADGES
  // ======================================

  function renderDirectionBadges(items) {

    if (
      !items ||
      items.length === 0
    ) {

      return `

        <span
          class="member-direction member-direction-empty"
        >

          🎮 Не вказано

        </span>

      `;

    }


    return items
      .map(
        item => `

          <span
            class="member-direction"
          >

            ${getDirectionIcon(item)}

            ${escapeHtml(item)}

          </span>

        `
      )
      .join("");

  }


  // ======================================
  // RENDER MEMBERS
  // ======================================

  function renderMembers() {

    if (!membersList) {

      return;

    }


    const members =
      getFilteredMembers();


    membersList.innerHTML =
      "";


    // ====================================
    // COUNT
    // ====================================

    if (membersCount) {

      membersCount.textContent =
        `Учасників: ${members.length}`;

    }


    // ====================================
    // EMPTY
    // ====================================

    if (
      members.length === 0
    ) {

      membersList.innerHTML = `

        <div class="members-empty">

          👤 Учасників не знайдено.

        </div>

      `;

      return;

    }


    // ====================================
    // CARDS
    // ====================================

    members.forEach(
      member => {

        const roles =
          getMemberRoles(member);


        const directions =
          getMemberDirections(member);


        const card =
          document.createElement("article");


        card.className =
          "member-card";


        card.innerHTML = `

          <!-- AVATAR -->

          <div
            class="member-avatar"
          >

            ${renderAvatar(member)}

          </div>


          <!-- INFO -->

          <div
            class="member-info"
          >


            <div
              class="member-main-info"
            >

              <h2>

                ${escapeHtml(
                  member.name ||
                  "Учасник UA LEGION"
                )}

              </h2>


              <div
                class="member-nickname"
              >

                🎮

                ${escapeHtml(
                  member.game_nickname ||
                  "Не вказано"
                )}

              </div>

            </div>


            <!-- ROLES -->

            <div
              class="member-section"
            >

              <div
                class="member-section-title"
              >

                🛡 Ролі

              </div>


              <div
                class="member-badges"
              >

                ${renderRoleBadges(
                  roles
                )}

              </div>

            </div>


            <!-- DIRECTIONS -->

            <div
              class="member-section"
            >

              <div
                class="member-section-title"
              >

                🎯 Напрямки

              </div>


              <div
                class="member-badges"
              >

                ${renderDirectionBadges(
                  directions
                )}

              </div>

            </div>


          </div>

        `;


        membersList.appendChild(
          card
        );

      }
    );

  }


  // ======================================
  // SEARCH
  // ======================================

  membersSearch?.addEventListener(
    "input",
    () => {

      renderMembers();

    }
  );


  // ======================================
  // START
  // ======================================

  await loadMembers();

});
