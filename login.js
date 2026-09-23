// ======================================
// UA LEGION — LOGIN / REGISTER
// login.js
// ======================================

document.addEventListener("DOMContentLoaded", async () => {

  // ======================================
  // SUPABASE
  // ======================================

  const client = window.supabaseClient;

  if (!client) {

    console.error(
      "UA LEGION: Supabase не підключений"
    );

    return;
  }


  // ======================================
  // URL
  // ======================================

  const HOME_URL =
    window.location.origin +
    "/ua-legion/";

  const LOGIN_URL =
    window.location.origin +
    "/ua-legion/login.html";


  // ======================================
  // ELEMENTS
  // ======================================

  const authForm =
    document.getElementById("auth-form");

  const emailInput =
    document.getElementById("email");

  const passwordInput =
    document.getElementById("password");

  const submitButton =
    document.getElementById("submit-button");

  const googleButton =
    document.getElementById("google-login");

  const discordButton =
    document.getElementById("discord-login");

  const switchButton =
    document.getElementById("switch-mode");

  const switchText =
    document.getElementById("switch-text");

  const formTitle =
    document.getElementById("form-title");

  const message =
    document.getElementById("message");


  // ======================================
  // MODE
  // ======================================

  let registerMode = false;


  // ======================================
  // MESSAGE
  // ======================================

  function showMessage(
    text,
    type = "error"
  ) {

    if (!message) {
      return;
    }

    message.textContent =
      text;

    message.className =
      "message " + type;
  }


  function clearMessage() {

    if (!message) {
      return;
    }

    message.textContent =
      "";

    message.className =
      "message";
  }


  // ======================================
  // UPDATE FORM
  // ======================================

  function updateFormMode() {

    clearMessage();


    if (registerMode) {

      if (formTitle) {

        formTitle.textContent =
          "Реєстрація в UA LEGION";

      }


      if (submitButton) {

        submitButton.textContent =
          "ЗАРЕЄСТРУВАТИСЯ";

      }


      if (switchText) {

        switchText.textContent =
          "Вже маєте акаунт?";

      }


      if (switchButton) {

        switchButton.textContent =
          "Увійти";

      }

    } else {

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


      if (switchButton) {

        switchButton.textContent =
          "Реєстрація";

      }

    }

  }


  // ======================================
  // CURRENT SESSION
  // ======================================

  try {

    const {
      data,
      error
    } =
      await client.auth.getSession();


    if (error) {

      console.error(
        "UA LEGION SESSION ERROR:",
        error
      );

    }


    if (
      data &&
      data.session
    ) {

      console.log(
        "UA LEGION: existing session → homepage"
      );

      window.location.replace(
        HOME_URL
      );

      return;

    }

  } catch (error) {

    console.error(
      "UA LEGION SESSION CHECK ERROR:",
      error
    );

  }


  // ======================================
  // AUTH STATE CHANGE
  // ======================================

  client.auth.onAuthStateChange(
    (event, session) => {

      console.log(
        "UA LEGION AUTH:",
        event,
        session
      );


      if (!session) {
        return;
      }


      if (
        window.location.pathname.endsWith(
          "/login.html"
        )
      ) {

        console.log(
          "UA LEGION: authenticated → homepage"
        );

        window.location.replace(
          HOME_URL
        );

      }

    }
  );


  // ======================================
  // SWITCH LOGIN / REGISTER
  // ======================================

  if (switchButton) {

    switchButton.addEventListener(
      "click",
      () => {

        registerMode =
          !registerMode;

        updateFormMode();

      }
    );

  }


  // ======================================
  // EMAIL / PASSWORD
  // ======================================

  if (authForm) {

    authForm.addEventListener(
      "submit",
      async (event) => {

        event.preventDefault();

        clearMessage();


        const email =
          emailInput
            ? emailInput.value.trim()
            : "";

        const password =
          passwordInput
            ? passwordInput.value
            : "";


        if (!email) {

          showMessage(
            "Введіть email.",
            "error"
          );

          return;
        }


        if (!password) {

          showMessage(
            "Введіть пароль.",
            "error"
          );

          return;
        }


        if (password.length < 6) {

          showMessage(
            "Пароль повинен містити щонайменше 6 символів.",
            "error"
          );

          return;
        }


        // ==================================
        // REGISTER
        // ==================================

        if (registerMode) {

          if (submitButton) {

            submitButton.disabled =
              true;

            submitButton.textContent =
              "РЕЄСТРАЦІЯ...";

          }


          showMessage(
            "Створення акаунта...",
            "info"
          );


          try {

            const {
              data,
              error
            } =
              await client.auth.signUp({

                email,
                password,

                options: {

                  emailRedirectTo:
                    LOGIN_URL

                }

              });


            if (error) {

              console.error(
                "UA LEGION REGISTER ERROR:",
                error
              );

              showMessage(
                error.message,
                "error"
              );

              return;
            }


            console.log(
              "UA LEGION REGISTER SUCCESS:",
              data
            );


            if (
              data &&
              data.user &&
              !data.session
            ) {

              showMessage(
                "Реєстрацію виконано. Перевірте email та підтвердіть адресу.",
                "success"
              );

              return;
            }


            showMessage(
              "Реєстрацію виконано!",
              "success"
            );


            window.location.replace(
              HOME_URL
            );

          } catch (error) {

            console.error(
              "UA LEGION REGISTER ERROR:",
              error
            );

            showMessage(
              "Сталася помилка під час реєстрації.",
              "error"
            );

          } finally {

            if (submitButton) {

              submitButton.disabled =
                false;

              submitButton.textContent =
                registerMode
                  ? "ЗАРЕЄСТРУВАТИСЯ"
                  : "УВІЙТИ";

            }

          }


          return;
        }


        // ==================================
        // LOGIN
        // ==================================

        if (submitButton) {

          submitButton.disabled =
            true;

          submitButton.textContent =
            "ВХІД...";

        }


        showMessage(
          "Виконується вхід...",
          "info"
        );


        try {

          const {
            data,
            error
          } =
            await client.auth.signInWithPassword({

              email,
              password

            });


          if (error) {

            console.error(
              "UA LEGION LOGIN ERROR:",
              error
            );

            showMessage(
              error.message,
              "error"
            );

            return;
          }


          console.log(
            "UA LEGION LOGIN SUCCESS:",
            data
          );


          showMessage(
            "Успішний вхід!",
            "success"
          );


          window.location.replace(
            HOME_URL
          );

        } catch (error) {

          console.error(
            "UA LEGION LOGIN ERROR:",
            error
          );

          showMessage(
            "Сталася помилка під час входу.",
            "error"
          );

        } finally {

          if (submitButton) {

            submitButton.disabled =
              false;

            submitButton.textContent =
              "УВІЙТИ";

          }

        }

      }
    );

  }


  // ======================================
  // GOOGLE LOGIN
  // ======================================

  if (googleButton) {

    googleButton.addEventListener(
      "click",
      async () => {

        clearMessage();

        googleButton.disabled =
          true;


        showMessage(
          "Перенаправлення до Google...",
          "info"
        );


        try {

          const {
            error
          } =
            await client.auth.signInWithOAuth({

              provider:
                "google",

              options: {

                redirectTo:
                  HOME_URL

              }

            });


          if (error) {

            console.error(
              "UA LEGION GOOGLE ERROR:",
              error
            );

            showMessage(
              error.message,
              "error"
            );

            googleButton.disabled =
              false;
          }

        } catch (error) {

          console.error(
            "UA LEGION GOOGLE ERROR:",
            error
          );

          showMessage(
            "Не вдалося виконати вхід через Google.",
            "error"
          );

          googleButton.disabled =
            false;
        }

      }
    );

  }


  // ======================================
  // DISCORD LOGIN
  // ======================================

  if (discordButton) {

    discordButton.addEventListener(
      "click",
      async () => {

        clearMessage();

        discordButton.disabled =
          true;


        showMessage(
          "Перенаправлення до Discord...",
          "info"
        );


        try {

          const {
            error
          } =
            await client.auth.signInWithOAuth({

              provider:
                "discord",

              options: {

                redirectTo:
                  HOME_URL

              }

            });


          if (error) {

            console.error(
              "UA LEGION DISCORD ERROR:",
              error
            );

            showMessage(
              error.message,
              "error"
            );

            discordButton.disabled =
              false;
          }

        } catch (error) {

          console.error(
            "UA LEGION DISCORD ERROR:",
            error
          );

          showMessage(
            "Не вдалося виконати вхід через Discord.",
            "error"
          );

          discordButton.disabled =
            false;
        }

      }
    );

  }


  // ======================================
  // INITIAL FORM
  // ======================================

  updateFormMode();

});
