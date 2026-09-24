// ======================================
// UA LEGION — AUTH MENU SYSTEM
// auth-menu.js
// ======================================

let authMenuRunning = false;


// ======================================
// INIT AUTH MENU
// ======================================

async function initAuthMenu() {

  // ======================================
  // ЗАХИСТ ВІД ПАРАЛЕЛЬНОГО ЗАПУСКУ
  // ======================================

  if (authMenuRunning) {

    console.log(
      "UA LEGION MENU: попередній запуск ще виконується"
    );

    return;

  }

  authMenuRunning = true;


  try {

    // ======================================
    // SUPABASE
    // ======================================

    const supabase =
      window.supabaseClient;


    if (!supabase) {

      console.error(
        "UA LEGION: Supabase не підключений"
      );

      return;

    }


    // ======================================
    // НАВІГАЦІЯ
    // ======================================

    const nav =
      document.querySelector(".nav");


    if (!nav) {

      console.error(
        "UA LEGION: навігаційне меню не знайдено"
      );

      return;

    }


    // ======================================
    // ВИДАЛЯЄМО СТАРІ ДИНАМІЧНІ ПУНКТИ
    // ======================================

    nav
      .querySelectorAll(
        ".admin-menu-item, .members-menu-item, .support-menu-item"
      )
      .forEach(
        (item) => item.remove()
      );


    // ======================================
    // КНОПКА АВТОРИЗАЦІЇ
    // ======================================

    let authButton =
      document.getElementById("authButton");


    if (!authButton) {

      authButton =
        document.createElement("a");

      authButton.id =
        "authButton";

      nav.appendChild(
        authButton
      );

    }


    // ======================================
    // СЕСІЯ
    // ======================================

    const {
      data: {
        session
      },
      error: sessionError
    } = await supabase
      .auth
      .getSession();


    // ======================================
    // НЕАВТОРИЗОВАНИЙ
    // ======================================

    if (
      sessionError ||
      !session ||
      !session.user
    ) {

      authButton.href =
        "login.html";

      authButton.textContent =
        "Увійти / Реєстрація";


      // ======================================
      // ЗАВЖДИ ОСТАННІЙ
      // ======================================

      nav.appendChild(
        authButton
      );


      console.log(
        "UA LEGION MENU STATUS:",
        {
          user: null,
          isAdmin: false,
          isApproved: false
        }
      );


      return;

    }


    // ======================================
    // АВТОРИЗОВАНИЙ
    // ======================================

    const user =
      session.user;


    // ======================================
    // МІЙ КАБІНЕТ
    // ======================================

    authButton.href =
      "profile.html";

    authButton.textContent =
      "👤 Мій кабінет";


    // ======================================
    // ПЕРЕВІРКА АДМІНІСТРАЦІЇ
    // ======================================

    let isAdmin =
      false;


    try {

      const {
        data,
        error
      } = await supabase
        .rpc(
          "is_ua_legion_staff"
        );


      if (error) {

        console.error(
          "Помилка перевірки адміністрації:",
          error
        );

      }

      else {

        isAdmin =
          data === true;

      }

    }

    catch (error) {

      console.error(
        "Помилка перевірки адміністрації:",
        error
      );

    }


    // ======================================
    // ПЕРЕВІРКА ОДОБРЕНОЇ ЗАЯВКИ
    // ======================================

    let isApproved =
      false;


    try {

      const {
        data,
        error
      } = await supabase
        .from("applications")
        .select("id")
        .eq(
          "user_id",
          user.id
        )
        .eq(
          "status",
          "approved"
        )
        .limit(1);


      if (error) {

        console.error(
          "Помилка перевірки заявки:",
          error
        );

      }

      else {

        isApproved =
          Array.isArray(data) &&
          data.length > 0;

      }

    }

    catch (error) {

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
          nav.querySelectorAll("a")
        )
        .find(
          (link) =>
            link.href.includes(
              "tiktok.com"
            )
        );


    // ======================================
    // ФУНКЦІЯ ДОДАВАННЯ ПУНКТУ
    // ======================================

    function addMenuItem(
      href,
      text,
      className
    ) {

      // ----------------------------------
      // ДОДАТКОВИЙ ЗАХИСТ
      // ----------------------------------

      const existing =
        nav.querySelector(
          `.${className}`
        );


      if (existing) {

        return existing;

      }


      const link =
        document.createElement("a");


      link.href =
        href;


      link.textContent =
        text;


      link.className =
        className;


      if (tiktokLink) {

        nav.insertBefore(
          link,
          tiktokLink
        );

      }

      else {

        nav.insertBefore(
          link,
          authButton
        );

      }


      return link;

    }


    // ======================================
    // УЧАСНИКИ
    // АДМІНІСТРАЦІЯ
    // АБО ОДОБРЕНИЙ УЧАСНИК
    // ======================================

    if (
      isAdmin ||
      isApproved
    ) {

      addMenuItem(
        "members.html",
        "👥 Учасники",
        "members-menu-item"
      );

    }


    // ======================================
    // ЗАЯВКИ
    // ТІЛЬКИ АДМІНІСТРАЦІЯ
    // ======================================

    if (isAdmin) {

      addMenuItem(
        "applications.html",
        "📋 Заявки",
        "admin-menu-item"
      );

    }


    // ======================================
    // ЗВЕРНЕННЯ
    // ДЛЯ ВСІХ АВТОРИЗОВАНИХ
    // ======================================

    const supportMenuItem =
      document.createElement("a");


    supportMenuItem.href =
      "support.html";


    supportMenuItem.className =
      "support-menu-item";


    supportMenuItem.textContent =
      "💬";


    supportMenuItem.title =
      "Звернення";


    supportMenuItem.setAttribute(
      "aria-label",
      "Звернення"
    );


    // ======================================
    // СТИЛЬ ІКОНКИ
    // ======================================

    supportMenuItem.style.position =
      "relative";


    supportMenuItem.style.display =
      "inline-flex";


    supportMenuItem.style.alignItems =
      "center";


    supportMenuItem.style.justifyContent =
      "center";


    supportMenuItem.style.width =
      "38px";


    supportMenuItem.style.height =
      "38px";


    supportMenuItem.style.fontSize =
      "18px";


    supportMenuItem.style.border =
      "1px solid rgba(23,104,255,.35)";


    supportMenuItem.style.background =
      "rgba(23,104,255,.06)";


    supportMenuItem.style.transition =
      ".25s";


    // ======================================
    // HOVER
    // ======================================

    supportMenuItem.addEventListener(
      "mouseenter",
      () => {

        supportMenuItem.style.borderColor =
          "rgba(23,104,255,.75)";

        supportMenuItem.style.background =
          "rgba(23,104,255,.14)";

      }
    );


    supportMenuItem.addEventListener(
      "mouseleave",
      () => {

        supportMenuItem.style.borderColor =
          "rgba(23,104,255,.35)";

        supportMenuItem.style.background =
          "rgba(23,104,255,.06)";

      }
    );


    // ======================================
    // ДОДАЄМО ПЕРЕД МІЙ КАБІНЕТ
    // ======================================

    nav.insertBefore(
      supportMenuItem,
      authButton
    );


    // ======================================
    // МІЙ КАБІНЕТ — ЗАВЖДИ ОСТАННІЙ
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

  finally {

    // ======================================
    // ДОЗВОЛЯЄМО НАСТУПНИЙ ЗАПУСК
    // ======================================

    authMenuRunning = false;

  }

}


// ======================================
// ЗАПУСК ПІСЛЯ ЗАВАНТАЖЕННЯ DOM
// ======================================

if (
  document.readyState === "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initAuthMenu
  );

}

else {

  initAuthMenu();

}


// ======================================
// ОНОВЛЕННЯ ПІСЛЯ LOGIN / LOGOUT
// ======================================

window.addEventListener(
  "focus",
  () => {

    initAuthMenu();

  }
);
