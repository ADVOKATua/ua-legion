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

  messageBox.textContent = text;

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
// ==========================================
//
// OAuth:
// Google
//   ↓
// Supabase
//   ↓
// profile.html#access_token...
//   ↓
// Supabase створює session
//   ↓
// profile.html
//
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


      // ====================================
      // Є СЕСІЯ
      // ====================================

      if (
        session &&
        (
          event === "SIGNED_IN" ||
          event === "INITIAL_SESSION"
        )
      ) {

        // ----------------------------------
        // Ми вже в profile.html
        // ----------------------------------

        if (
          window.location.pathname.endsWith(
            "/profile.html"
          )
        ) {

          return;

        }


        // ----------------------------------
        // Якщо знаходимось на login.html
        // → переходимо в профіль
        // ----------------------------------

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


      // ====================================
      // РЕЄСТРАЦІЯ
      // ====================================

      if (isRegistration) {

        if (formTitle) {

          formTitle.textContent =
            "Реєстрація UA LEGION";

        }

        if (submitButton) {

          submitButton.textContent =
            "СТВОРИТИ АКАУНТ";

        }

        if (switchText) {

          switchText.textContent =
            "Вже маєте акаунт?";

        }

        switchModeButton.textContent =
          "Увійти";

      }


      // ====================================
      // ВХІД
      // ====================================

      else {

        if (formTitle) {

          formTitle.textContent =
            "Вхід до UA LEGION";

        }

        if (submitButton) {

          submitButton.textContent =
            "УВІЙТИ";

        }

        if (switchText) {

          switchText.textContent =
            "Ще немає акаунта?";

        }

        switchModeButton.textContent =
          "Реєстрація";

      }


      // ====================================
      // ОЧИЩЕННЯ ПОВІДОМЛЕННЯ
      // ====================================

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
        emailInput
          ? emailInput.value.trim()
          : "";

      const password =
        passwordInput
          ? passwordInput.value
          : "";


      // ====================================
      // ПРОВЕРКА
      // ====================================

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


      if (submitButton) {

        submitButton.disabled =
          true;

      }


      // ====================================
      // РЕЄСТРАЦІЯ
      // ====================================

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


        if (submitButton) {

          submitButton.disabled =
            false;

        }


        if (error) {

          showMessage(
            error.message,
            "error"
          );

          console.error(
            "UA LEGION REGISTRATION ERROR:",
            error
          );

          return;

        }


        // ----------------------------------
        // СЕСІЯ СТВОРЕНА
        // ----------------------------------

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


        // ----------------------------------
        // ПОТРІБНЕ ПІДТВЕРДЖЕННЯ EMAIL
        // ----------------------------------

        showMessage(
          "Акаунт створено! Перевірте електронну пошту та підтвердіть акаунт.",
          "success"
        );


        return;

      }


      // ====================================
      // ВХІД
      // ====================================

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


      if (submitButton) {

        submitButton.disabled =
          false;

      }


      if (error) {

        showMessage(
          error.message,
          "error"
        );

        console.error(
          "UA LEGION LOGIN ERROR:",
          error
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


      // ------------------------------------
      // ОСНОВНИЙ КАБІНЕТ
      // ------------------------------------

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
            // ПОСЛЕ GOOGLE СРАЗУ PROFILE
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
