// ======================================
// UA LEGION — PROFILE SYSTEM
// profile.js
// ======================================

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
        "PROFILE: Supabase не підключений"
      );

      return;
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
    // ELEMENTS
    // ======================================

    const profileForm =
      document.getElementById(
        "profileForm"
      );


    const displayName =
      document.getElementById(
        "displayName"
      );


    const birthDate =
      document.getElementById(
        "birthDate"
      );


    const avatarUrl =
      document.getElementById(
        "avatarUrl"
      );


    const discordUsername =
      document.getElementById(
        "discordUsername"
      );


    const discordUserId =
      document.getElementById(
        "discordUserId"
      );


    const steamId =
      document.getElementById(
        "steamId"
      );


    const gameNickname =
      document.getElementById(
        "gameNickname"
      );


    const profileAvatar =
      document.getElementById(
        "profileAvatar"
      );


    const profileNamePreview =
      document.getElementById(
        "profileNamePreview"
      );


    const messageBox =
      document.getElementById(
        "profileMessage"
      );


    const logoutButton =
      document.getElementById(
        "logoutButton"
      );


    const rolesList =
      document.getElementById(
        "rolesList"
      );


    const globalRolesSection =
      document.getElementById(
        "globalRolesSection"
      );


    const directionsStatus =
      document.getElementById(
        "directionsStatus"
      );


    // ======================================
    // STATE
    // ======================================

    let currentAvatarUrl =
      null;


    let previewObjectUrl =
      null;


    let currentManagement =
      null;


    let allDirections =
      [];


    let allApplications =
      [];


    // ======================================
    // MESSAGE
    // ======================================

    function showMessage(
      message,
      type = "success"
    ) {

      if (!messageBox) {
        return;
      }


      messageBox.textContent =
        message;


      messageBox.className =
        "profile-message " +
        type;

    }


    // ======================================
    // ESCAPE HTML
    // ======================================

    function escapeHtml(
      value
    ) {

      return String(
        value ?? ""
      )
        .replace(
          /&/g,
          "&amp;"
        )
        .replace(
          /</g,
          "&lt;"
        )
        .replace(
          />/g,
          "&gt;"
        )
        .replace(
          /"/g,
          "&quot;"
        )
        .replace(
          /'/g,
          "&#039;"
        );

    }


    // ======================================
    // NORMALIZE
    // ======================================

    function normalize(
      value
    ) {

      return String(
        value ?? ""
      )
        .trim()
        .toLowerCase();

    }


    // ======================================
    // GLOBAL ROLE ICON
    // ======================================

    function getGlobalRoleIcon(
      code
    ) {

      switch (
        normalize(code)
      ) {

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

      const key =
        normalize(
          direction?.slug ||
          direction?.code ||
          direction?.name ||
          direction
        );


      switch (key) {

        case "ets2":
        case "ets":
        case "truckersmp":
        case "ets2 / truckersmp":

          return "🚛";


        case "wot":
        case "world_of_tanks":
        case "world of tanks":

          return "🪖";


        case "dota":
        case "dota2":
        case "dota 2":

          return "🎮";


        case "wow":
        case "world_of_warcraft":
        case "world of warcraft":

          return "🐉";


        default:

          return "📍";

      }

    }


    // ======================================
    // DIRECTION NAME
    // ======================================

    function getDirectionName(
      direction
    ) {

      const key =
        normalize(
          direction?.slug ||
          direction?.code ||
          direction?.name ||
          direction
        );


      switch (key) {

        case "ets2":
        case "ets":
        case "truckersmp":
        case "ets2 / truckersmp":

          return "ETS2 / TruckersMP";


        case "wot":
        case "world_of_tanks":
        case "world of tanks":

          return "World of Tanks";


        case "dota":
        case "dota2":
        case "dota 2":

          return "Dota 2";


        case "wow":
        case "world_of_warcraft":
        case "world of warcraft":

          return "World of Warcraft";


        default:

          return (
            direction?.name ||
            direction?.slug ||
            direction?.code ||
            "Невідомий напрямок"
          );

      }

    }


    // ======================================
    // DIRECTION KEY
    // ======================================

    function getDirectionKey(
      direction
    ) {

      return normalize(
        direction?.slug ||
        direction?.code ||
        direction?.name ||
        direction
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
          "Клас A — «Майстер водій»",

        B:
          "Клас B — «Старший водій»",

        C:
          "Клас C — «Досвідчений водій»",

        D:
          "Клас D — «Водій»",

        E:
          "Клас E — «Стажер»"

      };


      const key =
        String(
          driverClass ?? ""
        )
          .trim()
          .toUpperCase();


      return (
        names[key] ||
        (
          key
            ? `Клас ${key}`
            : ""
        )
      );

    }


    // ======================================
    // APPLICATION STATUS
    // ======================================

    function getApplicationStatusText(
      status
    ) {

      switch (
        normalize(status)
      ) {

        case "pending":

          return "🟡 На розгляді";


        case "approved":

          return "🟢 Схвалено";


        case "rejected":

          return "🔴 Відхилено";


        default:

          return (
            status ||
            "Невідомий статус"
          );

      }

    }


    // ======================================
    // APPLICATION DIRECTION
    // ======================================

    function getApplicationDirectionKey(
      application
    ) {

      // direction

      if (
        application?.direction !==
          null &&
        application?.direction !==
          undefined &&
        String(
          application.direction
        ).trim() !== ""
      ) {

        return normalize(
          application.direction
        );

      }


      // directions array

      if (
        Array.isArray(
          application?.directions
        ) &&
        application.directions.length
      ) {

        return normalize(
          application.directions[0]
        );

      }


      // directions string

      if (
        typeof application?.directions ===
        "string"
      ) {

        return normalize(
          application.directions
            .replace(
              /[\[\]"]/g,
              ""
            )
            .split(",")[0]
        );

      }


      // direction_id

      if (
        application?.direction_id
      ) {

        const direction =
          allDirections.find(
            item =>
              String(
                item.id
              ) ===
              String(
                application.direction_id
              )
          );


        if (direction) {

          return getDirectionKey(
            direction
          );

        }

      }


      return "";

    }


    // ======================================
    // AVATAR PREVIEW
    // ======================================

    if (avatarUrl) {

      avatarUrl.addEventListener(
        "change",
        () => {

          const file =
            avatarUrl.files?.[0];


          if (!file) {
            return;
          }


          if (
            !file.type.startsWith(
              "image/"
            )
          ) {

            showMessage(
              "Будь ласка, виберіть файл зображення.",
              "error"
            );

            avatarUrl.value =
              "";

            return;

          }


          if (
            file.size >
            10 * 1024 * 1024
          ) {

            showMessage(
              "Розмір аватара не повинен перевищувати 10 MB.",
              "error"
            );

            avatarUrl.value =
              "";

            return;

          }


          if (
            previewObjectUrl
          ) {

            URL.revokeObjectURL(
              previewObjectUrl
            );

          }


          previewObjectUrl =
            URL.createObjectURL(
              file
            );


          if (profileAvatar) {

            profileAvatar.src =
              previewObjectUrl;

          }

        }
      );

    }


    // ======================================
    // LOAD PROFILE
    // ======================================

    async function loadProfile() {

      const {
        data: profile,
        error
      } =
        await supabase
          .from("profiles")
          .select("*")
          .eq(
            "id",
            user.id
          )
          .maybeSingle();


      if (error) {

        console.error(
          "PROFILE: Помилка профілю:",
          error
        );

        showMessage(
          error.message,
          "error"
        );

        return;

      }


      if (!profile) {
        return;
      }


      // NAME

      if (displayName) {

        displayName.value =
          profile.display_name ||
          "";

      }


      if (profileNamePreview) {

        profileNamePreview.textContent =
          profile.display_name ||
          "Учасник UA LEGION";

      }


      // BIRTH DATE

      if (birthDate) {

        birthDate.value =
          profile.birth_date ||
          "";

      }


      // AVATAR

      currentAvatarUrl =
        profile.avatar_url ||
        null;


      if (
        currentAvatarUrl &&
        profileAvatar
      ) {

        profileAvatar.src =
          currentAvatarUrl;

      }


      // DISCORD

      if (discordUsername) {

        discordUsername.value =
          profile.discord_username ||
          "";

      }


      if (discordUserId) {

        discordUserId.value =
          profile.discord_user_id ||
          "";

      }


      // STEAM

      if (steamId) {

        steamId.value =
          profile.steam_id ||
          "";

      }


      // GAME NICK

      if (gameNickname) {

        gameNickname.value =
          profile.game_nickname ||
          "";

      }

    }


    // ======================================
    // SYNC DISCORD
    // ======================================

    async function syncDiscordIdentity() {

      try {

        const {
          data,
          error
        } =
          await supabase.auth
            .getUserIdentities();


        if (error) {

          console.warn(
            "PROFILE: Discord identities:",
            error
          );

          return;

        }


        const identities =
          data?.identities ||
          [];


        const discordIdentity =
          identities.find(
            identity =>
              normalize(
                identity.provider
              ) ===
              "discord"
          );


        if (
          !discordIdentity
        ) {

          return;

        }


        const identityData =
          discordIdentity.identity_data ||
          {};


        const discordId =
          identityData.provider_id ||
          identityData.user_id ||
          discordIdentity.id ||
          null;


        const discordName =
          identityData.full_name ||
          identityData.name ||
          identityData.preferred_username ||
          identityData.username ||
          null;


        const updateData = {};


        if (discordId) {

          updateData.discord_user_id =
            String(
              discordId
            );

        }


        if (discordName) {

          updateData.discord_username =
            String(
              discordName
            );

        }


        if (
          !Object.keys(
            updateData
          ).length
        ) {

          return;

        }


        const {
          error: updateError
        } =
          await supabase
            .from("profiles")
            .update(
              updateData
            )
            .eq(
              "id",
              user.id
            );


        if (updateError) {

          console.warn(
            "PROFILE: Discord sync:",
            updateError
          );

          return;

        }


        if (
          discordUsername &&
          updateData.discord_username
        ) {

          discordUsername.value =
            updateData.discord_username;

        }


        if (
          discordUserId &&
          updateData.discord_user_id
        ) {

          discordUserId.value =
            updateData.discord_user_id;

        }


      } catch (error) {

        console.warn(
          "PROFILE: Discord sync error:",
          error
        );

      }

    }


    // ======================================
    // LOAD DIRECTIONS
    // ======================================

    async function loadDirections() {

      const {
        data,
        error
      } =
        await supabase
          .from("directions")
          .select("*")
          .order(
            "id",
            {
              ascending: true
            }
          );


      if (error) {

        console.error(
          "PROFILE: directions:",
          error
        );


        // FALLBACK

        allDirections = [

          {
            id: 1,
            code: "ets2",
            slug: "ets2",
            name:
              "ETS2 / TruckersMP",
            icon:
              "🚛"
          },

          {
            id: 2,
            code: "wot",
            slug: "wot",
            name:
              "World of Tanks",
            icon:
              "🪖"
          },

          {
            id: 3,
            code: "dota2",
            slug: "dota2",
            name:
              "Dota 2",
            icon:
              "🎮"
          },

          {
            id: 4,
            code: "wow",
            slug: "wow",
            name:
              "World of Warcraft",
            icon:
              "🐉"
          }

        ];


        return;

      }


      allDirections =
        Array.isArray(data)
          ? data
          : [];

    }


    // ======================================
    // LOAD RBAC
    // ======================================

    async function loadManagement() {

      const {
        data,
        error
      } =
        await supabase.rpc(
          "get_user_direction_management",
          {
            p_target_user_id:
              user.id
          }
        );


      if (error) {

        console.error(
          "PROFILE: RBAC:",
          error
        );


        if (directionsStatus) {

          directionsStatus.innerHTML = `
            <div class="roles-empty">
              Не вдалося завантажити статуси напрямків.
            </div>
          `;

        }


        if (globalRolesSection) {

          globalRolesSection.style.display =
            "none";

        }


        return;

      }


      if (
        !data ||
        data.success === false
      ) {

        console.error(
          "PROFILE: Некоректний RBAC:",
          data
        );

        return;

      }


      currentManagement =
        data;


      window.currentUserRoles =
        data;

    }


    // ======================================
    // LOAD APPLICATIONS
    // ======================================

    async function loadApplications() {

      const {
        data,
        error
      } =
        await supabase
          .from("applications")
          .select("*")
          .eq(
            "user_id",
            user.id
          )
          .order(
            "created_at",
            {
              ascending:
                false
            }
          );


      if (error) {

        console.error(
          "PROFILE: applications:",
          error
        );


        allApplications =
          [];


        return;

      }


      allApplications =
        Array.isArray(data)
          ? data
          : [];

    }


    // ======================================
    // ACTIVE DIRECTION
    // ======================================

    function getActiveDirection(
      direction
    ) {

      if (
        !currentManagement
      ) {

        return null;

      }


      const managementDirections =
        Array.isArray(
          currentManagement.directions
        )
          ? currentManagement.directions
          : [];


      const targetKey =
        getDirectionKey(
          direction
        );


      return (
        managementDirections.find(
          item => {

            return (
              normalize(
                item.status
              ) ===
              "active" &&

              getDirectionKey(
                item
              ) ===
              targetKey
            );

          }
        ) ||
        null
      );

    }


    // ======================================
    // LATEST APPLICATION
    // ======================================

    function getLatestApplication(
      direction
    ) {

      const targetKey =
        getDirectionKey(
          direction
        );


      const applications =
        allApplications.filter(
          application =>
            getApplicationDirectionKey(
              application
            ) ===
            targetKey
        );


      return (
        applications[0] ||
        null
      );

    }


    // ======================================
    // DIRECTION STATE
    // ======================================

    function getDirectionState(
      direction
    ) {

      const active =
        getActiveDirection(
          direction
        );


      const latestApplication =
        getLatestApplication(
          direction
        );


      // ACTIVE MEMBER

      if (active) {

        return {

          type:
            "active",

          active,

          application:
            latestApplication

        };

      }


      // NO APPLICATION

      if (
        !latestApplication
      ) {

        return {

          type:
            "none",

          active:
            null,

          application:
            null

        };

      }


      const status =
        normalize(
          latestApplication.status
        );


      // PENDING

      if (
        status ===
        "pending"
      ) {

        return {

          type:
            "pending",

          active:
            null,

          application:
            latestApplication

        };

      }


      // REJECTED

      if (
        status ===
        "rejected"
      ) {

        return {

          type:
            "rejected",

          active:
            null,

          application:
            latestApplication

        };

      }


      // APPROVED WITHOUT ACTIVE MEMBERSHIP

      if (
        status ===
        "approved"
      ) {

        return {

          type:
            "approved_waiting",

          active:
            null,

          application:
            latestApplication

        };

      }


      return {

        type:
          "none",

        active:
          null,

        application:
          latestApplication

      };

    }


    // ======================================
    // RENDER GLOBAL ROLES
    // ======================================

    function renderGlobalRoles() {

      if (!rolesList) {
        return;
      }


      const globalRoles =
        Array.isArray(
          currentManagement?.global_roles
        )
          ? currentManagement.global_roles
          : [];


      // ==================================
      // НЕТ ГЛОБАЛЬНОЙ РОЛИ
      // ==================================

      if (
        !globalRoles.length
      ) {

        if (globalRolesSection) {

          globalRolesSection.style.display =
            "none";

        }

        return;

      }


      // ==================================
      // ЕСТЬ ГЛОБАЛЬНАЯ РОЛЬ
      // ==================================

      if (globalRolesSection) {

        globalRolesSection.style.display =
          "";

      }


      rolesList.innerHTML =
        "";


      globalRoles.forEach(
        role => {

          const card =
            document.createElement(
              "div"
            );


          card.className =
            "global-role-card";


          const icon =
            getGlobalRoleIcon(
              role.code
            );


          card.innerHTML = `

            <h3>
              ${icon}
              ${escapeHtml(
                role.name ||
                "Невідома роль"
              )}
            </h3>

            <p>
              Глобальна роль UA LEGION
            </p>

          `;


          rolesList.appendChild(
            card
          );

        }
      );

    }


    // ======================================
    // RENDER DIRECTIONS
    // ======================================

    function renderDirections() {

      if (!directionsStatus) {
        return;
      }


      directionsStatus.innerHTML =
        "";


      if (
        !allDirections.length
      ) {

        directionsStatus.innerHTML = `
          <div class="roles-empty">
            Напрямки поки недоступні.
          </div>
        `;

        return;

      }


      allDirections.forEach(
        direction => {

          const state =
            getDirectionState(
              direction
            );


          const key =
            getDirectionKey(
              direction
            );


          const icon =
            direction.icon ||
            getDirectionIcon(
              direction
            );


          const name =
            getDirectionName(
              direction
            );


          const card =
            document.createElement(
              "div"
            );


          card.className =
            "direction-status-card " +
            state.type;


          // ==================================
          // STATUS
          // ==================================

          let statusHtml = "";


          if (
            state.type ===
            "active"
          ) {

            statusHtml = `
              <span
                class="direction-member-status active"
              >
                🟢 Учасник
              </span>
            `;

          }

          else if (
            state.type ===
            "pending"
          ) {

            statusHtml = `
              <span
                class="direction-member-status pending"
              >
                🟡 Заявка
              </span>
            `;

          }

          else if (
            state.type ===
            "rejected"
          ) {

            statusHtml = `
              <span
                class="direction-member-status rejected"
              >
                🔴 Відхилено
              </span>
            `;

          }

          else if (
            state.type ===
            "approved_waiting"
          ) {

            statusHtml = `
              <span
                class="direction-member-status pending"
              >
                🟡 Схвалено
              </span>
            `;

          }

          else {

            statusHtml = `
              <span
                class="direction-member-status none"
              >
                ⚪ Не подавав
              </span>
            `;

          }


          // ==================================
          // HEADER
          // ==================================

          let html = `

            <div
              class="direction-card-header"
            >

              <h3
                class="direction-card-title"
              >
                ${escapeHtml(icon)}
                ${escapeHtml(name)}
              </h3>

              ${statusHtml}

            </div>

            <div
              class="direction-details"
            >

          `;


          // ==================================
          // ACTIVE
          // ==================================

          if (
            state.type ===
            "active"
          ) {

            const active =
              state.active ||
              {};


            const roles =
              Array.isArray(
                active.roles
              )
                ? active.roles
                : [];


            // POSITIONS

            if (
              roles.length
            ) {

              const roleNames =
                roles
                  .map(
                    role =>
                      role.name ||
                      role.code ||
                      "Невідома посада"
                  )
                  .join(
                    ", "
                  );


              html += `
                <p
                  class="direction-detail"
                >
                  <strong>
                    Посади:
                  </strong>
                  ${escapeHtml(
                    roleNames
                  )}
                </p>
              `;

            }

            else {

              html += `
                <p
                  class="direction-detail"
                >
                  <strong>
                    Посади:
                  </strong>
                  ще не призначено
                </p>
              `;

            }


            // ETS2 CLASS

            if (
              key ===
              "ets2"
            ) {

              if (
                active.driver_class
              ) {

                html += `
                  <p
                    class="direction-detail"
                  >
                    <strong>
                      Клас:
                    </strong>
                    ${escapeHtml(
                      getDriverClassName(
                        active.driver_class
                      )
                    )}
                  </p>
                `;

              }

              else {

                html += `
                  <p
                    class="direction-detail"
                  >
                    <strong>
                      Клас:
                    </strong>
                    не призначено
                  </p>
                `;

              }

            }


            // LAST APPLICATION

            if (
              state.application
            ) {

              html += `
                <div
                  class="direction-application"
                >

                  <p
                    class="direction-application-status"
                  >
                    Заявка:
                    ${escapeHtml(
                      getApplicationStatusText(
                        state.application.status
                      )
                    )}
                  </p>

                  ${
                    state.application.created_at
                      ? `
                        <p
                          class="direction-application-date"
                        >
                          Подано:
                          ${escapeHtml(
                            new Date(
                              state.application.created_at
                            ).toLocaleDateString(
                              "uk-UA"
                            )
                          )}
                        </p>
                      `
                      : ""
                  }

                </div>
              `;

            }

          }


          // ==================================
          // PENDING
          // ==================================

          else if (
            state.type ===
            "pending"
          ) {

            html += `
              <p
                class="direction-detail"
              >
                Ваша заявка очікує рішення адміністрації.
              </p>
            `;


            if (
              state.application?.created_at
            ) {

              html += `
                <div
                  class="direction-application"
                >

                  <p
                    class="direction-application-status"
                  >
                    Заявка:
                    🟡 На розгляді
                  </p>

                  <p
                    class="direction-application-date"
                  >
                    Подано:
                    ${escapeHtml(
                      new Date(
                        state.application.created_at
                      ).toLocaleDateString(
                        "uk-UA"
                      )
                    )}
                  </p>

                </div>
              `;

            }

          }


          // ==================================
          // REJECTED
          // ==================================

          else if (
            state.type ===
            "rejected"
          ) {

            html += `
              <p
                class="direction-detail"
              >
                Останню заявку було відхилено.
              </p>
            `;


            const reason =
              state.application?.review_comment ||
              state.application?.rejection_reason ||
              state.application?.review_reason ||
              null;


            if (reason) {

              html += `
                <p
                  class="direction-detail"
                >
                  <strong>
                    Причина:
                  </strong>
                  ${escapeHtml(
                    reason
                  )}
                </p>
              `;

            }


            html += `
              <a
                href="join.html?direction=${encodeURIComponent(
                  key
                )}"
                class="direction-apply-button"
              >
                📝 ПОДАТИ ПОВТОРНО
              </a>
            `;

          }


          // ==================================
          // APPROVED WAITING
          // ==================================

          else if (
            state.type ===
            "approved_waiting"
          ) {

            html += `
              <p
                class="direction-detail"
              >
                Заявку схвалено. Очікується активація членства.
              </p>
            `;

          }


          // ==================================
          // NO APPLICATION
          // ==================================

          else {

            html += `
              <p
                class="direction-detail"
              >
                Ви ще не подавали заявку до цього напрямку.
              </p>

              <a
                href="join.html?direction=${encodeURIComponent(
                  key
                )}"
                class="direction-apply-button"
              >
                📝 ПОДАТИ ЗАЯВКУ
              </a>
            `;

          }


          html += `
            </div>
          `;


          card.innerHTML =
            html;


          directionsStatus.appendChild(
            card
          );

        }
      );

    }


    // ======================================
    // SAVE PROFILE
    // ======================================

    if (profileForm) {

      profileForm.addEventListener(
        "submit",
        async event => {

          event.preventDefault();


          showMessage(
            "Збереження профілю..."
          );


          let uploadedAvatarUrl =
            null;


          const avatarFile =
            avatarUrl?.files?.[0];


          // ==================================
          // AVATAR
          // ==================================

          if (avatarFile) {

            if (
              !avatarFile.type.startsWith(
                "image/"
              )
            ) {

              showMessage(
                "Будь ласка, виберіть файл зображення.",
                "error"
              );

              return;

            }


            if (
              avatarFile.size >
              10 * 1024 * 1024
            ) {

              showMessage(
                "Розмір аватара не повинен перевищувати 10 MB.",
                "error"
              );

              return;

            }


            const extension =
              avatarFile.name
                .split(".")
                .pop()
                ?.toLowerCase() ||
              "png";


            const safeExtension =
              /^[a-z0-9]+$/.test(
                extension
              )
                ? extension
                : "png";


            const filePath =
              `${user.id}/avatar-${Date.now()}.${safeExtension}`;


            const {
              error:
                uploadError
            } =
              await supabase
                .storage
                .from("avatars")
                .upload(
                  filePath,
                  avatarFile,
                  {
                    cacheControl:
                      "3600",

                    upsert:
                      false,

                    contentType:
                      avatarFile.type
                  }
                );


            if (
              uploadError
            ) {

              console.error(
                "PROFILE: avatar upload:",
                uploadError
              );


              showMessage(
                uploadError.message,
                "error"
              );

              return;

            }


            const {
              data:
                publicUrlData
            } =
              supabase
                .storage
                .from("avatars")
                .getPublicUrl(
                  filePath
                );


            uploadedAvatarUrl =
              publicUrlData?.publicUrl ||
              null;


            if (
              !uploadedAvatarUrl
            ) {

              showMessage(
                "Не вдалося отримати URL аватара.",
                "error"
              );

              return;

            }


            if (profileAvatar) {

              profileAvatar.src =
                uploadedAvatarUrl;

            }

          }


          // ==================================
          // PROFILE DATA
          // ==================================

          const profileData = {

            id:
              user.id,

            display_name:
              displayName?.value
                .trim() ||
              null,

            birth_date:
              birthDate?.value ||
              null,

            avatar_url:
              uploadedAvatarUrl ||
              currentAvatarUrl ||
              null,

            discord_username:
              discordUsername?.value
                .trim() ||
              null,

            discord_user_id:
              discordUserId?.value
                .trim() ||
              null,

            steam_id:
              steamId?.value
                .trim() ||
              null,

            game_nickname:
              gameNickname?.value
                .trim() ||
              null,

            updated_at:
              new Date()
                .toISOString()

          };


          // ==================================
          // SAVE
          // ==================================

          const {
            error:
              saveError
          } =
            await supabase
              .from("profiles")
              .upsert(
                profileData,
                {
                  onConflict:
                    "id"
                }
              );


          if (
            saveError
          ) {

            console.error(
              "PROFILE: save:",
              saveError
            );


            showMessage(
              saveError.message,
              "error"
            );

            return;

          }


          currentAvatarUrl =
            profileData.avatar_url;


          if (
            previewObjectUrl
          ) {

            URL.revokeObjectURL(
              previewObjectUrl
            );

            previewObjectUrl =
              null;

          }


          if (avatarUrl) {

            avatarUrl.value =
              "";

          }


          if (
            profileNamePreview
          ) {

            profileNamePreview.textContent =
              profileData.display_name ||
              "Учасник UA LEGION";

          }


          showMessage(
            "Профіль успішно збережено!",
            "success"
          );

        }
      );

    }


    // ======================================
    // LOGOUT
    // ======================================

    if (logoutButton) {

      logoutButton.addEventListener(
        "click",
        async () => {

          const {
            error
          } =
            await supabase
              .auth
              .signOut();


          if (error) {

            showMessage(
              error.message,
              "error"
            );

            return;

          }


          window.location.href =
            "index.html";

        }
      );

    }


    // ======================================
    // INITIAL LOAD
    // ======================================

    try {

      // 1. PROFILE

      await loadProfile();


      // 2. DISCORD

      await syncDiscordIdentity();


      // 3. DIRECTIONS

      await loadDirections();


      // 4. RBAC

      await loadManagement();


      // 5. APPLICATIONS

      await loadApplications();


      // 6. GLOBAL ROLES

      renderGlobalRoles();


      // 7. DIRECTIONS

      renderDirections();


      console.log(
        "PROFILE: готово",
        {
          directions:
            allDirections,

          applications:
            allApplications,

          management:
            currentManagement
        }
      );


    } catch (error) {

      console.error(
        "PROFILE: critical error:",
        error
      );


      if (
        directionsStatus
      ) {

        directionsStatus.innerHTML = `
          <div class="roles-empty">
            Не вдалося завантажити дані профілю.
          </div>
        `;

      }


      if (
        globalRolesSection
      ) {

        globalRolesSection.style.display =
          "none";

      }


      showMessage(
        "Помилка завантаження профілю.",
        "error"
      );

    }

  }
);
