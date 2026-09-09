document.addEventListener("DOMContentLoaded", async () => {

  /* =========================================
     SUPABASE CLIENT
     ========================================= */

  const supabaseClient =
    window.supabaseClient ||
    window.sb ||
    (
      window.supabase &&
      typeof window.supabase.from === "function"
        ? window.supabase
        : null
    );


  if (!supabaseClient) {

    console.error("Supabase client не знайдено.");

    return;

  }


  /* =========================================
     ЕЛЕМЕНТИ СТОРІНКИ
     ========================================= */

  const profileForm =
    document.getElementById("profileForm");

  const profileAvatar =
    document.getElementById("profileAvatar");

  const profileNamePreview =
    document.getElementById("profileNamePreview");

  const displayName =
    document.getElementById("displayName");

  const birthDate =
    document.getElementById("birthDate");

  const avatarInput =
    document.getElementById("avatarUrl");

  const discordUsername =
    document.getElementById("discordUsername");

  const discordUserId =
    document.getElementById("discordUserId");

  const steamId =
    document.getElementById("steamId");

  const gameNickname =
    document.getElementById("gameNickname");

  const applicationStatus =
    document.getElementById("applicationStatus");

  const rolesList =
    document.getElementById("rolesList");

  const joinButton =
    document.getElementById("joinButton");

  const logoutButton =
    document.getElementById("logoutButton");

  const profileMessage =
    document.getElementById("profileMessage");

  const saveProfileButton =
    document.getElementById("saveProfile");


  /* =========================================
     ПОТОЧНИЙ КОРИСТУВАЧ
     ========================================= */

  const {
    data: {
      user
    },
    error: userError
  } =
    await supabaseClient
      .auth
      .getUser();


  if (userError || !user) {

    window.location.href =
      "login.html";

    return;

  }


  const userId =
    user.id;


  /* =========================================
     БАЗОВИЙ АВАТАР
     ========================================= */

  const defaultAvatar =
    "ua-legion-logo.png";


  /* =========================================
     ДАНІ ПРОФІЛЮ
     ========================================= */

  let currentProfile =
    null;


  /* =========================================
     ПОВІДОМЛЕННЯ
     ========================================= */

  function showMessage(
    text,
    type = ""
  ) {

    if (!profileMessage) {

      return;

    }


    profileMessage.textContent =
      text;

    profileMessage.className =
      "profile-message";


    if (type) {

      profileMessage.classList.add(
        type
      );

    }


    if (type === "success") {

      setTimeout(
        () => {

          profileMessage.textContent =
            "";

          profileMessage.className =
            "profile-message";

        },
        4000
      );

    }

  }


  /* =========================================
     ОНОВЛЕННЯ ІМЕНІ
     ========================================= */

  if (displayName) {

    displayName.addEventListener(
      "input",
      () => {

        const name =
          displayName.value.trim();


        if (profileNamePreview) {

          profileNamePreview.textContent =
            name ||
            user.email ||
            "UA LEGION Member";

        }

      }
    );

  }


  /* =========================================
     ПЕРЕГЛЯД АВАТАРА
     ========================================= */

  if (avatarInput) {

    avatarInput.addEventListener(
      "change",
      () => {

        const file =
          avatarInput.files[0];


        if (!file) {

          return;

        }


        const reader =
          new FileReader();


        reader.onload =
          event => {

            if (profileAvatar) {

              profileAvatar.src =
                event.target.result;

            }

          };


        reader.readAsDataURL(
          file
        );

      }
    );

  }


  /* =========================================
     НАЗВИ НАПРЯМКІВ
     ========================================= */

  const DIRECTION_LABELS = {

    ets2:
      "ETS2",

    trucksmp:
      "ETS2 / TrucksMP",

    wot:
      "World of Tanks",

    dota2:
      "Dota 2",

    wow:
      "World of Warcraft"

  };


  /* =========================================
     НАЗВИ РОЛЕЙ ETS2
     ========================================= */

  const ROLE_LABELS = {

    director:
      "Топ-менеджер ETS2",

    top_manager:
      "Топ-менеджер ETS2",

    manager:
      "Менеджер ETS2",

    logistics_manager:
      "Менеджер з логістики ETS2",

    dispatcher:
      "Диспетчер ETS2",

    recruiter:
      "Рекрутер ETS2",

    instructor:
      "Інструктор ETS2",

    moderator:
      "Модератор ETS2"

  };


  /* =========================================
     НАЗВИ ГЛОБАЛЬНИХ РОЛЕЙ
     ========================================= */

  const GLOBAL_ROLE_LABELS = {

    owner:
      "Власник UA LEGION",

    director:
      "Директор UA LEGION",

    administrator:
      "Адміністратор UA LEGION",

    admin:
      "Адміністратор UA LEGION",

    moderator:
      "Модератор UA LEGION"

  };


  /* =========================================
     НАЗВА НАПРЯМКУ
     ========================================= */

  function getDirectionLabel(
    direction
  ) {

    if (!direction) {

      return "Невідомий напрямок";

    }


    return (
      DIRECTION_LABELS[
        direction
      ] ||
      direction.toUpperCase()
    );

  }


  /* =========================================
     НАЗВА РОЛІ
     ========================================= */

  function getRoleLabel(
    role
  ) {

    if (!role) {

      return "";

    }


    return (
      ROLE_LABELS[
        role
      ] ||
      role
    );

  }


  /* =========================================
     НАЗВА ГЛОБАЛЬНОЇ РОЛІ
     ========================================= */

  function getGlobalRoleLabel(
    role
  ) {

    if (!role) {

      return "";

    }


    return (
      GLOBAL_ROLE_LABELS[
        role
      ] ||
      role
    );

  }


  /* =========================================
     ОТРИМАННЯ КЛАСУ ETS2
     ========================================= */

  function getETS2Class() {

    if (!currentProfile) {

      return null;

    }


    const value =
      currentProfile.ets2_class ||
      currentProfile.ets2_driver_class ||
      currentProfile.driver_class ||
      currentProfile.class ||
      null;


    if (
      !value ||
      String(value).trim() === ""
    ) {

      return null;

    }


    return String(value).trim();

  }


  /* =========================================
     ОТРИМАННЯ ГЛОБАЛЬНОЇ РОЛІ
     ========================================= */

  function getGlobalRole() {

    if (!currentProfile) {

      return null;

    }


    const value =
      currentProfile.global_role ||
      currentProfile.globalRole ||
      null;


    if (
      !value ||
      String(value).trim() === ""
    ) {

      return null;

    }


    return String(value).trim();

  }


  /* =========================================
     ЗАВАНТАЖЕННЯ ПРОФІЛЮ
     ========================================= */

  async function loadProfile() {

    const {
      data: profile,
      error
    } =
      await supabaseClient
        .from("profiles")
        .select("*")
        .eq(
          "id",
          userId
        )
        .maybeSingle();


    if (error) {

      console.error(
        "Помилка завантаження профілю:",
        error
      );

      return;

    }


    currentProfile =
      profile;


    /* ПРОФІЛЬ ЩЕ НЕ СТВОРЕНИЙ */

    if (!profile) {

      if (displayName) {

        displayName.value =
          user.email ||
          "";

      }


      if (profileNamePreview) {

        profileNamePreview.textContent =
          user.email ||
          "UA LEGION Member";

      }


      if (profileAvatar) {

        profileAvatar.src =
          defaultAvatar;

      }


      return;

    }


    /* ІМ'Я */

    if (displayName) {

      displayName.value =
        profile.display_name ||
        "";

    }


    if (profileNamePreview) {

      profileNamePreview.textContent =
        profile.display_name ||
        user.email ||
        "UA LEGION Member";

    }


    /* ДАТА НАРОДЖЕННЯ */

    if (
      profile.birth_date &&
      birthDate
    ) {

      birthDate.value =
        profile.birth_date;

    }


    /* DISCORD USERNAME */

    if (discordUsername) {

      discordUsername.value =
        profile.discord_username ||
        "";

    }


    /* DISCORD ID */

    if (discordUserId) {

      discordUserId.value =
        profile.discord_user_id ||
        "";

    }


    /* STEAM ID */

    if (steamId) {

      steamId.value =
        profile.steam_id ||
        "";

    }


    /* GAME NICKNAME */

    if (gameNickname) {

      gameNickname.value =
        profile.game_nickname ||
        "";

    }


    /* АВАТАР */

    if (profileAvatar) {

      profileAvatar.src =
        profile.avatar_url ||
        defaultAvatar;

    }


    /* НАПРЯМКИ */

    let selectedDirections =
      [];


    if (
      Array.isArray(
        profile.directions
      )
    ) {

      selectedDirections =
        profile.directions;

    }


    document
      .querySelectorAll(
        'input[name="direction"]'
      )
      .forEach(
        checkbox => {

          checkbox.checked =
            selectedDirections.includes(
              checkbox.value
            );

        }
      );

  }


  /* =========================================
     ЗАВАНТАЖЕННЯ АВАТАРА
     ========================================= */

  async function uploadAvatar() {

    if (!avatarInput) {

      return null;

    }


    const file =
      avatarInput.files[0];


    /* ФАЙЛ НЕ ВИБРАНИЙ */

    if (!file) {

      const {
        data: profile
      } =
        await supabaseClient
          .from("profiles")
          .select("avatar_url")
          .eq(
            "id",
            userId
          )
          .maybeSingle();


      return (
        profile?.avatar_url ||
        null
      );

    }


    /* ДОЗВОЛЕНІ ТИПИ */

    const allowedTypes =
      [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp"
      ];


    if (
      !allowedTypes.includes(
        file.type
      )
    ) {

      throw new Error(
        "Дозволені тільки PNG, JPG, JPEG або WEBP."
      );

    }


    const extension =
      file.name
        .split(".")
        .pop()
        .toLowerCase();


    const fileName =
      `avatar-${Date.now()}.${extension}`;


    const filePath =
      `${userId}/${fileName}`;


    const {
      error: uploadError
    } =
      await supabaseClient
        .storage
        .from("avatars")
        .upload(
          filePath,
          file,
          {
            cacheControl:
              "3600",

            upsert:
              false
          }
        );


    if (uploadError) {

      console.error(
        uploadError
      );


      throw new Error(
        "Не вдалося завантажити аватар."
      );

    }


    const {
      data: urlData
    } =
      supabaseClient
        .storage
        .from("avatars")
        .getPublicUrl(
          filePath
        );


    if (
      !urlData ||
      !urlData.publicUrl
    ) {

      throw new Error(
        "Не вдалося отримати URL аватара."
      );

    }


    return urlData.publicUrl;

  }


  /* =========================================
     ЗБІР НАПРЯМКІВ
     ========================================= */

  function getDirections() {

    const directions =
      [];


    document
      .querySelectorAll(
        'input[name="direction"]:checked'
      )
      .forEach(
        checkbox => {

          directions.push(
            checkbox.value
          );

        }
      );


    return directions;

  }


  /* =========================================
     ЗБЕРЕЖЕННЯ ПРОФІЛЮ
     ========================================= */

  if (profileForm) {

    profileForm.addEventListener(
      "submit",
      async event => {

        event.preventDefault();


        try {

          if (saveProfileButton) {

            saveProfileButton.disabled =
              true;

            saveProfileButton.textContent =
              "⏳ ЗБЕРІГАЄМО...";

          }


          showMessage("");


          const avatarUrl =
            await uploadAvatar();


          const directions =
            getDirections();


          const profileData =
            {

              id:
                userId,

              display_name:
                displayName
                  ? displayName.value.trim()
                  : null,

              birth_date:
                birthDate?.value ||
                null,

              discord_username:
                discordUsername?.value.trim() ||
                null,

              discord_user_id:
                discordUserId?.value.trim() ||
                null,

              steam_id:
                steamId?.value.trim() ||
                null,

              game_nickname:
                gameNickname?.value.trim() ||
                null,

              directions:
                directions,

              avatar_url:
                avatarUrl,

              updated_at:
                new Date().toISOString()

            };


          const {
            error
          } =
            await supabaseClient
              .from("profiles")
              .upsert(
                profileData,
                {
                  onConflict:
                    "id"
                }
              );


          if (error) {

            console.error(
              error
            );


            throw new Error(
              error.message
            );

          }


          currentProfile =
            {
              ...(currentProfile || {}),
              ...profileData
            };


          if (
            avatarUrl &&
            profileAvatar
          ) {

            profileAvatar.src =
              avatarUrl;

          }


          if (profileNamePreview) {

            profileNamePreview.textContent =
              displayName?.value.trim() ||
              user.email;

          }


          showMessage(
            "Профіль успішно збережено ✓",
            "success"
          );


          await loadRoles();


        } catch (error) {

          console.error(
            "Помилка:",
            error
          );


          showMessage(
            error.message ||
            "Помилка збереження профілю.",
            "error"
          );

        } finally {

          if (saveProfileButton) {

            saveProfileButton.disabled =
              false;

            saveProfileButton.textContent =
              "💾 ЗБЕРЕГТИ ПРОФІЛЬ";

          }

        }

      }
    );

  }


  /* =========================================
     МОЯ ЗАЯВКА
     ========================================= */

  async function loadApplication() {

    if (!applicationStatus) {

      return;

    }


    const {
      data: application,
      error
    } =
      await supabaseClient
        .from("applications")
        .select("*")
        .eq(
          "user_id",
          userId
        )
        .order(
          "created_at",
          {
            ascending:
              false
          }
        )
        .limit(1)
        .maybeSingle();


    if (error) {

      console.error(
        "Помилка заявки:",
        error
      );


      applicationStatus.className =
        "application-card none";


      applicationStatus.innerHTML =
        `
          <h3>ℹ️ Заявку не знайдено</h3>
          <p>Не вдалося завантажити інформацію про заявку.</p>
        `;


      return;

    }


    /* ЗАЯВКИ НЕМАЄ */

    if (!application) {

      applicationStatus.className =
        "application-card none";


      applicationStatus.innerHTML =
        `
          <h3>📄 Заявки немає</h3>
          <p>Ви ще не подавали заявку до UA LEGION.</p>
        `;


      return;

    }


    const status =
      String(
        application.status ||
        ""
      )
      .toLowerCase();


    /* ПРИЙНЯТО */

    if (
      status === "approved" ||
      status === "accepted"
    ) {

      applicationStatus.className =
        "application-card approved";


      applicationStatus.innerHTML =
        `
          <h3>✓ Заявку прийнято</h3>
          <p>Вітаємо у UA LEGION!</p>
        `;


      return;

    }


    /* ВІДХИЛЕНО */

    if (
      status === "rejected" ||
      status === "declined"
    ) {

      applicationStatus.className =
        "application-card rejected";


      applicationStatus.innerHTML =
        `
          <h3>✕ Заявку відхилено</h3>
          <p>На жаль, вашу заявку було відхилено.</p>
        `;


      return;

    }


    /* НА РОЗГЛЯДІ */

    applicationStatus.className =
      "application-card pending";


    applicationStatus.innerHTML =
      `
        <h3>⏳ Заявка на розгляді</h3>
        <p>Ваша заявка очікує рішення адміністрації.</p>
      `;

  }


  /* =========================================
     МОЇ РОЛІ
     ========================================= */

  async function loadRoles() {

    if (!rolesList) {

      return;

    }


    rolesList.innerHTML =
      `
        <div class="roles-empty">
          ⏳ Завантаження ролей...
        </div>
      `;


    try {

      /* =====================================
         ГОЛОВНИЙ ЗАПИТ ДО ТВОЄЇ ТАБЛИЦІ
         ===================================== */

      const {
        data: roleRows,
        error
      } =
        await supabaseClient
          .from("user_direction_roles")
          .select(
            "direction, role"
          )
          .eq(
            "user_id",
            userId
          )
          .order(
            "created_at",
            {
              ascending:
                true
            }
          );


      if (error) {

        console.error(
          "Помилка завантаження ролей:",
          error
        );


        rolesList.innerHTML =
          `
            <div class="roles-empty">
              ⚠️ Не вдалося завантажити ролі.
            </div>
          `;


        return;

      }


      const rows =
        Array.isArray(roleRows)
          ? roleRows
          : [];


      /* =====================================
         ЗБИРАЄМО ВСІ НАПРЯМКИ
         ===================================== */

      const directions =
        new Set();


      /* НАПРЯМКИ З ПРОФІЛЮ */

      if (
        currentProfile &&
        Array.isArray(
          currentProfile.directions
        )
      ) {

        currentProfile.directions.forEach(
          direction => {

            if (direction) {

              directions.add(
                direction
              );

            }

          }
        );

      }


      /* НАПРЯМКИ З РОЛЕЙ */

      rows.forEach(
        row => {

          if (
            row.direction
          ) {

            directions.add(
              row.direction
            );

          }

        }
      );


      /* ETS2 КЛАС ТЕЖ ОЗНАЧАЄ НАПРЯМОК ETS2 */

      const ets2Class =
        getETS2Class();


      if (ets2Class) {

        directions.add(
          "ets2"
        );

      }


      /* ЯКЩО НАПРЯМКІВ НЕМАЄ */

      if (
        directions.size === 0
      ) {

        rolesList.innerHTML =
          `
            <div class="roles-empty">
              🏅 Ролі та посади ще не призначені.
            </div>
          `;


        return;

      }


      /* =====================================
         ГРУПУЄМО ПОСАДИ ЗА НАПРЯМКАМИ
         ===================================== */

      const rolesByDirection =
        {};


      rows.forEach(
        row => {

          if (
            !row.direction ||
            !row.role
          ) {

            return;

          }


          if (
            !rolesByDirection[
              row.direction
            ]
          ) {

            rolesByDirection[
              row.direction
            ] =
              [];

          }


          rolesByDirection[
            row.direction
          ].push(
            row.role
          );

        }
      );


      /* =====================================
         ГЛОБАЛЬНА РОЛЬ
         ===================================== */

      const globalRole =
        getGlobalRole();


      /* =====================================
         ОЧИЩАЄМО СПИСОК
         ===================================== */

      rolesList.innerHTML =
        "";


      /* =====================================
         ГЛОБАЛЬНА КАРТКА
         ПОКАЗУЄТЬСЯ ТІЛЬКИ ЯКЩО Є РОЛЬ
         ===================================== */

      if (globalRole) {

        const globalCard =
          document.createElement(
            "div"
          );


        globalCard.className =
          "role-card global";


        globalCard.innerHTML =
          `
            <h3>
              ${getGlobalRoleLabel(globalRole)}
            </h3>

            <p>
              Глобальна роль
            </p>
          `;


        rolesList.appendChild(
          globalCard
        );

      }


      /* =====================================
         КАРТКИ НАПРЯМКІВ
         ===================================== */

      directions.forEach(
        direction => {

          const card =
            document.createElement(
              "div"
            );


          card.className =
            "role-card";


          const directionName =
            getDirectionLabel(
              direction
            );


          const directionRoles =
            rolesByDirection[
              direction
            ] ||
            [];


          /* УНІКАЛЬНІ ПОСАДИ */

          const uniqueRoles =
            [
              ...new Set(
                directionRoles
              )
            ];


          /* =================================
             ЗАГОЛОВОК
             ================================= */

          let html =
            `
              <h3>
                Напрямок: ${directionName}
              </h3>
            `;


          /* =================================
             ПОСАДИ

             ЯКЩО ЇХ НЕМАЄ —
             РЯДОК НЕ ПОКАЗУЄМО
             ================================= */

          if (
            uniqueRoles.length > 0
          ) {

            const rolesText =
              uniqueRoles
                .map(
                  role =>
                    getRoleLabel(
                      role
                    )
                )
                .join(
                  " + "
                );


            html +=
              `
                <p>
                  <strong>
                    Посади ${directionName}:
                  </strong>
                  ${rolesText}
                </p>
              `;

          }


          /* =================================
             КЛАС

             ТІЛЬКИ ДЛЯ ETS2
             ================================= */

          if (
            direction === "ets2" &&
            ets2Class
          ) {

            html +=
              `
                <p style="margin-top: 8px;">
                  <strong>
                    Клас:
                  </strong>
                  ${ets2Class}
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


      /* =====================================
         ЯКЩО Є ГЛОБАЛЬНА РОЛЬ,
         АЛЕ НЕМАЄ НАПРЯМКІВ
         ===================================== */

      if (
        directions.size === 0 &&
        globalRole
      ) {

        return;

      }


    } catch (error) {

      console.error(
        "Критична помилка ролей:",
        error
      );


      rolesList.innerHTML =
        `
          <div class="roles-empty">
            ⚠️ Не вдалося завантажити ролі.
          </div>
        `;

    }

  }


  /* =========================================
     ВИХІД
     ========================================= */

  if (logoutButton) {

    logoutButton.addEventListener(
      "click",
      async () => {

        try {

          await supabaseClient
            .auth
            .signOut();

        } catch (error) {

          console.error(
            "Помилка виходу:",
            error
          );

        }


        window.location.href =
          "index.html";

      }
    );

  }


  /* =========================================
     КНОПКА ПОДАЧІ ЗАЯВКИ
     ========================================= */

  if (joinButton) {

    joinButton.addEventListener(
      "click",
      () => {

        window.location.href =
          "applications.html";

      }
    );

  }


  /* =========================================
     ЗАПУСК
     ========================================= */

  try {

    await loadProfile();

    await loadApplication();

    await loadRoles();

  } catch (error) {

    console.error(
      "Помилка ініціалізації профілю:",
      error
    );

  }

});
