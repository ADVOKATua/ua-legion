// ======================================
// UA LEGION — AUTH MENU SYSTEM
// auth-menu.js
// ======================================

let authMenuRunning = false;

let supportUnreadTimer = null;


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

      // Зупиняємо старий таймер
      if (supportUnreadTimer) {

        clearInterval(
          supportUnreadTimer
        );

        supportUnreadTimer =
          null;

      }


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


    supportMenuItem.title =
      "Звернення";


    supportMenuItem.setAttribute(
      "aria-label",
      "Звернення"
    );


    // ======================================
    // КОНТЕЙНЕР ІКОНКИ
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
    // ІКОНКА
    // ======================================

    const supportIcon =
      document.createElement("span");


    supportIcon.className =
      "support-icon";


    supportIcon.textContent =
      "💬";


    supportMenuItem.appendChild(
      supportIcon
    );


    // ======================================
    // BADGE
    // ======================================

    const supportBadge =
      document.createElement("span");


    supportBadge.className =
      "support-unread-badge";


    supportBadge.hidden =
      true;


    supportBadge.style.position =
      "absolute";


    supportBadge.style.top =
      "-6px";


    supportBadge.style.right =
      "-6px";


    supportBadge.style.minWidth =
      "18px";


    supportBadge.style.height =
      "18px";


    supportBadge.style.padding =
      "0 5px";


    supportBadge.style.borderRadius =
      "999px";


    supportBadge.style.display =
      "inline-flex";


    supportBadge.style.alignItems =
      "center";


    supportBadge.style.justifyContent =
      "center";


    supportBadge.style.boxSizing =
      "border-box";


    supportBadge.style.background =
      "#ff3b30";


    supportBadge.style.color =
      "#ffffff";


    supportBadge.style.fontSize =
      "10px";


    supportBadge.style.fontWeight =
      "800";


    supportBadge.style.lineHeight =
      "1";


    supportBadge.style.fontFamily =
      "Arial, sans-serif";


    supportBadge.style.border =
      "2px solid #05080d";


    supportBadge.style.zIndex =
      "10";


    supportMenuItem.appendChild(
      supportBadge
    );


    // ======================================
    // ОНОВЛЕННЯ ЛІЧИЛЬНИКА
    // ======================================

    async function refreshSupportUnreadCount() {

      try {

        const result =
          await supabase.rpc(
            "get_support_unread_count"
          );


        if (result.error) {

          console.error(
            "get_support_unread_count:",
            result.error
          );

          supportBadge.hidden =
            true;

          return;

        }


        let count =
          Number(
            result.data || 0
          );


        if (
          !Number.isFinite(count) ||
          count < 0
        ) {

          count =
            0;

        }


        if (count <= 0) {

          supportBadge.hidden =
            true;

          supportBadge.textContent =
            "";

          supportMenuItem.title =
            "Звернення";

          supportMenuItem.setAttribute(
            "aria-label",
            "Звернення"
          );

          return;

        }


        const badgeText =
          count > 99
            ? "99+"
            : String(count);


        supportBadge.textContent =
          badgeText;


        supportBadge.hidden =
          false;


        supportMenuItem.title =
          `Звернення — непрочитаних: ${count}`;


        supportMenuItem.setAttribute(
          "aria-label",
          `Звернення — непрочитаних: ${count}`
        );

      }

      catch (error) {

        console.error(
          "Помилка лічильника звернень:",
          error
        );

        supportBadge.hidden =
          true;

      }

    }


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
    // ПЕРШЕ ОНОВЛЕННЯ ЛІЧИЛЬНИКА
    // ======================================

    await refreshSupportUnreadCount();


    // ======================================
    // ЗАПАМ'ЯТОВУЄМО ФУНКЦІЮ ГЛОБАЛЬНО
    // ======================================

    window.uaLegionRefreshSupportUnread =
      refreshSupportUnreadCount;


    // ======================================
    // ОЧИЩАЄМО ПОПЕРЕДНІЙ ТАЙМЕР
    // ======================================

    if (supportUnreadTimer) {

      clearInterval(
        supportUnreadTimer
      );

    }


    // ======================================
    // АВТООНОВЛЕННЯ
    // КОЖНІ 5 СЕКУНД
    // ======================================

    supportUnreadTimer =
      setInterval(
        refreshSupportUnreadCount,
        5000
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

    authMenuRunning =
      false;

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
