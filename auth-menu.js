
/* ======================================
   UA LEGION — AUTH MENU SYSTEM
   auth-menu.js
   VERSION 6
   ====================================== */

let authMenuRunning = false;
let authMenuPending = false;
let supportUnreadTimer = null;
let authStateSubscription = null;
let authMenuInitialized = false;

// ======================================
// ETS2 APPLICATIONS MENU VISIBILITY
// ======================================

function setEts2ApplicationsMenuVisible(visible) {
  document.querySelectorAll(
    '.ets-sidebar a[href="ets2-join.html"], ' +
    '.ets-sidebar a[href$="/ets2-join.html"]'
  ).forEach(link => {
    link.hidden = !visible;
    link.style.display = visible ? "" : "none";
  });
}

// Поки доступ не перевірено — пункт прихований.
setEts2ApplicationsMenuVisible(false);

// ======================================
// STOP SUPPORT TIMER
// ======================================

function stopSupportUnreadTimer() {
  if (supportUnreadTimer) {
    clearInterval(supportUnreadTimer);
    supportUnreadTimer = null;
  }

  window.uaLegionRefreshSupportUnread = null;
}

// ======================================
// CREATE / UPDATE AUTH BUTTON
// ======================================

function getAuthButton(nav) {
  let button = document.getElementById("authButton");

  if (!button) {
    button = document.createElement("a");
    button.id = "authButton";
    nav.appendChild(button);
  }

  return button;
}

// ======================================
// RESET DYNAMIC MENU
// ======================================

function clearDynamicMenu(nav) {
  nav.querySelectorAll(
    ".admin-menu-item, .members-menu-item, .support-menu-item"
  ).forEach(item => item.remove());
}

// ======================================
// ADD MENU ITEM
// ======================================

function addMenuItem(nav, href, text, className, authButton) {
  let link = nav.querySelector("." + className);

  if (!link) {
    link = document.createElement("a");
    link.className = className;
    link.href = href;
    link.textContent = text;

    const tiktokLink = Array.from(
      nav.querySelectorAll("a")
    ).find(item => item.href.includes("tiktok.com"));

    if (tiktokLink) {
      nav.insertBefore(link, tiktokLink);
    } else {
      nav.insertBefore(link, authButton);
    }
  }

  return link;
}

// ======================================
// SUPPORT MENU
// ======================================

