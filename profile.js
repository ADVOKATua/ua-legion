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
    // АВТОРИЗАЦІЯ
    // ======================================

    const {
      data: {
        user
      },
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


    const directionsStatus =
      document.getElementById(
        "directionsStatus"
      );


    const applicationStatus =
      document.getElementById(
        "applicationStatus"
      );


    // ======================================
    // VARIABLES
    // ======================================

    let currentAvatarUrl =
      null;


    let previewObjectUrl =
      null;


    let currentProfile =
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
      roleCode
    ) {

      switch (
        normalize(roleCode)
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

      const value =
        normalize(
          direction?.slug ||
          direction?.code ||
          direction
        );


      switch (value) {

        case "ets2":
        case "ets":
        case "truckersmp":
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

      const value =
        normalize(
          direction?.slug ||
          direction?.code ||
          direction?.name ||
          direction
        );


      switch (value) {

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


      const value =
        String(
          driverClass ?? ""
        )
          .trim()
          .toUpperCase();


      return (
        names[value] ||
        (
          value
            ? `Клас ${value}`
            : ""
        )
      );

    }


    // ======================================
    // APPLICATION STATUS NAME
    // ======================================

    function getApplicationStatusName(
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

    function getApplicationDirection(
      application
    ) {

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


      if (
        application?.direction_id
      ) {

        const found =
          allDirections.find(
            direction =>
              String(
                direction.id
              ) ===
              String(
                application.direction_id
              )
          );


        if (found) {

          return getDirectionKey(
            found
          );

        }

      }


      return "";

    }


    // ======================================
    // PREVIEW AVATAR
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
      } = await supabase
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

        console.warn(
          "PROFILE: Профіль не знайдений"
        );

        return;

      }


      currentProfile =
        profile;


      // ==================================
      // NAME
      // ==================================

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


      // ==================================
      // BIRTH DATE
      // ==================================

      if (birthDate) {

        birthDate.value =
          profile.birth_date ||
          "";

      }


      // ==================================
      // AVATAR
      // ==================================

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


      // ==================================
      // DISCORD
      // ==================================

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


      // ==================================
      // STEAM
      // ==================================

      if (steamId) {

        steamId.value =
          profile.steam_id ||
          "";

      }


      // ==================================
      // GAME NICK
      // ==================================

      if (gameNickname) {

        gameNickname.value =
          profile.game_nickname ||
          "";

      }

    }


    // ======================================
    // DISCORD IDENTITY
    // ======================================

    async function syncDiscordIdentity() {

      try {

        if (
          !supabase.auth
            .getUserIdentities
        ) {

          return;

        }


        const {
          data,
          error
        } =
          await supabase.auth
            .getUserIdentities();


        if (error) {

          console.warn(
            "PROFILE: Не вдалося отримати identities:",
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


        if (
          !discordId &&
          !discordName
        ) {

          return;

        }


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
            "PROFILE: Discord identity не збережено:",
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


        if (currentProfile) {

          Object.assign(
            currentProfile,
            updateData
          );

        }


      } catch (error) {

        console.warn(
          "PROFILE: Discord sync error:",
          error
        );

      }

    }


    // ======================================
    // LOAD RBAC MANAGEMENT
    // ======================================

    async function loadUserManagement() {

      if (rolesList) {

        rolesList.innerHTML = `
          <div class="roles-empty">
            Завантаження ролей...
          </div>
        `;

      }


      const {
        data,
        error
      } = await supabase.rpc(
        "get_user_direction_management",
        {
          p_target_user_id:
            user.id
        }
      );


      if (error) {

        console.error(
          "PROFILE: get_user_direction_management:",
          error
        );


        if (rolesList) {

          rolesList.innerHTML = `
            <div class="roles-empty">
              Не вдалося завантажити ролі.
            </div>
          `;

        }


        return null;

      }


      if (
        !data ||
        data.success === false
      ) {

        console.error(
          "PROFILE: Некоректна RBAC відповідь:",
          data
        );


        if (rolesList) {

          rolesList.innerHTML = `
            <div class="roles-empty">
              Не вдалося отримати RBAC-дані.
            </div>
          `;

        }


        return null;

      }


      currentManagement =
        data;


      window.currentUserRoles =
        data;


      renderUserRoles(
        data.global_roles || [],
        data.directions || []
      );


      return data;

    }


    // ======================================
    // RENDER ROLES
    // ======================================

    function renderUserRoles(
      globalRoles = [],
      directions = []
    ) {

      if (!rolesList) {
        return;
      }


      rolesList.innerHTML =
        "";


      // ==================================
      // GLOBAL ROLES
      // ==================================

      globalRoles.forEach(
        role => {

          const card =
            document.createElement(
              "div"
            );


          card.className =
            "role-card global";


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
              Глобальна роль
            </p>
          `;


          rolesList.appendChild(
            card
          );

        }
      );


      // ==================================
      // DIRECTION ROLES
      // ==================================

      directions.forEach(
        direction => {

          const status =
            normalize(
              direction.status
            );


          if (
            status &&
            status !==
              "active"
          ) {

            return;

          }


          const card =
            document.createElement(
              "div"
            );


          card.className =
            "role-card";


          const icon =
            direction.icon ||
            getDirectionIcon(
              direction
            );


          const name =
            getDirectionName(
              direction
            );


          let html = `
            <h3>
              ${escapeHtml(
                icon
              )}
              ${escapeHtml(
                name
              )}
            </h3>
          `;


          // --------------------------------
          // POSITIONS
          // --------------------------------

          const roles =
            Array.isArray(
              direction.roles
            )
              ? direction.roles
              : [];


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
              <p>
                Посади:
                ${escapeHtml(
                  roleNames
                )}
              </p>
            `;

          } else {

            html += `
              <p>
                Учасник напрямку
              </p>
            `;

          }


          // --------------------------------
          // ETS2 DRIVER CLASS
          // --------------------------------

          if (
            getDirectionKey(
              direction
            ) ===
              "ets2" &&
            direction.driver_class
          ) {

            html += `
              <p>
                Клас водія:
                <strong>
                  ${escapeHtml(
                    getDriverClassName(
                      direction.driver_class
                    )
                  )}
                </strong>
              </p>
            `;

          }


          card.innerHTML =
            html;


          rolesList.appendChild(
            card
          );

        }
      );


      if (
        !rolesList.children.length
      ) {

        rolesList.innerHTML = `
          <div class="roles-empty">
            У вас поки немає призначених ролей.
          </div>
        `;

      }

    }


    // ======================================
    // LOAD ALL DIRECTIONS
    // ======================================

    async function loadDirections() {

      const {
        data,
        error
      } = await supabase
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
          "PROFILE: Помилка directions:",
          error
        );


        // ----------------------------------
        // FALLBACK
        // ----------------------------------

        allDirections = [

          {
            id: 1,
            code: "ets2",
            slug: "ets2",
            name:
              "ETS2 / TruckersMP",
            icon: "🚛"
          },

          {
            id: 2,
            code: "wot",
            slug: "wot",
            name:
              "World of Tanks",
            icon: "🪖"
          },

          {
            id: 3,
            code: "dota2",
            slug: "dota2",
            name:
              "Dota 2",
            icon: "🎮"
          },

          {
            id: 4,
            code: "wow",
            slug: "wow",
            name:
              "World of Warcraft",
            icon: "🐉"
          }

        ];


        return allDirections;

      }


      allDirections =
        Array.isArray(data)
          ? data
          : [];


      return allDirections;

    }


    // ======================================
    // LOAD APPLICATIONS
    // ======================================

    async function loadApplications() {

      const {
        data,
        error
      } = await supabase
        .from("applications")
        .select("*")
        .eq(
          "user_id",
          user.id
        )
        .order(
          "created_at",
          {
            ascending: false
          }
        );


      if (error) {

        console.error(
          "PROFILE: Помилка applications:",
          error
        );


        allApplications =
          [];


        renderApplications();


        return;

      }


      allApplications =
        Array.isArray(data)
          ? data
          : [];


      renderApplications();

    }


    // ======================================
    // GET ACTIVE DIRECTION
    // ======================================

    function getActiveDirection(
      direction
    ) {

      if (
        !currentManagement
      ) {

        return null;

      }


      const directions =
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
        directions.find(
          item =>
            normalize(
              item.status
            ) ===
              "active" &&
            getDirectionKey(
              item
            ) ===
              targetKey
        ) ||
        null
      );

    }


    // ======================================
    // GET APPLICATION FOR DIRECTION
    // ======================================

    function getLatestApplication(
      direction
    ) {

      const targetKey =
        getDirectionKey(
          direction
        );


      const matches =
        allApplications.filter(
          application =>
            getApplicationDirection(
              application
            ) ===
            targetKey
        );


      if (!matches.length) {
        return null;
      }


      return matches[0];

    }


    // ======================================
    // DIRECTION STATE
    // ======================================

    function getDirectionState(
      direction
    ) {

      // ----------------------------------
      // ACTIVE MEMBER
      // ----------------------------------

      const active =
        getActiveDirection(
          direction
        );


      if (active) {

        return {
          type: "active",
          active,
          application:
            getLatestApplication(
              direction
            )
        };

      }


      // ----------------------------------
      // LAST APPLICATION
      // ----------------------------------

      const application =
        getLatestApplication(
          direction
        );


      if (!application) {

        return {
          type: "none",
          application:
            null
        };

      }


      const status =
        normalize(
          application.status
        );


      // ----------------------------------
      // PENDING
      // ----------------------------------

      if (
        status ===
        "pending"
      ) {

        return {
          type: "pending",
          application
        };

      }


      // ----------------------------------
      // REJECTED
      // ----------------------------------

      if (
        status ===
        "rejected"
      ) {

        return {
          type: "rejected",
          application
        };

      }


      // ----------------------------------
      // APPROVED WITHOUT MEMBERSHIP
      // ----------------------------------

      if (
        status ===
        "approved"
      ) {

        return {
          type:
            "approved_waiting",
          application
        };

      }


      return {
        type: "none",
        application
      };

    }


    // ======================================
    // RENDER DIRECTION STATUS
    // ======================================

    function renderDirectionStatuses() {

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


          const card =
            document.createElement(
              "div"
            );


          card.className =
            "direction-status-card " +
            state.type;


          const icon =
            direction.icon ||
            getDirectionIcon(
              direction
            );


          const name =
            getDirectionName(
              direction
            );


          let html = `
            <h3>
              ${escapeHtml(
                icon
              )}
              ${escapeHtml(
                name
              )}
            </h3>
          `;


          // ==================================
          // ACTIVE
          // ==================================

          if (
            state.type ===
            "active"
          ) {

            html += `
              <p class="direction-status">
                🟢 Учасник
              </p>
            `;


            const active =
              state.active ||
              {};


            const roles =
              Array.isArray(
                active.roles
              )
                ? active.roles
                : [];


            if (
              roles.length
            ) {

              const roleNames =
                roles
                  .map(
                    role =>
                      role.name ||
                      role.code
                  )
                  .join(
                    ", "
                  );


              html += `
                <p>
                  <strong>
                    Посади:
                  </strong>
                  ${escapeHtml(
                    roleNames
                  )}
                </p>
              `;

            } else {

              html += `
                <p>
                  Посада ще не призначена
                </p>
              `;

            }


            if (
              getDirectionKey(
                direction
              ) ===
                "ets2"
            ) {

              if (
                active.driver_class
              ) {

                html += `
                  <p>
                    <strong>
                      Клас водія:
                    </strong>
                    ${escapeHtml(
                      getDriverClassName(
                        active.driver_class
                      )
                    )}
                  </p>
                `;

              } else {

                html += `
                  <p>
                    <strong>
                      Клас водія:
                    </strong>
                    Не призначено
                  </p>
                `;

              }

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
              <p class="direction-status">
                🟡 Заявка на розгляді
              </p>

              <p>
                Ваша заявка очікує
                рішення адміністрації.
              </p>
            `;

          }


          // ==================================
          // REJECTED
          // ==================================

          else if (
            state.type ===
            "rejected"
          ) {

            html += `
              <p class="direction-status">
                🔴 Заявку відхилено
              </p>
            `;


            const reason =
              state.application
                ?.review_comment ||
              state.application
                ?.rejection_reason ||
              state.application
                ?.review_reason ||
              null;


            if (reason) {

              html += `
                <p>
                  <strong>
                    Причина:
                  </strong>
                  ${escapeHtml(
                    reason
                  )}
                </p>
              `;

            } else {

              html += `
                <p>
                  Причина відхилення
                  не вказана.
                </p>
              `;

            }


            html += `
              <a
                href="join.html?direction=${encodeURIComponent(
                  getDirectionKey(
                    direction
                  )
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
              <p class="direction-status">
                🟡 Заявку схвалено
              </p>

              <p>
                Заявку схвалено.
                Очікується активація
                членства в напрямку.
              </p>
            `;

          }


          // ==================================
          // NONE
          // ==================================

          else {

            html += `
              <p class="direction-status">
                ⚪ Не подавав заявку
              </p>

              <p>
                Ви ще не подавали заявку
                до цього напрямку.
              </p>

              <a
                href="join.html?direction=${encodeURIComponent(
                  getDirectionKey(
                    direction
                  )
                )}"
                class="direction-apply-button"
              >
                📝 ПОДАТИ ЗАЯВКУ
              </a>
            `;

          }


          card.innerHTML =
            html;


          directionsStatus.appendChild(
            card
          );

        }
      );

    }


    // ======================================
    // RENDER APPLICATIONS
    // ======================================

    function renderApplications() {

      if (!applicationStatus) {
        return;
      }


      applicationStatus.className =
        "application-card";


      // ----------------------------------
      // NO APPLICATIONS
      // ----------------------------------

      if (
        !allApplications.length
      ) {

        applicationStatus.innerHTML = `
          <h3>
            📝 Заявок ще немає
          </h3>

          <p>
            Ви ще не подавали заявок
            до UA LEGION.
          </p>

          <p>
            Статуси кожного напрямку
            відображаються вище.
          </p>
        `;

        return;

      }


      // ----------------------------------
      // GROUP
      // ----------------------------------

      const applicationsHtml =
        allApplications
          .map(
            application => {

              const directionKey =
                getApplicationDirection(
                  application
                );


              const direction =
                allDirections.find(
                  item =>
                    getDirectionKey(
                      item
                    ) ===
                    directionKey
                );


              const directionName =
                direction
                  ? getDirectionName(
                      direction
                    )
                  : (
                      directionKey ||
                      "Невідомий напрямок"
                    );


              const status =
                normalize(
                  application.status
                );


              let statusClass =
                "";


              if (
                status ===
                "pending"
              ) {

                statusClass =
                  "pending";

              } else if (
                status ===
                "approved"
              ) {

                statusClass =
                  "approved";

              } else if (
                status ===
                "rejected"
              ) {

                statusClass =
                  "rejected";

              }


              const createdAt =
                application.created_at
                  ? new Date(
                      application.created_at
                    ).toLocaleString(
                      "uk-UA"
                    )
                  : "";


              const reason =
                application.review_comment ||
                application.rejection_reason ||
                application.review_reason ||
                null;


              return `
                <div
                  class="application-card ${statusClass}"
                  style="
                    margin-bottom:12px;
                  "
                >

                  <h3>
                    ${escapeHtml(
                      directionName
                    )}
                  </h3>

                  <p>
                    ${escapeHtml(
                      getApplicationStatusName(
                        status
                      )
                    )}
                  </p>

                  ${
                    createdAt
                      ? `
                        <p>
                          Подано:
                          ${escapeHtml(
                            createdAt
                          )}
                        </p>
                      `
                      : ""
                  }

                  ${
                    reason
                      ? `
                        <p>
                          <strong>
                            Коментар:
                          </strong>
                          ${escapeHtml(
                            reason
                          )}
                        </p>
                      `
                      : ""
                  }

                </div>
              `;

            }
          )
          .join("");


      applicationStatus.innerHTML = `
        <h3>
          📝 Мої заявки
        </h3>

        <p>
          Усього заявок:
          ${allApplications.length}
        </p>

        <div
          style="
            margin-top:15px;
          "
        >
          ${applicationsHtml}
        </div>
      `;

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


            showMessage(
              "Завантаження аватара..."
            );


            const extension =
              avatarFile.name
                .split(".")
                .pop()
                ?.toLowerCase()
                || "png";


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
                "PROFILE: Avatar upload:",
                uploadError
              );


              showMessage(
                "Не вдалося завантажити аватар: " +
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
              publicUrlData
                ?.publicUrl ||
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
          // AVATAR URL
          // ==================================

          const avatarToSave =
            uploadedAvatarUrl ||
            currentAvatarUrl ||
            null;


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
              avatarToSave,

            // Discord readonly,
            // але зберігаємо поточне значення
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
              profileError
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
            profileError
          ) {

            console.error(
              "PROFILE: Save error:",
              profileError
            );


            showMessage(
              profileError.message,
              "error"
            );

            return;

          }


          currentProfile =
            {
              ...currentProfile,
              ...profileData
            };


          currentAvatarUrl =
            avatarToSave;


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

            console.error(
              "PROFILE: Logout:",
              error
            );

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

      // ----------------------------------
      // 1. PROFILE
      // ----------------------------------

      await loadProfile();


      // ----------------------------------
      // 2. DISCORD
      // ----------------------------------

      await syncDiscordIdentity();


      // ----------------------------------
      // 3. ALL DIRECTIONS
      // ----------------------------------

      await loadDirections();


      // ----------------------------------
      // 4. RBAC
      // ----------------------------------

      await loadUserManagement();


      // ----------------------------------
      // 5. APPLICATIONS
      // ----------------------------------

      await loadApplications();


      // ----------------------------------
      // 6. STATUS CARDS
      // ----------------------------------

      renderDirectionStatuses();


      // ----------------------------------
      // 7. APPLICATION LIST
      // ----------------------------------

      renderApplications();


      console.log(
        "PROFILE: Система завантажена",
        {
          userId:
            user.id,

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
        "PROFILE: Критична помилка:",
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


      showMessage(
        "Помилка завантаження профілю.",
        "error"
      );

    }

  }
);
