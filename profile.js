// ======================================
// UA LEGION — PROFILE SYSTEM
// profile.js
// ======================================

document.addEventListener("DOMContentLoaded", async () => {

  // ======================================
  // SUPABASE
  // ======================================

  const supabase = window.supabaseClient;

  if (!supabase) {

    console.error(
      "Supabase не підключений"
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
  } = await supabase.auth.getUser();


  if (userError || !user) {

    window.location.href =
      "login.html";

    return;
  }


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

  let currentAvatarUrl = null;

  let previewObjectUrl = null;


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

  function escapeHtml(value) {

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
  // ІКОНКА GLOBAL РОЛІ
  // ======================================

  function getGlobalRoleIcon(
    roleCode
  ) {

    switch (roleCode) {

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
  // НАЗВА КЛАСУ ETS2
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


    return (
      names[driverClass] ||
      `Клас ${driverClass}`
    );

  }


  // ======================================
  // ПОПЕРЕДНІЙ ПЕРЕГЛЯД АВАТАРА
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


        // -------------------------------
        // ПЕРЕВІРКА ТИПУ
        // -------------------------------

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


        // -------------------------------
        // ПЕРЕВІРКА РОЗМІРУ
        // -------------------------------

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


        // -------------------------------
        // СТАРИЙ PREVIEW
        // -------------------------------

        if (previewObjectUrl) {

          URL.revokeObjectURL(
            previewObjectUrl
          );

        }


        // -------------------------------
        // НОВИЙ PREVIEW
        // -------------------------------

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
  // ЗАВАНТАЖЕННЯ ОСОБИСТОГО ПРОФІЛЮ
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
        "PROFILE: Помилка завантаження профілю:",
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


    // ==================================
    // ІМ'Я
    // ==================================

    if (displayName) {

      displayName.value =
        profile.display_name || "";

    }


    if (profileNamePreview) {

      profileNamePreview.textContent =
        profile.display_name ||
        "Учасник UA LEGION";

    }


    // ==================================
    // ДАТА НАРОДЖЕННЯ
    // ==================================

    if (birthDate) {

      birthDate.value =
        profile.birth_date || "";

    }


    // ==================================
    // АВАТАР
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


    // ==================================
    // DISCORD ID
    // ==================================

    if (discordUserId) {

      discordUserId.value =
        profile.discord_user_id ||
        "";

    }


    // ==================================
    // STEAM ID
    // ==================================

    if (steamId) {

      steamId.value =
        profile.steam_id ||
        "";

    }


    // ==================================
    // ІГРОВИЙ НІК
    // ==================================

    if (gameNickname) {

      gameNickname.value =
        profile.game_nickname ||
        "";

    }

  }


  // ======================================
  // ЗАВАНТАЖЕННЯ RBAC
  //
  // ЄДИНЕ ДЖЕРЕЛО:
  // get_user_direction_management()
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
    } = await supabase.rpc(
      "get_user_direction_management",
      {
        p_target_user_id:
          user.id
      }
    );


    if (error) {

      console.error(
        "PROFILE: Помилка get_user_direction_management:",
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
        "PROFILE: Некоректна відповідь RBAC:",
        data
      );

      rolesList.innerHTML = `
        <div class="roles-empty">
          Не вдалося отримати інформацію про ролі.
        </div>
      `;

      return null;
    }


    console.log(
      "PROFILE: RBAC:",
      data
    );


    // ----------------------------------
    // ЗБЕРІГАЄМО СТАН
    // ----------------------------------

    window.currentUserRoles =
      data;


    // ----------------------------------
    // РЕНДЕР
    // ----------------------------------

    renderUserRoles(
      data.global_roles || [],
      data.directions || []
    );


    // ----------------------------------
    // ОНОВЛЮЄМО НАПРЯМКИ
    // ----------------------------------

    renderManagedDirections(
      data.directions || []
    );


    return data;

  }


  // ======================================
  // ВІДОБРАЖЕННЯ РОЛЕЙ
  // + НАПРЯМКІВ
  // + КЛАСУ ETS2
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
    // GLOBAL РОЛІ
    // ==================================

    globalRoles.forEach(
      role => {

        const roleCard =
          document.createElement(
            "div"
          );


        roleCard.className =
          "role-card global";


        const roleIcon =
          getGlobalRoleIcon(
            role.code
          );


        const roleName =
          escapeHtml(
            role.name ||
            "Невідома роль"
          );


        roleCard.innerHTML = `
          <h3>
            ${roleIcon}
            ${roleName}
          </h3>

          <p>
            Глобальна роль
          </p>
        `;


        rolesList.appendChild(
          roleCard
        );

      }
    );


    // ==================================
    // НАПРЯМКИ
    // ==================================

    directions.forEach(
      direction => {

        // --------------------------------
        // ВРАХОВУЄМО ТІЛЬКИ ACTIVE
        // --------------------------------

        if (
          direction.status &&
          direction.status !== "active"
        ) {

          return;
        }


        const directionCard =
          document.createElement(
            "div"
          );


        directionCard.className =
          "role-card";


        const icon =
          escapeHtml(
            direction.icon ||
            "📍"
          );


        const name =
          escapeHtml(
            direction.name ||
            direction.slug ||
            "Невідомий напрямок"
          );


        let html = `
          <h3>
            ${icon}
            ${name}
          </h3>
        `;


        // --------------------------------
        // ПОСАДИ
        // --------------------------------

        const directionRoles =
          Array.isArray(
            direction.roles
          )
            ? direction.roles
            : [];


        if (
          directionRoles.length > 0
        ) {

          const roleNames =
            directionRoles
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


        // --------------------------------
        // КЛАС ETS2
        // --------------------------------

        const directionSlug =
          String(
            direction.slug ||
            direction.code ||
            ""
          )
            .trim()
            .toLowerCase();


        if (
          directionSlug === "ets2" &&
          direction.driver_class
        ) {

          const driverClass =
            String(
              direction.driver_class
            )
              .trim()
              .toUpperCase();


          const driverClassName =
            getDriverClassName(
              driverClass
            );


          html += `
            <p>
              Клас водія:
              <strong>
                ${escapeHtml(
                  driverClassName
                )}
              </strong>
            </p>
          `;

        }


        directionCard.innerHTML =
          html;


        rolesList.appendChild(
          directionCard
        );

      }
    );


    // ==================================
    // НІЧОГО НЕМАЄ
    // ==================================

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
  // НАПРЯМКИ В ОСОБИСТОМУ ПРОФІЛІ
  //
  // ТЕПЕР ЦЕ ТІЛЬКИ ВІДОБРАЖЕННЯ.
  //
  // КЕРУВАННЯ ЧЛЕНСТВОМ:
  // member.html
  //
  // ДЖЕРЕЛО:
  // user_directions
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


    // ----------------------------------
    // ОЧИЩАЄМО СТАН
    // ----------------------------------

    checkboxes.forEach(
      checkbox => {

        checkbox.checked =
          false;

        // Напрямками керує адміністрація
        checkbox.disabled =
          true;

      }
    );


    // ----------------------------------
    // ВСТАНОВЛЮЄМО ACTIVE
    // ----------------------------------

    directions.forEach(
      direction => {

        if (
          direction.status &&
          direction.status !== "active"
        ) {

          return;
        }


        const slug =
          String(
            direction.slug ||
            direction.code ||
            ""
          )
            .trim()
            .toLowerCase();


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
  // СТАТУС ЗАЯВКИ
  //
  // ПОКАЗУЄМО ОСТАННЮ ЗАЯВКУ
  // ======================================

  async function loadApplicationStatus() {

    if (!applicationStatus) {
      return;
    }


    applicationStatus.className =
      "application-card";


    applicationStatus.innerHTML = `
      <h3>
        📝 Моя заявка
      </h3>

      <p>
        Завантаження заявки...
      </p>
    `;


    const {
      data: applications,
      error
    } = await supabase
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
      )
      .limit(1);


    if (error) {

      console.error(
        "PROFILE: Помилка завантаження заявки:",
        error
      );


      applicationStatus.className =
        "application-card rejected";


      applicationStatus.innerHTML = `
        <h3>
          ⚠️ Не вдалося перевірити заявку
        </h3>

        <p>
          ${escapeHtml(
            error.message
          )}
        </p>
      `;


      return;
    }


    // ==================================
    // ЗАЯВОК НЕМАЄ
    // ==================================

    if (
      !applications ||
      applications.length === 0
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
      applications[0];


    console.log(
      "PROFILE: Остання заявка:",
      application
    );


    // ==================================
    // ВИЗНАЧАЄМО НАПРЯМОК
    // ==================================

    let direction =
      null;


    if (
      application.direction !==
        null &&
      application.direction !==
        undefined &&
      String(
        application.direction
      ).trim() !== ""
    ) {

      direction =
        String(
          application.direction
        )
          .trim()
          .toLowerCase();

    }


    if (
      !direction &&
      Array.isArray(
        application.directions
      ) &&
      application.directions.length >
        0
    ) {

      direction =
        String(
          application.directions[0]
        )
          .trim()
          .toLowerCase();

    }


    if (
      !direction &&
      typeof application.directions ===
        "string"
    ) {

      const value =
        application.directions.trim();


      if (value) {

        direction =
          value
            .replace(
              /[\[\]"]/g,
              ""
            )
            .trim()
            .toLowerCase();

      }

    }


    // ==================================
    // НАЗВИ НАПРЯМКІВ
    // ==================================

    const directionNames = {

      ets2:
        "🚛 ETS2 / TruckersMP",

      "ets2 / truckersmp":
        "🚛 ETS2 / TruckersMP",

      ets:
        "🚛 ETS2 / TruckersMP",

      wot:
        "🪖 World of Tanks",

      "world of tanks":
        "🪖 World of Tanks",

      dota2:
        "🎮 Dota 2",

      dota:
        "🎮 Dota 2",

      "dota 2":
        "🎮 Dota 2",

      wow:
        "⚔️ World of Warcraft",

      "world of warcraft":
        "⚔️ World of Warcraft"

    };


    const directionName =
      directionNames[
        String(
          direction || ""
        )
          .trim()
          .toLowerCase()
      ] ||
      (
        direction
          ? "📍 " +
            String(
              direction
            ).toUpperCase()
          : "📍 Невідомий напрямок"
      );


    // ==================================
    // СТАТУС
    // ==================================

    const status =
      String(
        application.status ||
        ""
      )
        .trim()
        .toLowerCase();


    console.log(
      "PROFILE: Напрямок:",
      direction
    );


    console.log(
      "PROFILE: Статус:",
      status
    );


    // ==================================
    // PENDING
    // ==================================

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
          ⏳ Заявка на розгляді
        </p>

        <p>
          Ваша заявка очікує рішення
          адміністрації UA LEGION.
        </p>
      `;


      if (joinButton) {

        joinButton.style.display =
          "none";

      }


      return;
    }


    // ==================================
    // APPROVED
    // ==================================

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
          ✅ Заявку схвалено
        </p>

        <p>
          Ваша заявка була схвалена
          адміністрацією UA LEGION.
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


    // ==================================
    // REJECTED
    // ==================================

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
          ❌ Заявку відхилено
        </p>

        <p>
          Ваша заявка була відхилена
          адміністрацією UA LEGION.
        </p>
      `;


      if (joinButton) {

        joinButton.style.display =
          "inline-flex";

        joinButton.href =
          "join.html";

        joinButton.textContent =
          "📝 ПОДАТИ ЗАЯВКУ НА ІНШИЙ НАПРЯМОК";

      }


      return;
    }


    // ==================================
    // ІНШИЙ СТАТУС
    // ==================================

    applicationStatus.className =
      "application-card";


    applicationStatus.innerHTML = `
      <h3>
        ${escapeHtml(
          directionName
        )}
      </h3>

      <p>
        ℹ️ Поточний статус заявки:
        ${escapeHtml(
          application.status ||
          "невідомий"
        )}
      </p>
    `;

  }


  // ======================================
  // СОХРАНЕНИЕ ЛИЧНОГО ПРОФИЛЯ
  //
  // ВАЖНО:
  // НЕ СОХРАНЯЕМ ЗДЕСЬ РОЛИ И ЧЛЕНСТВО
  // В НАПРЯМКАХ.
  //
  // ИМИ УПРАВЛЯЕТ member.html
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
        // ЗАВАНТАЖЕННЯ АВАТАРА
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


          // -------------------------------
          // РОЗШИРЕННЯ
          // -------------------------------

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


          // -------------------------------
          // ШЛЯХ
          // -------------------------------

          const filePath =
            `${user.id}/avatar-${Date.now()}.${fileExtension}`;


          // -------------------------------
          // UPLOAD
          // -------------------------------

          const {
            error: uploadError
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
              "PROFILE: Помилка завантаження аватара:",
              uploadError
            );


            showMessage(
              "Не вдалося завантажити аватар: " +
              uploadError.message,
              "error"
            );


            return;
          }


          // -------------------------------
          // PUBLIC URL
          // -------------------------------

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
              "Аватар завантажено, але не вдалося отримати його URL.",
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
        // АВАТАР ДЛЯ ЗБЕРЕЖЕННЯ
        // ==================================

        const avatarToSave =
          uploadedAvatarUrl ||
          currentAvatarUrl ||
          null;


        // ==================================
        // ЗБЕРЕЖЕННЯ PROFILES
        // ==================================

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

              },
              {
                onConflict:
                  "id"
              }
            );


        if (profileError) {

          console.error(
            "PROFILE: Помилка профілю:",
            profileError
          );


          showMessage(
            profileError.message,
            "error"
          );


          return;
        }


        // ==================================
        // ОНОВЛЕННЯ СТАНУ АВАТАРА
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


        // ==================================
        // ОНОВЛЕННЯ ІМЕНІ
        // ==================================

        if (
          displayName?.value.trim() &&
          profileNamePreview
        ) {

          profileNamePreview.textContent =
            displayName.value.trim();

        }


        // ==================================
        // ПОВТОРНО ЧИТАЄМО RBAC
        //
        // НА ВИПАДОК, ЯКЩО ДАНІ ЗМІНИЛИСЯ
        // В ІНШІЙ ВКЛАДЦІ.
        // ==================================

        await loadUserManagement();


        showMessage(
          "Профіль успішно збережено!",
          "success"
        );

      }
    );

  }


  // ======================================
  // ВИХІД
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
            "PROFILE: Помилка виходу:",
            error
          );

          return;
        }


        window.location.href =
          "index.html";

      }
    );

  }


  // ======================================
  // ЗАПУСК
  // ======================================

  await loadProfile();

  await loadUserManagement();

  await loadApplicationStatus();


});
