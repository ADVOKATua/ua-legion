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
    // ПЕРЕВІРКА АВТОРИЗАЦІЇ
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


    console.log(
      "PROFILE: Auth user:",
      user
    );


    // ======================================
    // ЕЛЕМЕНТИ СТОРІНКИ
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

    const applicationStatus =
      document.getElementById(
        "applicationStatus"
      );

    const joinButton =
      document.getElementById(
        "joinButton"
      );


    // ======================================
    // ЗМІННІ
    // ======================================

    let currentAvatarUrl =
      null;

    let previewObjectUrl =
      null;

    let currentProfile =
      null;

    let currentManagement =
      null;

    let currentApplications =
      [];

    let currentDirections =
      [];


    // ======================================
    // ПОВІДОМЛЕННЯ
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
    // БЕЗПЕЧНИЙ HTML
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
    // НОРМАЛІЗАЦІЯ SLUG
    // ======================================

    function normalizeSlug(
      value
    ) {

      return String(
        value ?? ""
      )
        .trim()
        .toLowerCase();

    }


    // ======================================
    // НАЗВА НАПРЯМКУ
    // ======================================

    function getDirectionName(
      direction
    ) {

      const slug =
        normalizeSlug(
          direction?.slug ||
          direction?.code ||
          direction
        );


      const names = {

        ets2:
          "🚛 ETS2 / TruckersMP",

        ets:
          "🚛 ETS2 / TruckersMP",

        wot:
          "🪖 World of Tanks",

        world_of_tanks:
          "🪖 World of Tanks",

        "world of tanks":
          "🪖 World of Tanks",

        dota:
          "🎮 Dota 2",

        dota2:
          "🎮 Dota 2",

        "dota 2":
          "🎮 Dota 2",

        wow:
          "⚔️ World of Warcraft",

        world_of_warcraft:
          "⚔️ World of Warcraft",

        "world of warcraft":
          "⚔️ World of Warcraft"

      };


      return (
        names[slug] ||
        direction?.name ||
        (
          slug
            ? "📍 " +
              slug.toUpperCase()
            : "📍 Невідомий напрямок"
        )
      );

    }


    // ======================================
    // ICON GLOBAL ROLE
    // ======================================

    function getGlobalRoleIcon(
      roleCode
    ) {

      switch (
        roleCode
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
    // ETS2 DRIVER CLASS
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
            : "Клас не призначено"
        )
      );

    }


    // ======================================
    // APPLICATION STATUS
    // ======================================

    function getApplicationStatusName(
      status
    ) {

      switch (
        normalizeSlug(status)
      ) {

        case "pending":
          return "🟡 Заявка на розгляді";

        case "approved":
          return "🟢 Заявку схвалено";

        case "rejected":
          return "🔴 Заявку відхилено";

        default:
          return "⚪ Заявка відсутня";

      }

    }


    // ======================================
    // ПЕРЕДАЧА DISCORD IDENTITY
    //
    // Тільки читання.
    // Ніякого автоматичного merge.
    // ======================================

    async function loadAuthIdentities() {

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

        return [];

      }


      const identities =
        Array.isArray(
          data?.identities
        )
          ? data.identities
          : [];


      console.log(
        "PROFILE: Auth identities:",
        identities
      );


      return identities;

    }


    // ======================================
    // DISCORD IDENTITY
    // ======================================

    async function syncDiscordIdentity(
      profile
    ) {

      const identities =
        await loadAuthIdentities();


      const discordIdentity =
        identities.find(
          identity =>
            normalizeSlug(
              identity.provider
            ) === "discord"
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
        discordIdentity.provider_id ||
        identityData.id ||
        identityData.user_id ||
        null;


      const discordName =
        identityData.global_name ||
        identityData.username ||
        identityData.preferred_username ||
        identityData.name ||
        null;


      if (
        !discordId &&
        !discordName
      ) {

        return;

      }


      const newDiscordId =
        discordId ||
        profile?.discord_user_id ||
        null;


      const newDiscordName =
        discordName ||
        profile?.discord_username ||
        null;


      const idChanged =
        String(
          profile?.discord_user_id ||
          ""
        ) !==
        String(
          newDiscordId ||
          ""
        );


      const nameChanged =
        String(
          profile?.discord_username ||
          ""
        ) !==
        String(
          newDiscordName ||
          ""
        );


      if (
        !idChanged &&
        !nameChanged
      ) {

        return;

      }


      const {
        error
      } =
        await supabase
          .from("profiles")
          .update({

            discord_user_id:
              newDiscordId,

            discord_username:
              newDiscordName,

            updated_at:
              new Date()
                .toISOString()

          })
          .eq(
            "id",
            user.id
          );


      if (error) {

        console.warn(
          "PROFILE: Не вдалося синхронізувати Discord:",
          error
        );

        return;

      }


      console.log(
        "PROFILE: Discord identity синхронізовано"
      );


      if (discordUsername) {

        discordUsername.value =
          newDiscordName || "";

      }


      if (discordUserId) {

        discordUserId.value =
          newDiscordId || "";

      }


      if (currentProfile) {

        currentProfile.discord_username =
          newDiscordName;

        currentProfile.discord_user_id =
          newDiscordId;

      }

    }


    // ======================================
    // ЗАВАНТАЖЕННЯ ПРОФІЛЮ
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

        return null;

      }


      if (!profile) {

        console.warn(
          "PROFILE: Профіль не знайдено"
        );

        return null;

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


      // ==================================
      // DISCORD FIELDS НЕ РЕДАГУЄМО
      // ==================================

      if (discordUsername) {

        discordUsername.readOnly =
          true;

      }


      if (discordUserId) {

        discordUserId.readOnly =
          true;

      }


      return profile;

    }


    // ======================================
    // RBAC
    //
    // ЄДИНЕ ДЖЕРЕЛО РОЛЕЙ
    // ======================================

    async function loadUserManagement() {

      if (!rolesList) {
        return null;
      }


      rolesList.innerHTML = `
        <div class="roles-empty">
          Завантаження ролей...
        </div>
      `;


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
          "PROFILE: RBAC error:",
          error
        );

        rolesList.innerHTML = `
          <div class="roles-empty">
            Не вдалося завантажити ролі та напрямки.
          </div>
        `;

        return null;

      }


      if (
        !data ||
        data.success === false
      ) {

        console.error(
          "PROFILE: Некоректний RBAC:",
          data
        );

        rolesList.innerHTML = `
          <div class="roles-empty">
            Не вдалося отримати інформацію про ролі.
          </div>
        `;

        return null;

      }


      currentManagement =
        data;


      window.currentUserRoles =
        data;


      console.log(
        "PROFILE: RBAC:",
        data
      );


      renderUserRoles(
        data.global_roles || [],
        data.directions || []
      );


      renderManagedDirections(
        data.directions || []
      );


      return data;

    }


    // ======================================
    // РЕНДЕР РОЛЕЙ
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
      // GLOBAL
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
      // ACTIVE DIRECTIONS
      // ==================================

      directions.forEach(
        direction => {

          if (
            direction.status &&
            direction.status !==
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


          const name =
            getDirectionName(
              direction
            );


          const roles =
            Array.isArray(
              direction.roles
            )
              ? direction.roles
              : [];


          let html = `
            <h3>
              ${escapeHtml(
                name
              )}
            </h3>
          `;


          // ------------------------------
          // ПОСАДИ
          // ------------------------------

          if (
            roles.length
          ) {

            const roleNames =
              roles
                .map(
                  role =>
                    escapeHtml(
                      role.name ||
                      role.code ||
                      "Невідома посада"
                    )
                )
                .join(
                  ", "
                );


            html += `
              <p>
                Посади:
                ${roleNames}
              </p>
            `;

          } else {

            html += `
              <p>
                Учасник напрямку
              </p>
            `;

          }


          // ------------------------------
          // ETS2 CLASS
          // ------------------------------

          const slug =
            normalizeSlug(
              direction.slug ||
              direction.code
            );


          if (
            slug === "ets2"
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
    // НАПРЯМКИ
    //
    // ВАЖЛИВО:
    // ЦЕ НЕ МЕХАНІЗМ ПРИЗНАЧЕННЯ.
    //
    // Користувач не може поставити собі
    // членство через profile.js.
    // ======================================

    function renderManagedDirections(
      directions = []
    ) {

      const checkboxes =
        document.querySelectorAll(
          'input[name="direction"]'
        );


      if (!checkboxes.length) {
        return;
      }


      checkboxes.forEach(
        checkbox => {

          checkbox.checked =
            false;

          checkbox.disabled =
            true;

        }
      );


      directions.forEach(
        direction => {

          if (
            direction.status &&
            direction.status !==
              "active"
          ) {

            return;

          }


          const slug =
            normalizeSlug(
              direction.slug ||
              direction.code
            );


          if (!slug) {
            return;
          }


          const checkbox =
            document.querySelector(
              `input[name="direction"][value="${CSS.escape(slug)}"]`
            );


          if (checkbox) {

            checkbox.checked =
              true;

          }

        }
      );

    }


    // ======================================
    // ЗАЯВКИ КОРИСТУВАЧА
    //
    // Завантажуємо ВСІ заявки.
    // ======================================

    async function loadApplications() {

      const {
        data,
        error
      } =
        await supabase
          .from("applications")
          .select(`
            id,
            direction,
            directions,
            status,
            created_at
          `)
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
          "PROFILE: Applications error:",
          error
        );

        currentApplications =
          [];

        return [];

      }


      currentApplications =
        Array.isArray(data)
          ? data
          : [];


      console.log(
        "PROFILE: Applications:",
        currentApplications
      );


      return currentApplications;

    }


    // ======================================
    // ВИЗНАЧЕННЯ APPLICATION DIRECTION
    // ======================================

    function getApplicationDirection(
      application
    ) {

      if (
        application?.direction
      ) {

        return normalizeSlug(
          application.direction
        );

      }


      if (
        Array.isArray(
          application?.directions
        ) &&
        application.directions.length
      ) {

        return normalizeSlug(
          application.directions[0]
        );

      }


      if (
        typeof application?.directions ===
          "string"
      ) {

        return normalizeSlug(
          application.directions
            .replace(
              /[\[\]"]/g,
              ""
            )
            .split(",")[0]
        );

      }


      return "";

    }


    // ======================================
    // APPLICATION ДЛЯ НАПРЯМКУ
    // ======================================

    function getLatestApplicationForDirection(
      slug
    ) {

      const normalized =
        normalizeSlug(
          slug
        );


      return (
        currentApplications.find(
          application =>
            getApplicationDirection(
              application
            ) === normalized
        ) ||
        null
      );

    }


    // ======================================
    // ACTIVE DIRECTION
    // ======================================

    function getActiveDirection(
      slug
    ) {

      const normalized =
        normalizeSlug(
          slug
        );


      return (
        (
          currentManagement?.directions ||
          []
        ).find(
          direction =>
            direction.status ===
              "active" &&
            normalizeSlug(
              direction.slug ||
              direction.code
            ) === normalized
        ) ||
        null
      );

    }


    // ======================================
    // СТАТУС НАПРЯМКУ
    // ======================================

    function getDirectionState(
      direction
    ) {

      const slug =
        normalizeSlug(
          direction.slug ||
          direction.code
        );


      const active =
        getActiveDirection(
          slug
        );


      if (active) {

        return {
          type:
            "active",

          label:
            "🟢 Учасник",

          direction:
            active
        };

      }


      const application =
        getLatestApplicationForDirection(
          slug
        );


      if (application) {

        const status =
          normalizeSlug(
            application.status
          );


        if (
          status === "pending"
        ) {

          return {
            type:
              "pending",

            label:
              "🟡 Заявка на розгляді",

            application
          };

        }


        if (
          status === "rejected"
        ) {

          return {
            type:
              "rejected",

            label:
              "🔴 Заявку відхилено",

            application
          };

        }


        if (
          status === "approved"
        ) {

          // Якщо approved є,
          // але user_directions ще не повернув
          // active — не створюємо членство
          // на frontend автоматично.

          return {
            type:
              "approved_waiting",

            label:
              "🟡 Заявку схвалено",

            application
          };

        }

      }


      return {
        type:
          "none",

        label:
          "⚪ Не подавав заявку"
      };

    }


    // ======================================
    // РЕНДЕР СТАТУСІВ НАПРЯМКІВ
    //
    // ПІДТРИМУЄ МАЙБУТНІЙ HTML:
    //
    // #directionsStatus
    //
    // Якщо такого контейнера ще немає,
    // стара система checkbox продовжить
    // працювати.
    // ======================================

    function renderDirectionStatuses(
      directions = []
    ) {

      const container =
        document.getElementById(
          "directionsStatus"
        );


      if (!container) {

        return;

      }


      container.innerHTML =
        "";


      directions.forEach(
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


          const title =
            getDirectionName(
              direction
            );


          let html = `
            <h3>
              ${escapeHtml(
                title
              )}
            </h3>

            <p class="direction-status">
              ${escapeHtml(
                state.label
              )}
            </p>
          `;


          // ==================================
          // ACTIVE
          // ==================================

          if (
            state.type ===
            "active"
          ) {

            const active =
              state.direction;


            const roles =
              Array.isArray(
                active?.roles
              )
                ? active.roles
                : [];


            if (
              roles.length
            ) {

              html += `
                <p>
                  Посади:
                  ${roles
                    .map(
                      role =>
                        escapeHtml(
                          role.name ||
                          role.code ||
                          ""
                        )
                    )
                    .join(
                      ", "
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


            if (
              normalizeSlug(
                active?.slug ||
                active?.code
              ) ===
              "ets2"
            ) {

              html += `
                <p>
                  Клас водія:
                  <strong>
                    ${escapeHtml(
                      getDriverClassName(
                        active.driver_class
                      )
                    )}
                  </strong>
                </p>
              `;

            }

          }


          // ==================================
          // PENDING
          // ==================================

          if (
            state.type ===
            "pending"
          ) {

            html += `
              <p>
                Ваша заявка очікує
                рішення адміністрації.
              </p>
            `;

          }


          // ==================================
          // REJECTED
          // ==================================

          if (
            state.type ===
            "rejected"
          ) {

            html += `
              <p>
                Заявку було відхилено.
              </p>

              <a
                href="join.html?direction=${encodeURIComponent(
                  normalizeSlug(
                    direction.slug ||
                    direction.code
                  )
                )}"
                class="direction-apply-button"
              >
                📝 ПОДАТИ ПОВТОРНО
              </a>
            `;

          }


          // ==================================
          // NO APPLICATION
          // ==================================

          if (
            state.type ===
            "none"
          ) {

            html += `
              <a
                href="join.html?direction=${encodeURIComponent(
                  normalizeSlug(
                    direction.slug ||
                    direction.code
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


          container.appendChild(
            card
          );

        }
      );


      if (
        !container.children.length
      ) {

        container.innerHTML = `
          <div class="roles-empty">
            Напрямки поки недоступні.
          </div>
        `;

      }

    }


    // ======================================
    // СТАРИЙ БЛОК APPLICATION STATUS
    //
    // ЗАЛИШАЄМО ДЛЯ СУМІСНОСТІ.
    // ======================================

    function renderLegacyApplicationStatus() {

      if (!applicationStatus) {
        return;
      }


      // ----------------------------------
      // Якщо новий контейнер уже існує,
      // старий блок не дублюємо.
      // ----------------------------------

      if (
        document.getElementById(
          "directionsStatus"
        )
      ) {

        applicationStatus.innerHTML = `
          <h3>
            📝 Мої заявки
          </h3>

          <p>
            Статус заявок відображається
            у розділі «Напрямки UA LEGION».
          </p>
        `;

        applicationStatus.className =
          "application-card";

        return;

      }


      // ----------------------------------
      // Стара логіка
      // ----------------------------------

      if (
        !currentApplications.length
      ) {

        applicationStatus.className =
          "application-card none";


        applicationStatus.innerHTML = `
          <h3>
            📝 Заявок ще немає
          </h3>

          <p>
            Ви можете подати заявку
            на вступ до UA LEGION.
          </p>
        `;


        if (joinButton) {

          joinButton.style.display =
            "inline-flex";

          joinButton.href =
            "join.html";

          joinButton.textContent =
            "📝 ПОДАТИ ЗАЯВКУ";

        }


        return;

      }


      const application =
        currentApplications[0];


      const direction =
        getApplicationDirection(
          application
        );


      const directionName =
        getDirectionName(
          direction
        );


      const status =
        normalizeSlug(
          application.status
        );


      if (
        status === "pending"
      ) {

        applicationStatus.className =
          "application-card pending";


        applicationStatus.innerHTML = `
          <h3>
            ${escapeHtml(
              directionName
            )}
          </h3>

          <p>
            🟡 Заявка на розгляді
          </p>
        `;


        if (joinButton) {

          joinButton.style.display =
            "none";

        }


        return;

      }


      if (
        status === "approved"
      ) {

        applicationStatus.className =
          "application-card approved";


        applicationStatus.innerHTML = `
          <h3>
            ${escapeHtml(
              directionName
            )}
          </h3>

          <p>
            🟢 Заявку схвалено
          </p>

          <a
            href="members.html"
            class="members-link"
          >
            👥 УЧАСНИКИ UA LEGION
          </a>
        `;


        if (joinButton) {

          joinButton.style.display =
            "none";

        }


        return;

      }


      if (
        status === "rejected"
      ) {

        applicationStatus.className =
          "application-card rejected";


        applicationStatus.innerHTML = `
          <h3>
            ${escapeHtml(
              directionName
            )}
          </h3>

          <p>
            🔴 Заявку відхилено
          </p>
        `;


        if (joinButton) {

          joinButton.style.display =
            "inline-flex";

          joinButton.href =
            `join.html?direction=${encodeURIComponent(
              direction
            )}`;

          joinButton.textContent =
            "📝 ПОДАТИ ЗАЯВКУ ПОВТОРНО";

        }


        return;

      }

    }


    // ======================================
    // АВАТАР PREVIEW
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
    // СОХРАНЕНИЕ ПРОФИЛЯ
    //
    // ТУТ НЕМАЄ:
    // - ролей
    // - членства
    // - driver class
    //
    // Тільки profiles.
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
          // AVATAR UPLOAD
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


            const originalExtension =
              avatarFile.name
                .split(".")
                .pop()
                ?.toLowerCase();


            const fileExtension =
              originalExtension &&
              /^[a-z0-9]+$/.test(
                originalExtension
              )
                ? originalExtension
                : "png";


            const filePath =
              `${user.id}/avatar-${Date.now()}.${fileExtension}`;


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


            if (uploadError) {

              console.error(
                "PROFILE: Avatar upload error:",
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
              publicUrlData?.publicUrl ||
              null;


            if (
              !uploadedAvatarUrl
            ) {

              showMessage(
                "Аватар завантажено, але URL не отримано.",
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
          // PROFILE UPDATE
          // ==================================

          const avatarToSave =
            uploadedAvatarUrl ||
            currentAvatarUrl ||
            null;


          const {
            error:
              profileError
          } =
            await supabase
              .from("profiles")
              .upsert(
                {

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

                  // Discord дані беруться
                  // з identity/profile.
                  discord_username:
                    currentProfile
                      ?.discord_username ||
                    discordUsername?.value
                      .trim() ||
                    null,

                  discord_user_id:
                    currentProfile
                      ?.discord_user_id ||
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

                },
                {
                  onConflict:
                    "id"
                }
              );


          if (profileError) {

            console.error(
              "PROFILE: Profile update error:",
              profileError
            );


            showMessage(
              profileError.message,
              "error"
            );


            return;

          }


          // ==================================
          // STATE UPDATE
          // ==================================

          if (
            uploadedAvatarUrl
          ) {

            currentAvatarUrl =
              uploadedAvatarUrl;


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

          }


          if (
            displayName?.value.trim() &&
            profileNamePreview
          ) {

            profileNamePreview.textContent =
              displayName.value.trim();

          }


          await loadProfile();

          await syncDiscordIdentity(
            currentProfile
          );

          await loadUserManagement();

          await loadApplications();

          renderDirectionStatuses(
            currentDirections
          );

          renderLegacyApplicationStatus();


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
              "PROFILE: Logout error:",
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
    // ЗАВАНТАЖЕННЯ НАПРЯМКІВ
    // ======================================

    async function loadDirections() {

      const {
        data,
        error
      } =
        await supabase
          .from("directions")
          .select(
            "id, code, slug, name, icon, status"
          )
          .eq(
            "status",
            "active"
          )
          .order(
            "id",
            {
              ascending:
                true
            }
          );


      if (error) {

        console.error(
          "PROFILE: Directions error:",
          error
        );

        currentDirections =
          [];

        return [];

      }


      currentDirections =
        Array.isArray(data)
          ? data
          : [];


      console.log(
        "PROFILE: Directions:",
        currentDirections
      );


      return currentDirections;

    }


    // ======================================
    // INITIAL LOAD
    // ======================================

    await loadProfile();

    await syncDiscordIdentity(
      currentProfile
    );

    await loadUserManagement();

    await loadApplications();

    await loadDirections();

    renderDirectionStatuses(
      currentDirections
    );

    renderLegacyApplicationStatus();


    console.log(
      "UA LEGION PROFILE: готово"
    );

  }
);
