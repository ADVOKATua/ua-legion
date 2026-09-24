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


  if (!membersList) {
    console.error("membersList не знайдений");
    return;
  }


  // ======================================
  // DATA
  // ======================================

  let allMembers = [];

  let filters = {
    direction: "",
    role: "",
    driverClass: "",
    sort: "name",
    order: "asc"
  };


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
  // VALUE
  // ======================================

  function cleanValue(value) {

    if (
      value === null ||
      value === undefined
    ) {
      return "";
    }

    return String(value).trim();

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


    if (Array.isArray(value)) {

      return value.filter(
        item =>
          item !== null &&
          item !== undefined
      );

    }


    if (typeof value === "string") {

      const trimmed =
        value.trim();

      if (!trimmed) {
        return [];
      }


      try {

        const parsed =
          JSON.parse(trimmed);

        if (Array.isArray(parsed)) {
          return parsed;
        }

      } catch (error) {
        // not JSON
      }


      return [
        trimmed
      ];

    }


    return [
      value
    ];

  }


  // ======================================
  // DIRECTION ICON
  // ======================================

  function getDirectionIcon(
    direction
  ) {

    const value =
      cleanValue(
        direction
      )
        .toLowerCase();


    const icons = {

      ets2: "🚛",

      "euro truck simulator 2":
        "🚛",

      wot: "🛡",

      "world of tanks":
        "🛡",

      dota2: "🎯",

      "dota 2":
        "🎯",

      wow: "⚔️",

      "world of warcraft":
        "⚔️"

    };


    return (
      icons[value] ||
      "🎮"
    );

  }


  // ======================================
  // DIRECTION LABEL
  // ======================================

  function getDirectionLabel(
    direction
  ) {

    if (!direction) {
      return "Напрямок";
    }

    return (
      direction.name ||
      direction.code ||
      direction.slug ||
      "Напрямок"
    );

  }


  // ======================================
  // MEMBER DIRECTIONS
  // ======================================

  function getMemberDirections(
    member
  ) {

    return normalizeArray(
      member.directions
    );

  }


  // ======================================
  // MEMBER GLOBAL ROLES
  // ======================================

  function getGlobalRoles(
    member
  ) {

    return normalizeArray(
      member.global_roles
    );

  }


  // ======================================
  // ALL DIRECTION ROLES
  // ======================================

  function getDirectionRoles(
    member
  ) {

    const roles = [];

    getMemberDirections(member)
      .forEach(direction => {

        normalizeArray(
          direction.roles
        )
          .forEach(role => {

            roles.push({
              ...role,
              direction:
                direction
            });

          });

      });

    return roles;

  }


  // ======================================
  // ALL ROLES
  // ======================================

  function getAllRoles(
    member
  ) {

    return [
      ...getGlobalRoles(member),
      ...getDirectionRoles(member)
    ];

  }


  // ======================================
  // DIRECTION DATA
  // ======================================

  function getDirectionData(
    direction
  ) {

    if (
      !direction ||
      typeof direction !== "object"
    ) {
      return {};
    }

    return (
      direction.direction_data ||
      {}
    );

  }


  // ======================================
  // ALL SEARCHABLE TEXT
  // ======================================

  function getSearchText(
    member
  ) {

    const values = [];


    // ====================================
    // BASIC PROFILE
    // ====================================

    values.push(
      member.name,
      member.display_name,
      member.game_nickname,
      member.discord_username
    );


    // ====================================
    // GLOBAL ROLES
    // ====================================

    getGlobalRoles(member)
      .forEach(role => {

        values.push(
          role.name,
          role.code,
          role.level
        );

      });


    // ====================================
    // DIRECTIONS
    // ====================================

    getMemberDirections(member)
      .forEach(direction => {

        values.push(
          direction.name,
          direction.code,
          direction.slug,
          direction.driver_class
        );


        // ==================================
        // DIRECTION ROLES
        // ==================================

        normalizeArray(
          direction.roles
        )
          .forEach(role => {

            values.push(
              role.name,
              role.code,
              role.level
            );

          });


        // ==================================
        // DIRECTION DATA
        // ==================================

        const data =
          getDirectionData(
            direction
          );


        Object.values(data)
          .forEach(value => {

            if (
              value !== null &&
              value !== undefined
            ) {

              values.push(
                String(value)
              );

            }

          });

      });


    return values
      .filter(
        value =>
          value !== null &&
          value !== undefined
      )
      .map(
        value =>
          String(value)
            .toLowerCase()
      )
      .join(" ");

  }


  // ======================================
  // SEARCH
  // ======================================

  function matchesSearch(
    member,
    search
  ) {

    if (!search) {
      return true;
    }

    return getSearchText(member)
      .includes(search);

  }


  // ======================================
  // FILTER: DIRECTION
  // ======================================

  function matchesDirection(
    member
  ) {

    if (!filters.direction) {
      return true;
    }

    return getMemberDirections(member)
      .some(direction => {

        const value =
          String(
            direction.slug ||
            direction.code ||
            direction.name ||
            ""
          )
            .toLowerCase();

        return (
          value ===
          filters.direction
        );

      });

  }


  // ======================================
  // FILTER: ROLE
  // ======================================

  function matchesRole(
    member
  ) {

    if (!filters.role) {
      return true;
    }

    return getAllRoles(member)
      .some(role => {

        const value =
          String(
            role.code ||
            role.name ||
            ""
          )
            .toLowerCase();

        return (
          value ===
          filters.role
        );

      });

  }


  // ======================================
  // FILTER: DRIVER CLASS
  // ======================================

  function matchesDriverClass(
    member
  ) {

    if (!filters.driverClass) {
      return true;
    }

    return getMemberDirections(member)
      .some(direction => {

        return (
          String(
            direction.driver_class ||
            ""
          )
            .toUpperCase() ===
          filters.driverClass
        );

      });

  }


  // ======================================
  // FILTER MEMBERS
  // ======================================

  function getFilteredMembers() {

    const search =
      cleanValue(
        membersSearch?.value
      )
        .toLowerCase();


    return allMembers.filter(
      member => {

        return (

          matchesSearch(
            member,
            search
          )

          &&

          matchesDirection(
            member
          )

          &&

          matchesRole(
            member
          )

          &&

          matchesDriverClass(
            member
          )

        );

      }
    );

  }


  // ======================================
  // SORT VALUE
  // ======================================

  function getSortValue(
    member
  ) {

    switch (
      filters.sort
    ) {

      case "nickname":

        return cleanValue(
          member.game_nickname ||
          member.name
        )
          .toLowerCase();


      case "direction":

        return getMemberDirections(
          member
        )
          .map(
            direction =>
              getDirectionLabel(
                direction
              )
          )
          .join(" ")
          .toLowerCase();


      case "role":

        return getAllRoles(
          member
        )
          .map(
            role =>
              role.name ||
              role.code ||
              ""
          )
          .join(" ")
          .toLowerCase();


      case "driver_class":

        return getMemberDirections(
          member
        )
          .map(
            direction =>
              direction.driver_class ||
              ""
          )
          .join(" ")
          .toUpperCase();


      case "name":

      default:

        return cleanValue(
          member.name ||
          member.display_name ||
          member.game_nickname
        )
          .toLowerCase();

    }

  }


  // ======================================
  // SORT MEMBERS
  // ======================================

  function sortMembers(
    members
  ) {

    const sorted =
      [...members];


    sorted.sort(
      (a, b) => {

        const valueA =
          getSortValue(a);

        const valueB =
          getSortValue(b);


        const result =
          valueA.localeCompare(
            valueB,
            "uk",
            {
              numeric: true,
              sensitivity: "base"
            }
          );


        return filters.order === "desc"
          ? -result
          : result;

      }
    );


    return sorted;

  }


  // ======================================
  // AVATAR LETTER
  // ======================================

  function getAvatarLetter(
    member
  ) {

    const name =
      cleanValue(
        member.name ||
        member.game_nickname ||
        "U"
      );


    return (
      name
        .charAt(0)
        .toUpperCase() ||
      "U"
    );

  }


  // ======================================
  // AVATAR URL
  // ======================================

  function getAvatarUrl(
    member
  ) {

    const value =
      cleanValue(
        member.avatar_url ||
        member.avatar
      );


    if (!value) {
      return "";
    }


    /*
     * Дозволяємо нормальні HTTP/HTTPS
     * адреси зображень.
     *
     * Якщо значення не є коректним URL,
     * повертаємо порожній рядок,
     * щоб не ламати картку учасника.
     */

    try {

      const url =
        new URL(
          value,
          window.location.origin
        );


      if (
        url.protocol !== "http:" &&
        url.protocol !== "https:"
      ) {

        return "";

      }


      return url.href;

    } catch (error) {

      return "";

    }

  }


  // ======================================
  // RENDER AVATAR
  // ======================================

  function renderAvatar(
    member
  ) {

    const avatarUrl =
      getAvatarUrl(
        member
      );


    if (avatarUrl) {

      return `

        <img
          src="${escapeHtml(avatarUrl)}"
          alt="${escapeHtml(
            member.name ||
            "Учасник"
          )}"
          class="member-avatar-image"
          loading="lazy"
          onerror="
            this.style.display='none';
            this.parentElement
              .querySelector('.member-avatar-letter')
              ?.removeAttribute('hidden');
          "
        >

        <span
          class="member-avatar-letter"
          hidden
        >

          ${escapeHtml(
            getAvatarLetter(member)
          )}

        </span>

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
  // ROLE BADGES
  // ======================================

  function renderGlobalRoles(
    member
  ) {

    const roles =
      getGlobalRoles(member);


    if (!roles.length) {

      return `
        <span class="member-role member-role-empty">
          🛡 Без глобальної ролі
        </span>
      `;

    }


    return roles
      .map(role => `

        <span class="member-role">

          🛡

          ${escapeHtml(
            role.name ||
            role.code ||
            "Роль"
          )}

        </span>

      `)
      .join("");

  }


  // ======================================
  // DIRECTION ROLE BADGES
  // ======================================

  function renderDirectionRoles(
    direction
  ) {

    const roles =
      normalizeArray(
        direction.roles
      );


    if (!roles.length) {

      return `
        <span class="direction-role-empty">
          Без посади
        </span>
      `;

    }


    return roles
      .map(role => `

        <span class="direction-role">

          🛡

          ${escapeHtml(
            role.name ||
            role.code ||
            "Посада"
          )}

        </span>

      `)
      .join("");

  }


  // ======================================
  // DIRECTION DATA LABELS
  // ======================================

  function getDataFields(
    direction
  ) {

    const code =
      String(
        direction.code ||
        direction.slug ||
        ""
      )
        .toLowerCase();


    const data =
      getDirectionData(
        direction
      );


    const fields = [];


    // ====================================
    // ETS2
    // ====================================

    if (code === "ets2") {

      if (data.truckersmp_nick) {

        fields.push([
          "🚛",
          "TruckersMP",
          data.truckersmp_nick
        ]);

      }

      if (data.truckersmp_id) {

        fields.push([
          "🆔",
          "TruckersMP ID",
          data.truckersmp_id
        ]);

      }

      if (
        data.truckershub_username
      ) {

        fields.push([
          "📊",
          "TruckersHub",
          data.truckershub_username
        ]);

      }

      if (data.truckershub_id) {

        fields.push([
          "🆔",
          "TruckersHub ID",
          data.truckershub_id
        ]);

      }

    }


    // ====================================
    // WORLD OF TANKS
    // ====================================

    else if (code === "wot") {

      if (data.wot_nickname) {

        fields.push([
          "🛡",
          "Ігровий нік",
          data.wot_nickname
        ]);

      }

      if (data.wargaming_id) {

        fields.push([
          "🆔",
          "Wargaming ID",
          data.wargaming_id
        ]);

      }

      if (data.wot_region) {

        fields.push([
          "🌍",
          "Регіон",
          data.wot_region
        ]);

      }

    }


    // ====================================
    // DOTA 2
    // ====================================

    else if (code === "dota2") {

      if (data.dota_nickname) {

        fields.push([
          "🎯",
          "Нік",
          data.dota_nickname
        ]);

      }

      if (data.dota_friend_id) {

        fields.push([
          "🆔",
          "Friend ID",
          data.dota_friend_id
        ]);

      }

      if (data.dota_rank) {

        fields.push([
          "🏆",
          "Ранг",
          data.dota_rank
        ]);

      }

    }


    // ====================================
    // WORLD OF WARCRAFT
    // ====================================

    else if (code === "wow") {

      if (data.battletag) {

        fields.push([
          "⚔️",
          "BattleTag",
          data.battletag
        ]);

      }

      if (data.wow_character) {

        fields.push([
          "👤",
          "Персонаж",
          data.wow_character
        ]);

      }

      if (data.wow_realm) {

        fields.push([
          "🌍",
          "Realm",
          data.wow_realm
        ]);

      }

      if (data.wow_faction) {

        fields.push([
          "🏳️",
          "Фракція",
          data.wow_faction
        ]);

      }

      if (data.wow_class) {

        fields.push([
          "⚔️",
          "Клас",
          data.wow_class
        ]);

      }

    }


    return fields;

  }


  // ======================================
  // RENDER DIRECTION DATA
  // ======================================

  function renderDirectionData(
    direction
  ) {

    const fields =
      getDataFields(
        direction
      );


    if (!fields.length) {

      return `
        <div class="member-direction-data-empty">
          Дані напрямку не вказані
        </div>
      `;

    }


    return `

      <div class="member-direction-data">

        ${fields
          .map(field => `

            <div
              class="member-data-row"
            >

              <span
                class="member-data-label"
              >

                ${field[0]}
                ${escapeHtml(field[1])}

              </span>

              <span
                class="member-data-value"
              >

                ${escapeHtml(field[2])}

              </span>

            </div>

          `)
          .join("")}

      </div>

    `;

  }


  // ======================================
  // RENDER DIRECTIONS
  // ======================================

  function renderDirections(
    member
  ) {

    const directions =
      getMemberDirections(
        member
      );


    if (!directions.length) {

      return `
        <div class="member-direction-empty">
          🎮 Напрямки не вказані
        </div>
      `;

    }


    return directions
      .map(direction => {

        const label =
          getDirectionLabel(
            direction
          );


        const icon =
          getDirectionIcon(
            direction.slug ||
            direction.code ||
            direction.name
          );


        const driverClass =
          cleanValue(
            direction.driver_class
          );


        return `

          <div
            class="member-direction-card"
          >

            <div
              class="member-direction-header"
            >

              <div>

                <div
                  class="member-direction-title"
                >

                  ${icon}

                  ${escapeHtml(
                    label
                  )}

                </div>

                <div
                  class="member-direction-status"
                >

                  ${
                    direction.status === "active"
                      ? "🟢 Активний"
                      : escapeHtml(
                          direction.status ||
                          ""
                        )
                  }

                </div>

              </div>


              ${
                driverClass
                  ? `
                    <span
                      class="member-driver-class"
                    >
                      Клас ${escapeHtml(
                        driverClass
                      )}
                    </span>
                  `
                  : ""
              }

            </div>


            <div
              class="member-direction-roles"
            >

              ${renderDirectionRoles(
                direction
              )}

            </div>


            ${renderDirectionData(
              direction
            )}

          </div>

        `;

      })
      .join("");

  }


  // ======================================
  // CREATE FILTER PANEL
  // ======================================

  function createFilterPanel() {

    if (
      document.getElementById(
        "membersFilters"
      )
    ) {
      return;
    }


    const panel =
      document.createElement(
        "section"
      );


    panel.id =
      "membersFilters";

    panel.className =
      "members-filters";


    panel.innerHTML = `

      <div
        class="members-filter-title"
      >
        🔎 Пошук та фільтри
      </div>


      <div
        class="members-filter-grid"
      >

        <select
          id="membersDirectionFilter"
          class="members-filter-control"
        >

          <option value="">
            🎮 Усі напрямки
          </option>

        </select>


        <select
          id="membersRoleFilter"
          class="members-filter-control"
        >

          <option value="">
            🛡 Усі посади
          </option>

        </select>


        <select
          id="membersClassFilter"
          class="members-filter-control"
        >

          <option value="">
            🚛 Усі класи
          </option>

          <option value="A">
            Клас A
          </option>

          <option value="B">
            Клас B
          </option>

          <option value="C">
            Клас C
          </option>

          <option value="D">
            Клас D
          </option>

          <option value="E">
            Клас E
          </option>

        </select>


        <select
          id="membersSort"
          class="members-filter-control"
        >

          <option value="name">
            Сортувати: Ім'я
          </option>

          <option value="nickname">
            Сортувати: Ігровий нік
          </option>

          <option value="direction">
            Сортувати: Напрямок
          </option>

          <option value="role">
            Сортувати: Посада
          </option>

          <option value="driver_class">
            Сортувати: Клас ETS2
          </option>

        </select>


        <select
          id="membersSortOrder"
          class="members-filter-control"
        >

          <option value="asc">
            ↑ За зростанням
          </option>

          <option value="desc">
            ↓ За спаданням
          </option>

        </select>


        <button
          type="button"
          id="membersResetFilters"
          class="members-filter-reset"
        >
          Скинути фільтри
        </button>

      </div>

    `;


    membersList
      .parentElement
      ?.insertBefore(
        panel,
        membersList
      );


    const directionFilter =
      document.getElementById(
        "membersDirectionFilter"
      );

    const roleFilter =
      document.getElementById(
        "membersRoleFilter"
      );

    const classFilter =
      document.getElementById(
        "membersClassFilter"
      );

    const sortSelect =
      document.getElementById(
        "membersSort"
      );

    const orderSelect =
      document.getElementById(
        "membersSortOrder"
      );

    const resetButton =
      document.getElementById(
        "membersResetFilters"
      );


    directionFilter?.addEventListener(
      "change",
      event => {

        filters.direction =
          event.target.value;

        renderMembers();

      }
    );


    roleFilter?.addEventListener(
      "change",
      event => {

        filters.role =
          event.target.value;

        renderMembers();

      }
    );


    classFilter?.addEventListener(
      "change",
      event => {

        filters.driverClass =
          event.target.value;

        renderMembers();

      }
    );


    sortSelect?.addEventListener(
      "change",
      event => {

        filters.sort =
          event.target.value;

        renderMembers();

      }
    );


    orderSelect?.addEventListener(
      "change",
      event => {

        filters.order =
          event.target.value;

        renderMembers();

      }
    );


    resetButton?.addEventListener(
      "click",
      () => {

        if (membersSearch) {
          membersSearch.value = "";
        }


        filters = {
          direction: "",
          role: "",
          driverClass: "",
          sort: "name",
          order: "asc"
        };


        if (directionFilter) {
          directionFilter.value = "";
        }

        if (roleFilter) {
          roleFilter.value = "";
        }

        if (classFilter) {
          classFilter.value = "";
        }

        if (sortSelect) {
          sortSelect.value = "name";
        }

        if (orderSelect) {
          orderSelect.value = "asc";
        }


        renderMembers();

      }
    );

  }


  // ======================================
  // BUILD FILTER OPTIONS
  // ======================================

  function buildFilterOptions() {

    const directionFilter =
      document.getElementById(
        "membersDirectionFilter"
      );

    const roleFilter =
      document.getElementById(
        "membersRoleFilter"
      );


    if (
      !directionFilter ||
      !roleFilter
    ) {
      return;
    }


    const directions =
      new Map();

    const roles =
      new Map();


    allMembers.forEach(
      member => {

        getMemberDirections(
          member
        )
          .forEach(direction => {

            const key =
              String(
                direction.slug ||
                direction.code ||
                direction.name ||
                ""
              )
                .toLowerCase();


            if (
              key &&
              !directions.has(key)
            ) {

              directions.set(
                key,
                getDirectionLabel(
                  direction
                )
              );

            }


            normalizeArray(
              direction.roles
            )
              .forEach(role => {

                const roleKey =
                  String(
                    role.code ||
                    role.name ||
                    ""
                  )
                    .toLowerCase();


                if (
                  roleKey &&
                  !roles.has(roleKey)
                ) {

                  roles.set(
                    roleKey,
                    role.name ||
                    role.code
                  );

                }

              });

          });

      }
    );


    directionFilter.innerHTML = `
      <option value="">
        🎮 Усі напрямки
      </option>
    `;


    [...directions.entries()]
      .sort(
        (a, b) =>
          a[1].localeCompare(
            b[1],
            "uk"
          )
      )
      .forEach(
        ([key, label]) => {

          directionFilter.insertAdjacentHTML(
            "beforeend",
            `
              <option value="${escapeHtml(key)}">
                ${escapeHtml(label)}
              </option>
            `
          );

        }
      );


    roleFilter.innerHTML = `
      <option value="">
        🛡 Усі посади
      </option>
    `;


    [...roles.entries()]
      .sort(
        (a, b) =>
          a[1].localeCompare(
            b[1],
            "uk"
          )
      )
      .forEach(
        ([key, label]) => {

          roleFilter.insertAdjacentHTML(
            "beforeend",
            `
              <option value="${escapeHtml(key)}">
                ${escapeHtml(label)}
              </option>
            `
          );

        }
      );

  }


  // ======================================
  // RENDER MEMBERS
  // ======================================

  function renderMembers() {

    const filtered =
      getFilteredMembers();


    const members =
      sortMembers(
        filtered
      );


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

    if (!members.length) {

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

        const card =
          document.createElement(
            "article"
          );


        card.className =
          "member-card";


        card.innerHTML = `

          <!-- =================================
               AVATAR
               ================================= -->

          <div
            class="member-avatar"
          >

            ${renderAvatar(
              member
            )}

          </div>


          <!-- =================================
               INFO
               ================================= -->

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


              ${
                member.game_nickname
                  ? `
                    <div
                      class="member-nickname"
                    >

                      🎮

                      ${escapeHtml(
                        member.game_nickname
                      )}

                    </div>
                  `
                  : ""
              }


              ${
                member.discord_username
                  ? `
                    <div
                      class="member-discord"
                    >

                      💬

                      ${escapeHtml(
                        member.discord_username
                      )}

                    </div>
                  `
                  : ""
              }

            </div>


            <!-- =================================
                 GLOBAL ROLES
                 ================================= -->

            <div
              class="member-section"
            >

              <div
                class="member-section-title"
              >
                🌐 Глобальні ролі
              </div>


              <div
                class="member-badges"
              >

                ${renderGlobalRoles(
                  member
                )}

              </div>

            </div>


            <!-- =================================
                 DIRECTIONS
                 ================================= -->

            <div
              class="member-section"
            >

              <div
                class="member-section-title"
              >
                🎮 Напрямки
              </div>


              <div
                class="member-directions-list"
              >

                ${renderDirections(
                  member
                )}

              </div>

            </div>


            <!-- =================================
                 OPEN PROFILE
                 ================================= -->

            <div
              class="member-card-actions"
            >

              <a
                href="member.html?user_id=${encodeURIComponent(
                  member.user_id
                )}"
                class="member-open-button"
              >

                👤 Відкрити профіль

              </a>

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
  // INJECT STYLES
  // ======================================

  function injectStyles() {

    if (
      document.getElementById(
        "uaLegionMembersDynamicStyles"
      )
    ) {
      return;
    }


    const style =
      document.createElement(
        "style"
      );


    style.id =
      "uaLegionMembersDynamicStyles";


    style.textContent = `

      /* ==================================
         FILTER PANEL
         ================================== */

      .members-filters {

        margin-bottom: 22px;

        padding: 18px;

        border-radius: 16px;

        background:
          rgba(255,255,255,.045);

        border:
          1px solid
          rgba(255,255,255,.09);

      }


      .members-filter-title {

        margin-bottom: 14px;

        font-size: 17px;

        font-weight: 800;

      }


      .members-filter-grid {

        display: grid;

        grid-template-columns:
          repeat(
            auto-fit,
            minmax(180px, 1fr)
          );

        gap: 10px;

      }


      .members-filter-control {

        width: 100%;

        min-height: 44px;

        padding:
          10px 12px;

        box-sizing:
          border-box;

        border-radius: 10px;

        border:
          1px solid
          rgba(255,255,255,.13);

        background:
          #11151d;

        color:
          white;

        font-size: 14px;

      }


      .members-filter-control:focus {

        outline: none;

        border-color:
          rgba(255,211,77,.7);

      }


      .members-filter-reset {

        min-height: 44px;

        padding:
          10px 15px;

        border: 0;

        border-radius: 10px;

        background:
          rgba(255,255,255,.08);

        color: white;

        font-weight: 700;

        cursor: pointer;

      }


      .members-filter-reset:hover {

        background:
          rgba(255,255,255,.13);

      }


      /* ==================================
         MEMBER CARD
         ================================== */

      .member-card {

        position:
          relative;

        box-sizing:
          border-box;

        overflow:
          hidden;

      }


      /* ==================================
         AVATAR
         ================================== */

      .member-avatar {

        width:
          72px;

        height:
          72px;

        min-width:
          72px;

        min-height:
          72px;

        max-width:
          72px;

        max-height:
          72px;

        flex:
          0 0 72px;

        border-radius:
          50%;

        overflow:
          hidden;

        display:
          flex;

        align-items:
          center;

        justify-content:
          center;

        box-sizing:
          border-box;

        background:
          #171a20;

        border:
          2px solid
          rgba(255,255,255,.12);

        position:
          relative;

      }


      .member-avatar-image {

        width:
          100%;

        height:
          100%;

        min-width:
          100%;

        min-height:
          100%;

        max-width:
          none;

        max-height:
          none;

        display:
          block;

        object-fit:
          cover;

        object-position:
          center;

        border-radius:
          50%;

        position:
          absolute;

        inset:
          0;

      }


      .member-avatar-letter {

        width:
          100%;

        height:
          100%;

        min-width:
          100%;

        min-height:
          100%;

        display:
          flex;

        align-items:
          center;

        justify-content:
          center;

        font-size:
          28px;

        font-weight:
          800;

        line-height:
          1;

        color:
          white;

        user-select:
          none;

        position:
          absolute;

        inset:
          0;

      }


      .member-avatar-letter[hidden] {

        display:
          none;

      }


      /* ==================================
         DIRECTION CARD
         ================================== */

      .member-directions-list {

        display:
          flex;

        flex-direction:
          column;

        gap:
          12px;

      }


      .member-direction-card {

        padding:
          14px;

        border-radius:
          12px;

        background:
          rgba(255,255,255,.035);

        border:
          1px solid
          rgba(255,255,255,.08);

        box-sizing:
          border-box;

        min-width:
          0;

      }


      .member-direction-header {

        display:
          flex;

        justify-content:
          space-between;

        align-items:
          flex-start;

        gap:
          12px;

        margin-bottom:
          10px;

      }


      .member-direction-title {

        font-size:
          16px;

        font-weight:
          800;

      }


      .member-direction-status {

        margin-top:
          4px;

        font-size:
          12px;

        opacity:
          .65;

      }


      .member-driver-class {

        display:
          inline-flex;

        align-items:
          center;

        padding:
          6px 10px;

        border-radius:
          8px;

        background:
          rgba(255,211,77,.12);

        color:
          #ffd34d;

        font-size:
          12px;

        font-weight:
          800;

        white-space:
          nowrap;

      }


      .member-direction-roles {

        display:
          flex;

        flex-wrap:
          wrap;

        gap:
          6px;

        margin-bottom:
          10px;

      }


      .direction-role {

        display:
          inline-flex;

        padding:
          5px 9px;

        border-radius:
          8px;

        background:
          rgba(72,145,255,.12);

        font-size:
          12px;

      }


      .direction-role-empty {

        opacity:
          .55;

        font-size:
          12px;

      }


      /* ==================================
         DIRECTION DATA
         ================================== */

      .member-direction-data {

        display:
          grid;

        grid-template-columns:
          repeat(
            auto-fit,
            minmax(210px, 1fr)
          );

        gap:
          7px;

      }


      .member-data-row {

        display:
          flex;

        flex-direction:
          column;

        gap:
          3px;

        padding:
          9px 10px;

        border-radius:
          8px;

        background:
          rgba(0,0,0,.14);

        min-width:
          0;

      }


      .member-data-label {

        font-size:
          11px;

        opacity:
          .58;

      }


      .member-data-value {

        font-size:
          13px;

        font-weight:
          650;

        word-break:
          break-word;

        overflow-wrap:
          anywhere;

      }


      .member-direction-data-empty {

        font-size:
          12px;

        opacity:
          .45;

      }


      /* ==================================
         PROFILE DATA
         ================================== */

      .member-discord {

        margin-top:
          4px;

        font-size:
          13px;

        opacity:
          .65;

      }


      /* ==================================
         ACTION
         ================================== */

      .member-card-actions {

        margin-top:
          16px;

      }


      .member-open-button {

        display:
          inline-flex;

        align-items:
          center;

        justify-content:
          center;

        padding:
          10px 15px;

        border-radius:
          9px;

        background:
          rgba(255,255,255,.08);

        color:
          white;

        text-decoration:
          none;

        font-weight:
          700;

      }


      .member-open-button:hover {

        background:
          rgba(255,255,255,.14);

      }


      /* ==================================
         EMPTY / LOADING
         ================================== */

      .members-empty,
      .members-loading {

        box-sizing:
          border-box;

        width:
          100%;

      }


      /* ==================================
         RESPONSIVE
         ================================== */

      @media (
        max-width: 600px
      ) {

        .member-avatar {

          width:
            64px;

          height:
            64px;

          min-width:
            64px;

          min-height:
            64px;

          max-width:
            64px;

          max-height:
            64px;

          flex-basis:
            64px;

        }


        .member-direction-header {

          flex-direction:
            column;

        }


        .member-driver-class {

          align-self:
            flex-start;

        }

      }

    `;


    document.head.appendChild(
      style
    );

  }


  // ======================================
  // AUTH
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
  // ACCESS
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


  if (!hasAccess) {

    membersList.innerHTML = `

      <div class="members-empty">

        🔒 Доступ до списку учасників
        доступний тільки учасникам
        UA LEGION.

      </div>

    `;

    return;

  }


  // ======================================
  // LOAD MEMBERS
  // ======================================

  async function loadMembers() {

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


      membersList.innerHTML =
        "";

      return;

    }


    allMembers =
      Array.isArray(data)
        ? data
        : [];


    createFilterPanel();

    buildFilterOptions();

    renderMembers();

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

  injectStyles();

  await loadMembers();

});
