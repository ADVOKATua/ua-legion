// ==========================================
// UA LEGION — СИСТЕМА ПОДАЧІ ЗАЯВКИ
// join.js
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

  const supabase =
    window.supabaseClient;


  // ==========================================
  // ПЕРЕВІРКА SUPABASE
  // ==========================================

  if (!supabase) {

    console.error(
      "Supabase не підключений"
    );

    alert(
      "Помилка підключення до сервера."
    );

    return;

  }


  // ==========================================
  // ЕЛЕМЕНТИ ФОРМИ
  // ==========================================

  const form =
    document.getElementById(
      "applicationForm"
    );


  if (!form) {

    console.error(
      "Форма заявки не знайдена"
    );

    return;

  }


  const submitButton =
    form.querySelector(
      ".submit-btn"
    );


  const nameInput =
    document.getElementById(
      "name"
    );


  const ageInput =
    document.getElementById(
      "age"
    );


  const discordNickInput =
    document.getElementById(
      "discord_nick"
    );


  const discordIdInput =
    document.getElementById(
      "discord_id"
    );


  const truckersmpNickInput =
    document.getElementById(
      "truckersmp_nick"
    );


  const truckersmpIdInput =
    document.getElementById(
      "truckersmp_id"
    );


  const steamIdInput =
    document.getElementById(
      "steam_id"
    );


  const gameNickInput =
    document.getElementById(
      "game_nick"
    );


  const aboutInput =
    document.getElementById(
      "about"
    );


  // ==========================================
  // БЛОК ПОВІДОМЛЕНЬ
  // ==========================================

  let messageBox =
    document.getElementById(
      "applicationMessage"
    );


  if (!messageBox) {

    messageBox =
      document.createElement(
        "div"
      );


    messageBox.id =
      "applicationMessage";


    messageBox.style.display =
      "none";


    messageBox.style.marginBottom =
      "20px";


    messageBox.style.padding =
      "14px 16px";


    messageBox.style.borderRadius =
      "8px";


    messageBox.style.fontWeight =
      "600";


    messageBox.style.lineHeight =
      "1.5";


    form.prepend(
      messageBox
    );

  }


  // ==========================================
  // ПОКАЗ ПОВІДОМЛЕННЯ
  // ==========================================

  function showMessage(
    message,
    type = "success"
  ) {

    messageBox.textContent =
      message;


    messageBox.style.display =
      "block";


    if (type === "success") {

      messageBox.style.background =
        "rgba(40, 167, 69, 0.12)";


      messageBox.style.border =
        "1px solid rgba(40, 167, 69, 0.45)";


      messageBox.style.color =
        "#7ee787";

    }


    else if (type === "error") {

      messageBox.style.background =
        "rgba(220, 53, 69, 0.12)";


      messageBox.style.border =
        "1px solid rgba(220, 53, 69, 0.45)";


      messageBox.style.color =
        "#ff8b94";

    }


    else {

      messageBox.style.background =
        "rgba(40, 120, 255, 0.12)";


      messageBox.style.border =
        "1px solid rgba(40, 120, 255, 0.45)";


      messageBox.style.color =
        "#9ec5ff";

    }

  }


  // ==========================================
  // АВТОРИЗОВАНИЙ КОРИСТУВАЧ
  // ==========================================

  const {
    data: {
      user
    },
    error: userError
  } =
    await supabase
      .auth
      .getUser();


  if (
    userError ||
    !user
  ) {

    alert(
      "Щоб подати заявку, потрібно увійти до акаунта."
    );


    window.location.href =
      "login.html";


    return;

  }


  console.log(
    "Авторизований користувач:",
    user.id
  );


  // ==========================================
  // ОБЧИСЛЕННЯ ВІКУ
  // ==========================================

  function calculateAge(
    birthDate
  ) {

    if (!birthDate) {

      return null;

    }


    const birth =
      new Date(
        birthDate
      );


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


    return age;

  }


  // ==========================================
  // ЗАВАНТАЖЕННЯ ДАНИХ ПРОФІЛЮ
  // ==========================================

  async function loadProfileData() {

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
        .maybeSingle();


    if (error) {

      console.error(
        "Помилка завантаження профілю:",
        error
      );

      return;

    }


    if (!profile) {

      return;

    }


    // ІМ'Я

    if (
      profile.display_name &&
      nameInput
    ) {

      nameInput.value =
        profile.display_name;

    }


    // ВІК

    if (
      profile.birth_date &&
      ageInput
    ) {

      const age =
        calculateAge(
          profile.birth_date
        );


      if (
        age !== null &&
        age > 0
      ) {

        ageInput.value =
          age;

      }

    }


    // DISCORD USERNAME

    if (
      profile.discord_username &&
      discordNickInput
    ) {

      discordNickInput.value =
        profile.discord_username;

    }


    // DISCORD ID

    if (
      profile.discord_user_id &&
      discordIdInput
    ) {

      discordIdInput.value =
        profile.discord_user_id;

    }


    // STEAM ID

    if (
      profile.steam_id &&
      steamIdInput
    ) {

      steamIdInput.value =
        profile.steam_id;

    }


    // ІГРОВИЙ НІК

    if (
      profile.game_nickname &&
      gameNickInput
    ) {

      gameNickInput.value =
        profile.game_nickname;

    }

  }


  // ==========================================
  // ЗАВАНТАЖЕННЯ НАПРЯМКІВ З ПРОФІЛЮ
  // ==========================================

  async function loadProfileDirections() {

    const {
      data: selectedRows,
      error
    } =
      await supabase
        .from("profile_directions")
        .select(
          "direction_id"
        )
        .eq(
          "profile_id",
          user.id
        );


    if (
      error ||
      !selectedRows ||
      selectedRows.length === 0
    ) {

      return;

    }


    const {
      data: directions,
      error: directionsError
    } =
      await supabase
        .from("directions")
        .select(
          "id, slug"
        );


    if (
      directionsError ||
      !directions
    ) {

      console.error(
        "Помилка завантаження напрямків:",
        directionsError
      );

      return;

    }


    const directionMap =
      new Map(

        directions.map(
          direction => [

            String(
              direction.id
            ),

            direction.slug

          ]
        )

      );


    const slugToApplicationValue = {

      ets2:
        "ETS2",

      wot:
        "World of Tanks",

      dota2:
        "Dota 2",

      wow:
        "World of Warcraft",

      streaming:
        "Streaming"

    };


    // JOIN.HTML дозволяє вибрати
    // тільки один напрямок.
    // Якщо у профілі кілька —
    // вибираємо перший знайдений.

    for (
      const row of selectedRows
    ) {

      const slug =
        directionMap.get(
          String(
            row.direction_id
          )
        );


      if (!slug) {

        continue;

      }


      const applicationValue =
        slugToApplicationValue[
          slug
        ];


      if (!applicationValue) {

        continue;

      }


      const radio =
        document.querySelector(

          `input[name="direction"][value="${applicationValue}"]`

        );


      if (radio) {

        radio.checked =
          true;

        break;

      }

    }

  }


  // ==========================================
  // ПЕРЕВІРКА ОСТАННЬОЇ ЗАЯВКИ
  // ==========================================

  async function checkExistingApplication() {

    const {
      data,
      error
    } =
      await supabase
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
            ascending:
              false
          }
        )
        .limit(1);


    if (error) {

      console.error(
        "Помилка перевірки заявки:",
        error
      );

      return null;

    }


    if (
      !data ||
      data.length === 0
    ) {

      return null;

    }


    return data[0];

  }


  // ==========================================
  // ПЕРЕВІРКА СТАТУСУ ЗАЯВКИ
  // ==========================================

  async function checkApplicationStatus() {

    const application =
      await checkExistingApplication();


    if (!application) {

      return;

    }


    const activeStatuses = [

      "new",

      "pending",

      "review"

    ];


    // ЗАЯВКА НА РОЗГЛЯДІ

    if (
      activeStatuses.includes(
        application.status
      )
    ) {

      showMessage(
        "У вас вже є заявка, яка знаходиться на розгляді адміністрації UA LEGION.",
        "info"
      );


      if (submitButton) {

        submitButton.disabled =
          true;


        submitButton.textContent =
          "ЗАЯВКА НА РОЗГЛЯДІ";

      }

    }


    // ЗАЯВКА СХВАЛЕНА

    else if (
      application.status ===
      "approved"
    ) {

      showMessage(
        "🎉 Ваша заявка вже була схвалена. Ласкаво просимо до UA LEGION!",
        "success"
      );


      if (submitButton) {

        submitButton.disabled =
          true;


        submitButton.textContent =
          "ЗАЯВКУ СХВАЛЕНО";

      }

    }


    // ВІДХИЛЕНА ЗАЯВКА

    else if (
      application.status ===
      "rejected"
    ) {

      showMessage(
        "Попередня заявка була завершена. Ви можете подати нову заявку.",
        "info"
      );

    }

  }


  // ==========================================
  // ПОЧАТКОВЕ ЗАВАНТАЖЕННЯ
  // ==========================================

  await loadProfileData();

  await loadProfileDirections();

  await checkApplicationStatus();


  // ==========================================
  // ВІДПРАВКА ФОРМИ
  // ==========================================

  form.addEventListener(
    "submit",

    async function (
      event
    ) {

      event.preventDefault();


      // ======================================
      // ПЕРЕВІРКА ІСНУЮЧОЇ ЗАЯВКИ
      // ======================================

      const existingApplication =
        await checkExistingApplication();


      const activeStatuses = [

        "new",

        "pending",

        "review"

      ];


      if (

        existingApplication &&

        activeStatuses.includes(
          existingApplication.status
        )

      ) {

        showMessage(
          "У вас вже є активна заявка на розгляді.",
          "error"
        );

        return;

      }


      // ======================================
      // ОТРИМУЄМО ДАНІ
      // ======================================

      const name =
        nameInput
          .value
          .trim();


      const age =
        ageInput
          .value;


      const discordNick =
        discordNickInput
          .value
          .trim();


      const discordId =
        discordIdInput
          .value
          .trim();


      const truckersmpNick =
        truckersmpNickInput
          .value
          .trim();


      const truckersmpId =
        truckersmpIdInput
          .value
          .trim();


      const steamId =
        steamIdInput
          .value
          .trim();


      const gameNick =
        gameNickInput
          .value
          .trim();


      const directionElement =
        document.querySelector(
          'input[name="direction"]:checked'
        );


      const sourceElement =
        document.querySelector(
          'input[name="source"]:checked'
        );


      const about =
        aboutInput
          .value
          .trim();


      // ======================================
      // ПЕРЕВІРКА ОБОВ'ЯЗКОВИХ ПОЛІВ
      // ======================================

      if (

        !name ||

        !age ||

        !discordNick ||

        !discordId ||

        !gameNick ||

        !directionElement ||

        !sourceElement

      ) {

        showMessage(
          "Будь ласка, заповніть усі обов'язкові поля.",
          "error"
        );

        return;

      }


      // ======================================
      // ПЕРЕВІРКА ВІКУ
      // ======================================

      if (

        Number(age) < 1 ||

        Number(age) > 100

      ) {

        showMessage(
          "Будь ласка, вкажіть коректний вік.",
          "error"
        );

        return;

      }


      // ======================================
      // НАПРЯМОК
      // ======================================

      const directions = [

        directionElement.value

      ];


      // ======================================
      // ДЖЕРЕЛО
      // ======================================

      const source =
        sourceElement.value;


      // ======================================
      // БЛОКУЄМО КНОПКУ
      // ======================================

      if (submitButton) {

        submitButton.disabled =
          true;


        submitButton.textContent =
          "НАДСИЛАЄМО...";

      }


      showMessage(
        "Ваша заявка надсилається...",
        "info"
      );


      // ======================================
      // ЗБЕРЕЖЕННЯ ЗАЯВКИ
      // ======================================

      const {
        data,
        error
      } =
        await supabase
          .from("applications")
          .insert({

            user_id:
              user.id,


            name:
              name,


            age:
              Number(age),


            discord_nickname:
              discordNick,


            discord_id:
              discordId,


            truckersmp_nickname:
              truckersmpNick ||
              null,


            truckersmp_id:
              truckersmpId ||
              null,


            steam_id:
              steamId ||
              null,


            game_nickname:
              gameNick,


            directions:
              directions,


            source:
              source,


            about:
              about ||
              null,


            status:
              "new"

          })
          .select()
          .single();


      // ======================================
      // ПОМИЛКА
      // ======================================

      if (error) {

        console.error(
          "Помилка Supabase:",
          error
        );


        showMessage(
          "Помилка під час надсилання заявки: " +
          error.message,
          "error"
        );


        if (submitButton) {

          submitButton.disabled =
            false;


          submitButton.textContent =
            "НАДІСЛАТИ ЗАЯВКУ";

        }


        return;

      }


      // ======================================
      // УСПІХ
      // ======================================

      console.log(
        "Заявка створена:",
        data
      );


      showMessage(
        "🎉 Заявку успішно надіслано! Тепер вона очікує розгляду адміністрацією UA LEGION.",
        "success"
      );


      if (submitButton) {

        submitButton.disabled =
          true;


        submitButton.textContent =
          "ЗАЯВКУ НАДІСЛАНО";

      }


      // ======================================
      // ПЕРЕНАПРАВЛЕННЯ В ПРОФІЛЬ
      // ======================================

      setTimeout(
        function () {

          window.location.href =
            "profile.html";

        },

        1800
      );

    }

  );

});
