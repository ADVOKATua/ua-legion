// ======================================
// UA LEGION — JOIN APPLICATION SYSTEM
// join.js
// ======================================

document.addEventListener("DOMContentLoaded", async () => {

  // ======================================
  // SUPABASE
  // ======================================

  const supabase = window.supabaseClient;

  if (!supabase) {
    console.error("Supabase не підключений");
    return;
  }


  // ======================================
  // ELEMENTS
  // ======================================

  const form =
    document.getElementById("applicationForm");

  const formMessage =
    document.getElementById("formMessage");

  const submitButton =
    document.getElementById("submitApplication");


  if (!form) {
    console.error("Форма заявки не знайдена");
    return;
  }


  // ======================================
  // CHECK AUTHORIZATION
  // ======================================

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();


  if (authError || !user) {
    window.location.href = "login.html";
    return;
  }


  // ======================================
  // DIRECTIONS
  // ======================================

  const directions = [
    "ets2",
    "wot",
    "dota2",
    "wow"
  ];


  // ======================================
  // HIDE ALL GAME FORMS
  // ======================================

  function hideAllGameForms() {

    directions.forEach(direction => {

      const gameForm =
        document.getElementById(
          direction + "Form"
        );

      if (gameForm) {
        gameForm.classList.remove("active");
      }

    });

  }


  // ======================================
  // SHOW SELECTED GAME FORM
  // ======================================

  function showGameForm(direction) {

    hideAllGameForms();

    const selectedForm =
      document.getElementById(
        direction + "Form"
      );

    if (selectedForm) {
      selectedForm.classList.add("active");
    }

  }


  // ======================================
  // DIRECTION CHANGE
  // ======================================

  const directionInputs =
    document.querySelectorAll(
      'input[name="direction"]'
    );


  directionInputs.forEach(input => {

    input.addEventListener("change", function () {

      showGameForm(this.value);

    });

  });


  // ======================================
  // MESSAGE
  // ======================================

  function showMessage(text, type = "") {

    if (!formMessage) {
      return;
    }

    formMessage.textContent = text;
    formMessage.className = type;

  }


  // ======================================
  // GET VALUE
  // ======================================

  function getValue(id) {

    const element =
      document.getElementById(id);

    if (!element) {
      return "";
    }

    return (element.value || "").trim();

  }


  // ======================================
  // GET SELECTED DIRECTION
  // ======================================

  function getSelectedDirection() {

    const selected =
      document.querySelector(
        'input[name="direction"]:checked'
      );

    if (!selected) {
      return null;
    }

    return selected.value;

  }


  // ======================================
  // CALCULATE AGE
  // ======================================

  function calculateAge(birthDate) {

    if (!birthDate) {
      return "";
    }

    const birth =
      new Date(birthDate);

    if (Number.isNaN(birth.getTime())) {
      return "";
    }

    const today =
      new Date();

    let age =
      today.getFullYear() -
      birth.getFullYear();

    const month =
      today.getMonth() -
      birth.getMonth();

    if (
      month < 0 ||
      (
        month === 0 &&
        today.getDate() < birth.getDate()
      )
    ) {
      age--;
    }

    return String(age);

  }


  // ======================================
  // LOAD MAIN PROFILE
  // ======================================

  async function loadMainProfile() {

    const {
      data: profile,
      error
    } = await supabase
      .from("profiles")
      .select(`
        display_name,
        birth_date,
        discord_username,
        discord_user_id,
        steam_id
      `)
      .eq("id", user.id)
      .maybeSingle();


    if (error) {

      console.error(
        "Помилка завантаження профілю:",
        error
      );

      return {
        profile: null,
        error
      };

    }


    return {
      profile,
      error: null
    };

  }


  // ======================================
  // MAIN PROFILE
  // ======================================

  const {
    profile,
    error: profileLoadError
  } = await loadMainProfile();


  if (profileLoadError) {

    showMessage(
      "Не вдалося завантажити ваш профіль.",
      "error"
    );

    return;

  }


  // ======================================
  // PROFILE DATA
  // ======================================

  let profileName =
    profile?.display_name ||
    user.user_metadata?.display_name ||
    user.user_metadata?.full_name ||
    user.email ||
    "Користувач";


  let birthDate =
    profile?.birth_date || "";


  let age =
    calculateAge(birthDate);


  let discordUsername =
    profile?.discord_username || "";


  let discordUserId =
    profile?.discord_user_id || "";


  let steamId =
    profile?.steam_id || "";


  // ======================================
  // SUBMIT APPLICATION
  // ======================================

  form.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      // ====================================
      // SELECTED DIRECTION
      // ====================================

      const direction =
        getSelectedDirection();


      if (!direction) {

        showMessage(
          "Оберіть напрямок.",
          "error"
        );

        return;

      }


      // ====================================
      // REFRESH PROFILE BEFORE SUBMIT
      // ====================================

      const {
        data: freshProfile,
        error: freshProfileError
      } = await supabase
        .from("profiles")
        .select(`
          display_name,
          birth_date,
          discord_username,
          discord_user_id,
          steam_id
        `)
        .eq("id", user.id)
        .maybeSingle();


      if (freshProfileError) {

        console.error(
          "Помилка профілю:",
          freshProfileError
        );

        showMessage(
          "Не вдалося отримати дані профілю.",
          "error"
        );

        return;

      }


      // ====================================
      // USE FRESH PROFILE DATA
      // ====================================

      profileName =
        freshProfile?.display_name ||
        user.user_metadata?.display_name ||
        user.user_metadata?.full_name ||
        user.email ||
        "Користувач";


      birthDate =
        freshProfile?.birth_date || "";


      age =
        calculateAge(birthDate);


      discordUsername =
        freshProfile?.discord_username || "";


      discordUserId =
        freshProfile?.discord_user_id || "";


      steamId =
        freshProfile?.steam_id || "";


      // ====================================
      // CHECK REQUIRED NAME
      // ====================================

      if (!profileName) {

        showMessage(
          "Спочатку вкажіть ім'я у профілі.",
          "error"
        );

        return;

      }


      // ====================================
      // DISABLE BUTTON
      // ====================================

      if (submitButton) {

        submitButton.disabled = true;

        submitButton.textContent =
          "НАДСИЛАННЯ...";

      }


      showMessage(
        "Надсилаємо заявку..."
      );


      // ====================================
      // CHECK EXISTING APPLICATION
      // ====================================

      const {
        data: existingApplication,
        error: checkError
      } = await supabase
        .from("applications")
        .select("id, status")
        .eq("user_id", user.id)
        .eq("direction", direction)
        .maybeSingle();


      if (checkError) {

        console.error(
          "Помилка перевірки заявки:",
          checkError
        );

        showMessage(
          "Не вдалося перевірити попередню заявку: " +
          checkError.message,
          "error"
        );


        if (submitButton) {

          submitButton.disabled = false;

          submitButton.textContent =
            "НАДІСЛАТИ ЗАЯВКУ";

        }

        return;

      }


      if (existingApplication) {

        showMessage(
          "Ви вже подавали заявку на цей напрямок.",
          "error"
        );


        if (submitButton) {

          submitButton.disabled = false;

          submitButton.textContent =
            "НАДІСЛАТИ ЗАЯВКУ";

        }

        return;

      }


      // ====================================
      // APPLICATION DATA
      // ====================================

      const applicationData = {

        // Основний користувач
        user_id:
          user.id,

        // Ім'я з основного профілю
        name:
          profileName,

        // Вік з основного профілю
        age:
          age || null,

        // Discord з основного профілю
        discord_nick:
          discordUsername || null,

        discord_id:
          discordUserId || null,

        // Steam з основного профілю
        steam_id:
          steamId || null,

        // Напрямок
        direction:
          direction,

        // Статус
        status:
          "pending",

        // Опис
        about:
          getValue("about"),

        // Старі / загальні поля
        game_nick:
          null,

        game_nickname:
          null,

        truckersmp_nick:
          null,

        truckersmp_id:
          null,

        truckersmp_nickname:
          null,

        truckershub_username:
          null,

        truckershub_id:
          null,

        wot_nickname:
          null,

        wargaming_id:
          null,

        wot_region:
          null,

        dota_nickname:
          null,

        dota_friend_id:
          null,

        dota_rank:
          null,

        battletag:
          null,

        wow_character:
          null,

        wow_realm:
          null,

        wow_faction:
          null,

        wow_class:
          null

      };


      // ====================================
      // ETS2
      // ====================================

      if (direction === "ets2") {

        applicationData.truckersmp_nick =
          getValue("truckersmpNick");


        applicationData.truckersmp_id =
          getValue("truckersmpId");


        applicationData.truckersmp_nickname =
          getValue("truckersmpNick");


        applicationData.truckershub_username =
          getValue("truckershubUsername");


        applicationData.truckershub_id =
          getValue("truckershubId");


        // Основний ігровий нік
        applicationData.game_nick =
          getValue("truckersmpNick");


        applicationData.game_nickname =
          getValue("truckersmpNick");

      }


      // ====================================
      // WORLD OF TANKS
      // ====================================

      if (direction === "wot") {

        applicationData.wot_nickname =
          getValue("wotNickname");


        applicationData.wargaming_id =
          getValue("wargamingId");


        applicationData.wot_region =
          getValue("wotRegion");


        applicationData.game_nick =
          getValue("wotNickname");


        applicationData.game_nickname =
          getValue("wotNickname");

      }


      // ====================================
      // DOTA 2
      // ====================================

      if (direction === "dota2") {

        applicationData.dota_nickname =
          getValue("dotaNickname");


        applicationData.dota_friend_id =
          getValue("dotaFriendId");


        applicationData.dota_rank =
          getValue("dotaRank");


        applicationData.game_nick =
          getValue("dotaNickname");


        applicationData.game_nickname =
          getValue("dotaNickname");

      }


      // ====================================
      // WORLD OF WARCRAFT
      // ====================================

      if (direction === "wow") {

        applicationData.battletag =
          getValue("battleTag");


        applicationData.wow_character =
          getValue("wowCharacter");


        applicationData.wow_realm =
          getValue("wowRealm");


        applicationData.wow_faction =
          getValue("wowFaction");


        applicationData.wow_class =
          getValue("wowClass");


        applicationData.game_nick =
          getValue("wowCharacter");


        applicationData.game_nickname =
          getValue("wowCharacter");

      }


      // ====================================
      // INSERT APPLICATION
      // ====================================

      console.log(
        "UA LEGION APPLICATION:",
        applicationData
      );


      const {
        data: insertedApplication,
        error: insertError
      } = await supabase
        .from("applications")
        .insert(applicationData)
        .select()
        .single();


      // ====================================
      // INSERT ERROR
      // ====================================

      if (insertError) {

        console.error(
          "Помилка заявки:",
          insertError
        );


        showMessage(
          "Помилка при надсиланні заявки: " +
          insertError.message,
          "error"
        );


        if (submitButton) {

          submitButton.disabled = false;

          submitButton.textContent =
            "НАДІСЛАТИ ЗАЯВКУ";

        }

        return;

      }


      // ====================================
      // SUCCESS
      // ====================================

      console.log(
        "Заявка створена:",
        insertedApplication
      );


      showMessage(
        "Заявку успішно надіслано!",
        "success"
      );


      // ====================================
      // RESET
      // ====================================

      form.reset();

      hideAllGameForms();


      // ====================================
      // BUTTON
      // ====================================

      if (submitButton) {

        submitButton.disabled = true;

        submitButton.textContent =
          "ЗАЯВКУ НАДІСЛАНО";

      }


      // ====================================
      // REDIRECT
      // ====================================

      setTimeout(
        () => {

          window.location.href =
            "profile.html";

        },
        1500
      );

    }
  );

});
