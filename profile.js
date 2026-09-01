// ==========================================
// UA LEGION — PROFILE SYSTEM
// ==========================================


document.addEventListener(
  "DOMContentLoaded",
  async function () {


    const supabase =
      window.supabaseClient;


    // ======================================
    // ПЕРЕВІРКА SUPABASE
    // ======================================

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
      }
    } =
      await supabase.auth.getUser();


    // Якщо користувач не увійшов

    if (!user) {

      window.location.href =
        "login.html";

      return;

    }


    console.log(
      "Авторизований користувач:",
      user
    );


    // ======================================
    // ЕЛЕМЕНТИ
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


    // ======================================
    // ПОКАЗ ПОВІДОМЛЕННЯ
    // ======================================

    function showMessage(
      message,
      type = "success"
    ) {

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

      } =
        await supabase
          .from("profiles")
          .select("*")
          .eq(
            "id",
            user.id
          )
          .single();


      if (error) {

        console.error(
          "Помилка завантаження профілю:",
          error
        );

        return;

      }


      // Ім'я

      if (profile.display_name) {

        displayName.value =
          profile.display_name;


        profileNamePreview.textContent =
          profile.display_name;

      }


      // Дата народження

      if (profile.birth_date) {

        birthDate.value =
          profile.birth_date;

      }


      // Аватар

      if (profile.avatar_url) {

        avatarUrl.value =
          profile.avatar_url;


        profileAvatar.src =
          profile.avatar_url;

      }


      // Discord username

      if (profile.discord_username) {

        discordUsername.value =
          profile.discord_username;

      }


      // Discord ID

      if (profile.discord_user_id) {

        discordUserId.value =
          profile.discord_user_id;

      }


      // Steam ID

      if (profile.steam_id) {

        steamId.value =
          profile.steam_id;

      }


      // Game nickname

      if (profile.game_nickname) {

        gameNickname.value =
          profile.game_nickname;

      }

    }


    // ======================================
    // ЗАВАНТАЖЕННЯ НАПРЯМКІВ
    // ======================================

    async function loadDirections() {


      const {

        data: directions,

        error

      } =
        await supabase
          .from(
            "profile_directions"
          )
          .select(
            `
            direction_id,
            directions (
              slug
            )
            `
          )
          .eq(
            "profile_id",
            user.id
          );


      if (error) {

        console.error(
          "Помилка напрямків:",
          error
        );

        return;

      }


      directions.forEach(
        function (item) {

          if (
            !item.directions
          ) {

            return;

          }


          const checkbox =
            document.querySelector(
              `input[name="direction"][value="${item.directions.slug}"]`
            );


          if (checkbox) {

            checkbox.checked =
              true;

          }

        }
      );

    }


    // ======================================
    // ЗБЕРЕЖЕННЯ ПРОФІЛЮ
    // ======================================

    profileForm.addEventListener(
      "submit",
      async function (
        event
      ) {

        event.preventDefault();


        showMessage(
          "Збереження..."
        );


        // ================================
        // ОНОВЛЕННЯ ПРОФІЛЮ
        // ================================

        const {

          error: profileError

        } =
          await supabase
            .from(
              "profiles"
            )
            .upsert({

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

            });


        if (profileError) {

          console.error(
            profileError
          );


          showMessage(
            profileError.message,
            "error"
          );


          return;

        }


        // ================================
        // ВИДАЛЯЄМО СТАРІ НАПРЯМКИ
        // ================================

        const {

          error: deleteError

        } =
          await supabase
            .from(
              "profile_directions"
            )
            .delete()
            .eq(
              "profile_id",
              user.id
            );


        if (deleteError) {

          console.error(
            deleteError
          );


          showMessage(
            deleteError.message,
            "error"
          );


          return;

        }


        // ================================
        // ВИБРАНІ НАПРЯМКИ
        // ================================

        const selectedDirections =
          Array.from(

            document.querySelectorAll(
              'input[name="direction"]:checked'
            )

          ).map(

            checkbox =>
              checkbox.value

          );


        // ================================
        // ЗБЕРІГАЄМО НАПРЯМКИ
        // ================================

        for (
          const slug
          of selectedDirections
        ) {


          const {

            data: direction,

            error: directionError

          } =
            await supabase
              .from(
                "directions"
              )
              .select(
                "id"
              )
              .eq(
                "slug",
                slug
              )
              .single();


          if (directionError) {

            console.error(
              directionError
            );

            continue;

          }


          const {

            error: insertError

          } =
            await supabase
              .from(
                "profile_directions"
              )
              .insert({

                profile_id:
                  user.id,


                direction_id:
                  direction.id

              });


          if (insertError) {

            console.error(
              insertError
            );

          }

        }


        // ================================
        // ОНОВЛЮЄМО АВАТАР
        // ================================

        if (
          avatarUrl.value.trim()
        ) {

          profileAvatar.src =
            avatarUrl.value.trim();

        }


        // ================================
        // ОНОВЛЮЄМО ІМ'Я
        // ================================

        if (
          displayName.value.trim()
        ) {

          profileNamePreview.textContent =
            displayName.value.trim();

        }


        showMessage(
          "Профіль успішно збережено!",
          "success"
        );

      }
    );


    // ======================================
    // ВИХІД
    // ======================================

    const logoutButton =
      document.getElementById(
        "logoutButton"
      );


    logoutButton.addEventListener(
      "click",
      async function () {


        await supabase
          .auth
          .signOut();


        window.location.href =
          "index.html";

      }
    );


    // ======================================
    // ЗАВАНТАЖУЄМО ДАНІ
    // ======================================

    await loadProfile();

    await loadDirections();


  }
);
