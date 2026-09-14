// ==========================================
// UA LEGION — АВТОРИЗАЦІЯ
// login.js
// ==========================================


// ==========================================
// РЕЖИМ
// ==========================================

let isRegistration = false;


// ==========================================
// SUPABASE
// ==========================================

const client = window.supabaseClient;


// ==========================================
// АДРЕСИ
// ==========================================

const LOGIN_URL =
  window.location.origin +
  "/ua-legion/login.html";

const PROFILE_URL =
  window.location.origin +
  "/ua-legion/profile.html";


// ==========================================
// ЕЛЕМЕНТИ
// ==========================================

const authForm =
  document.getElementById("auth-form");

const emailInput =
  document.getElementById("email");

const passwordInput =
  document.getElementById("password");

const submitButton =
  document.getElementById("submit-button");

const switchModeButton =
  document.getElementById("switch-mode");

const switchText =
  document.getElementById("switch-text");

const formTitle =
  document.getElementById("form-title");

const messageBox =
  document.getElementById("message");

const googleLoginButton =
  document.getElementById("google-login");

const discordLoginButton =
  document.getElementById("discord-login");


// ==========================================
// ПОВІДОМЛЕННЯ
// ==========================================

function showMessage(
  text,
  type = "success"
) {

  if (!messageBox) {
    console.log(text);
    return;
  }

  messageBox.textContent =
    text;

  messageBox.className =
    "message " + type;
}


// ==========================================
// ПЕРЕВІРКА SUPABASE
// ==========================================

if (!client) {

  console.error(
    "UA LEGION: Supabase не підключений"
  );

  showMessage(
    "Помилка підключення до сервера",
    "error"
  );
}


// ==========================================
// OAUTH CALLBACK
//
// Google / Discord
//        ↓
// login.html?oauth=1
//        ↓
// Supabase session
//        ↓
// profile.html
// ==========================================

async function checkOAuthCallback() {

  if (!client) {
    return;
  }


  const params =
    new URLSearchParams(
      window.location.search
    );


  if (
    params.get("oauth") !== "1"
  ) {

    return;
  }


  console.log(
    "UA LEGION: OAuth callback"
  );


  showMessage(
    "Завершення входу...",
    "success"
  );


  // ----------------------------------------
  // ОТРИМУЄМО ПОТОЧНУ СЕСІЮ
  // ----------------------------------------

  const {
    data,
    error
  } =
    await client.auth.getSession();


  if (error) {

    console.error(
      "UA LEGION: OAuth session error:",
      error
    );

    showMessage(
      "Помилка авторизації.",
      "error"
    );

    return;
  }


  // ----------------------------------------
  // СЕСІЯ Є
  // ----------------------------------------

  if (
    data &&
    data.session
  ) {

    console.log(
      "UA LEGION: OAuth session OK"
    );


    window.location.replace(
      PROFILE_URL
    );


    return;
  }


  // ----------------------------------------
  // СЕСІЯ МОЖЕ БУТИ ЩЕ НЕ ГОТОВА
  // ЧЕКАЄМО НА AUTH EVENT
  // ----------------------------------------

  const {
    data: authData
  } =
    client.auth.onAuthStateChange(
      (
        event,
        session
      ) => {

        console.log(
          "UA LEGION AUTH:",
          event
        );


        if (
          session
        ) {

          window.location.replace(
            PROFILE_URL
          );

        }

      }
    );

}


// ==========================================
// ЗАПУСК OAUTH CALLBACK
// ==========================================

checkOAuthCallback();


// ==========================================
// ПЕРЕМИКАННЯ
// ВХІД / РЕЄСТРАЦІЯ
// ==========================================

if (switchModeButton) {

  switchModeButton.addEventListener(
    "click",
    function () {

      isRegistration =
        !isRegistration;


      if (isRegistration) {

        formTitle.textContent =
          "Реєстрація UA LEGION";

        submitButton.textContent =
          "СТВОРИТИ АКАУНТ";

        switchText.textContent =
          "Вже маєте акаунт?";

        switchModeButton.textContent =
          "Увійти";

      } else {

        formTitle.textContent =
          "Вхід до UA LEGION";

        submitButton.textContent =
          "УВІЙТИ";

        switchText.textContent =
          "Ще немає акаунта?";

        switchModeButton.textContent =
          "Реєстрація";

      }


      if (messageBox) {

        messageBox.className =
          "message";

        messageBox.textContent =
          "";

      }

    }
  );

}


