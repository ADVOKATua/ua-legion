// ==========================================
// UA LEGION — ПОДАННЯ ЗАЯВКИ
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

  const supabase = window.supabaseClient;

  const form =
    document.getElementById("applicationForm");


  if (!form) {
    console.error("Форма заявки не знайдена");
    return;
  }


  // ==========================================
  // ПЕРЕВІРКА SUPABASE
  // ==========================================

  if (!supabase) {

    console.error("Supabase не підключений");

    alert(
      "Помилка підключення до сервера."
    );

    return;

  }


  // ==========================================
  // ПЕРЕВІРКА КОРИСТУВАЧА
  // ==========================================

  const {
    data: {
      user
    },
    error
  } =
    await supabase.auth.getUser();


  if (error || !user) {

    alert(
      "Щоб подати заявку, потрібно увійти до акаунта."
    );

    window.location.href =
      "login.html";

    return;

  }


  // ==========================================
  // ВІДПРАВКА ФОРМИ
  // ==========================================

  form.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();


      const submitButton =
        form.querySelector(
          ".submit-btn"
        );


      // ======================================
      // ОТРИМУЄМО ДАНІ
      // ======================================

      const name =
        document
          .getElementById("name")
          .value
          .trim();


      const age =
        document
          .getElementById("age")
          .value;


      const discordNick =
        document
          .getElementById("discord_nick")
          .value
          .trim();


      const discordId =
        document
          .getElementById("discord_id")
          .value
          .trim();


      const truckersmpNick =
        document
          .getElementById("truckersmp_nick")
          .value
          .trim();


      const truckersmpId =
        document
          .getElementById("truckersmp_id")
          .value
          .trim();


      const steamId =
        document
          .getElementById("steam_id")
          .value
          .trim();


      const gameNick =
        document
          .getElementById("game_nick")
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
        document
          .getElementById("about")
          .value
          .trim();


      // ======================================
      // ПЕРЕВІРКА
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

        alert(
          "Будь ласка, заповніть усі обов'язкові поля."
        );

        return;

      }


      const direction =
        directionElement.value;


      const source =
        sourceElement.value;


      // ======================================
      // БЛОКУЄМО КНОПКУ
      // ======================================

      submitButton.disabled =
        true;


      submitButton.textContent =
        "НАДСИЛАЄМО...";


      // ======================================
      // ЗБЕРЕЖЕННЯ В SUPABASE
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

            steam_id:
              steamId || null,

            game_nickname:
              gameNick,

            directions:
              [
                direction
              ],

            status:
              "new"

          })
          .select()
          .single();


      // ======================================
      // ПОМИЛКА
      // ======================================

      if (error) {

        console.error(error);


        alert(
          "Помилка під час надсилання заявки: " +
          error.message
        );


        submitButton.disabled =
          false;


        submitButton.textContent =
          "НАДІСЛАТИ ЗАЯВКУ";


        return;

      }


      // ======================================
      // УСПІХ
      // ======================================

      console.log(
        "Заявка створена:",
        data
      );


      alert(
        "Заявку успішно надіслано!"
      );


      // ======================================
      // ПЕРЕХІД У КАБІНЕТ
      // ======================================

      window.location.href =
        "profile.html";

    }
  );

});
