// ==========================================
// UA LEGION — AUTH MENU
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

  const supabase = window.supabaseClient;

  if (!supabase) {
    console.error("Supabase не підключений");
    return;
  }

  const authButton =
    document.getElementById("authButton");

  if (!authButton) {
    return;
  }

  // Перевіряємо, чи користувач увійшов

  const {
    data: {
      user
    },
    error
  } =
    await supabase.auth.getUser();


  if (error) {
    console.error(error);
  }


  // ======================================
  // КОРИСТУВАЧ НЕ УВІЙШОВ
  // ======================================

  if (!user) {

    authButton.textContent =
      "Увійти / Реєстрація";

    authButton.href =
      "login.html";

    return;
  }


  // ======================================
  // КОРИСТУВАЧ УВІЙШОВ
  // ======================================

  authButton.textContent =
    "Мій кабінет";

  authButton.href =
    "profile.html";

});