// ==========================================
// EMAIL + ПАРОЛЬ
// ==========================================

if (authForm) {

  authForm.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();


      if (!client) {
        return;
      }


      const email =
        emailInput.value.trim();

      const password =
        passwordInput.value;


      // --------------------------------------
      // ПЕРЕВІРКА
      // --------------------------------------

      if (
        !email ||
        !password
      ) {

        showMessage(
          "Заповніть email та пароль",
          "error"
        );

        return;
      }


      submitButton.disabled =
        true;


      // ======================================
      // РЕЄСТРАЦІЯ
      // ======================================

      if (isRegistration) {

        const {
          data,
          error
        } =
          await client.auth.signUp({

            email:
              email,

            password:
              password

          });


        submitButton.disabled =
          false;


        if (error) {

          showMessage(
            error.message,
            "error"
          );

          return;
        }


        // ------------------------------------
        // СЕСІЯ СТВОРЕНА
        // ------------------------------------

        if (
          data &&
          data.session
        ) {

          showMessage(
            "Акаунт створено!",
            "success"
          );


          setTimeout(
            function () {

              window.location.replace(
                PROFILE_URL
              );

            },
            500
          );


          return;
        }


        // ------------------------------------
        // ПОТРІБНЕ ПІДТВЕРДЖЕННЯ EMAIL
        // ------------------------------------

        showMessage(
          "Акаунт створено! Перевірте електронну пошту та підтвердіть акаунт.",
          "success"
        );


        return;
      }


      // ======================================
      // ВХІД
      // ======================================

      const {
        data,
        error
      } =
        await client.auth.signInWithPassword({

          email:
            email,

          password:
            password

        });


      submitButton.disabled =
        false;


      if (error) {

        showMessage(
          error.message,
          "error"
        );

        return;
      }


      if (
        !data ||
        !data.session
      ) {

        showMessage(
          "Сесію не створено.",
          "error"
        );

        return;
      }


      showMessage(
        "Успішний вхід!",
        "success"
      );


      // --------------------------------------
      // ПРОФІЛЬ
      // --------------------------------------

      setTimeout(
        function () {

          window.location.replace(
            PROFILE_URL
          );

        },
        500
      );

    }
  );

}


// ==========================================
// GOOGLE
// ==========================================

if (googleLoginButton) {

  googleLoginButton.addEventListener(
    "click",
    async function () {

      if (!client) {
        return;
      }


      googleLoginButton.disabled =
        true;


      showMessage(
        "Переходимо до Google...",
        "success"
      );


      const {
        data,
        error
      } =
        await client.auth.signInWithOAuth({

          provider:
            "google",

          options: {

            redirectTo:
              LOGIN_URL +
              "?oauth=1"

          }

        });


      console.log(
        "UA LEGION GOOGLE:",
        data
      );


      if (error) {

        googleLoginButton.disabled =
          false;

        showMessage(
          error.message,
          "error"
        );

        console.error(
          "UA LEGION GOOGLE ERROR:",
          error
        );

      }

    }
  );

}


// ==========================================
// DISCORD
// ==========================================

if (discordLoginButton) {

  discordLoginButton.addEventListener(
    "click",
    async function () {

      if (!client) {
        return;
      }


      discordLoginButton.disabled =
        true;


      showMessage(
        "Переходимо до Discord...",
        "success"
      );


      const {
        data,
        error
      } =
        await client.auth.signInWithOAuth({

          provider:
            "discord",

          options: {

            redirectTo:
              LOGIN_URL +
              "?oauth=1"

          }

        });


      console.log(
        "UA LEGION DISCORD:",
        data
      );


      if (error) {

        discordLoginButton.disabled =
          false;

        showMessage(
          error.message,
          "error"
        );

        console.error(
          "UA LEGION DISCORD ERROR:",
          error
        );

      }

    }
  );

}
