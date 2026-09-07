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


    // ВАЖЛИВО:
    // У твоєму HTML це поле вибору файлу.
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
    // ЗБЕРІГАЄМО URL ПОТОЧНОГО АВАТАРА
    // ======================================

    let currentAvatarUrl =
      null;


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


      // ====================================
      // ІМ'Я
      // ====================================

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


      // ====================================
      // ДАТА НАРОДЖЕННЯ
      // ====================================

      if (
        profile.birth_date &&
        birthDate
      ) {

        birthDate.value =
          profile.birth_date;

      }


      // ====================================
      // АВАТАР
      // ====================================

      if (
        profile.avatar_url
      ) {

        currentAvatarUrl =
          profile.avatar_url;


        if (profileAvatar) {

          profileAvatar.src =
            profile.avatar_url;

        }

      }


      // ====================================
      // DISCORD USERNAME
      // ====================================

      if (
        profile.discord_username &&
        discordUsername
      ) {

        discordUsername.value =
          profile.discord_username;

      }


      // ====================================
      // DISCORD USER ID
      // ====================================

      if (
        profile.discord_user_id &&
        discordUserId
      ) {

        discordUserId.value =
          profile.discord_user_id;

      }


      // ====================================
      // STEAM ID
      // ====================================

      if (
        profile.steam_id &&
        steamId
      ) {

        steamId.value =
          profile.steam_id;

      }


      // ====================================
      // ІГРОВИЙ НІК
      // ====================================

      if (
        profile.game_nickname &&
        gameNickname
      ) {

        gameNickname.value =
          profile.game_nickname;

      }

    }


    // ======================================
    // ПОПЕРЕДНІЙ ПЕРЕГЛЯД АВАТАРА
    // ======================================

    if (avatarInput) {

      avatarInput.addEventListener(
        "change",

        () => {

          const file =
            avatarInput.files &&
            avatarInput.files.length > 0
              ? avatarInput.files[0]
              : null;


          if (
            !file ||
            !profileAvatar
          ) {

            return;

          }


          // Перевірка типу файлу

          if (
            !file.type.startsWith(
              "image/"
            )
          ) {

            showMessage(
              "Будь ласка, виберіть файл зображення.",
              "error"
            );


            avatarInput.value =
              "";


            return;

          }


          // Максимум 5 MB

          if (
            file.size >
            5 * 1024 * 1024
          ) {

            showMessage(
              "Розмір фото не повинен перевищувати 5 MB.",
              "error"
            );


            avatarInput.value =
              "";


            return;

          }


          // Попередній перегляд

          const previewUrl =
            URL.createObjectURL(
              file
            );


          profileAvatar.src =
            previewUrl;

        }

      );

    }


    // ======================================
    // ЗАВАНТАЖЕННЯ ФОТО В SUPABASE STORAGE
    // ======================================

    async function uploadAvatar() {

      const file =
        avatarInput &&
        avatarInput.files &&
        avatarInput.files.length > 0
          ? avatarInput.files[0]
          : null;


      // Якщо нове фото не вибрано —
      // залишаємо старий аватар.

      if (!file) {

        return currentAvatarUrl;

      }


      // ====================================
      // РОЗШИРЕННЯ ФАЙЛУ
      // ====================================

      const originalName =
        file.name;


      let extension =
        originalName
          .split(".")
          .pop()
          .toLowerCase();


      if (
        !extension ||
        extension.length > 5
      ) {

        extension =
          "jpg";

      }


      // ====================================
      // ПОСТІЙНИЙ ШЛЯХ
      //
      // У кожного користувача
      // одна папка та один аватар.
      // ====================================

      const filePath =
        user.id +
        "/avatar." +
        extension;


      // ====================================
      // ЗАВАНТАЖЕННЯ
      // ====================================

      const {
        error: uploadError
      } = await supabase
        .storage
        .from("avatars")
        .upload(

          filePath,

          file,

          {

            upsert:
              true,


            cacheControl:
              "3600"


          }

        );


      if (uploadError) {

        console.error(
          "Помилка завантаження аватара:",
          uploadError
        );


        throw uploadError;

      }


      // ====================================
      // ОТРИМУЄМО PUBLIC URL
      // ====================================

      const {
        data: publicUrlData
      } = supabase
        .storage
        .from("avatars")
        .getPublicUrl(
          filePath
        );


      if (
        !publicUrlData ||
        !publicUrlData.publicUrl
      ) {

        throw new Error(
          "Не вдалося отримати URL аватара."
        );

      }


      // Додаємо timestamp,
      // щоб браузер не показував старе фото з кешу.

      const avatarPublicUrl =
        publicUrlData.publicUrl +
        "?v=" +
        Date.now();


      return avatarPublicUrl;

    }


    // ======================================
    // СТАТУС ЗАЯВКИ
    // ======================================

    async function loadApplicationStatus() {

      if (!applicationStatus) {
        return;
      }


      applicationStatus.className =
        "application-card";


      applicationStatus.innerHTML =
        `
          <h3>
            Завантаження...
          </h3>

          <p>
            Перевіряємо інформацію про вашу заявку.
          </p>
        `;


      const {
        data: applications,
        error
      } = await supabase
        .from("applications")
        .select(
          "id, status, created_at"
        )
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
        .limit(
          1
        );


      if (error) {

        console.error(
          "Помилка завантаження заявки:",
          error
        );


        applicationStatus.innerHTML =
          `
            <h3>
              ⚠️ Не вдалося перевірити заявку
            </h3>

            <p>
              ${error.message}
            </p>
          `;


        return;

      }


      const application =
        applications &&
        applications.length > 0
          ? applications[0]
          : null;


      // ====================================
      // ЗАЯВКИ НЕМАЄ
      // ====================================

      if (!application) {

        applicationStatus.className =
          "application-card none";


        applicationStatus.innerHTML =
          `
            <h3>
              📝 Заявка ще не подана
            </h3>

            <p>
              Ви можете подати заявку на вступ до UA LEGION.
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


      const status =
        application.status;


      // ====================================
      // PENDING
      // ====================================

      if (
        status === "pending"
      ) {

        applicationStatus.className =
          "application-card pending";


        applicationStatus.innerHTML =
          `
            <h3>
              ⏳ Заявка на розгляді
            </h3>

            <p>
              Ваша заявка отримана та очікує рішення адміністрації.
            </p>
          `;


        if (joinButton) {

          joinButton.style.display =
            "none";

        }


        return;

      }


      // ====================================
      // APPROVED
      // ====================================

      if (
        status === "approved"
      ) {

        applicationStatus.className =
          "application-card approved";


        applicationStatus.innerHTML =
          `
            <h3>
              ✅ Ви учасник UA LEGION
            </h3>

            <p>
              Ваша заявка схвалена. Тепер вам доступний список учасників UA LEGION.
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


      // ====================================
      // REJECTED
      // ====================================

      if (
        status === "rejected"
      ) {

        applicationStatus.className =
          "application-card rejected";


        applicationStatus.innerHTML =
          `
            <h3>
              ❌ Заявку відхилено
            </h3>

            <p>
              Ваша заявка була відхилена. Ви можете подати нову заявку.
            </p>
          `;


        if (joinButton) {

          joinButton.style.display =
            "inline-flex";


          joinButton.href =
            "join.html";


          joinButton.textContent =
            "📝 ПОДАТИ НОВУ ЗАЯВКУ";

        }


        return;

      }


      // ====================================
      // НЕВІДОМИЙ СТАТУС
      // ====================================

      applicationStatus.className =
        "application-card";


      applicationStatus.innerHTML =
        `
          <h3>
            ℹ️ Статус заявки
          </h3>

          <p>
            Поточний статус: ${status}
          </p>
        `;


      if (joinButton) {

        joinButton.style.display =
          "none";

      }

    }


    // ======================================
    // ЗАВАНТАЖЕННЯ НАПРЯМКІВ
    // ======================================

    async function loadDirections() {

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


        return;

      }


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


      rolesList.innerHTML =
        `
          <div class="roles-empty">
            Завантаження ролей...
          </div>
        `;


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


        rolesList.innerHTML =
          `
            <div class="roles-empty">
              Не вдалося завантажити ролі.
            </div>
          `;


        return;

      }


      if (
        !userRoles ||
        userRoles.length === 0
      ) {

        renderUserRoles(
          []
        );


        return;

      }


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

        rolesList.innerHTML =
          `
            <div class="roles-empty">
              Не вдалося завантажити ролі.
            </div>
          `;


        return;

      }


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


      if (
        directionIds.length > 0
      ) {

        const {
          data: directionsData
        } = await supabase
          .from("directions")
          .select(
            "id, name, slug"
          )
          .in(
            "id",
            directionIds
          );


        directions =
          directionsData ||
          [];

      }


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
              ) ||
              null,


            directions:

              item.direction_id
                ? (
                    directionsMap.get(
                      String(
                        item.direction_id
                      )
                    ) ||
                    null
                  )
                : null

          })
        );


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


      renderUserRoles(
        fullRoles
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


      if (
        !roles ||
        roles.length === 0
      ) {

        rolesList.innerHTML =
          `
            <div class="roles-empty">
              У вас поки немає призначених ролей.
            </div>
          `;


        return;

      }


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


          if (
            isGlobal
          ) {

            roleCard.classList.add(
              "global"
            );

          }


          roleCard.innerHTML =
            `
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

        async (
          event
        ) => {


          event.preventDefault();


          showMessage(
            "Збереження профілю..."
          );


          // ==================================
          // НАПРЯМКИ
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
          // ЗАВАНТАЖЕННЯ АВАТАРА
          // ==================================

          let newAvatarUrl =
            currentAvatarUrl;


          try {

            const hasNewAvatar =
              avatarInput &&
              avatarInput.files &&
              avatarInput.files.length > 0;


            if (hasNewAvatar) {

              showMessage(
                "Завантаження фото..."
              );


              newAvatarUrl =
                await uploadAvatar();

            }

          }

          catch (
            avatarError
          ) {

            console.error(
              "Помилка аватара:",
              avatarError
            );


            showMessage(
              "Не вдалося завантажити фото: " +
              avatarError.message,
              "error"
            );


            return;

          }


          // ==================================
          // ЗБЕРЕЖЕННЯ ПРОФІЛЮ
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
                  displayName
                    ? (
                        displayName.value.trim() ||
                        null
                      )
                    : null,


                birth_date:
                  birthDate
                    ? (
                        birthDate.value ||
                        null
                      )
                    : null,


                avatar_url:
                  newAvatarUrl ||
                  null,


                discord_username:
                  discordUsername
                    ? (
                        discordUsername.value.trim() ||
                        null
                      )
                    : null,


                discord_user_id:
                  discordUserId
                    ? (
                        discordUserId.value.trim() ||
                        null
                      )
                    : null,


                steam_id:
                  steamId
                    ? (
                        steamId.value.trim() ||
                        null
                      )
                    : null,


                game_nickname:
                  gameNickname
                    ? (
                        gameNickname.value.trim() ||
                        null
                      )
                    : null,


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

              showMessage(
                "Не вдалося зберегти напрямки: " +
                directionsError.message,
                "error"
              );


              return;

            }


            selectedDirections =
              directions ||
              [];

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

          currentAvatarUrl =
            newAvatarUrl;


          if (
            newAvatarUrl &&
            profileAvatar
          ) {

            profileAvatar.src =
              newAvatarUrl;

          }


          // ==================================
          // ОНОВЛЮЄМО ІМ'Я
          // ==================================

          if (
            displayName &&
            displayName.value.trim() &&
            profileNamePreview
          ) {

            profileNamePreview.textContent =
              displayName
                .value
                .trim();

          }


          // ==================================
          // ОЧИЩАЄМО ВИБІР ФАЙЛУ
          // ==================================

          if (avatarInput) {

            avatarInput.value =
              "";

          }


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

    await loadApplicationStatus();

    await loadUserRoles();


  }
);
