```javascript
// ======================================
// UA LEGION — AUTH MENU SYSTEM
// auth-menu.js
// VERSION 5
// ======================================

let authMenuRunning = false;
let supportUnreadTimer = null;

// ======================================
// ETS2 APPLICATIONS ACCESS
// ======================================

function isEts2JoinPage() {
  return window.location.pathname.split("/").pop() === "ets2-join.html";
}

function hideEts2ApplicationLinks() {
  document.querySelectorAll(
    '.ets-sidebar a[href="ets2-join.html"], ' +
    '.ets-sidebar a[href$="/ets2-join.html"]'
  ).forEach(link => {
    link.hidden = true;
    link.style.display = "none";
  });
}

// Приховуємо посилання одразу, до перевірки Supabase.
hideEts2ApplicationLinks();

async function initAuthMenu() {
  if (authMenuRunning) {
    console.log("UA LEGION MENU: попередній запуск ще виконується");
    return;
  }

  authMenuRunning = true;

  try {
    const supabase = window.supabaseClient;

    if (!supabase) {
      console.error("UA LEGION: Supabase не підключений");
      hideEts2ApplicationLinks();

      if (isEts2JoinPage()) {
        window.location.replace("ets2.html");
      }
      return;
    }

    const nav = document.querySelector(".nav");

    if (!nav) {
      console.error("UA LEGION: навігаційне меню не знайдено");
      hideEts2ApplicationLinks();

      if (isEts2JoinPage()) {
        window.location.replace("ets2.html");
      }
      return;
    }

    nav.querySelectorAll(
      ".admin-menu-item, .members-menu-item, .support-menu-item"
    ).forEach(item => item.remove());

    let authButton = document.getElementById("authButton");

    if (!authButton) {
      authButton = document.createElement("a");
      authButton.id = "authButton";
      nav.appendChild(authButton);
    }

    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession();

    // ======================================
    // НЕАВТОРИЗОВАНИЙ КОРИСТУВАЧ
    // ======================================

    if (sessionError || !session || !session.user) {
      if (supportUnreadTimer) {
        clearInterval(supportUnreadTimer);
        supportUnreadTimer = null;
      }

      hideEts2ApplicationLinks();

      authButton.href = "login.html";
      authButton.textContent = "Увійти / Реєстрація";
      nav.appendChild(authButton);

      if (isEts2JoinPage()) {
        window.location.replace("ets2.html");
        return;
      }

      console.log("UA LEGION MENU STATUS:", {
        user: null,
        isAdmin: false,
        isApproved: false,
        canAccessEts2Applications: false
      });

      return;
    }

    const user = session.user;

    authButton.href = "profile.html";
    authButton.textContent = "👤 Мій кабінет";

    // ======================================
    // ПЕРЕВІРКА ДОСТУПУ ДО ЗАЯВОК ETS2
    // ======================================

    let canAccessEts2Applications = false;

    try {
      const { data, error } = await supabase.rpc(
        "can_access_ets2_applications"
      );

      if (error) {
        console.error(
          "Помилка перевірки доступу до заявок ETS2:",
          error
        );
      } else {
        canAccessEts2Applications = data === true;
      }
    } catch (error) {
      console.error(
        "Помилка перевірки доступу до заявок ETS2:",
        error
      );
    }

    // ======================================
    // ПОСИЛАННЯ В ЛІВОМУ МЕНЮ ETS2
    // ======================================

    document.querySelectorAll(
      '.ets-sidebar a[href="ets2-join.html"], ' +
      '.ets-sidebar a[href$="/ets2-join.html"]'
    ).forEach(link => {
      if (canAccessEts2Applications) {
        link.hidden = false;
        link.style.display = "";
      } else {
        link.hidden = true;
        link.style.display = "none";
      }
    });

    // Прямий URL: доступ лише дозволеним ETS2-посадам.
    if (
      isEts2JoinPage() &&
      !canAccessEts2Applications
    ) {
      window.location.replace("ets2.html");
      return;
    }

    // ======================================
    // ПЕРЕВІРКА АДМІНІСТРАЦІЇ
    // ======================================

    let isAdmin = false;

    try {
      const { data, error } = await supabase.rpc(
        "is_ua_legion_staff"
      );

      if (error) {
        console.error(
          "Помилка перевірки адміністрації:",
          error
        );
      } else {
        isAdmin = data === true;
      }
    } catch (error) {
      console.error(
        "Помилка перевірки адміністрації:",
        error
      );
    }

    // ======================================
    // ПЕРЕВІРКА СХВАЛЕНОЇ ЗАЯВКИ
    // ======================================

    let isApproved = false;

    try {
      const { data, error } = await supabase
        .from("applications")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "approved")
        .limit(1);

      if (error) {
        console.error(
          "Помилка перевірки заявки:",
          error
        );
      } else {
        isApproved = Array.isArray(data) && data.length > 0;
      }
    } catch (error) {
      console.error(
        "Помилка перевірки статусу заявки:",
        error
      );
    }

    // ======================================
    // ПОШУК TIKTOK
    // ======================================

    const tiktokLink = Array
      .from(nav.querySelectorAll("a"))
      .find(link => link.href.includes("tiktok.com"));

    // ======================================
    // ДОДАВАННЯ ПУНКТУ МЕНЮ
    // ======================================

    function addMenuItem(href, text, className) {
      const existing = nav.querySelector(`.${className}`);

      if (existing) {
        return existing;
      }

      const link = document.createElement("a");
      link.href = href;
      link.textContent = text;
      link.className = className;

      if (tiktokLink) {
        nav.insertBefore(link, tiktokLink);
      } else {
        nav.insertBefore(link, authButton);
      }

      return link;
    }

    // ======================================
    // УЧАСНИКИ
    // ======================================

    if (isAdmin || isApproved) {
      addMenuItem(
        "members.html",
        "👥 Учасники",
        "members-menu-item"
      );
    }

    // ======================================
    // ЗАГАЛЬНІ ЗАЯВКИ
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
    // ======================================

    const supportMenuItem = document.createElement("a");
    supportMenuItem.href = "support.html";
    supportMenuItem.className = "support-menu-item";
    supportMenuItem.title = "Звернення";
    supportMenuItem.setAttribute("aria-label", "Звернення");

    Object.assign(supportMenuItem.style, {
      position: "relative",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: "38px",
      height: "38px",
      fontSize: "18px",
      border: "1px solid rgba(23,104,255,.35)",
      background: "rgba(23,104,255,.06)",
      transition: ".25s"
    });

    const supportIcon = document.createElement("span");
    supportIcon.className = "support-icon";
    supportIcon.textContent = "💬";
    supportMenuItem.appendChild(supportIcon);

    const supportBadge = document.createElement("span");
    supportBadge.className = "support-unread-badge";

    Object.assign(supportBadge.style, {
      display: "none",
      position: "absolute",
      top: "-6px",
      right: "-6px",
      minWidth: "18px",
      height: "18px",
      padding: "0 5px",
      borderRadius: "999px",
      alignItems: "center",
      justifyContent: "center",
      boxSizing: "border-box",
      background: "#ff3b30",
      color: "#ffffff",
      fontSize: "10px",
      fontWeight: "800",
      lineHeight: "1",
      fontFamily: "Arial, sans-serif",
      border: "2px solid #05080d",
      zIndex: "10"
    });

    supportMenuItem.appendChild(supportBadge);

    // ======================================
    // ЛІЧИЛЬНИК НЕПРОЧИТАНИХ ЗВЕРНЕНЬ
    // ======================================

    async function refreshSupportUnreadCount() {
      try {
        const result = await supabase.rpc(
          "get_support_unread_count"
        );

        if (result.error) {
          console.error(
            "get_support_unread_count:",
            result.error
          );
          supportBadge.style.display = "none";
          return;
        }

        let count = Number(result.data || 0);

        if (!Number.isFinite(count) || count < 0) {
          count = 0;
        }

        if (count <= 0) {
          supportBadge.textContent = "";
          supportBadge.style.display = "none";
          supportMenuItem.title = "Звернення";
          supportMenuItem.setAttribute(
            "aria-label",
            "Звернення"
          );
          return;
        }

        supportBadge.textContent =
          count > 99 ? "99+" : String(count);

        supportBadge.style.display = "inline-flex";
        supportMenuItem.title =
          `Звернення — непрочитаних: ${count}`;

        supportMenuItem.setAttribute(
          "aria-label",
          `Звернення — непрочитаних: ${count}`
        );
      } catch (error) {
        console.error(
          "Помилка лічильника звернень:",
          error
        );
        supportBadge.style.display = "none";
      }
    }

    // ======================================
    // ЕФЕКТИ НАВЕДЕННЯ
    // ======================================

    supportMenuItem.addEventListener("mouseenter", () => {
      supportMenuItem.style.borderColor =
        "rgba(23,104,255,.75)";
      supportMenuItem.style.background =
        "rgba(23,104,255,.14)";
    });

    supportMenuItem.addEventListener("mouseleave", () => {
      supportMenuItem.style.borderColor =
        "rgba(23,104,255,.35)";
      supportMenuItem.style.background =
        "rgba(23,104,255,.06)";
    });

    nav.insertBefore(supportMenuItem, authButton);
    nav.appendChild(authButton);

    await refreshSupportUnreadCount();

    window.uaLegionRefreshSupportUnread =
      refreshSupportUnreadCount;

    if (supportUnreadTimer) {
      clearInterval(supportUnreadTimer);
    }

    supportUnreadTimer = setInterval(
      refreshSupportUnreadCount,
      5000
    );

    console.log("UA LEGION MENU STATUS:", {
      user: user.email,
      isAdmin,
      isApproved,
      canAccessEts2Applications
    });

  } finally {
    authMenuRunning = false;
  }
}

// ======================================
// ЗАПУСК
// ======================================

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initAuthMenu
  );
} else {
  initAuthMenu();
}

// ======================================
// ОНОВЛЕННЯ ПІСЛЯ LOGIN / LOGOUT
// ======================================

window.addEventListener("focus", () => {
  initAuthMenu();
});
```
