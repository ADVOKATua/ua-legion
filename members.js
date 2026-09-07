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
  // Converts:
  // array
  // JSON string
  // object
  // simple string
  // into array
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


    // JSON string
    if (typeof value === "string") {

      const trimmed =
        value.trim();

      if (!trimmed) {

        return [];

      }


      // Try JSON
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


      // PostgreSQL style array:
      // {ETS2,WoT}
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

      return Object.values(value)
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
  // GET MEMBER ROLES
  // ======================================

  function getMemberRoles(member) {

    return normalizeArray(
      member.roles
    );

  }


  // ======================================
  // GET MEMBER DIRECTIONS
  // ======================================

  function getMemberDirections(member) {

    return normalizeArray(
      member.directions
    );

  }


  // ======================================
  // GET FILTERED MEMBERS
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
  // RENDER BADGES
  // ======================================

  function renderBadges(
    items,
    className,
    icon,
    emptyText
  ) {

    if (
      !items ||
      items.length === 0
    ) {

      return `

        <span
          class="${className} ${className}-empty"
        >

          ${icon}
          ${escapeHtml(emptyText)}

        </span>

      `;

    }


    return items
      .map(
        item => `

          <span
            class="${className}"
          >

            ${icon}
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
          document.createElement("div");


        card.className =
          "member-card";


        card.innerHTML = `

          <div class="member-avatar">

            👤

          </div>


          <div class="member-info">


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

                ${renderBadges(
                  roles,
                  "member-role",
                  "🛡",
                  "Без ролі"
                )}

              </div>

            </div>


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

                ${renderBadges(
                  directions,
                  "member-direction",
                  "🎯",
                  "Не вказано"
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
