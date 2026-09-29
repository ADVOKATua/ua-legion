```javascript
// ==========================================
// UA LEGION
// ADMIN HUB
// admin.js
//
// АРХІТЕКТУРА:
//
// applications.html
//   → єдиний центр роботи із заявками
//
// admin.html
//   → адміністративний центр
//
// ВАЖЛИВО:
//
// approve / reject заявок тут НЕ виконується.
//
// Ролі тут НЕ призначаються.
//
// Заявки НЕ завантажуються.
//
// ==========================================


document.addEventListener(
  "DOMContentLoaded",

  async () => {


    // ======================================
    // SUPABASE
    // ======================================

    const supabase =
      window.supabaseClient;


    if (!supabase) {

      console.error(
        "UA LEGION: Supabase не підключений."
      );

      return;

    }



    // ======================================
    // DOM
    // ======================================

    const adminUserName =
      document.getElementById(
        "adminUserName"
      );


    const adminMessage =
      document.getElementById(
        "adminMessage"
      );



    // ======================================
    // MESSAGE
    // ======================================

    function showMessage(
      message,
      type = "info"
    ) {

      if (!adminMessage) {
        return;
      }


      adminMessage.textContent =
        message;


      adminMessage.className =
        "admin-message " +
        type;


      adminMessage.style.display =
        "block";

    }



    // ======================================
    // AUTH
    // ======================================

    const {
      data: {
        user
      },

      error: userError

    } =
      await supabase
        .auth
        .getUser();



    // ======================================
    // USER NOT AUTHENTICATED
    // ======================================

    if (
      userError ||
      !user
    ) {

      window.location.href =
        "login.html";

      return;

    }



    // ======================================
    // LOAD USER PROFILE
    // ======================================

    const {
      data: profile,
      error: profileError
    } =
      await supabase
        .from("profiles")
        .select(
          "display_name, game_nickname"
        )
        .eq(
          "id",
          user.id
        )
        .maybeSingle();



    if (profileError) {

      console.error(
        "UA LEGION: помилка завантаження профілю:",
        profileError
      );

    }



    // ======================================
    // USER NAME
    // ======================================

    if (adminUserName) {

      adminUserName.textContent =

        profile?.display_name ||

        profile?.game_nickname ||

        "Адміністратор";

    }



    // ======================================
    // CHECK ADMIN ACCESS
    // ======================================
    //
    // ЗАРАЗ:
    //
    // використовуємо існуючий
    // applications.view
    //
    // ПІЗНІШЕ:
    //
    // можна створити окремий permission:
    //
    // admin.panel.view
    //
    // ======================================

    const {
      data: hasAccess,
      error: permissionError
    } =
      await supabase
        .rpc(
          "has_permission",
          {
            p_permission_code:
              "applications.view",

            p_direction_id:
              null
          }
        );



    // ======================================
    // PERMISSION ERROR
    // ======================================

    if (permissionError) {

      console.error(
        "UA LEGION: помилка перевірки permission:",
        permissionError
      );


      showMessage(
        "Не вдалося перевірити права доступу.",
        "error"
      );


      setTimeout(
        () => {

          window.location.href =
            "profile.html";

        },

        1200
      );


      return;

    }



    // ======================================
    // ACCESS DENIED
    // ======================================

    if (
      hasAccess !== true
    ) {

      showMessage(
        "У вас немає доступу до адміністративного центру.",
        "error"
      );


      setTimeout(
        () => {

          window.location.href =
            "profile.html";

        },

        900
      );


      return;

    }



    // ======================================
    // ACCESS GRANTED
    // ======================================

    console.log(
      "UA LEGION ADMIN HUB:",
      {
        user_id:
          user.id,

        permission:
          "applications.view",

        access:
          true
      }
    );


    showMessage(
      "Адміністративний центр готовий до роботи.",
      "success"
    );


  }

);
```