function createSupportMenuItem(supabase, nav, authButton) {
  const link = document.createElement("a");

  link.href = "support.html";
  link.className = "support-menu-item";
  link.title = "Звернення";
  link.setAttribute("aria-label", "Звернення");

  Object.assign(link.style, {
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

  const icon = document.createElement("span");
  icon.className = "support-icon";
  icon.textContent = "💬";
  link.appendChild(icon);

  const badge = document.createElement("span");
  badge.className = "support-unread-badge";

  Object.assign(badge.style, {
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

  link.appendChild(badge);

  link.addEventListener("mouseenter", () => {
    link.style.borderColor = "rgba(23,104,255,.75)";
    link.style.background = "rgba(23,104,255,.14)";
  });

  link.addEventListener("mouseleave", () => {
    link.style.borderColor = "rgba(23,104,255,.35)";
    link.style.background = "rgba(23,104,255,.06)";
  });

  async function refreshSupportUnreadCount() {
    try {
      const { data, error } = await supabase.rpc(
        "get_support_unread_count"
      );

      if (error) {
        console.error("get_support_unread_count:", error);
        badge.style.display = "none";
        return;
      }

      let count = Number(data || 0);

      if (!Number.isFinite(count) || count < 0) {
        count = 0;
      }

      if (count === 0) {
        badge.textContent = "";
        badge.style.display = "none";
        link.title = "Звернення";
        link.setAttribute("aria-label", "Звернення");
        return;
      }

      badge.textContent = count > 99 ? "99+" : String(count);
      badge.style.display = "inline-flex";

      link.title = `Звернення — непрочитаних: ${count}`;
      link.setAttribute(
        "aria-label",
        `Звернення — непрочитаних: ${count}`
      );
    } catch (error) {
      console.error("Помилка лічильника звернень:", error);
      badge.style.display = "none";
    }
  }

  nav.insertBefore(link, authButton);

  return {
    element: link,
    refresh: refreshSupportUnreadCount
  };
}

// ======================================
// RENDER MENU
// ======================================

async function renderAuthMenu() {
  const supabase = window.supabaseClient;
  const nav = document.querySelector(".nav");

  if (!supabase || !nav) {
    console.error(
      "UA LEGION: Supabase або навігаційне меню не знайдено"
    );
    setEts2ApplicationsMenuVisible(false);
    return;
  }

  const authButton = getAuthButton(nav);

  // Спочатку отримуємо підтверджений стан сесії.
  const {
    data: { session },
    error: sessionError
  } = await supabase.auth.getSession();

  if (sessionError) {
    console.error("Помилка отримання сесії:", sessionError);
    setEts2ApplicationsMenuVisible(false);
    return;
  }

  clearDynamicMenu(nav);
  stopSupportUnreadTimer();

  // ======================================
  // LOGGED OUT
  // ======================================

  if (!session?.user) {
    setEts2ApplicationsMenuVisible(false);

    authButton.href = "login.html";
    authButton.textContent = "Увійти / Реєстрація";

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
  // ETS2 APPLICATIONS PERMISSION
  // ======================================

  let canAccessEts2Applications = false;

  try {
    const { data, error } = await supabase.rpc(
      "can_access_ets2_applications"
    );

    if (error) {
      console.error("Помилка перевірки доступу ETS2:", error);
    } else {
      canAccessEts2Applications = data === true;
    }
  } catch (error) {
    console.error("Помилка перевірки доступу ETS2:", error);
  }

  setEts2ApplicationsMenuVisible(canAccessEts2Applications);

  // ======================================
  // STAFF PERMISSION
  // ======================================

  let isAdmin = false;

  try {
    const { data, error } = await supabase.rpc(
      "is_ua_legion_staff"
    );

    if (error) {
      console.error("Помилка перевірки адміністрації:", error);
    } else {
      isAdmin = data === true;
    }
  } catch (error) {
    console.error("Помилка перевірки адміністрації:", error);
  }

  // ======================================
  // APPROVED APPLICATION
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
      console.error("Помилка перевірки заявки:", error);
    } else {
      isApproved = Array.isArray(data) && data.length > 0;
    }
  } catch (error) {
    console.error("Помилка перевірки статусу заявки:", error);
  }

  // ======================================
  // MEMBERS
  // ======================================

  if (isAdmin || isApproved) {
    addMenuItem(
      nav,
      "members.html",
      "👥 Учасники",
      "members-menu-item",
      authButton
    );
  }

  // ======================================
  // GENERAL APPLICATIONS
  // ======================================

  if (isAdmin) {
    addMenuItem(
      nav,
      "applications.html",
      "📋 Заявки",
      "admin-menu-item",
      authButton
    );
  }

  // ======================================
  // SUPPORT
  // ======================================

  const support = createSupportMenuItem(
    supabase,
    nav,
    authButton
  );

  window.uaLegionRefreshSupportUnread = support.refresh;

  await support.refresh();

  supportUnreadTimer = setInterval(
    support.refresh,
    5000
  );

  // Кабінет завжди останній.
  nav.appendChild(authButton);

  console.log("UA LEGION MENU STATUS:", {
    user: user.email,
    isAdmin,
    isApproved,
    canAccessEts2Applications
  });
}

// ======================================
// SINGLE-FLIGHT INITIALIZATION
// ======================================

async function initAuthMenu() {
  if (authMenuRunning) {
    authMenuPending = true;
    return;
  }

  authMenuRunning = true;

  try {
    do {
      authMenuPending = false;

      try {
        await renderAuthMenu();
      } catch (error) {
        console.error("Помилка побудови меню:", error);
      }
    } while (authMenuPending);
  } finally {
    authMenuRunning = false;
  }
}

// ======================================
// START AFTER DOM READY
// ======================================

function startAuthMenuSystem() {
  if (authMenuInitialized) return;
  authMenuInitialized = true;

  const supabase = window.supabaseClient;

  if (!supabase) {
    console.error("UA LEGION: Supabase не підключений");
    setEts2ApplicationsMenuVisible(false);
    return;
  }

  // Первинна побудова меню.
  initAuthMenu();

  // Оновлюємо меню після входу, виходу та відновлення сесії.
  const { data } = supabase.auth.onAuthStateChange(
    (event, session) => {
      console.log("UA LEGION AUTH EVENT:", event);

      // Не виконуємо запити Supabase всередині callback.
      // Відкладаємо оновлення до завершення callback.
      setTimeout(() => {
        initAuthMenu();
      }, 0);
    }
  );

  authStateSubscription = data?.subscription || null;
}

// ======================================
// DOM READY
// ======================================

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    startAuthMenuSystem,
    { once: true }
  );
} else {
  startAuthMenuSystem();
}

// ======================================
// TAB FOCUS
// ======================================

window.addEventListener("focus", () => {
  initAuthMenu();
});

// ======================================
// CLEANUP HELPER
// ======================================

window.uaLegionStopAuthMenuListener = function () {
  authStateSubscription?.unsubscribe();
  authStateSubscription = null;
  stopSupportUnreadTimer();
};
