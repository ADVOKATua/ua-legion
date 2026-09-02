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
  // ЗАВАНТАЖЕННЯ ПРОФІЛЮ
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
        "Помилка завантаження профілю:",
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


    // ІМ'Я

    if (
      profile.display_name &&
      displayName
    ) {

      displayName.value =
        profile.display_name;


      if (profileNamePreview) {

        profileNamePreview.textContent =
          profile.display_name;

      }

    }


    // ДАТА НАРОДЖЕННЯ

    if (
      profile.birth_date &&
      birthDate
    ) {

      birthDate.value =
        profile.birth_date;

    }


    // АВАТАР

    if (
      profile.avatar_url &&
      avatarUrl
    ) {

      avatarUrl.value =
        profile.avatar_url;


      if (profileAvatar) {

        profileAvatar.src =
          profile.avatar_url;

      }

    }


    // DISCORD USERNAME

    if (
      profile.discord_username &&
      discordUsername
    ) {

      discordUsername.value =
        profile.discord_username;

    }


    // DISCORD USER ID

    if (
      profile.discord_user_id &&
      discordUserId
    ) {

      discordUserId.value =
        profile.discord_user_id;

    }


    // STEAM ID

    if (
      profile.steam_id &&
      steamId
    ) {

      steamId.value =
        profile.steam_id;

    }


    // ІГРОВИЙ НІК

    if (
      profile.game_nickname &&
      gameNickname
    ) {

      gameNickname.value =
        profile.game_nickname;

    }

  }


  // ======================================
  // ЗАВАНТАЖЕННЯ НАПРЯМКІВ
  // ======================================

  async function loadDirections() {

    // --------------------------------------
    // ОТРИМУЄМО ВСІ НАПРЯМКИ
    // --------------------------------------

    const {
      data: allDirections,
      error: directionsError
    } = await supabase
      .from("directions")
      .select(
        "id, slug"
      );


    if (directionsError) {

      console.error(
        "Помилка читання directions:",
        directionsError
      );


      showMessage(
        "Не вдалося завантажити напрямки: " +
        directionsError.message,
        "error"
      );


      return;

    }


    // --------------------------------------
    // СТВОРЮЄМО КАРТУ ID → SLUG
    // --------------------------------------

    const directionMap =
      new Map(
        allDirections.map(
          (direction) => [

            String(
              direction.id
            ),

            direction.slug

          ]
        )
      );


    // --------------------------------------
    // НАПРЯМКИ ПОТОЧНОГО КОРИСТУВАЧА
    // --------------------------------------

    const {
      data: selectedRows,
      error: selectedError
    } = await supabase
      .from("profile_directions")
      .select(
        "direction_id"
      )
      .eq(
        "profile_id",
        user.id
      );


    if (selectedError) {

      console.error(
        "Помилка завантаження напрямків:",
        selectedError
      );


      return;

    }


    // --------------------------------------
    // ОЧИЩАЄМО ЧЕКБОКСИ
    // --------------------------------------

    document
      .querySelectorAll(
        'input[name="direction"]'
      )
      .forEach(
        (checkbox) => {

          checkbox.checked =
            false;

        }
      );


    // --------------------------------------
    // ВІДМІЧАЄМО ЗБЕРЕЖЕНІ
    // --------------------------------------

    selectedRows.forEach(
      (row) => {

        const slug =
          directionMap.get(
            String(
              row.direction_id
            )
          );


        if (!slug) {
          return;
        }


        const checkbox =
          document.querySelector(
            `input[name="direction"][value="${slug}"]`
          );


        if (checkbox) {

          checkbox.checked =
            true;

        }

      }
    );

  }


  // ======================================
  // ЗАВАНТАЖЕННЯ РОЛЕЙ
  // ======================================

  async function loadUserRoles() {

    if (!rolesList) {
      return;
    }


    rolesList.innerHTML = `
      <div class="roles-empty">
        Завантаження ролей...
      </div>
    `;


    // --------------------------------------
    // 1. ОТРИМУЄМО РОЛІ КОРИСТУВАЧА
    // --------------------------------------

    const {
      data: userRoles,
      error: userRolesError
    } = await supabase
      .from("user_roles")
      .select(
        "role_id, direction_id"
      )
      .eq(
        "user_id",
        user.id
      );


    if (userRolesError) {

      console.error(
        "Помилка user_roles:",
        userRolesError
      );


      rolesList.innerHTML = `
        <div class="roles-empty">
          Не вдалося завантажити ролі.
        </div>
      `;


      return;

    }


    // --------------------------------------
    // ЯКЩО РОЛЕЙ НЕМАЄ
    // --------------------------------------

    if (
      !userRoles ||
      userRoles.length === 0
    ) {

      window.currentUserRoles =
        [];


      renderUserRoles(
        []
      );


      return;

    }


    // --------------------------------------
    // 2. ОТРИМУЄМО ID РОЛЕЙ
    // --------------------------------------

    const roleIds =
      [
        ...new Set(
          userRoles
            .map(
              (item) =>
                item.role_id
            )
            .filter(
              Boolean
            )
        )
      ];


    // --------------------------------------
    // 3. ЗАВАНТАЖУЄМО РОЛІ
    // --------------------------------------

    const {
      data: roles,
      error: rolesError
    } = await supabase
      .from("roles")
      .select(
        "id, code, name"
      )
      .in(
        "id",
        roleIds
      );


    if (rolesError) {

      console.error(
        "Помилка roles:",
        rolesError
      );


      rolesList.innerHTML = `
        <div class="roles-empty">
          Не вдалося завантажити інформацію про ролі.
        </div>
      `;


      return;

    }


    // --------------------------------------
    // 4. ОТРИМУЄМО ID НАПРЯМКІВ
    // --------------------------------------

    const directionIds =
      [
        ...new Set(
          userRoles
            .map(
              (item) =>
                item.direction_id
            )
            .filter(
              Boolean
            )
        )
      ];


    let directions =
      [];


    // --------------------------------------
    // 5. ЗАВАНТАЖУЄМО НАПРЯМКИ
    // --------------------------------------

    if (
      directionIds.length > 0
    ) {

      const {
        data: directionsData,
        error: directionsError
      } = await supabase
        .from("directions")
        .select(
          "id, name, slug"
        )
        .in(
          "id",
          directionIds
        );


      if (directionsError) {

        console.error(
          "Помилка directions:",
          directionsError
        );

      }

      else {

        directions =
          directionsData || [];

      }

    }


    // --------------------------------------
    // 6. СТВОРЮЄМО КАРТИ
    // --------------------------------------

    const rolesMap =
      new Map(
        roles.map(
          (role) => [

            String(
              role.id
            ),

            role

          ]
        )
      );


    const directionsMap =
      new Map(
        directions.map(
          (direction) => [

            String(
              direction.id
            ),

            direction

          ]
        )
      );


    // --------------------------------------
    // 7. ОБ'ЄДНУЄМО ДАНІ
    // --------------------------------------

    const fullRoles =
      userRoles.map(
        (item) => ({

          role_id:
            item.role_id,


          direction_id:
            item.direction_id,


          roles:
            rolesMap.get(
              String(
                item.role_id
              )
            ) || null,


          directions:

            item.direction_id
              ? (
                  directionsMap.get(
                    String(
                      item.direction_id
                    )
                  ) || null
                )
              : null

        })
      );


    // --------------------------------------
    // 8. СОРТУВАННЯ
    // ГЛОБАЛЬНІ РОЛІ СПОЧАТКУ
    // --------------------------------------

    fullRoles.sort(
      (
        a,
        b
      ) => {

        if (
          a.direction_id === null &&
          b.direction_id !== null
        ) {
          return -1;
        }


        if (
          a.direction_id !== null &&
          b.direction_id === null
        ) {
          return 1;
        }


        return 0;

      }
    );


    window.currentUserRoles =
      fullRoles;


    console.log(
      "Ролі користувача:",
      window.currentUserRoles
    );


    renderUserRoles(
      window.currentUserRoles
    );

  }


  // ======================================
  // ВІДОБРАЖЕННЯ РОЛЕЙ
  // ======================================

  function renderUserRoles(
    roles
  ) {

    if (!rolesList) {
      return;
    }


    rolesList.innerHTML =
      "";


    // --------------------------------------
    // ЯКЩО РОЛЕЙ НЕМАЄ
    // --------------------------------------

    if (
      !roles ||
      roles.length === 0
    ) {

      rolesList.innerHTML = `
        <div class="roles-empty">
          У вас поки немає призначених ролей.
        </div>
      `;


      return;

    }


    // --------------------------------------
    // ВИВОДИМО КОЖНУ РОЛЬ
    // --------------------------------------

    roles.forEach(
      (item) => {

        const roleCard =
          document.createElement(
            "div"
          );


        roleCard.className =
          "role-card";


        const roleName =
          item.roles?.name ||
          "Невідома роль";


        const roleCode =
          item.roles?.code ||
          "";


        const isGlobal =
          item.direction_id === null;


        const directionName =
          item.directions?.name ||
          "Глобальна роль";


        let roleIcon =
          "👤";


        // ----------------------------------
        // ІКОНКИ РОЛЕЙ
        // ----------------------------------

        if (
          roleCode === "owner"
        ) {

          roleIcon =
            "👑";

        }

        else if (
          roleCode === "deputy_owner"
        ) {

          roleIcon =
            "🛡️";

        }

        else if (
          roleCode === "top_manager"
        ) {

          roleIcon =
            "🏆";

        }

        else if (
          roleCode === "hr_manager"
        ) {

          roleIcon =
            "👥";

        }

        else if (
          roleCode === "logistics_manager"
        ) {

          roleIcon =
            "🚛";

        }


        // ----------------------------------
        // ГЛОБАЛЬНА РОЛЬ
        // ----------------------------------

        if (
          isGlobal
        ) {

          roleCard.classList.add(
            "global"
          );

        }


        // ----------------------------------
        // ВМІСТ КАРТКИ
        // ----------------------------------

        roleCard.innerHTML = `

          <h3>
            ${roleIcon}
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


  // ======================================
  // ЗБЕРЕЖЕННЯ ПРОФІЛЮ
  // ======================================

  if (profileForm) {

    profileForm.addEventListener(
      "submit",

      async (event) => {


        event.preventDefault();


        showMessage(
          "Збереження..."
        );


        // ==================================
        // ОТРИМУЄМО ВИБРАНІ НАПРЯМКИ
        // ==================================

        const selectedSlugs =
          Array.from(

            document.querySelectorAll(
              'input[name="direction"]:checked'
            )

          )
          .map(
            (checkbox) =>
              checkbox.value
          );


        // ==================================
        // ЗБЕРІГАЄМО ПРОФІЛЬ
        // ==================================

        const {
          error: profileError
        } = await supabase
          .from("profiles")
          .upsert(

            {

              id:
                user.id,


              display_name:
                displayName.value.trim() ||
                null,


              birth_date:
                birthDate.value ||
                null,


              avatar_url:
                avatarUrl.value.trim() ||
                null,


              discord_username:
                discordUsername.value.trim() ||
                null,


              discord_user_id:
                discordUserId.value.trim() ||
                null,


              steam_id:
                steamId.value.trim() ||
                null,


              game_nickname:
                gameNickname.value.trim() ||
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
            "Помилка профілю:",
            profileError
          );


          showMessage(
            profileError.message,
            "error"
          );


          return;

        }


        // ==================================
        // ОТРИМУЄМО ID НАПРЯМКІВ
        // ==================================

        let selectedDirections =
          [];


        if (
          selectedSlugs.length > 0
        ) {

          const {
            data: directions,
            error: directionsError
          } = await supabase
            .from("directions")
            .select(
              "id, slug"
            )
            .in(
              "slug",
              selectedSlugs
            );


          if (directionsError) {

            console.error(
              "Помилка отримання напрямків:",
              directionsError
            );


            showMessage(
              "Не вдалося зберегти напрямки: " +
              directionsError.message,
              "error"
            );


            return;

          }


          selectedDirections =
            directions;

        }


        // ==================================
        // ВИДАЛЯЄМО СТАРІ НАПРЯМКИ
        // ==================================

        const {
          error: deleteError
        } = await supabase
          .from("profile_directions")
          .delete()
          .eq(
            "profile_id",
            user.id
          );


        if (deleteError) {

          console.error(
            "Помилка видалення напрямків:",
            deleteError
          );


          showMessage(
            deleteError.message,
            "error"
          );


          return;

        }


        // ==================================
        // ДОДАЄМО НОВІ НАПРЯМКИ
        // ==================================

        if (
          selectedDirections.length > 0
        ) {

          const rowsToInsert =
            selectedDirections.map(
              (direction) => ({

                profile_id:
                  user.id,


                direction_id:
                  direction.id

              })
            );


          const {
            error: insertError
          } = await supabase
            .from("profile_directions")
            .insert(
              rowsToInsert
            );


          if (insertError) {

            console.error(
              "Помилка додавання напрямків:",
              insertError
            );


            showMessage(
              insertError.message,
              "error"
            );


            return;

          }

        }


        // ==================================
        // ОНОВЛЮЄМО АВАТАР
        // ==================================

        if (
          avatarUrl.value.trim() &&
          profileAvatar
        ) {

          profileAvatar.src =
            avatarUrl.value.trim();

        }


        // ==================================
        // ОНОВЛЮЄМО ІМ'Я
        // ==================================

        if (
          displayName.value.trim() &&
          profileNamePreview
        ) {

          profileNamePreview.textContent =
            displayName
              .value
              .trim();

        }


        // ==================================
        // УСПІШНЕ ЗБЕРЕЖЕННЯ
        // ==================================

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
        } = await supabase
          .auth
          .signOut();


        if (error) {

          console.error(
            "Помилка виходу:",
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

  await loadDirections();

  await loadUserRoles();


});
