// UA LEGION — PROFILE SYSTEM
// profile.js

document.addEventListener("DOMContentLoaded", async () => {

  const supabase = window.supabaseClient;

  if (!supabase) {
    console.error("Supabase не підключений");
    return;
  }

  // ======================================
  // ПЕРЕВІРКА АВТОРИЗАЦІЇ
  // ======================================

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    window.location.href = "login.html";
    return;
  }

  // ======================================
  // ЕЛЕМЕНТИ СТОРІНКИ
  // ======================================

  const profileForm = document.getElementById("profileForm");

  const displayName =
    document.getElementById("displayName");

  const birthDate =
    document.getElementById("birthDate");

  const avatarUrl =
    document.getElementById("avatarUrl");

  const discordUsername =
    document.getElementById("discordUsername");

  const discordUserId =
    document.getElementById("discordUserId");

  const steamId =
    document.getElementById("steamId");

  const gameNickname =
    document.getElementById("gameNickname");

  const profileAvatar =
    document.getElementById("profileAvatar");

  const profileNamePreview =
    document.getElementById("profileNamePreview");

  const messageBox =
    document.getElementById("profileMessage");

  const logoutButton =
    document.getElementById("logoutButton");


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

    messageBox.textContent = message;

    messageBox.className =
      "profile-message " + type;

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


    // -------------------------------
    // ІМ'Я
    // -------------------------------

    if (profile.display_name) {

      displayName.value =
        profile.display_name;

      if (profileNamePreview) {

        profileNamePreview.textContent =
          profile.display_name;

      }

    }


    // -------------------------------
    // ДАТА НАРОДЖЕННЯ
    // -------------------------------

    if (profile.birth_date) {

      birthDate.value =
        profile.birth_date;

    }


    // -------------------------------
    // АВАТАР
    // -------------------------------

    if (profile.avatar_url) {

      avatarUrl.value =
        profile.avatar_url;

      if (profileAvatar) {

        profileAvatar.src =
          profile.avatar_url;

      }

    }


    // -------------------------------
    // DISCORD USERNAME
    // -------------------------------

    if (profile.discord_username) {

      discordUsername.value =
        profile.discord_username;

    }


    // -------------------------------
    // DISCORD USER ID
    // -------------------------------

    if (profile.discord_user_id) {

      discordUserId.value =
        profile.discord_user_id;

    }


    // -------------------------------
    // STEAM ID
    // -------------------------------

    if (profile.steam_id) {

      steamId.value =
        profile.steam_id;

    }


    // -------------------------------
    // ІГРОВИЙ НІК
    // -------------------------------

    if (profile.game_nickname) {

      gameNickname.value =
        profile.game_nickname;

    }

  }


  // ======================================
  // ЗАВАНТАЖЕННЯ НАПРЯМКІВ
  // ======================================

  async function loadDirections() {


    // -------------------------------
    // ОТРИМУЄМО ВСІ НАПРЯМКИ
    // -------------------------------

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


    // -------------------------------
    // СТВОРЮЄМО КАРТУ
    // ID → SLUG
    // -------------------------------

    const directionMap =
      new Map(

        allDirections.map(
          (direction) => [

            String(direction.id),

            direction.slug

          ]
        )

      );


    // -------------------------------
    // ОТРИМУЄМО НАПРЯМКИ
    // ПОТОЧНОГО КОРИСТУВАЧА
    // -------------------------------

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

      showMessage(
        selectedError.message,
        "error"
      );

      return;
    }


    // -------------------------------
    // ОЧИЩАЄМО ЧЕКБОКСИ
    // -------------------------------

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


    // -------------------------------
    // ВІДМІЧАЄМО
    // ЗБЕРЕЖЕНІ НАПРЯМКИ
    // -------------------------------

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
  // ЗАВАНТАЖЕННЯ РОЛЕЙ КОРИСТУВАЧА
  // ======================================

  async function loadUserRoles() {

    const {
      data,
      error
    } = await supabase
      .from("user_roles")
      .select(`
        user_id,
        role_id,
        direction_id,

        roles (
          code,
          name
        ),

        directions (
          name,
          slug
        )
      `)
      .eq(
        "user_id",
        user.id
      )
      .order(
        "direction_id",
        {
          ascending: true,
          nullsFirst: true
        }
      );


    if (error) {

      console.error(
        "Помилка завантаження ролей:",
        error
      );

      return;

    }


    // -------------------------------
    // ВИВОДИМО РОЛІ В CONSOLE
    // -------------------------------

    console.log(
      "Ролі користувача:",
      data
    );


    // -------------------------------
    // ЗБЕРІГАЄМО РОЛІ
    // ГЛОБАЛЬНО
    // -------------------------------

    window.currentUserRoles =
      data || [];

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

                displayName.value.trim()
                  || null,


              birth_date:

                birthDate.value
                  || null,


              avatar_url:

                avatarUrl.value.trim()
                  || null,


              discord_username:

                discordUsername.value.trim()
                  || null,


              discord_user_id:

                discordUserId.value.trim()
                  || null,


              steam_id:

                steamId.value.trim()
                  || null,


              game_nickname:

                gameNickname.value.trim()
                  || null,


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
        // ОТРИМУЄМО ID
        // ВИБРАНИХ НАПРЯМКІВ
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

          avatarUrl.value.trim()

          &&

          profileAvatar

        ) {

          profileAvatar.src =
            avatarUrl.value.trim();

        }


        // ==================================
        // ОНОВЛЮЄМО ІМ'Я
        // ==================================

        if (

          displayName.value.trim()

          &&

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

        await supabase
          .auth
          .signOut();


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
