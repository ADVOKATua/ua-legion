// ======================================
// UA LEGION — AUTH MENU SYSTEM
// auth-menu.js
// ======================================

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
        "Supabase не підключений"
      );

      return;

    }


    // ======================================
    // НАВІГАЦІЯ
    // ======================================

    const nav =
      document.querySelector(
        ".nav"
      );


    if (!nav) {

      console.error(
        "Навігаційне меню не знайдено"
      );

      return;

    }


    // ======================================
    // ВИДАЛЯЄМО СТАРІ ДИНАМІЧНІ ПУНКТИ
    // ======================================

    nav
      .querySelectorAll(
        ".admin-menu-item, .members-menu-item"
      )
      .forEach(
        (item) => {

          item.remove();

        }
      );


    // ======================================
    // ШУКАЄМО КНОПКУ АВТОРИЗАЦІЇ
    // ======================================

    let authButton =
      document.getElementById(
        "authButton"
      );


    // --------------------------------------
    // ЯКЩО НЕ ЗНАЙДЕНО ПО ID
    // --------------------------------------

    if (!authButton) {

      authButton =
        Array
          .from(
            nav.querySelectorAll(
              "a"
            )
          )
          .find(
            (link) => {

              const href =
                link.getAttribute(
                  "href"
                ) || "";


              const text =
                link
                  .textContent
                  .trim()
                  .toLowerCase();


              return (

                href.includes(
                  "login.html"
                ) ||

                href.includes(
                  "profile.html"
                ) ||

                text.includes(
                  "увійти"
                ) ||

                text.includes(
                  "реєстрація"
                ) ||

                text.includes(
                  "мій кабінет"
                )

              );

            }
          );

    }


    // --------------------------------------
    // ЯКЩО ЗНАЙШЛИ — ДОДАЄМО ID
    // --------------------------------------

    if (authButton) {

      authButton.id =
        "authButton";

    }


    // --------------------------------------
    // ЯКЩО ВЗАГАЛІ НЕМАЄ
    // --------------------------------------

    if (!authButton) {

      authButton =
        document.createElement(
          "a"
        );


      authButton.id =
        "authButton";


      nav.appendChild(
        authButton
      );

    }


    // ======================================
    // ОТРИМУЄМО КОРИСТУВАЧА
    // ======================================

    const {
      data: {
        user
      },
      error: userError
    } = await supabase
      .auth
      .getUser();


    // ======================================
    // НЕАВТОРИЗОВАНИЙ КОРИСТУВАЧ
    // ======================================

    if (

      userError ||

      !user

    ) {

      authButton.href =
        "login.html";


      authButton.textContent =
        "Увійти / Реєстрація";


      // КНОПКА ЗАВЖДИ ОСТАННЯ

      nav.appendChild(
        authButton
      );


      console.log(
        "UA LEGION: користувач не авторизований"
      );


      return;

    }


    // ======================================
    // АВТОРИЗОВАНИЙ КОРИСТУВАЧ
    // ======================================

    authButton.href =
      "profile.html";


    authButton.textContent =
      "👤 Мій кабінет";


    // КНОПКА ЗАВЖДИ ОСТАННЯ

    nav.appendChild(
      authButton
    );


    // ======================================
    // ПЕРЕВІРКА АДМІНІСТРАЦІЇ
    // ======================================

    let isAdmin =
      false;


    try {

      const {
        data: adminResult,
        error: adminError
      } = await supabase
        .rpc(
          "is_ua_legion_staff"
        );


      if (adminError) {

        console.error(
          "Помилка перевірки адміністрації:",
          adminError
        );

      }

      else {

        isAdmin =
          adminResult === true;

      }

    }

    catch (
      error
    ) {

      console.error(
        "Помилка перевірки адміністрації:",
        error
      );

    }


    // ======================================
    // ПЕРЕВІРКА ЗАТВЕРДЖЕНОЇ ЗАЯВКИ
    // ======================================

    let isApproved =
      false;


    try {

      const {
        data: application,
        error: applicationError
      } = await supabase
        .from(
          "applications"
        )
        .select(
          "status"
        )
        .eq(
          "user_id",
          user.id
        )
        .eq(
          "status",
          "approved"
        )
        .maybeSingle();


      if (applicationError) {

        console.error(
          "Помилка перевірки заявки:",
          applicationError
        );

      }

      else if (
        application
      ) {

        isApproved =
          true;

      }

    }

    catch (
      error
    ) {

      console.error(
        "Помилка перевірки статусу заявки:",
        error
      );

    }


    // ======================================
    // ШУКАЄМО TIKTOK
    // ======================================

    const tiktokLink =
      Array
        .from(
          nav.querySelectorAll(
            "a"
          )
        )
        .find(
          (link) =>
            link.href.includes(
              "tiktok.com"
            )
        );


    // ======================================
    // УЧАСНИКИ
    // ======================================

    if (

      isAdmin ||

      isApproved

    ) {

      const membersLink =
        document.createElement(
          "a"
        );


      membersLink.href =
        "members.html";


      membersLink.className =
        "members-menu-item";


      membersLink.textContent =
        "👥 Учасники";


      // ВСТАВЛЯЄМО ПЕРЕД TIKTOK

      if (
        tiktokLink
      ) {

        nav.insertBefore(
          membersLink,
          tiktokLink
        );

      }

      else {

        nav.insertBefore(
          membersLink,
          authButton
        );

      }

    }


    // ======================================
    // ЗАЯВКИ
    // ТІЛЬКИ ДЛЯ АДМІНІСТРАЦІЇ
    // ======================================

    if (
      isAdmin
    ) {

      const applicationsLink =
        document.createElement(
          "a"
        );


      applicationsLink.href =
        "applications.html";


      applicationsLink.className =
        "admin-menu-item";


      applicationsLink.textContent =
        "📋 Заявки";


      // ВСТАВЛЯЄМО ПЕРЕД TIKTOK

      if (
        tiktokLink
      ) {

        nav.insertBefore(
          applicationsLink,
          tiktokLink
        );

      }

      else {

        nav.insertBefore(
          applicationsLink,
          authButton
        );

      }

    }


    // ======================================
    // ФІНАЛЬНО:
    // AUTH BUTTON ЗАВЖДИ ОСТАННЯ
    // ======================================

    nav.appendChild(
      authButton
    );


    // ======================================
    // DEBUG
    // ======================================

    console.log(
      "UA LEGION MENU STATUS:",
      {

        user:
          user.email,


        isAdmin:
          isAdmin,


        isApproved:
          isApproved

      }
    );


  }

);
