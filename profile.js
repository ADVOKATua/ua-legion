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

    console.error(
      "Supabase client не знайдено."
    );

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
     НАЗВИ НАПРЯМКІВ
     ========================================= */

  const directionNames = {

    ets2:
      "🚛 ETS2 / TruckersMP",

    wot:
      "🪖 World of Tanks",

    dota2:
      "⚔️ Dota 2",

    wow:
      "🐉 World of Warcraft"

  };


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


    /* -----------------------------------------
       ПРОФІЛЬ ЩЕ НЕ СТВОРЕНИЙ
       ----------------------------------------- */

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


    /* -----------------------------------------
       ІМ'Я
       ----------------------------------------- */

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


    /* -----------------------------------------
       ДАТА НАРОДЖЕННЯ
       ----------------------------------------- */

    if (
      profile.birth_date &&
      birthDate
    ) {

      birthDate.value =
        profile.birth_date;

    }


    /* -----------------------------------------
       DISCORD USERNAME
       ----------------------------------------- */

    if (discordUsername) {

      discordUsername.value =
        profile.discord_username ||
        "";

    }


    /* -----------------------------------------
       DISCORD ID
       ----------------------------------------- */

    if (discordUserId) {

      discordUserId.value =
        profile.discord_user_id ||
        "";

    }


    /* -----------------------------------------
       STEAM ID
       ----------------------------------------- */

    if (steamId) {

      steamId.value =
        profile.steam_id ||
        "";

    }


    /* -----------------------------------------
       GAME NICKNAME
       ----------------------------------------- */

    if (gameNickname) {

      gameNickname.value =
        profile.game_nickname ||
        "";

    }


    /* -----------------------------------------
       АВАТАР
       ----------------------------------------- */

    if (profileAvatar) {

      profileAvatar.src =
        profile.avatar_url ||
        defaultAvatar;

    }

  }


  /* =========================================
     ЗАВАНТАЖЕННЯ НАПРЯМКІВ КОРИСТУВАЧА

     user_directions
        ↓
     directions
     ========================================= */

  async function loadUserDirections() {

    const {
      data: userDirections,
      error
    } =
      await supabaseClient
        .from("user_directions")
        .select(`
          direction_id,
          directions (
            id,
            code,
            slug,
            name
          )
        `)
        .eq(
          "user_id",
          userId
        )
        .eq(
          "status",
          "active"
        );


    if (error) {

      console.error(
        "Помилка завантаження напрямків:",
        error
      );

      return;

    }


    /* Спочатку знімаємо всі галочки */

    document
      .querySelectorAll(
        'input[name="direction"]'
      )
      .forEach(
        checkbox => {

          checkbox.checked =
            false;

        }
      );


    if (
      !userDirections ||
      userDirections.length === 0
    ) {

      return;

    }


    userDirections.forEach(
      item => {

        const direction =
          Array.isArray(
            item.directions
          )
            ? item.directions[0]
            : item.directions;


        if (!direction) {

          return;

        }


        const code =
          direction.code ||
          direction.slug;


        if (!code) {

          return;

        }


        const checkbox =
          document.querySelector(
            `input[name="direction"][value="${code}"]`
          );


        if (checkbox) {

          checkbox.checked =
            true;

        }

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


    /* Якщо файл не вибраний */

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
     СИНХРОНІЗАЦІЯ НАПРЯМКІВ

     checkbox
        ↓
     directions
        ↓
     user_directions
     ========================================= */

  async function saveUserDirections(
    selectedDirections
  ) {

    /* Отримуємо всі напрямки */

    const {
      data: directions,
      error: directionsError
    } =
      await supabaseClient
        .from("directions")
        .select(`
          id,
          code,
          slug
        `);


    if (directionsError) {

      throw new Error(
        directionsError.message
      );

    }


    /* Видаляємо старі напрямки користувача */

    const {
      error: deleteError
    } =
      await supabaseClient
        .from("user_directions")
        .delete()
        .eq(
          "user_id",
          userId
        );


    if (deleteError) {

      throw new Error(
        deleteError.message
      );

    }


    /* Якщо нічого не вибрано */

    if (
      !selectedDirections ||
      selectedDirections.length === 0
    ) {

      return;

    }


    const rows =
      [];


    selectedDirections.forEach(
      selectedCode => {

        const direction =
          directions.find(
            item =>
              item.code === selectedCode ||
              item.slug === selectedCode
          );


        if (!direction) {

          return;

        }


        rows.push(
          {

            user_id:
              userId,

            direction_id:
              direction.id,

            status:
              "active",

            /*
              Для ETS2 залишаємо клас водія.
              Для інших напрямків він може бути null.
            */

            driver_class:
              selectedCode === "ets2"
                ? "A"
                : null

          }
        );

      }
    );


    if (rows.length === 0) {

      return;

    }


    const {
      error: insertError
    } =
      await supabaseClient
        .from("user_directions")
        .insert(
          rows
        );


    if (insertError) {

      throw new Error(
        insertError.message
      );

    }

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


          /* -------------------------------
             АВАТАР
             ------------------------------- */

          const avatarUrl =
            await uploadAvatar();


          /* -------------------------------
             НАПРЯМКИ
             ------------------------------- */

          const selectedDirections =
            getDirections();


          /* -------------------------------
             ДАНІ ПРОФІЛЮ
             ------------------------------- */

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


              /*
                Залишаємо також у profiles
                для сумісності зі старими даними.
              */

              directions:
                selectedDirections,


              avatar_url:
                avatarUrl,


              updated_at:
                new Date().toISOString()

            };


          /* -------------------------------
             ЗБЕРЕЖЕННЯ ПРОФІЛЮ
             ------------------------------- */

          const {
            error: profileError
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


          if (profileError) {

            throw new Error(
              profileError.message
            );

          }


          /* -------------------------------
             ЗБЕРЕЖЕННЯ НАПРЯМКІВ
             ------------------------------- */

          await saveUserDirections(
            selectedDirections
          );


          /* -------------------------------
             ОНОВЛЕННЯ АВАТАРА
             ------------------------------- */

          if (
            avatarUrl &&
            profileAvatar
          ) {

            profileAvatar.src =
              avatarUrl;

          }


          /* -------------------------------
             ОНОВЛЕННЯ ІМЕНІ
             ------------------------------- */

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

     НОВА СТРУКТУРА:

     user_direction_roles
        ↓
     direction + role
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


    const {
      data: userRoles,
      error
    } =
      await supabaseClient
        .from("user_direction_roles")
        .select(`
          id,
          user_id,
          direction,
          role,
          created_at
        `)
        .eq(
          "user_id",
          userId
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


    if (
      !userRoles ||
      userRoles.length === 0
    ) {

      rolesList.innerHTML =
        `
          <div class="roles-empty">
            🏅 У вас поки що немає призначених ролей.
          </div>
        `;


      return;

    }


    rolesList.innerHTML =
      "";


    userRoles.forEach(
      userRole => {


        const roleCode =
          (
            userRole.role ||
            "member"
          )
          .toLowerCase();


        const directionCode =
          (
            userRole.direction ||
            ""
          )
          .toLowerCase();


        /* -------------------------------------
           НАЗВА РОЛІ
           ------------------------------------- */

        const roleNames =
          {

            member:
              "Учасник",

            driver:
              "Водій",

            director:
              "Керівник напрямку",

            moderator:
              "Модератор",

            admin:
              "Адміністратор",

            administrator:
              "Адміністратор",

            owner:
              "Власник"

          };


        const roleName =
          roleNames[roleCode] ||
          userRole.role ||
          "Учасник";


        /* -------------------------------------
           НАЗВА НАПРЯМКУ
           ------------------------------------- */

        const directionName =
          directionNames[directionCode] ||
          directionCode ||
          "UA LEGION";


        /* -------------------------------------
           ГЛОБАЛЬНА РОЛЬ
           ------------------------------------- */

        const isGlobal =
          roleCode === "owner" ||
          roleCode === "admin" ||
          roleCode === "administrator";


        /* -------------------------------------
           КАРТКА
           ------------------------------------- */

        const roleCard =
          document.createElement(
            "div"
          );


        roleCard.className =
          isGlobal
            ? "role-card global"
            : "role-card";


        /* -------------------------------------
           ІКОНКА
           ------------------------------------- */

        let icon =
          "🏅";


        if (
          roleCode === "driver"
        ) {

          icon =
            "🚛";

        }


        if (
          roleCode === "director"
        ) {

          icon =
            "👑";

        }


        if (
          roleCode === "moderator"
        ) {

          icon =
            "🛡️";

        }


        if (
          roleCode === "admin" ||
          roleCode === "administrator"
        ) {

          icon =
            "⚔️";

        }


        if (
          roleCode === "owner"
        ) {

          icon =
            "🇺🇦";

        }


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

          console.error(
            error
          );


          showMessage(
            "Помилка виходу з акаунта.",
            "error"
          );

        }

      }
    );

  }


  /* =========================================
     ЗАВАНТАЖЕННЯ СТОРІНКИ
     ========================================= */

  await Promise.all(
    [

      loadProfile(),

      loadUserDirections(),

      loadApplication(),

      loadRoles()

    ]
  );

});
