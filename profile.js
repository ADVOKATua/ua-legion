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


    /* ЯКЩО НОВИЙ ФАЙЛ НЕ ВИБРАНИЙ */

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


    /* ПЕРЕВІРКА ТИПУ */

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


    /* РОЗШИРЕННЯ */

    const extension =
      file.name
        .split(".")
        .pop()
        .toLowerCase();


    const fileName =
      `avatar-${Date.now()}.${extension}`;


    const filePath =
      `${userId}/${fileName}`;


    /* ЗАВАНТАЖЕННЯ */

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
            cacheControl: "3600",
            upsert: false
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


    /* PUBLIC URL */

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


          /* АВАТАР */

          const avatarUrl =
            await uploadAvatar();


          /* НАПРЯМКИ */

          const directions =
            getDirections();


          /* ДАНІ ПРОФІЛЮ */

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


          /* UPSERT */

          const {
            error
          } =
            await supabaseClient
              .from("profiles")
              .upsert(
                profileData,
                {
                  onConflict: "id"
                }
              );


          if (error) {

            console.error(error);

            throw new Error(
              error.message
            );

          }


          /* ОНОВЛЕННЯ АВАТАРА */

          if (
            avatarUrl &&
            profileAvatar
          ) {

            profileAvatar.src =
              avatarUrl;

          }


          /* ОНОВЛЕННЯ ІМЕНІ */

          if (profileNamePreview) {

            profileNamePreview.textContent =
              displayName?.value.trim() ||
              user.email;

          }


          showMessage(
            "Профіль успішно збережено ✓",
            "success"
          );


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
            ascending: false
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
          <p>
            Ви ще не подавали заявку до UA LEGION.
          </p>
        `;


      return;

    }


    /* НЕМАЄ ЗАЯВКИ */

    if (!application) {

      applicationStatus.className =
        "application-card none";


      applicationStatus.innerHTML =
        `
          <h3>📄 Заявки немає</h3>
          <p>
            Ви ще не подавали заявку до UA LEGION.
          </p>
        `;


      if (joinButton) {

        joinButton.style.display =
          "inline-flex";

      }


      return;

    }


    const status =
      (
        application.status ||
        "pending"
      )
      .toLowerCase();


    /* ОЧІКУЄ */

    if (status === "pending") {

      applicationStatus.className =
        "application-card pending";


      applicationStatus.innerHTML =
        `
          <h3>⏳ Заявка на розгляді</h3>
          <p>
            Ваша заявка очікує перевірки адміністрацією.
          </p>
        `;


      return;

    }


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
          <p>
            Вітаємо у UA LEGION!
          </p>
        `;


      if (joinButton) {

        joinButton.style.display =
          "none";

      }


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
          <h3>❌ Заявку відхилено</h3>
          <p>
            Ваша заявка була відхилена.
            Ви можете подати нову заявку.
          </p>
        `;


      if (joinButton) {

        joinButton.style.display =
          "inline-flex";

      }


      return;

    }


    /* ІНШИЙ СТАТУС */

    applicationStatus.className =
      "application-card";


    applicationStatus.innerHTML =
      `
        <h3>📋 Статус: ${status}</h3>
        <p>
          Перевірте інформацію пізніше.
        </p>
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


    /* =========================================
       1. РОЛІ ЗА НАПРЯМКАМИ
       user_direction_roles
       ========================================= */

    const {
      data: directionRoles,
      error: directionRolesError
    } =
      await supabaseClient
        .from("user_direction_roles")
        .select(
          `
            id,
            user_id,
            direction,
            role,
            created_at
          `
        )
        .eq(
          "user_id",
          userId
        );


    if (directionRolesError) {

      console.error(
        "Помилка завантаження ролей напрямків:",
        directionRolesError
      );

    }


    /* =========================================
       2. ГЛОБАЛЬНІ РОЛІ
       user_roles
       ========================================= */

    const {
      data: globalUserRoles,
      error: globalRolesError
    } =
      await supabaseClient
        .from("user_roles")
        .select(
          `
            id,
            user_id,
            role_id,
            direction_id
          `
        )
        .eq(
          "user_id",
          userId
        )
        .is(
          "direction_id",
          null
        );


    if (globalRolesError) {

      console.error(
        "Помилка завантаження глобальних ролей:",
        globalRolesError
      );

    }


    /* =========================================
       ОЧИЩЕННЯ СПИСКУ
       ========================================= */

    rolesList.innerHTML =
      "";


    let rolesFound =
      false;


    /* =========================================
       ГЛОБАЛЬНІ РОЛІ
       ========================================= */

    if (
      globalUserRoles &&
      globalUserRoles.length > 0
    ) {

      const roleIds =
        globalUserRoles
          .map(
            item => item.role_id
          )
          .filter(
            Boolean
          );


      if (roleIds.length > 0) {

        const {
          data: roles,
          error: rolesError
        } =
          await supabaseClient
            .from("roles")
            .select(
              `
                id,
                name,
                code
              `
            )
            .in(
              "id",
              roleIds
            );


        if (rolesError) {

          console.error(
            "Помилка отримання назв глобальних ролей:",
            rolesError
          );

        } else {

          globalUserRoles.forEach(
            userRole => {

              const role =
                roles?.find(
                  item =>
                    item.id ===
                    userRole.role_id
                );


              if (!role) {

                return;

              }


              createRoleCard(
                role.name,
                "Глобальна роль",
                role.code,
                true
              );


              rolesFound =
                true;

            }
          );

        }

      }

    }


    /* =========================================
       РОЛІ ЗА НАПРЯМКАМИ
       ========================================= */

    if (
      directionRoles &&
      directionRoles.length > 0
    ) {

      directionRoles.forEach(
        item => {

          const directionName =
            getDirectionName(
              item.direction
            );


          const roleName =
            getRoleName(
              item.role
            );


          createRoleCard(
            roleName,
            directionName,
            item.role,
            false
          );


          rolesFound =
            true;

        }
      );

    }


    /* =========================================
       НЕМАЄ РОЛЕЙ
       ========================================= */

    if (!rolesFound) {

      rolesList.innerHTML =
        `
          <div class="roles-empty">
            🏅 У вас поки що немає
            призначених ролей.
          </div>
        `;

    }

  }


  /* =========================================
     НАЗВИ НАПРЯМКІВ
     ========================================= */

  function getDirectionName(
    direction
  ) {

    const directions =
      {

        ets2:
          "🚛 ETS2 / TruckersMP",

        wot:
          "🪖 World of Tanks",

        dota2:
          "⚔️ Dota 2",

        wow:
          "🐉 World of Warcraft"

      };


    return (
      directions[direction] ||
      direction ||
      "UA LEGION"
    );

  }


  /* =========================================
     НАЗВИ ПОСАД
     ========================================= */

  function getRoleName(
    role
  ) {

    const roles =
      {

        director:
          "Директор",

        deputy_director:
          "Заступник директора",

        top_manager:
          "Топ-менеджер",

        manager:
          "Менеджер",

        logistics_manager:
          "Менеджер з логістики",

        recruiter:
          "Рекрутер",

        member:
          "Учасник",

        moderator:
          "Модератор",

        admin:
          "Адміністратор",

        owner:
          "Власник"

      };


    return (
      roles[role] ||
      role ||
      "Учасник"
    );

  }


  /* =========================================
     СТВОРЕННЯ КАРТКИ РОЛІ
     ========================================= */

  function createRoleCard(
    roleName,
    directionName,
    roleCode,
    forceGlobal = false
  ) {

    if (!rolesList) {

      return;

    }


    const normalizedCode =
      (
        roleCode ||
        ""
      )
      .toLowerCase();


    const isGlobal =
      forceGlobal ||
      normalizedCode === "owner" ||
      normalizedCode === "admin" ||
      normalizedCode === "administrator";


    let icon =
      "🏅";


    if (
      normalizedCode === "director"
    ) {

      icon =
        "👔";

    }


    if (
      normalizedCode ===
      "deputy_director"
    ) {

      icon =
        "🎖️";

    }


    if (
      normalizedCode ===
      "top_manager"
    ) {

      icon =
        "📊";

    }


    if (
      normalizedCode ===
      "manager"
    ) {

      icon =
        "💼";

    }


    if (
      normalizedCode ===
      "logistics_manager"
    ) {

      icon =
        "🚛";

    }


    if (
      normalizedCode ===
      "recruiter"
    ) {

      icon =
        "🤝";

    }


    if (
      normalizedCode ===
      "moderator"
    ) {

      icon =
        "🛡️";

    }


    if (
      normalizedCode === "admin" ||
      normalizedCode === "administrator"
    ) {

      icon =
        "⚔️";

    }


    if (
      normalizedCode === "owner"
    ) {

      icon =
        "🇺🇦";

    }


    const roleCard =
      document.createElement(
        "div"
      );


    roleCard.className =
      isGlobal
        ? "role-card global"
        : "role-card";


    roleCard.innerHTML =
      `
        <h3>
          ${icon}
          ${roleName}
        </h3>

        <p>
          ${directionName}
        </p>
      `;


    rolesList.appendChild(
      roleCard
    );

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


          window.location.href =
            "login.html";


        } catch (error) {

          console.error(error);


          showMessage(
            "Помилка виходу з акаунта.",
            "error"
          );

        }

      }
    );

  }


  /* =========================================
     ЗАВАНТАЖЕННЯ ВСІЄЇ ІНФОРМАЦІЇ
     ========================================= */

  await Promise.all(
    [

      loadProfile(),

      loadApplication(),

      loadRoles()

    ]
  );

});
