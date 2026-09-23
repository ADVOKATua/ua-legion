// ======================================
// UA LEGION — LOGIN SYSTEM
// login.js
// ======================================

document.addEventListener(
  "DOMContentLoaded",
  async () => {

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

    const loginForm =
      document.getElementById("loginForm");

    const registerForm =
      document.getElementById("registerForm");

    const googleButton =
      document.getElementById("googleLogin");

    const discordButton =
      document.getElementById("discordLogin");

    const message =
      document.getElementById("message");


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

      message.textContent = text;

      message.className =
        "message " + type;
    }


    // ======================================
    // AUTH STATE
    // ======================================

    client.auth.onAuthStateChange(
      (event, session) => {

        console.log(
          "UA LEGION AUTH:",
          event,
          session
        );


        // ==================================
        // USER LOGGED IN
        // ==================================

        if (
          session &&
          (
            event === "SIGNED_IN" ||
            event === "INITIAL_SESSION"
          )
        ) {

          const path =
            window.location.pathname;


          // --------------------------------
          // Already on homepage
          // --------------------------------

          if (
            path.endsWith(
              "/ua-legion/"
            ) ||
            path.endsWith(
              "/ua-legion/index.html"
            )
          ) {
            return;
          }


          // --------------------------------
          // Login page → homepage
          // --------------------------------

          if (
            path.endsWith(
              "/login.html"
            )
          ) {

            console.log(
              "UA LEGION: session detected → homepage"
            );

            window.location.replace(
              HOME_URL
            );

          }

        }

      }
    );


    // ======================================
    // EMAIL / PASSWORD LOGIN
    // ======================================

    if (loginForm) {

      loginForm.addEventListener(
        "submit",
        async (event) => {

          event.preventDefault();


          const emailInput =
            document.getElementById(
              "loginEmail"
            );

          const passwordInput =
            document.getElementById(
              "loginPassword"
            );


          const email =
            emailInput
              ? emailInput.value.trim()
              : "";

          const password =
            passwordInput
              ? passwordInput.value
              : "";


          if (
            !email ||
            !password
          ) {

            showMessage(
              "Введіть email та пароль.",
              "error"
            );

            return;
          }


          showMessage(
            "Виконується вхід...",
            "info"
          );


          const {
            data,
            error
          } =
            await client.auth.signInWithPassword(
              {
                email,
                password
              }
            );


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


          // ==================================
          // EMAIL LOGIN → HOMEPAGE
          // ==================================

          window.location.replace(
            HOME_URL
          );

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

          showMessage(
            "Перенаправлення до Google...",
            "info"
          );


          const {
            error
          } =
            await client.auth.signInWithOAuth(
              {
                provider: "google",

                options: {
                  redirectTo: HOME_URL
                }

              }
            );


          if (error) {

            console.error(
              "UA LEGION GOOGLE LOGIN ERROR:",
              error
            );

            showMessage(
              error.message,
              "error"
            );

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

          showMessage(
            "Перенаправлення до Discord...",
            "info"
          );


          const {
            error
          } =
            await client.auth.signInWithOAuth(
              {
                provider: "discord",

                options: {
                  redirectTo: HOME_URL
                }

              }
            );


          if (error) {

            console.error(
              "UA LEGION DISCORD LOGIN ERROR:",
              error
            );

            showMessage(
              error.message,
              "error"
            );

          }

        }
      );

    }


    // ======================================
    // REGISTER
    // ======================================

    if (registerForm) {

      registerForm.addEventListener(
        "submit",
        async (event) => {

          event.preventDefault();


          const emailInput =
            document.getElementById(
              "registerEmail"
            );

          const passwordInput =
            document.getElementById(
              "registerPassword"
            );


          const email =
            emailInput
              ? emailInput.value.trim()
              : "";

          const password =
            passwordInput
              ? passwordInput.value
              : "";


          if (
            !email ||
            !password
          ) {

            showMessage(
              "Введіть email та пароль.",
              "error"
            );

            return;
          }


          if (
            password.length < 6
          ) {

            showMessage(
              "Пароль повинен містити щонайменше 6 символів.",
              "error"
            );

            return;
          }


          showMessage(
            "Створення облікового запису...",
            "info"
          );


          const {
            data,
            error
          } =
            await client.auth.signUp(
              {
                email,
                password,

                options: {
                  emailRedirectTo:
                    LOGIN_URL
                }
              }
            );


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


          showMessage(
            "Реєстрацію виконано. Перевірте email для підтвердження.",
            "success"
          );

        }
      );

    }

  }
);
