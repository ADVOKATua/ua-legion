// ======================================
// КНОПКА АВТОРИЗАЦІЇ
// ======================================

// Спочатку шукаємо по ID
let authButton =
  document.getElementById(
    "authButton"
  );


// Якщо ID немає — шукаємо посилання
// "Увійти / Реєстрація" або login.html
if (!authButton) {

  authButton =
    Array.from(
      nav.querySelectorAll("a")
    )
    .find(
      (link) => {

        const href =
          link.getAttribute("href") || "";

        const text =
          link.textContent
            .trim()
            .toLowerCase();

        return (
          href === "login.html" ||
          href.endsWith("/login.html") ||
          text.includes("увійти") ||
          text.includes("реєстрація")
        );

      }
    );

}


// Якщо знайшли — додаємо правильний ID
if (authButton) {

  authButton.id =
    "authButton";

}


// Якщо взагалі немає — створюємо
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
