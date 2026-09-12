// ==========================================
// UA LEGION
// MEMBERS SYSTEM
// members.js
// ==========================================

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    // ======================================
    // SUPABASE
    // ======================================

    const supabase =
      window.supabaseClient;


    if (!supabase) {

      console.error(
        "Supabase не підключений"
      );

      return;
    }


    // ======================================
    // ELEMENTS
    // ======================================

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
        "members-message " +
        type;

    }


    // ======================================
    // ESCAPE HTML
    // ======================================

    function escapeHtml(
      value
    ) {

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


    // ======================================
    // ARRAY HELPER
    // ======================================

    function normalizeArray(
      value
    ) {

      if (
        value === null ||
        value === undefined
      ) {

        return [];

      }


      if (
        Array.isArray(value)
      ) {

        return value;

      }


      return [];

    }


    // ======================================
    // AUTH
    // ======================================

    const {
      data: {
        user
      },
      error: userError
    } =
      await supabase.auth.getUser();


    if (
      userError ||
      !user
    ) {

      window.location.href =
        "login.html";

      return;
    }


    // ======================================
    // ACCESS
    // ======================================

    async function checkAccess() {

      const {
        data,
        error
      } =
        await supabase.rpc(
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
            🔒 Доступ до списку учасників доступний тільки учасникам UA LEGION.
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


      allMembers =
        Array.isArray(data)
          ? data
          : [];


      console.log(
        "MEMBERS: RBAC data:",
        allMembers
      );


      renderMembers();

    }


    // ======================================
    // GLOBAL ROLE ICON
    // ======================================

    function getGlobalRoleIcon(
      code
    ) {

      switch (code) {

        case "owner":
          return "👑";

        case "deputy_owner":
          return "🛡️";

        case "general_top_manager":
          return "🏆";

        case "general_hr_manager":
          return "👥";

        case "general_pr_manager":
          return "📢";

        case "general_smm_manager":
          return "📱";

        case "general_event_manager":
          return "🎯";

        case "general_technical_manager":
          return "🔧";

        default:
          return "👤";

      }

    }


    // ======================================
    // DIRECTION ICON
    // ======================================

    function getDirectionIcon(
      direction
    ) {

      const value =
        String(
          direction || ""
        )
          .trim()
          .toLowerCase();


      const icons = {

        ets2:
          "🚛",

        "ets2 / truckersmp":
          "🚛",

        wot:
          "🛡️",

        "world of tanks":
          "🛡️",

        dota2:
          "🎮",

        dota:
          "🎮",

        "dota 2":
          "🎮",

        wow:
          "⚔️",

        "world of warcraft":
          "⚔️"

      };


      return (
        icons[value] ||
        "🎮"
      );

    }


    // ======================================
    // DRIVER CLASS
    // ======================================

    function getDriverClassName(
      driverClass
    ) {

      const names = {

        A:
          "A — «Майстер водій»",

        B:
          "B — «Старший водій»",

        C:
          "C — «Досвідчений водій»",

        D:
          "D — «Водій»",

        E:
          "E — «Стажер»"

      };


      return (
        names[driverClass] ||
        `Клас ${driverClass}`
      );

    }


    // ======================================
    // AVATAR LETTER
    // ======================================

    function getAvatarLetter(
      member
    ) {

      const name =
        String(
          member.name ||
          member.game_nickname ||
          "U"
        ).trim();


      return (
        name.charAt(0)
          .toUpperCase() ||
        "U"
      );

    }


    // ======================================
    // AVATAR
    // ======================================

    function renderAvatar(
      member
    ) {

      const avatarUrl =
        member.avatar_url ||
        "";


      if (avatarUrl) {

        return `
          <img
            src="${escapeHtml(
              avatarUrl
            )}"
            alt="${escapeHtml(
              member.name ||
              "Учасник"
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


    // ======================================
    // GLOBAL ROLES
    // ======================================

    function renderGlobalRoles(
      member
    ) {

      const roles =
        normalizeArray(
          member.global_roles
        );


      if (
        roles.length === 0
      ) {

        return "";

      }


      return roles
        .map(
          role => {

            const icon =
              getGlobalRoleIcon(
                role.code
              );


            return `
              <span class="member-role member-role-global">

                ${icon}

                ${escapeHtml(
                  role.name ||
                  role.code ||
                  "Роль"
                )}

              </span>
            `;

          }
        )
        .join("");

    }


    // ======================================
    // DIRECTIONS
    // ======================================

    function renderDirections(
      member
    ) {

      const directions =
        normalizeArray(
          member.directions
        );


      if (
        directions.length === 0
      ) {

        return `
          <div class="member-empty-info">
            Напрямків немає
          </div>
        `;

      }


      return directions
        .map(
          direction => {

            // ------------------------------
            // DIRECTION DATA
            // ------------------------------

            const icon =
              getDirectionIcon(
                direction.slug ||
                direction.code ||
                direction.name
              );


            const directionName =
              escapeHtml(
                direction.name ||
                direction.slug ||
                "Напрямок"
              );


            const roles =
              normalizeArray(
                direction.roles
              );


            let html = `

              <div class="member-direction-block">

                <div class="member-direction-title">

                  ${icon}

                  ${directionName}

                </div>

            `;


            // ------------------------------
            // ROLES
            // ------------------------------

            if (
              roles.length > 0
            ) {

              html += `

                <div class="member-direction-roles">

              `;


              roles.forEach(
                role => {

                  html += `

                    <span class="member-role">

                      🛡️

                      ${escapeHtml(
                        role.name ||
                        role.code ||
                        "Посада"
                      )}

                    </span>

                  `;

                }
              );


              html += `

                </div>

              `;

            } else {

              html += `

                <div class="member-direction-member">

                  Учасник напрямку

                </div>

              `;

            }


            // ------------------------------
            // ETS2 DRIVER CLASS
            // ------------------------------

            const slug =
              String(
                direction.slug ||
                direction.code ||
                ""
              )
                .trim()
                .toLowerCase();


            if (
              slug === "ets2" &&
              direction.driver_class
            ) {

              const driverClass =
                String(
                  direction.driver_class
                )
                  .trim()
                  .toUpperCase();


              html += `

                <div class="member-driver-class">

                  🏅

                  Клас водія:

                  <strong>

                    ${escapeHtml(
                      getDriverClassName(
                        driverClass
                      )
                    )}

                  </strong>

                </div>

              `;

            }


            html += `

              </div>

            `;


            return html;

          }
        )
        .join("");

    }


    // ======================================
    // SEARCH
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

          // ------------------------------
          // NAME
          // ------------------------------

          const name =
            String(
              member.name ||
              ""
            ).toLowerCase();


          // ------------------------------
          // NICKNAME
          // ------------------------------

          const nickname =
            String(
              member.game_nickname ||
              ""
            ).toLowerCase();


          // ------------------------------
          // GLOBAL ROLES
          // ------------------------------

          const globalRoles =
            normalizeArray(
              member.global_roles
            )
              .map(
                role =>
                  role.name ||
                  role.code ||
                  ""
              )
              .join(" ")
              .toLowerCase();


          // ------------------------------
          // DIRECTIONS
          // ------------------------------

          const directions =
            normalizeArray(
              member.directions
            );


          const directionText =
            directions
              .map(
                direction => {

                  const roleText =
                    normalizeArray(
                      direction.roles
                    )
                      .map(
                        role =>
                          role.name ||
                          role.code ||
                          ""
                      )
                      .join(" ");


                  const directionName =
                    direction.name ||
                    direction.slug ||
                    "";


                  return (
                    directionName +
                    " " +
                    roleText
                  );

                }
              )
              .join(" ")
              .toLowerCase();


          // ------------------------------
          // RESULT
          // ------------------------------

          return (

            name.includes(
              search
            ) ||

            nickname.includes(
              search
            ) ||

            globalRoles.includes(
              search
            ) ||

            directionText.includes(
              search
            )

          );

        }
      );

    }


    // ======================================
    // CABINET LINK
    // ======================================

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
        >

          👤 ВІДКРИТИ КАБІНЕТ

        </a>

      `;

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


      // ==================================
      // COUNT
      // ==================================

      if (membersCount) {

        membersCount.textContent =
          `Учасників: ${members.length}`;

      }


      // ==================================
      // EMPTY
      // ==================================

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


      // ==================================
      // CARDS
      // ==================================

      members.forEach(
        member => {

          const card =
            document.createElement(
              "article"
            );


          card.className =
            "member-card";


          // ==================================
          // GLOBAL ROLES
          // ==================================

          const globalRolesHtml =
            renderGlobalRoles(
              member
            );


          // ==================================
          // DIRECTIONS
          // ==================================

          const directionsHtml =
            renderDirections(
              member
            );


          // ==================================
          // CABINET
          // ==================================

          const cabinetLink =
            renderCabinetLink(
              member
            );


          // ==================================
          // CARD HTML
          // ==================================

          card.innerHTML = `

            <div class="member-avatar">

              ${renderAvatar(
                member
              )}

            </div>


            <div class="member-info">


              <!-- ==========================
                   NAME
              =========================== -->

              <div class="member-main-info">

                <h2>

                  ${escapeHtml(
                    member.name ||
                    "Учасник UA LEGION"
                  )}

                </h2>


                <div class="member-nickname">

                  🎮

                  ${escapeHtml(
                    member.game_nickname ||
                    "Не вказано"
                  )}

                </div>

              </div>


              <!-- ==========================
                   GLOBAL
              =========================== -->

              ${
                globalRolesHtml
                  ? `

                    <div class="member-section">

                      <div class="member-section-title">

                        🌐 GLOBAL

                      </div>


                      <div class="member-badges">

                        ${globalRolesHtml}

                      </div>

                    </div>

                  `
                  : ""
              }


              <!-- ==========================
                   DIRECTIONS
              =========================== -->

              <div class="member-section">

                <div class="member-section-title">

                  🎯 Напрямки

                </div>


                <div class="member-directions">

                  ${directionsHtml}

                </div>

              </div>


              <!-- ==========================
                   CABINET
              =========================== -->

              ${cabinetLink}


            </div>

          `;


          membersList.appendChild(
            card
          );

        }
      );

    }


    // ======================================
    // SEARCH EVENT
    // ======================================

    if (membersSearch) {

      membersSearch.addEventListener(
        "input",
        () => {

          renderMembers();

        }
      );

    }


    // ======================================
    // INITIAL LOAD
    // ======================================

    await loadMembers();

  }
);
