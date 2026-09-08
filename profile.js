document.addEventListener(
  "DOMContentLoaded",
  async () => {

    /* =========================================
       ЕЛЕМЕНТИ
       ========================================= */

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


    const avatarInput =
      document.getElementById(
        "avatarUrl"
      );


    const profileAvatar =
      document.getElementById(
        "profileAvatar"
      );


    const profileNamePreview =
      document.getElementById(
        "profileNamePreview"
      );


    const profileRolePreview =
      document.getElementById(
        "profileRolePreview"
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


    const logoutButton =
      document.getElementById(
        "logoutButton"
      );


    const profileMessage =
      document.getElementById(
        "profileMessage"
      );


    /* =========================================
       SUPABASE
       ========================================= */

    if (
      typeof supabase === "undefined"
    ) {

      console.error(
        "Supabase не знайдено"
      );

      return;

    }


    /* =========================================
       ОТРИМУЄМО КОРИСТУВАЧА
       ========================================= */

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


    const userId =
      user.id;


    /* =========================================
       ПОВІДОМЛЕННЯ
       ========================================= */

    function showMessage(
      text,
      type = "success"
    ) {

      profileMessage.textContent =
        text;


      profileMessage.className =
        "profile-message " +
        type;


      setTimeout(
        () => {

          profileMessage.textContent =
            "";

          profileMessage.className =
            "profile-message";

        },
        5000
      );

    }


    /* =========================================
       ЗАВАНТАЖЕННЯ ПРОФІЛЮ
       ========================================= */

    async function loadProfile() {

      const {
        data,
        error

      } = await supabase
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


      if (
        error
      ) {

        console.error(
          "Помилка профілю:",
          error
        );

        return;

      }


      /* =========================================
         ІМ'Я
         ========================================= */

      const name =
        data?.display_name ||
        user.email ||
        "UA LEGION Member";


      displayName.value =
        data?.display_name ||
        user.email ||
        "";


      profileNamePreview.textContent =
        name;


      /* =========================================
         ДАТА НАРОДЖЕННЯ
         ========================================= */

      birthDate.value =
        data?.birth_date ||
        "";


      /* =========================================
         DISCORD
         ========================================= */

      discordUsername.value =
        data?.discord_username ||
        "";


      discordUserId.value =
        data?.discord_user_id ||
        "";


      /* =========================================
         STEAM
         ========================================= */

      steamId.value =
        data?.steam_id ||
        "";


      /* =========================================
         GAME NICKNAME
         ========================================= */

      gameNickname.value =
        data?.game_nickname ||
        "";


      /* =========================================
         АВАТАР
         ========================================= */

      if (
        data?.avatar_url
      ) {

        profileAvatar.src =
          data.avatar_url;

      }


      /* =========================================
         НАПРЯМКИ
         ========================================= */

      let directions =
        data?.directions ||
        [];


      if (
        typeof directions === "string"
      ) {

        try {

          directions =
            JSON.parse(
              directions
            );

        }

        catch {

          directions =
            directions
              .split(
                ","
              )
              .map(
                item =>
                  item.trim()
              );

        }

      }


      document
        .querySelectorAll(
          'input[name="direction"]'
        )
        .forEach(
          checkbox => {

            checkbox.checked =
              directions.includes(
                checkbox.value
              );

          }
        );

    }


    /* =========================================
       АВАТАР — ПОПЕРЕДНІЙ ПЕРЕГЛЯД
       ========================================= */

    avatarInput.addEventListener(
      "change",
      () => {

        const file =
          avatarInput.files[0];


        if (
          !file
        ) {

          return;

        }


        const previewUrl =
          URL.createObjectURL(
            file
          );


        profileAvatar.src =
          previewUrl;

      }
    );


    /* =========================================
       ЗБЕРЕЖЕННЯ ПРОФІЛЮ
       ========================================= */

    profileForm.addEventListener(
      "submit",
      async event => {

        event.preventDefault();


        const saveButton =
          document.getElementById(
            "saveProfile"
          );


        saveButton.disabled =
          true;


        saveButton.textContent =
          "⏳ ЗБЕРЕЖЕННЯ...";


        try {


          /* =========================================
             НАПРЯМКИ
             ========================================= */

          const directions =
            Array.from(
              document.querySelectorAll(
                'input[name="direction"]:checked'
              )
            )
            .map(
              checkbox =>
                checkbox.value
            );


          /* =========================================
             АВАТАР
             ========================================= */

          let avatarUrl =
            profileAvatar.src;


          const file =
            avatarInput.files[0];


          if (
            file
          ) {

            const fileExtension =
              file.name
                .split(
                  "."
                )
                .pop();


            const fileName =
              `avatar-${Date.now()}.${fileExtension}`;


            const filePath =
              `${userId}/${fileName}`;


            const {
              error: uploadError

            } = await supabase
              .storage
              .from(
                "avatars"
              )
              .upload(
                filePath,
                file,
                {
                  upsert:
                    true
                }
              );


            if (
              uploadError
            ) {

              throw uploadError;

            }


            const {
              data: publicUrlData

            } = supabase
              .storage
              .from(
                "avatars"
              )
              .getPublicUrl(
                filePath
              );


            avatarUrl =
              publicUrlData.publicUrl;

          }


          /* =========================================
             ЗБЕРЕЖЕННЯ В БАЗУ
             ========================================= */

          const profileData = {

            id:
              userId,

            display_name:
              displayName.value.trim(),

            birth_date:
              birthDate.value ||
              null,

            discord_username:
              discordUsername.value.trim(),

            discord_user_id:
              discordUserId.value.trim(),

            steam_id:
              steamId.value.trim(),

            game_nickname:
              gameNickname.value.trim(),

            directions:
              directions,

            avatar_url:
              avatarUrl,

            updated_at:
              new Date().toISOString()

          };


          const {
            error

          } = await supabase
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


          if (
            error
          ) {

            throw error;

          }


          profileNamePreview.textContent =
            displayName.value.trim() ||
            user.email;


          showMessage(
            "Профіль успішно збережено!",
            "success"
          );

        }


        catch (
          error
        ) {

          console.error(
            error
          );


          showMessage(
            "Помилка збереження: " +
            error.message,
            "error"
          );

        }


        finally {

          saveButton.disabled =
            false;


          saveButton.textContent =
            "💾 ЗБЕРЕГТИ ПРОФІЛЬ";

        }

      }
    );


    /* =========================================
       ЗАЯВКА
       ========================================= */

    async function loadApplication() {

      try {

        const {
          data,
          error

        } = await supabase
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


        if (
          error
        ) {

          throw error;

        }


        if (
          !data
        ) {

          applicationStatus.className =
            "application-card none";


          applicationStatus.innerHTML =
            `
              <h3>
                📝 Заявки немає
              </h3>

              <p>
                Ви ще не подавали заявку до UA LEGION.
              </p>
            `;


          return;

        }


        const status =
          String(
            data.status ||
            "pending"
          )
          .toLowerCase();


        if (
          status === "approved"
        ) {

          applicationStatus.className =
            "application-card approved";


          applicationStatus.innerHTML =
            `
              <h3>
                ✅ Заявку схвалено
              </h3>

              <p>
                Вітаємо! Ви є учасником UA LEGION.
              </p>
            `;

        }


        else if (
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
                Ваша заявка була відхилена.
                Ви можете подати нову заявку.
              </p>
            `;

        }


        else {

          applicationStatus.className =
            "application-card pending";


          applicationStatus.innerHTML =
            `
              <h3>
                ⏳ Заявка на розгляді
              </h3>

              <p>
                Адміністрація ще розглядає вашу заявку.
              </p>
            `;

        }

      }


      catch (
        error
      ) {

        console.error(
          "Помилка заявки:",
          error
        );


        applicationStatus.className =
          "application-card";


        applicationStatus.innerHTML =
          `
            <h3>
              ⚠️ Помилка
            </h3>

            <p>
              Не вдалося завантажити заявку.
            </p>
          `;

      }

    }


    /* =========================================
       РОЛІ
       ========================================= */

    async function loadRoles() {

      try {

        const {
          data,
          error

        } = await supabase
          .from(
            "user_roles"
          )
          .select(
            `
              *,
              roles (
                id,
                name,
                description
              )
            `
          )
          .eq(
            "user_id",
            userId
          );


        if (
          error
        ) {

          throw error;

        }


        if (
          !data ||
          data.length === 0
        ) {

          rolesList.innerHTML =
            `
              <div class="roles-empty">
                У вас поки немає призначених ролей.
              </div>
            `;


          return;

        }


        rolesList.innerHTML =
          "";


        let hasGlobalAdmin =
          false;


        data.forEach(
          item => {

            const role =
              item.roles ||
              {};


            const roleName =
              role.name ||
              item.role_name ||
              "Учасник";


            const roleDescription =
              role.description ||
              item.description ||
              "UA LEGION";


            const normalizedName =
              roleName
                .toLowerCase();


            const isGlobalAdmin =
              normalizedName.includes(
                "глобаль"
              ) ||
              normalizedName.includes(
                "global"
              );


            if (
              isGlobalAdmin
            ) {

              hasGlobalAdmin =
                true;

            }


            const roleCard =
              document.createElement(
                "div"
              );


            roleCard.className =
              isGlobalAdmin
                ? "role-card global-admin"
                : "role-card";


            roleCard.innerHTML =
              `
                <h3>
                  ${
                    isGlobalAdmin
                      ? "👑 "
                      : "🏅 "
                  }
                  ${roleName}
                </h3>

                <p>
                  ${roleDescription}
                </p>
              `;


            rolesList.appendChild(
              roleCard
            );

          }
        );


        /* =========================================
           ПІДПИС ПІД АВАТАРОМ
           ========================================= */

        if (
          hasGlobalAdmin
        ) {

          profileRolePreview.textContent =
            "👑 Глобальна адміністрація UA LEGION";

        }

      }


      catch (
        error
      ) {

        console.error(
          "Помилка ролей:",
          error
        );


        rolesList.innerHTML =
          `
            <div class="roles-empty">
              Не вдалося завантажити ролі.
            </div>
          `;

      }

    }


    /* =========================================
       ВИХІД
       ========================================= */

    logoutButton.addEventListener(
      "click",
      async () => {

        await supabase.auth.signOut();


        window.location.href =
          "index.html";

      }
    );


    /* =========================================
       ЗАВАНТАЖЕННЯ ВСЬОГО
       ========================================= */

    await loadProfile();

    await loadApplication();

    await loadRoles();

  }
);
