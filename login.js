// ==========================================
// UA LEGION — Авторизація
// ==========================================

let isRegistration = false;


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

function showMessage(text, type = "success") {

  if (!messageBox) {
    console.log(text);
    return;
  }

  messageBox.textContent = text;
  messageBox.className = "message " + type;

}


// ==========================================
// ПЕРЕВІРКА SUPABASE
// ==========================================

if (!window.supabaseClient) {

  console.error("Supabase не підключений");

  showMessage(
    "Помилка підключення до сервера",
    "error"
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

      isRegistration = !isRegistration;


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


      messageBox.className = "message";
      messageBox.textContent = "";

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


      if (!window.supabaseClient) {
        return;
      }


      const email =
        emailInput.value.trim();

      const password =
        passwordInput.value;


      if (!email || !password) {

        showMessage(
          "Заповніть email та пароль",
          "error"
        );

        return;

      }


      submitButton.disabled = true;


      // ======================================
      // РЕЄСТРАЦІЯ
      // ======================================

      if (isRegistration) {

        const {
          data,
          error
        } =
          await window.supabaseClient.auth.signUp({

            email: email,
            password: password

          });


        submitButton.disabled = false;


        if (error) {

          showMessage(
            error.message,
            "error"
          );

          return;

        }


        // Якщо після реєстрації Supabase
        // одразу створив сесію

        if (data.user && data.session) {

          showMessage(
            "Акаунт створено! Ласкаво просимо до UA LEGION.",
            "success"
          );


          setTimeout(() => {

            window.location.href =
              "index.html";

          }, 500);


          return;

        }


        // Якщо потрібне підтвердження email

        showMessage(
          "Акаунт створено! Перевірте свою електронну пошту та підтвердіть акаунт.",
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
        await window.supabaseClient.auth.signInWithPassword({

          email: email,
          password: password

        });


      submitButton.disabled = false;


      if (error) {

        showMessage(
          error.message,
          "error"
        );

        return;

      }


      showMessage(
        "Успішний вхід!",
        "success"
      );


      // ======================================
      // ПІСЛЯ ВХОДУ → ГОЛОВНА СТОРІНКА
      // ======================================

      setTimeout(() => {

        window.location.href =
          "index.html";

      }, 500);

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

      if (!window.supabaseClient) {
        return;
      }


      const {
        data,
        error
      } =
        await window.supabaseClient.auth.signInWithOAuth({

          provider: "google",

          options: {

            // Після входу через Google
            // повертаємо на головну

            redirectTo:
              window.location.origin +
              "/ua-legion/index.html"

          }

        });


      if (error) {

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

      if (!window.supabaseClient) {
        return;
      }


      const {
        data,
        error
      } =
        await window.supabaseClient.auth.signInWithOAuth({

          provider: "discord",

          options: {

            // Після входу через Discord
            // повертаємо на головну

            redirectTo:
              window.location.origin +
              "/ua-legion/index.html"

          }

        });


      if (error) {

        showMessage(
          error.message,
          "error"
        );

      }

    }
  );

}
