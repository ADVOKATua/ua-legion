// ==========================================
// UA LEGION — Авторизація
// login.js
// ==========================================

let isRegistration = false;
let oauthRedirectStarted = false;


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
// SUPABASE
// ==========================================

const client =
  window.supabaseClient;


// ==========================================
// АДРЕСИ
// ==========================================

const HOME_URL =
  window.location.origin + "/ua-legion/";

const LOGIN_URL =
  window.location.origin + "/ua-legion/login.html";

const PROFILE_URL =
  window.location.origin + "/ua-legion/profile.html";


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
    "Supabase не підключений"
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
// відновлення сесії
//        ↓
// profile.html
// ==========================================

async function handleOAuthCallback() {

  if (!client) {
    return;
  }


  const params =
    new URLSearchParams(
      window.location.search
    );


  const isOAuthCallback =
    params.get("oauth") === "1";


  if (!isOAuthCallback) {
    return;
  }


  if (oauthRedirectStarted) {
    return;
  }


  console.log(
    "UA LEGION: OAuth callback"
  );


  showMessage(
    "Завершення входу...",
    "success"
  );


  // ========================================
  // ПЕРЕВІРЯЄМО СЕСІЮ
  // ========================================

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
      "Не вдалося відновити сесію.",
      "error"
    );

    return;
  }


  // ========================================
  // СЕСІЯ ВЖЕ Є
  // ========================================

  if (
    data &&
    data.session
  ) {

    oauthRedirectStarted =
      true;


    console.log(
      "UA LEGION: OAuth session restored"
    );


    window.location.replace(
      PROFILE_URL
    );


    return;
  }


  // ========================================
  // СЕСІЇ ЩЕ НЕМАЄ
  // ЧЕКАЄМО AUTH EVENT
  // ========================================

  const {
    data: authListener
  } =
    client.auth.onAuthStateChange(
      (
        event,
        session
      ) => {

        console.log(
          "UA LEGION AUTH EVENT:",
          event
        );


        if (
          session &&
          !oauthRedirectStarted
        ) {

          oauthRedirectStarted =
            true;


          window.location.replace(
            PROFILE_URL
          );

        }

      }
    );


  // ========================================
  // ДОДАТКОВЕ ОЧІКУВАННЯ
  // ========================================

  let attempts = 0;

  const maxAttempts = 20;


  const waitForSession =
    setInterval(
      async () => {

        attempts++;


        // -------------------------------
        // ВЖЕ ПЕРЕЙШЛИ
        // -------------------------------

        if (
          oauthRedirectStarted
        ) {

          clearInterval(
            waitForSession
          );

          return;
        }


        // -------------------------------
        // ПЕРЕВІРЯЄМО СЕСІЮ
        // -------------------------------

        const {
          data: sessionData
        } =
          await client.auth.getSession();


        if (
          sessionData &&
          sessionData.session
        ) {

          clearInterval(
            waitForSession
          );


          oauthRedirectStarted =
            true;


          window.location.replace(
            PROFILE_URL
          );


          return;
        }


        // -------------------------------
        // TIMEOUT
        // -------------------------------

        if (
          attempts >=
          maxAttempts
        ) {

          clearInterval(
            waitForSession
          );


          console.error(
            "UA LEGION: OAuth session timeout"
          );


          showMessage(
            "Не вдалося завершити вхід через Google. Спробуйте ще раз.",
            "error"
          );

        }

      },
      500
    );

}


// ==========================================
// ЗАПУСК OAUTH CALLBACK
// ==========================================

handleOAuthCallback();


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


      // ====================================
      // ПЕРЕВІРКА
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


      submitButton.disabled =
        true;


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


        submitButton.disabled =
          false;


        if (error) {

          showMessage(
            error.message,
            "error"
          );

          return;
        }


        // ----------------------------------
        // СЕСІЯ СТВОРЕНА ОДРАЗУ
        // ----------------------------------

        if (
          data.user &&
          data.session
        ) {

          showMessage(
            "Акаунт створено! Ласкаво просимо до UA LEGION.",
            "success"
          );


          setTimeout(
            () => {

              window.location.replace(
                PROFILE_URL
              );

            },
            500
          );


          return;
        }


        // ----------------------------------
        // ПОТРІБНЕ ПІДТВЕРДЖЕННЯ EMAIL
        // ----------------------------------

        showMessage(
          "Акаунт створено! Перевірте свою електронну пошту та підтвердіть акаунт.",
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


      submitButton.disabled =
        false;


      if (error) {

        showMessage(
          error.message,
          "error"
        );

        return;
      }


      // ====================================
      // ПЕРЕВІРКА СЕСІЇ
      // ====================================

      if (
        !data ||
        !data.session
      ) {

        showMessage(
          "Не вдалося створити сесію.",
          "error"
        );

        return;
      }


      showMessage(
        "Успішний вхід!",
        "success"
      );


      // ====================================
      // ПРОФІЛЬ
      // ====================================

      setTimeout(
        () => {

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
// GOOGLE / GMAIL LOGIN
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
        error
      } =
        await client.auth.signInWithOAuth({

          provider:
            "google",


          options: {

            // --------------------------------
            // ВАЖЛИВО
            //
            // Спочатку повертаємося
            // на login.html
            //
            // Після відновлення session
            // login.js відкриє profile.html
            // --------------------------------

            redirectTo:
              LOGIN_URL +
              "?oauth=1"

          }

        });


      if (error) {

        googleLoginButton.disabled =
          false;


        showMessage(
          error.message,
          "error"
        );

      }

    }
  );

}


// ==========================================
// DISCORD LOGIN
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


      if (error) {

        discordLoginButton.disabled =
          false;


        showMessage(
          error.message,
          "error"
        );

      }

    }
  );

}
