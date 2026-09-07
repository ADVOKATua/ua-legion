// ======================================
// UA LEGION — AUTH MENU SYSTEM
// auth-menu.js
// ======================================

async function initAuthMenu() {

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
    document.querySelector(
      ".nav"
    );


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
      ".admin-menu-item, .members-menu-item"
    )
    .forEach(
      (item) => {

        item.remove();

      }
    );


  // ======================================
  // КНОПКА АВТОРИЗАЦІЇ
  // ======================================

  let authButton =
    document.getElementById(
      "authButton"
    );


  // --------------------------------------
  // ЯКЩО КНОПКИ НЕМАЄ — СТВОРЮЄМО
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
  // СПОЧАТКУ ЗАВЖДИ СТАВИМО
  // КНОПКУ В КІНЕЦЬ МЕНЮ
  // ======================================

  nav.appendChild(
    authButton
  );


  // ======================================
  // ПЕРЕВІРЯЄМО СЕСІЮ
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
  // АВТОРИЗОВАНИЙ КОРИСТУВАЧ
  // ======================================

  const user =
    session.user;


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
      .from(
        "applications"
      )
      .select(
        "id"
      )
      .eq(
        "user_id",
        user.id
      )
      .eq(
        "status",
        "approved"
      )
      .limit(
        1
      );


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
        nav.querySelectorAll(
          "a"
        )
      )
      .find(
        (link) => {

          return (
            link.href.includes(
              "tiktok.com"
            )
          );

        }
      );


  // ======================================
  // ФУНКЦІЯ ДОДАВАННЯ ПУНКТУ
  // ======================================

  function addMenuItem(
    href,
    text,
    className
  ) {

    const link =
      document.createElement(
        "a"
      );


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
  //
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
  //
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
  // МІЙ КАБІНЕТ ЗАВЖДИ ОСТАННІЙ
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


// ======================================
// ЗАПУСК
// ======================================

if (
  document.readyState ===
  "loading"
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
