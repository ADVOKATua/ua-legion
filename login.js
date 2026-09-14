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

const client =
  window.supabaseClient;


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
// AUTH SESSION
//
// OAuth
//   ↓
// Supabase
//   ↓
// profile.html#access_token...
//   ↓
// Supabase обробляє session
//   ↓
// особистий кабінет
// ==========================================

if (client) {

  client.auth.onAuthStateChange(
    (
      event,
      session
    ) => {

      console.log(
        "UA LEGION AUTH:",
        event
      );


      // ------------------------------------
      // КОРИСТУВАЧ УСПІШНО УВІЙШОВ
      // ------------------------------------

      if (
        session &&
        (
          event === "SIGNED_IN" ||
          event === "INITIAL_SESSION"
        )
      ) {

        // Якщо ми вже на profile.html —
        // нікуди не переходимо.

        if (
          window.location.pathname.endsWith(
            "/profile.html"
          )
        ) {

          return;
        }


        // Якщо ми на login.html —
        // переходимо в особистий кабінет.

        if (
          window.location.pathname.endsWith(
            "/login.html"
          )
        ) {

          console.log(
            "UA LEGION: session detected → profile"
          );


          window.location.replace(
            PROFILE_URL
          );

        }

      }

    }
  );

}


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
        // СЕСІЯ СТВОРЕНА ОДРАЗУ
        // ------------------------------------

        if (
          data &&
          data.session
        ) {

          showMessage(
            "Акаунт створено!",
            "success"
          );


          window.location.replace(
            PROFILE_URL
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

      window.location.replace(
        PROFILE_URL
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


      // ====================================
      // GOOGLE OAUTH
      // ====================================

      const {
        data,
        error
      } =
        await client.auth.signInWithOAuth({

          provider:
            "google",

          options: {

            // =================================
            // ВАЖНО:
            // ПОСЛЕ GOOGLE СРАЗУ В PROFILE
            // =================================

            redirectTo:
              PROFILE_URL

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


      // ====================================
      // DISCORD OAUTH
      // ====================================

      const {
        data,
        error
      } =
        await client.auth.signInWithOAuth({

          provider:
            "discord",

          options: {

            redirectTo:
              PROFILE_URL

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
