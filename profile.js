document.addEventListener("DOMContentLoaded", async () => {

  /* =========================================
     UA LEGION — PROFILE
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
    document.getElementById(
      "profileForm"
    );


  const profileAvatar =
    document.getElementById(
      "profileAvatar"
    );


  const profileNamePreview =
    document.getElementById(
      "profileNamePreview"
    );


  const displayName =
    document.getElementById(
      "displayName"
    );


  const birthDate =
    document.getElementById(
      "birthDate"
    );


  const avatarInput =
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


  const applicationStatus =
    document.getElementById(
      "applicationStatus"
    );


  const rolesList =
    document.getElementById(
      "rolesList"
    );


  const joinButton =
    document.getElementById(
      "joinButton"
    );


  const logoutButton =
    document.getElementById(
      "logoutButton"
    );


  const profileMessage =
    document.getElementById(
      "profileMessage"
    );


  const saveProfileButton =
    document.getElementById(
      "saveProfile"
    );


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


  if (
    userError ||
    !user
  ) {

    window.location.href =
      "login.html";

    return;

  }


  const userId =
    user.id;


  const defaultAvatar =
    "ua-legion-logo.png";


  let currentProfile =
    null;


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


  const DIRECTION_ORDER = [

    "ets2",

    "trucksmp",

    "wot",

    "dota2",

    "wow"

  ];


  /* =========================================
     ПОСАДИ ETS2
     ========================================= */

  const ETS2_ROLE_LABELS = {

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
     ГЛОБАЛЬНІ РОЛІ
     ========================================= */

  const GLOBAL_ROLE_LABELS = {

    owner:
      "Власник UA LEGION",

    deputy_owner:
      "Заступник власника UA LEGION",

    director:
      "Директор UA LEGION",

    administrator:
      "Адміністратор UA LEGION",

    admin:
      "Адміністратор UA LEGION",

    top_manager:
      "Топ-менеджер UA LEGION",

    hr_manager:
      "HR-менеджер UA LEGION",

    moderator:
      "Модератор UA LEGION"

  };


  /* =========================================
     КЛАСИ ETS2
     ========================================= */

  const ETS2_CLASS_LABELS = {

    s:
      "S — Елітний водій",

    a:
      "A — Професійний водій",

    b:
      "B — Старший водій",

    c:
      "C — Водій",

    d:
      "D — Молодший водій"

  };


  /* =========================================
     БЕЗПЕЧНИЙ HTML
     ========================================= */

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


    if (
      type === "success"
    ) {

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
     НАЗВА НАПРЯМКУ
     ========================================= */

  function getDirectionLabel(
    direction
  ) {

    const key =
      String(
        direction || ""
      )
        .trim()
        .toLowerCase();


    return (
      DIRECTION_LABELS[key] ||
      direction ||
      "Невідомий напрямок"
    );

  }


  /* =========================================
     НАЗВА ПОСАДИ ETS2
     ========================================= */

  function getETS2RoleLabel(
    role
  ) {

    const key =
      String(
        role || ""
      )
        .trim()
        .toLowerCase();


    return (
      ETS2_ROLE_LABELS[key] ||
      String(
        role || ""
      ).trim()
    );

  }


  /* =========================================
     НАЗВА ГЛОБАЛЬНОЇ РОЛІ
     ========================================= */

  function getGlobalRoleLabel(
    role,
    name
  ) {

    if (
      name &&
      String(name).trim()
    ) {

      return String(
        name
      ).trim();

    }


    const key =
      String(
        role || ""
      )
        .trim()
        .toLowerCase();


    return (
      GLOBAL_ROLE_LABELS[key] ||
      String(
        role || ""
      ).trim()
    );

  }


  /* =========================================
     КЛАС ETS2
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
      !String(value).trim()
    ) {

      return null;

    }


    const text =
      String(value).trim();


    const key =
      text.toLowerCase();


    return (
      ETS2_CLASS_LABELS[key] ||
      text
    );

  }


  /* =========================================
     НАПРЯМКИ З ПРОФІЛЮ
     ========================================= */

  function getDirectionsFromProfile() {

    if (
      !currentProfile ||
      !Array.isArray(
        currentProfile.directions
      )
    ) {

      return [];

    }


    return currentProfile.directions

      .filter(
        Boolean
      )

      .map(
        direction =>
          String(direction)
            .trim()
            .toLowerCase()
      );

  }


  /* =========================================
     НАПРЯМКИ З ФОРМИ
     ========================================= */

  function getDirectionsFromForm() {

    return Array.from(

      document.querySelectorAll(
        'input[name="direction"]:checked'
      )

    )

      .map(
        checkbox =>
          checkbox.value
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

        .from(
          "profiles"
        )

        .select(
          "*"
        )

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


    /* ДАТА */

    if (birthDate) {

      birthDate.value =
        profile.birth_date ||
        "";

    }


    /* DISCORD */

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


    /* STEAM */

    if (steamId) {

      steamId.value =
        profile.steam_id ||
        "";

    }


    /* GAME NICK */

    if (gameNickname) {

      gameNickname.value =
        profile.game_nickname ||
        "";

    }


    /* ІМ'Я У ШАПЦІ */

    if (profileNamePreview) {

      profileNamePreview.textContent =

        profile.display_name ||

        profile.game_nickname ||

        user.email ||

        "UA LEGION Member";

    }


    /* АВАТАР */

    if (profileAvatar) {

      profileAvatar.src =

        profile.avatar_url ||

        defaultAvatar;

    }


    /* НАПРЯМКИ */

    const selectedDirections =
      getDirectionsFromProfile();


    document

      .querySelectorAll(
        'input[name="direction"]'
      )

      .forEach(
        checkbox => {

          checkbox.checked =
            selectedDirections.includes(

              String(
                checkbox.value
              )
                .toLowerCase()

            );

        }
      );

  }


  /* =========================================
     ЗАВАНТАЖЕННЯ АВАТАРА
     ========================================= */

  async function uploadAvatar() {

    if (!avatarInput) {

      return (
        currentProfile?.avatar_url ||
        null
      );

    }


    const file =
      avatarInput.files?.[0];


    /* ФАЙЛ НЕ ВИБРАНИЙ */

    if (!file) {

      return (
        currentProfile?.avatar_url ||
        null
      );

    }


    const allowedTypes = [

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


    const filePath =
      `${userId}/avatar-${Date.now()}.${extension}`;


    const {
      error: uploadError
    } =
      await supabaseClient

        .storage

        .from(
          "avatars"
        )

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
        "Помилка завантаження аватара:",
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

        .from(
          "avatars"
        )

        .getPublicUrl(
          filePath
        );


    if (
      !urlData?.publicUrl
    ) {

      throw new Error(
        "Не вдалося отримати URL аватара."
      );

    }


    return urlData.publicUrl;

  }


  /* =========================================
     ОНОВЛЕННЯ ІМЕНІ
     ========================================= */

  if (displayName) {

    displayName.addEventListener(
      "input",
      () => {

        if (!profileNamePreview) {

          return;

        }


        profileNamePreview.textContent =

          displayName.value.trim() ||

          gameNickname?.value.trim() ||

          user.email ||

          "UA LEGION Member";

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
          avatarInput.files?.[0];


        if (
          !file ||
          !profileAvatar
        ) {

          return;

        }


        const reader =
          new FileReader();


        reader.onload =
          event => {

            profileAvatar.src =
              event.target.result;

          };


        reader.readAsDataURL(
          file
        );

      }
    );

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


          showMessage(
            ""
          );


          const avatarUrl =
            await uploadAvatar();


          const directions =
            getDirectionsFromForm();


          const profileData = {

            id:
              userId,


            display_name:

              displayName?.value.trim() ||

              null,


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

              new Date()
                .toISOString()

          };


          const {
            error
          } =
            await supabaseClient

              .from(
                "profiles"
              )

              .upsert(
                profileData,
                {

                  onConflict:
                    "id"

                }
              );


          if (error) {

            console.error(
              "Помилка збереження профілю:",
              error
            );


            throw new Error(
              error.message
            );

          }


          currentProfile = {

            ...(
              currentProfile ||
              {}
            ),

            ...profileData

          };


          if (
            profileAvatar &&
            avatarUrl
          ) {

            profileAvatar.src =
              avatarUrl;

          }


          if (profileNamePreview) {

            profileNamePreview.textContent =

              profileData.display_name ||

              profileData.game_nickname ||

              user.email ||

              "UA LEGION Member";

          }


          showMessage(
            "Профіль успішно збережено ✓",
            "success"
          );


          await loadRoles();


        }

        catch (error) {

          console.error(
            "Помилка збереження профілю:",
            error
          );


          showMessage(

            error.message ||

            "Помилка збереження профілю.",

            "error"

          );

        }

        finally {

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

        .from(
          "applications"
        )

        .select(
          "*"
        )

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

        .limit(
          1
        )

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

     ГЛОБАЛЬНІ РОЛІ:
     user_roles → roles
     direction_id = NULL

     ПОСАДИ НАПРЯМКІВ:
     user_direction_roles

     КЛАС:
     тільки ETS2
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

      const [

        globalRolesResult,

        directionRolesResult

      ] =
        await Promise.all([


          /* =================================
             ГЛОБАЛЬНІ РОЛІ
             ================================= */

          supabaseClient

            .from(
              "user_roles"
            )

            .select(
              `
                direction_id,

                roles (
                  code,
                  name
                )
              `
            )

            .eq(
              "user_id",
              userId
            )

            .is(
              "direction_id",
              null
            ),


          /* =================================
             ПОСАДИ НАПРЯМКІВ
             ================================= */

          supabaseClient

            .from(
              "user_direction_roles"
            )

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
            )

        ]);


      const globalRolesError =
        globalRolesResult.error;


      const directionRolesError =
        directionRolesResult.error;


      if (globalRolesError) {

        console.error(
          "Помилка завантаження глобальної ролі:",
          globalRolesError
        );

      }


      if (directionRolesError) {

        console.error(
          "Помилка завантаження посад напрямків:",
          directionRolesError
        );

      }


      /* =====================================
         ГЛОБАЛЬНІ РОЛІ
         ===================================== */

      const globalRoles =
        Array.isArray(
          globalRolesResult.data
        )

          ? globalRolesResult.data

              .map(
                item => ({

                  code:
                    item?.roles?.code ||
                    "",


                  name:
                    item?.roles?.name ||
                    ""

                })
              )

              .filter(
                item =>
                  item.code ||
                  item.name
              )

          : [];


      /* =====================================
         ПОСАДИ НАПРЯМКІВ
         ===================================== */

      const directionRoleRows =
        Array.isArray(
          directionRolesResult.data
        )

          ? directionRolesResult.data

          : [];


      /* =====================================
         ЗБИРАЄМО НАПРЯМКИ
         ===================================== */

      const directions =
        new Set();


      /* НАПРЯМКИ З ПРОФІЛЮ */

      getDirectionsFromProfile()

        .forEach(
          direction => {

            directions.add(
              direction
            );

          }
        );


      /* НАПРЯМКИ З ПОСАД */

      directionRoleRows

        .forEach(
          row => {

            if (row?.direction) {

              directions.add(

                String(
                  row.direction
                )

                  .trim()

                  .toLowerCase()

              );

            }

          }
        );


      /* КЛАС ETS2 АВТОМАТИЧНО ДОДАЄ ETS2 */

      const ets2Class =
        getETS2Class();


      if (ets2Class) {

        directions.add(
          "ets2"
        );

      }


      /* =====================================
         ГРУПУЄМО ПОСАДИ
         ===================================== */

      const rolesByDirection =
        {};


      directionRoleRows

        .forEach(
          row => {

            const direction =
              String(
                row?.direction ||
                ""
              )

                .trim()

                .toLowerCase();


            const role =
              String(
                row?.role ||
                ""
              )

                .trim();


            if (
              !direction ||
              !role
            ) {

              return;

            }


            if (
              !rolesByDirection[
                direction
              ]
            ) {

              rolesByDirection[
                direction
              ] =
                [];

            }


            rolesByDirection[
              direction
            ]

              .push(
                role
              );

          }
        );


      /* =====================================
         ОЧИЩАЄМО СПИСОК
         ===================================== */

      rolesList.innerHTML =
        "";


      /* =====================================
         ВИДАЛЯЄМО ДУБЛІКАТИ ГЛОБАЛЬНИХ РОЛЕЙ
         ===================================== */

      const uniqueGlobalRoles =
        [];


      const seenGlobalRoles =
        new Set();


      globalRoles

        .forEach(
          item => {

            const key =
              `${item.code}|${item.name}`;


            if (
              !seenGlobalRoles.has(
                key
              )
            ) {

              seenGlobalRoles.add(
                key
              );


              uniqueGlobalRoles.push(
                item
              );

            }

          }
        );


      /* =====================================
         ГЛОБАЛЬНІ КАРТКИ
         ===================================== */

      uniqueGlobalRoles

        .forEach(
          item => {

            const card =
              document.createElement(
                "div"
              );


            card.className =
              "role-card global";


            const label =
              getGlobalRoleLabel(
                item.code,
                item.name
              );


            card.innerHTML =
              `
                <h3>
                  ${escapeHtml(label)}
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


      /* =====================================
         СОРТУВАННЯ НАПРЯМКІВ
         ===================================== */

      const sortedDirections =
        Array.from(
          directions
        )

          .sort(
            (
              a,
              b
            ) => {

              const aIndex =
                DIRECTION_ORDER.indexOf(
                  a
                );


              const bIndex =
                DIRECTION_ORDER.indexOf(
                  b
                );


              const safeA =
                aIndex === -1
                  ? 999
                  : aIndex;


              const safeB =
                bIndex === -1
                  ? 999
                  : bIndex;


              return (
                safeA -
                safeB
              );

            }
          );


      /* =====================================
         КАРТКИ НАПРЯМКІВ
         ===================================== */

      sortedDirections

        .forEach(
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


            const uniqueRoles =
              [

                ...new Set(

                  rolesByDirection[
                    direction
                  ] ||
                  []

                )

              ];


            /* ЗАГОЛОВОК */

            let html =
              `
                <h3>
                  Напрямок:
                  ${escapeHtml(directionName)}
                </h3>
              `;


            /* =================================
               ПОСАДИ

               ЯКЩО НЕМАЄ —
               РЯДОК НЕ ПОКАЗУЄМО
               ================================= */

            if (
              uniqueRoles.length > 0
            ) {

              const rolesText =
                uniqueRoles

                  .map(
                    role => {

                      if (

                        direction === "ets2" ||

                        direction === "trucksmp"

                      ) {

                        return escapeHtml(

                          getETS2RoleLabel(
                            role
                          )

                        );

                      }


                      return escapeHtml(
                        role
                      );

                    }
                  )

                  .join(
                    " + "
                  );


              const title =

                direction === "ets2" ||

                direction === "trucksmp"

                  ? "Посади ETS2"

                  : `Ролі ${directionName}`;


              html +=
                `
                  <p>
                    <strong>
                      ${escapeHtml(title)}:
                    </strong>

                    ${rolesText}
                  </p>
                `;

            }


            /* =================================
               КЛАС

               ВИКЛЮЧНО ETS2
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

                    ${escapeHtml(ets2Class)}

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
         ЯКЩО РОЛЕЙ ВЗАГАЛІ НЕМАЄ
         ===================================== */

      if (

        !uniqueGlobalRoles.length &&

        !sortedDirections.length

      ) {

        rolesList.innerHTML =
          `
            <div class="roles-empty">
              🏅 Ролі та посади ще не призначені.
            </div>
          `;

      }


    }

    catch (error) {

      console.error(
        "Критична помилка завантаження ролей:",
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

          logoutButton.disabled =
            true;


          logoutButton.textContent =
            "⏳ ВИХОДИМО...";


          const {
            error
          } =
            await supabaseClient
              .auth
              .signOut();


          if (error) {

            throw error;

          }


          window.location.href =
            "index.html";

        }

        catch (error) {

          console.error(
            "Помилка виходу:",
            error
          );


          showMessage(
            "Не вдалося вийти з акаунта.",
            "error"
          );

        }

        finally {

          logoutButton.disabled =
            false;


          logoutButton.textContent =
            "🚪 ВИЙТИ";

        }

      }
    );

  }


  /* =========================================
     КНОПКА ПОДАТИ ЗАЯВКУ
     ========================================= */

  if (joinButton) {

    joinButton.addEventListener(
      "click",
      () => {

        /* Перехід виконується через href */

      }
    );

  }


  /* =========================================
     ПОЧАТКОВЕ ЗАВАНТАЖЕННЯ
     ========================================= */

  await loadProfile();


  await Promise.all([

    loadApplication(),

    loadRoles()

  ]);


});
