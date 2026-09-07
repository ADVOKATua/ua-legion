// ======================================
// UA LEGION — AUTH MENU SYSTEM
// auth-menu.js
// ======================================

document.addEventListener("DOMContentLoaded", async () => {

  // ======================================
  // SUPABASE
  // ======================================

  const supabase = window.supabaseClient;

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
    document.querySelector(".nav");


  if (!nav) {
    return;
  }


  // ======================================
  // ВИДАЛЯЄМО СТАРІ ДИНАМІЧНІ ПУНКТИ
  // ======================================

  document
    .querySelectorAll(
      ".admin-menu-item, .members-menu-item"
    )
    .forEach(
      (item) => {

        item.remove();

      }
    );


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
  // ЯКЩО КОРИСТУВАЧ НЕ АВТОРИЗОВАНИЙ
  // ======================================

  if (
    userError ||
    !user
  ) {

    return;

  }


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
  // ПЕРЕВІРКА СТАТУСУ ЗАЯВКИ
  // ======================================

  let isApproved =
    false;


  try {

    const {
      data: application,
      error: applicationError
    } = await supabase
      .from("applications")
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
  // АДМІНІСТРАЦІЯ
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


    nav.appendChild(
      applicationsLink
    );

  }


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


    nav.appendChild(
      membersLink
    );

  }


  // ======================================
  // DEBUG
  // ======================================

  console.log(
    "UA LEGION MENU:",
    {

      user:
        user.email,


      isAdmin,


      isApproved

    }
  );

});
