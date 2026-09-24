/* =========================================================
   UA LEGION — join.js
   Подача заявки на вступ

   Логіка:
   - Дані профілю беремо з profiles.
   - Одна заявка = один напрямок.
   - Повторна заявка дозволена для іншого напрямку.
   - Активний напрямок у user_directions блокує повторну заявку.
   - Активна/схвалена заявка також блокує повторну заявку.
   - Відхилену заявку можна подати повторно.
   - Уже недоступні напрямки приховуються з форми.
   - Перед submit виконується повторна перевірка.
   - Неактивні форми ігрових напрямків вимикаються.
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

  const supabase = window.supabaseClient;

  if (!supabase) {
    console.error(
      "UA LEGION: Supabase client не знайдено."
    );
    return;
  }


  // ---------------------------------------------------------
  // DOM
  // ---------------------------------------------------------

  const applicationForm =
    document.getElementById("applicationForm");

  const submitButton =
    document.getElementById("submitApplication");

  const formMessage =
    document.getElementById("formMessage");

  const directionInputs =
    document.querySelectorAll(
      'input[name="direction"]'
    );


  const gameForms = {

    ets2:
      document.getElementById("ets2Form"),

    wot:
      document.getElementById("wotForm"),

    dota2:
      document.getElementById("dota2Form"),

    wow:
      document.getElementById("wowForm")

  };


  // ---------------------------------------------------------
  // DATA
  // ---------------------------------------------------------

  let activeUserDirections = new Set();

  let activeApplicationDirections =
    new Set();


  // ---------------------------------------------------------
  // HELPERS
  // ---------------------------------------------------------

  function showMessage(
    message,
    type = "error"
  ) {

    if (!formMessage) {
      return;
    }

    formMessage.textContent =
      message;

    formMessage.className = "";

    formMessage.classList.add(
      "show",
      type
    );

  }


  function clearMessage() {

    if (!formMessage) {
      return;
    }

    formMessage.textContent = "";

    formMessage.className = "";

  }


  function getValue(id) {

    const element =
      document.getElementById(id);

    if (!element) {
      return null;
    }

    const value =
      element.value?.trim();

    return value === ""
      ? null
      : value;

  }


  function getSelectedDirection() {

    const selected =
      document.querySelector(
        'input[name="direction"]:checked'
      );

    return selected
      ? selected.value
      : null;

  }


  function normalizeDirection(value) {

    if (!value) {
      return null;
    }

    const text =
      String(value)
        .trim()
        .toLowerCase();


    if (
      text === "ets2" ||
      text === "ets2/truckersmp"
    ) {

      return "ets2";

    }


    if (
      text === "wot" ||
      text === "world of tanks"
    ) {

      return "wot";

    }


    if (
      text === "dota2" ||
      text === "dota 2" ||
      text === "dota"
    ) {

      return "dota2";

    }


    if (
      text === "wow" ||
      text === "world of warcraft"
    ) {

      return "wow";

    }


    return text;

  }


  function getDirectionLabel(
    direction
  ) {

    switch (
      normalizeDirection(direction)
    ) {

      case "ets2":

        return "🚛 ETS2 / TruckersMP";


      case "wot":

        return "🪖 World of Tanks";


      case "dota2":

        return "⚔️ Dota 2";


      case "wow":

        return "🐉 World of Warcraft";


      default:

        return String(
          direction ||
          "напрямок"
        );

    }

  }


  function calculateAge(
    birthDate
  ) {

    if (!birthDate) {
      return null;
    }

    const birth =
      new Date(
        `${birthDate}T00:00:00`
      );


    if (
      Number.isNaN(
        birth.getTime()
      )
    ) {

      return null;

    }


    const today =
      new Date();


    let age =
      today.getFullYear() -
      birth.getFullYear();


    const monthDifference =
      today.getMonth() -
      birth.getMonth();


    if (
      monthDifference < 0 ||
      (
        monthDifference === 0 &&
        today.getDate() <
        birth.getDate()
      )
    ) {

      age--;

    }


    return age >= 0
      ? age
      : null;

  }


  function getFallbackName(
    user,
    profile
  ) {

    return (

      profile?.display_name?.trim() ||

      user?.user_metadata
        ?.full_name
        ?.trim() ||

      user?.user_metadata
        ?.name
        ?.trim() ||

      user?.user_metadata
        ?.display_name
        ?.trim() ||

      user?.email
        ?.split("@")[0]
        ?.trim() ||

      null

    );

  }


  function setFormEnabled(
    container,
    enabled
  ) {

    if (!container) {
      return;
    }


    const controls =
      container.querySelectorAll(
        "input, select, textarea, button"
      );


    controls.forEach(
      control => {

        control.disabled =
          !enabled;

      }
    );

  }


  function hideAllGameForms() {

    Object.values(
      gameForms
    ).forEach(
      form => {

        if (!form) {
          return;
        }


        form.classList.remove(
          "active"
        );


        setFormEnabled(
          form,
          false
        );

      }
    );

  }


  function showGameForm(
    direction
  ) {

    hideAllGameForms();


    const normalizedDirection =
      normalizeDirection(
        direction
      );


    const form =
      gameForms[
        normalizedDirection
      ];


    if (!form) {
      return;
    }


    form.classList.add(
      "active"
    );


    setFormEnabled(
      form,
      true
    );

  }


  // ---------------------------------------------------------
  // APPLICATION HELPERS
  // ---------------------------------------------------------

  function getDirectionsFromApplication(
    application
  ) {

    const result = [];


    if (
      application?.direction
    ) {

      result.push(
        application.direction
      );

    }


    const directions =
      application?.directions;


    if (
      Array.isArray(
        directions
      )
    ) {

      result.push(
        ...directions
      );

    }


    else if (
      typeof directions ===
      "string"
    ) {

      try {

        const parsed =
          JSON.parse(
            directions
          );


        if (
          Array.isArray(
            parsed
          )
        ) {

          result.push(
            ...parsed
          );

        }

        else {

          result.push(
            directions
          );

        }

      }

      catch {

        result.push(
          directions
        );

      }

    }


    return result

      .map(
        normalizeDirection
      )

      .filter(
        Boolean
      );

  }


  function isActiveApplicationStatus(
    status
  ) {

    const normalized =
      String(
        status || ""
      )
        .trim()
        .toLowerCase();


    return [

      "pending",

      "approved",

      "new",

      "review",

      "under_review",

      "in_review"

    ].includes(
      normalized
    );

  }


  // ---------------------------------------------------------
  // LOAD USER DIRECTIONS
  // ---------------------------------------------------------

  async function loadUserDirections() {

    activeUserDirections =
      new Set();


    const {
      data,
      error
    } = await supabase

      .from(
        "user_directions"
      )

      .select(
        "direction_id,status,direction:directions(id,slug,name)"
      )

      .eq(
        "user_id",
        user.id
      );


    if (error) {

      console.error(
        "UA LEGION: помилка завантаження user_directions:",
        error
      );


      throw error;

    }


    (data || []).forEach(
      item => {

        const status =
          String(
            item.status || ""
          )
            .trim()
            .toLowerCase();


        // Нас цікавлять тільки активні
        // членства в напрямках.

        if (
          status !== "active"
        ) {

          return;

        }


        const direction =
          item.direction;


        if (
          direction?.slug
        ) {

          activeUserDirections.add(
            normalizeDirection(
              direction.slug
            )
          );

        }


        else if (
          item.direction_id !==
          null &&
          item.direction_id !==
          undefined
        ) {

          /*
             Якщо relation directions
             недоступний через RLS,
             direction_id все одно
             зберігаємо окремо.

             Нижче він буде зіставлений
             із значенням input.
          */

          activeUserDirections.add(
            String(
              item.direction_id
            )
          );

        }

      }
    );


    console.log(
      "UA LEGION: активні напрямки користувача:",
      [
        ...activeUserDirections
      ]
    );

  }


  // ---------------------------------------------------------
  // LOAD APPLICATIONS
  // ---------------------------------------------------------

  async function loadUserApplications() {

    activeApplicationDirections =
      new Set();


    const {
      data,
      error
    } = await supabase

      .from(
        "applications"
      )

      .select(
        "id,status,direction,directions,created_at"
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
      );


    if (error) {

      console.error(
        "UA LEGION: помилка завантаження заявок:",
        error
      );


      throw error;

    }


    const applications =
      data || [];


    applications.forEach(
      application => {

        if (
          !isActiveApplicationStatus(
            application.status
          )
        ) {

          return;

        }


        const directions =
          getDirectionsFromApplication(
            application
          );


        directions.forEach(
          direction => {

            activeApplicationDirections.add(
              direction
            );

          }
        );

      }
    );


    console.log(
      "UA LEGION: активні заявки:",
      [
        ...activeApplicationDirections
      ]
    );

  }


  // ---------------------------------------------------------
  // CHECK WHETHER DIRECTION IS BLOCKED
  // ---------------------------------------------------------

  function isDirectionBlocked(
    direction
  ) {

    const normalized =
      normalizeDirection(
        direction
      );


    if (!normalized) {
      return false;
    }


    // 1. Уже є активне членство

    if (
      activeUserDirections.has(
        normalized
      )
    ) {

      return true;

    }


    // 2. Уже є активна заявка

    if (
      activeApplicationDirections.has(
        normalized
      )
    ) {

      return true;

    }


    return false;

  }


  // ---------------------------------------------------------
  // HIDE / DISABLE BLOCKED DIRECTIONS
  // ---------------------------------------------------------

  function updateDirectionAvailability() {

    directionInputs.forEach(
      input => {

        const direction =
          normalizeDirection(
            input.value
          );


        const blocked =
          isDirectionBlocked(
            direction
          );


        const label =
          input.closest(
            "label"
          );


        const card =
          input.closest(
            ".direction-card"
          );


        /*
          Підтримуємо різні варіанти
          HTML-структури.

          Якщо direction-card існує —
          працюємо з ним.

          Якщо ні —
          працюємо з label.
        */

        const wrapper =
          card ||
          label;


        if (blocked) {

          input.checked =
            false;

          input.disabled =
            true;


          if (wrapper) {

            wrapper.style.display =
              "none";

            wrapper.classList.add(
              "direction-unavailable"
            );

          }

        }

        else {

          input.disabled =
            false;


          if (wrapper) {

            wrapper.style.display =
              "";

            wrapper.classList.remove(
              "direction-unavailable"
            );

          }

        }

      }
    );


    /*
      Якщо початковий direction
      виявився заблокованим —
      ховаємо всі ігрові форми.
    */

    const selected =
      document.querySelector(
        'input[name="direction"]:checked'
      );


    if (!selected) {

      hideAllGameForms();

    }

  }


  // ---------------------------------------------------------
  // AUTH
  // ---------------------------------------------------------

  const {
    data: {
      user
    },
    error: authError
  } =
    await supabase.auth.getUser();


  if (authError) {

    console.error(
      "UA LEGION: помилка отримання користувача:",
      authError
    );


    showMessage(
      "Не вдалося перевірити авторизацію. Оновіть сторінку.",
      "error"
    );


    return;

  }


  if (!user) {

    showMessage(
      "Щоб подати заявку, спочатку увійдіть у свій акаунт.",
      "error"
    );


    setTimeout(
      () => {

        window.location.href =
          "login.html";

      },
      1200
    );


    return;

  }


  // ---------------------------------------------------------
  // LOAD PROFILE
  // ---------------------------------------------------------

  const {
    data: profile,
    error: profileError
  } =
    await supabase

      .from(
        "profiles"
      )

      .select(
        "display_name,birth_date,discord_username,discord_user_id,steam_id,game_nickname"
      )

      .eq(
        "id",
        user.id
      )

      .maybeSingle();


  if (profileError) {

    console.error(
      "UA LEGION: помилка завантаження профілю:",
      profileError
    );


    showMessage(
      "Не вдалося завантажити дані профілю.",
      "error"
    );


    return;

  }


  const profileName =
    getFallbackName(
      user,
      profile
    );


  const profileAge =
    calculateAge(
      profile?.birth_date
    );


  if (!profileName) {

    showMessage(
      "Спочатку заповніть ім'я у своєму профілі.",
      "error"
    );


    return;

  }


  if (
    profileAge === null
  ) {

    showMessage(
      "Спочатку заповніть дату народження у своєму профілі.",
      "error"
    );


    return;

  }


  // ---------------------------------------------------------
  // LOAD MEMBERSHIP + APPLICATIONS
  // ---------------------------------------------------------

  try {

    await loadUserDirections();

    await loadUserApplications();

  }

  catch (error) {

    console.error(
      "UA LEGION: не вдалося перевірити доступні напрямки:",
      error
    );


    showMessage(
      "Не вдалося перевірити ваші поточні напрямки. Оновіть сторінку.",
      "error"
    );


    return;

  }


  // ---------------------------------------------------------
  // DIRECTION AVAILABILITY
  // ---------------------------------------------------------

  updateDirectionAvailability();


  // ---------------------------------------------------------
  // DIRECTION CHANGE
  // ---------------------------------------------------------

  directionInputs.forEach(
    input => {

      input.addEventListener(
        "change",
        () => {

          clearMessage();


          const direction =
            normalizeDirection(
              input.value
            );


          if (
            isDirectionBlocked(
              direction
            )
          ) {

            input.checked =
              false;


            showMessage(
              `Напрямок ${getDirectionLabel(
                direction
              )} вже недоступний для нової заявки.`,
              "error"
            );


            hideAllGameForms();

            return;

          }


          showGameForm(
            direction
          );

        }
      );

    }
  );


  // ---------------------------------------------------------
  // INITIAL DIRECTION
  // ---------------------------------------------------------

  const initialDirection =
    getSelectedDirection();


  if (
    initialDirection &&
    !isDirectionBlocked(
      initialDirection
    )
  ) {

    showGameForm(
      initialDirection
    );

  }

  else {

    hideAllGameForms();

  }


  // ---------------------------------------------------------
  // APPLICATION FORM
  // ---------------------------------------------------------

  if (!applicationForm) {

    console.error(
      "UA LEGION: #applicationForm не знайдено."
    );


    return;

  }


  // ---------------------------------------------------------
  // SUBMIT
  // ---------------------------------------------------------

  applicationForm.addEventListener(
    "submit",
    async event => {

      event.preventDefault();

      clearMessage();


      const direction =
        normalizeDirection(
          getSelectedDirection()
        );


      if (!direction) {

        showMessage(
          "Оберіть доступний напрямок, до якого хочете подати заявку.",
          "error"
        );


        return;

      }


      // ---------------------------------------------------
      // FINAL SECURITY CHECK
      // ---------------------------------------------------

      try {

        await loadUserDirections();

        await loadUserApplications();

      }

      catch (error) {

        console.error(
          "UA LEGION: помилка повторної перевірки:",
          error
        );


        showMessage(
          "Не вдалося перевірити доступність напрямку. Спробуйте ще раз.",
          "error"
        );


        return;

      }


      if (
        isDirectionBlocked(
          direction
        )
      ) {

        showMessage(
          `Ви вже є учасником або маєте активну заявку на напрямок ${getDirectionLabel(
            direction
          )}.`,
          "error"
        );


        updateDirectionAvailability();

        return;

      }


      // ---------------------------------------------------
      // APPLICATION DATA
      // ---------------------------------------------------

      const applicationData = {

        user_id:
          user.id,

        name:
          profileName,

        age:
          profileAge,

        discord_nick:
          profile?.discord_username ||
          null,

        discord_id:
          profile?.discord_user_id ||
          null,

        steam_id:
          profile?.steam_id ||
          null,

        direction:
          direction,

        directions:
          [
            direction.toUpperCase()
          ],

        status:
          "pending",

        about:
          getValue("about")

      };


      // ---------------------------------------------------
      // ETS2
      // ---------------------------------------------------

      if (
        direction === "ets2"
      ) {

        applicationData.truckersmp_nick =
          getValue(
            "truckersmpNick"
          );


        applicationData.truckersmp_id =
          getValue(
            "truckersmpId"
          );


        applicationData.truckershub_username =
          getValue(
            "truckershubUsername"
          );


        applicationData.truckershub_id =
          getValue(
            "truckershubId"
          );


        applicationData.game_nick =
          applicationData.truckersmp_nick ||
          profile?.game_nickname ||
          null;

      }


      // ---------------------------------------------------
      // WORLD OF TANKS
      // ---------------------------------------------------

      if (
        direction === "wot"
      ) {

        applicationData.wot_nickname =
          getValue(
            "wotNickname"
          );


        applicationData.wargaming_id =
          getValue(
            "wargamingId"
          );


        applicationData.wot_region =
          getValue(
            "wotRegion"
          );


        applicationData.game_nick =
          applicationData.wot_nickname ||
          profile?.game_nickname ||
          null;

      }


      // ---------------------------------------------------
      // DOTA 2
      // ---------------------------------------------------

      if (
        direction === "dota2"
      ) {

        applicationData.dota_nickname =
          getValue(
            "dotaNickname"
          );


        applicationData.dota_friend_id =
          getValue(
            "dotaFriendId"
          );


        applicationData.dota_rank =
          getValue(
            "dotaRank"
          );


        applicationData.game_nick =
          applicationData.dota_nickname ||
          profile?.game_nickname ||
          null;

      }


      // ---------------------------------------------------
      // WORLD OF WARCRAFT
      // ---------------------------------------------------

      if (
        direction === "wow"
      ) {

        applicationData.battle_tag =
          getValue(
            "battleTag"
          );


        applicationData.wow_character =
          getValue(
            "wowCharacter"
          );


        applicationData.wow_realm =
          getValue(
            "wowRealm"
          );


        applicationData.wow_faction =
          getValue(
            "wowFaction"
          );


        applicationData.wow_class =
          getValue(
            "wowClass"
          );


        applicationData.game_nick =
          applicationData.wow_character ||
          profile?.game_nickname ||
          null;

      }


      // ---------------------------------------------------
      // SUBMIT UI
      // ---------------------------------------------------

      if (submitButton) {

        submitButton.disabled =
          true;


        submitButton.dataset.originalText =
          submitButton.textContent;


        submitButton.textContent =
          "Відправлення...";

      }


      try {

        console.log(
          "UA LEGION: відправляємо заявку:",
          applicationData
        );


        const {
          data: insertedApplication,
          error: insertError
        } =
          await supabase

            .from(
              "applications"
            )

            .insert(
              applicationData
            )

            .select()
            .single();


        if (insertError) {

          console.error(
            "UA LEGION: помилка створення заявки:",
            insertError
          );


          if (
            insertError.code ===
              "23502" &&
            String(
              insertError.message ||
              ""
            ).includes(
              "name"
            )
          ) {

            showMessage(
              "Не вдалося створити заявку: у профілі не заповнене ім'я.",
              "error"
            );

          }

          else {

            showMessage(
              `Не вдалося відправити заявку: ${
                insertError.message ||
                "невідома помилка"
              }`,
              "error"
            );

          }


          return;

        }


        console.log(
          "UA LEGION: заявку створено:",
          insertedApplication
        );


        showMessage(
          `Заявку на напрямок ${getDirectionLabel(
            direction
          )} успішно відправлено.`,
          "success"
        );


        setTimeout(
          () => {

            window.location.href =
              "profile.html";

          },
          1500
        );

      }


      catch (error) {

        console.error(
          "UA LEGION: неочікувана помилка:",
          error
        );


        showMessage(
          "Сталася неочікувана помилка. Спробуйте ще раз.",
          "error"
        );

      }


      finally {

        if (submitButton) {

          submitButton.disabled =
            false;


          submitButton.textContent =
            submitButton.dataset
              .originalText ||
            "Подати заявку";

        }

      }

    }
  );

});
