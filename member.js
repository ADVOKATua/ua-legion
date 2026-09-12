// ==========================================
// UA LEGION
// MEMBERS SYSTEM
// members.js
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

  // ==========================================
  // SUPABASE
  // ==========================================

  const supabase = window.supabaseClient;

  if (!supabase) {

    console.error(
      "Supabase не підключений"
    );

    return;
  }


  // ==========================================
  // HTML ELEMENTS
  // ==========================================

  const membersList =
    document.getElementById(
      "membersList"
    );

  const membersSearch =
    document.getElementById(
      "membersSearch"
    );

  const membersCount =
    document.getElementById(
      "membersCount"
    );

  const membersMessage =
    document.getElementById(
      "membersMessage"
    );


  let allMembers = [];


  // ==========================================
  // MESSAGE
  // ==========================================

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


  // ==========================================
  // HTML ESCAPE
  // ==========================================

  function escapeHtml(value) {

    if (
      value === null ||
      value === undefined
    ) {

      return "";
    }

    const div =
      document.createElement(
        "div"
      );

    div.textContent =
      String(value);

    return div.innerHTML;
  }


  // ==========================================
  // AUTHENTICATED USER
  // ==========================================

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();


  if (
    userError ||
    !user
  ) {

    window.location.href =
      "login.html";

    return;
  }


  // ==========================================
  // ACCESS CHECK
  // ==========================================

  async function checkAccess() {

    const {
      data,
      error
    } = await supabase.rpc(
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


  if (!hasAccess) {

    if (membersList) {

      membersList.innerHTML = `

        <div class="members-empty">

          🔒 Доступ до списку учасників
          доступний тільки учасникам UA LEGION.

        </div>

      `;
    }

    return;
  }


  // ==========================================
  // DRIVER CLASS
  // ==========================================

  function getDriverClassName(
    driverClass
  ) {

    const classes = {

      E: "Клас E — «Стажер»",

      D: "Клас D — «Водій»",

      C: "Клас C — «Досвідчений водій»",

      B: "Клас B — «Старший водій»",

      A: "Клас A — «Майстер водій»"

    };


    return (
      classes[driverClass] ||
      `Клас ${driverClass || "—"}`
    );
  }


  // ==========================================
  // DIRECTION ICON
  // ==========================================

  function getDirectionIcon(
    direction
  ) {

    if (
      direction &&
      direction.icon
    ) {

      return direction.icon;
    }


    const code =
      String(
        direction?.code ||
        direction?.slug ||
        direction?.name ||
        ""
      )
        .trim()
        .toLowerCase();


    const icons = {

      ets2: "🚛",

      wot: "🛡",

      "world of tanks": "🛡",

      dota: "🎯",

      "dota 2": "🎯",

      wow: "⚔️",

      "world of warcraft": "⚔️",

      ats: "🇺🇸🚛",

      cs2: "🔫",

      minecraft: "⛏️",

      fortnite: "🏗️",

      stream: "📺",

      streaming: "📺",

      youtube: "▶️",

      tiktok: "🎵"

    };


    return (
      icons[code] ||
      "🎮"
    );
  }


  // ==========================================
  // AVATAR LETTER
  // ==========================================

  function getAvatarLetter(
    member
  ) {

    const name =
      String(
        member.display_name ||
        member.game_nickname ||
        member.name ||
        "U"
      ).trim();


    return (
      name
        .charAt(0)
        .toUpperCase() ||
      "U"
    );
  }


  // ==========================================
  // AVATAR
  // ==========================================

  function renderAvatar(
    member
  ) {

    const avatarUrl =
      member.avatar_url ||
      member.avatar ||
      "";


    if (avatarUrl) {

      return `

        <img
          src="${escapeHtml(
            avatarUrl
          )}"
          alt="${escapeHtml(
            member.name ||
            "Учасник UA LEGION"
          )}"
          class="member-avatar-image"
        >

      `;
    }


    return `

      <span class="member-avatar-letter">

        ${escapeHtml(
          getAvatarLetter(
            member
          )
        )}

      </span>

    `;
  }


  // ==========================================
  // GLOBAL ROLES
  // ==========================================

  function getGlobalRoles(
    member
  ) {

    if (
      !member ||
      !Array.isArray(
        member.global_roles
      )
    ) {

      return [];
    }


    return member.global_roles
      .filter(role =>
        role &&
        typeof role === "object"
      );
  }


  // ==========================================
  // GLOBAL ROLES HTML
  // ==========================================

  function renderGlobalRoles(
    member
  ) {

    const roles =
      getGlobalRoles(
        member
      );


    if (!roles.length) {

      return `

        <span
          class="member-role member-role-empty"
        >

          🛡 Без ролі

        </span>

      `;
    }


    return roles
      .map(role => {

        const roleName =
          role.name ||
          role.code ||
          "Роль";


        return `

          <span class="member-role">

            👑
            ${escapeHtml(
              roleName
            )}

          </span>

        `;

      })
      .join("");
  }


  // ==========================================
  // DIRECTIONS
  // ==========================================

  function getDirections(
    member
  ) {

    if (
      !member ||
      !Array.isArray(
        member.directions
      )
    ) {

      return [];
    }


    return member.directions
      .filter(direction =>
        direction &&
        typeof direction === "object"
      );
  }


  // ==========================================
  // DIRECTION ROLES
  // ==========================================

  function renderDirectionRoles(
    direction
  ) {

    const roles =
      Array.isArray(
        direction.roles
      )
        ? direction.roles
        : [];


    if (!roles.length) {

      return `

        <div
          class="member-direction-roles"
        >

          <span
            class="member-direction-role-empty"
          >

            Посади: немає

          </span>

        </div>

      `;
    }


    return `

      <div
        class="member-direction-roles"
      >

        <span
          class="member-direction-label"
        >

          Посади:

        </span>


        <div
          class="member-direction-role-list"
        >

          ${roles
            .map(role => {

              const roleName =
                role.name ||
                role.code ||
                "Посада";


              return `

                <span
                  class="member-direction-role"
                >

                  ${escapeHtml(
                    roleName
                  )}

                </span>

              `;

            })
            .join("")}

        </div>

      </div>

    `;
  }


  // ==========================================
  // DRIVER CLASS
  // ==========================================

  function renderDriverClass(
    direction
  ) {

    if (!direction) {
      return "";
    }


    const code =
      String(
        direction.code ||
        direction.slug ||
        ""
      )
        .trim()
        .toLowerCase();


    // Driver class exists only for ETS2

    if (
      code !== "ets2"
    ) {

      return "";
    }


    if (
      !direction.driver_class
    ) {

      return "";
    }


    return `

      <div
        class="member-driver-class"
      >

        🚛
        ${escapeHtml(
          getDriverClassName(
            direction.driver_class
          )
        )}

      </div>

    `;
  }


  // ==========================================
  // SINGLE DIRECTION
  // ==========================================

  function renderDirection(
    direction
  ) {

    const directionName =
      direction.name ||
      direction.code ||
      direction.slug ||
      "Напрямок";


    const icon =
      getDirectionIcon(
        direction
      );


    return `

      <div
        class="member-direction-card"
      >

        <div
          class="member-direction-title"
        >

          ${escapeHtml(
            icon
          )}

          ${escapeHtml(
            directionName
          )}

        </div>


        ${renderDirectionRoles(
          direction
        )}


        ${renderDriverClass(
          direction
        )}

      </div>

    `;
  }


  // ==========================================
  // ALL DIRECTIONS
  // ==========================================

  function renderDirections(
    member
  ) {

    const directions =
      getDirections(
        member
      );


    if (!directions.length) {

      return `

        <span
          class="
            member-direction
            member-direction-empty
          "
        >

          🎮 Не вказано

        </span>

      `;
    }


    return directions
      .map(direction =>
        renderDirection(
          direction
        )
      )
      .join("");
  }


  // ==========================================
  // SEARCH TEXT
  // ==========================================

  function getSearchText(
    member
  ) {

    const parts = [];


    // Name

    parts.push(
      member.name || ""
    );


    // Display name

    parts.push(
      member.display_name || ""
    );


    // Game nickname

    parts.push(
      member.game_nickname || ""
    );


    // Global roles

    getGlobalRoles(
      member
    )
      .forEach(role => {

        parts.push(
          role.name || "",
          role.code || ""
        );

      });


    // Directions

    getDirections(
      member
    )
      .forEach(direction => {

        parts.push(
          direction.name || "",
          direction.code || "",
          direction.slug || "",
          direction.driver_class || ""
        );


        // Direction roles

        const roles =
          Array.isArray(
            direction.roles
          )
            ? direction.roles
            : [];


        roles.forEach(role => {

          parts.push(
            role.name || "",
            role.code || ""
          );

        });

      });


    return parts
      .join(" ")
      .toLowerCase();
  }


  // ==========================================
  // FILTER
  // ==========================================

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
      member =>
        getSearchText(
          member
        ).includes(
          search
        )
    );
  }


  // ==========================================
  // CABINET LINK
  // ==========================================

  function renderCabinetLink(
    member
  ) {

    if (
      !member.user_id
    ) {

      return "";
    }


    return `

      <a
        href="member.html?user_id=${encodeURIComponent(
          member.user_id
        )}"
        class="member-cabinet-link"
        style="
          display:inline-flex;
          margin-top:15px;
          padding:10px 15px;
          border-radius:9px;
          background:#ffd34d;
          color:#111;
          text-decoration:none;
          font-weight:700;
        "
      >

        👤 ВІДКРИТИ КАБІНЕТ

      </a>

    `;
  }


  // ==========================================
  // RENDER MEMBERS
  // ==========================================

  function renderMembers() {

    if (!membersList) {
      return;
    }


    const members =
      getFilteredMembers();


    membersList.innerHTML =
      "";


    // Count

    if (membersCount) {

      membersCount.textContent =
        `Учасників: ${members.length}`;
    }


    // No members

    if (!members.length) {

      membersList.innerHTML = `

        <div class="members-empty">

          👤 Учасників не знайдено.

        </div>

      `;

      return;
    }


    // Render cards

    members.forEach(
      member => {

        const card =
          document.createElement(
            "article"
          );


        card.className =
          "member-card";


        card.innerHTML = `

          <!-- ==================================
               AVATAR
          ================================== -->

          <div
            class="member-avatar"
          >

            ${renderAvatar(
              member
            )}

          </div>


          <!-- ==================================
               MEMBER INFO
          ================================== -->

          <div
            class="member-info"
          >


            <!-- ==================================
                 NAME
            ================================== -->

            <div
              class="member-main-info"
            >

              <h2>

                ${escapeHtml(
                  member.name ||
                  member.display_name ||
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


            <!-- ==================================
                 GLOBAL ROLES
            ================================== -->

            <div
              class="member-section"
            >

              <div
                class="member-section-title"
              >

                🌐 РОЛІ

              </div>


              <div
                class="member-badges"
              >

                ${renderGlobalRoles(
                  member
                )}

              </div>

            </div>


            <!-- ==================================
                 DIRECTIONS
            ================================== -->

            <div
              class="member-section"
            >

              <div
                class="member-section-title"
              >

                🎯 НАПРЯМКИ

              </div>


              <div
                class="
                  member-badges
                  member-directions-list
                "
              >

                ${renderDirections(
                  member
                )}

              </div>

            </div>


            <!-- ==================================
                 CABINET
            ================================== -->

            ${renderCabinetLink(
              member
            )}

          </div>

        `;


        membersList.appendChild(
          card
        );

      }
    );
  }


  // ==========================================
  // LOAD MEMBERS
  // ==========================================

  async function loadMembers() {

    if (!membersList) {
      return;
    }


    membersList.innerHTML = `

      <div
        class="members-loading"
      >

        ⏳ Завантаження учасників...

      </div>

    `;


    const {
      data,
      error
    } =
      await supabase.rpc(
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


      membersList.innerHTML =
        "";

      return;
    }


    // Debug

    console.log(
      "UA LEGION MEMBERS:",
      data
    );


    allMembers =
      Array.isArray(data)
        ? data
        : [];


    renderMembers();
  }


  // ==========================================
  // SEARCH
  // ==========================================

  if (membersSearch) {

    membersSearch.addEventListener(
      "input",
      () => {

        renderMembers();

      }
    );
  }


  // ==========================================
  // START
  // ==========================================

  await loadMembers();

});
