/* =========================================================
   UA LEGION — join.js
   Подача заявки на вступ

   Логіка:
   - Дані профілю (ім'я, вік, Discord, Steam) беремо з profiles.
   - Одна заявка = один напрямок.
   - Повторна заявка дозволена для іншого напрямку.
   - Для того самого напрямку активна/схвалена заявка блокує повторну.
   - Відхилену заявку можна подати повторно.
   - Неактивні форми ігрових напрямків вимикаються,
     щоб required-поля прихованих форм не заважали submit.
   - Streaming НЕ використовується.
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
  const supabase = window.supabaseClient;

  if (!supabase) {
    console.error("UA LEGION: Supabase client не знайдено.");
    return;
  }

  // ---------------------------------------------------------
  // DOM
  // ---------------------------------------------------------

  const applicationForm = document.getElementById("applicationForm");
  const submitButton = document.getElementById("submitApplication");
  const formMessage = document.getElementById("formMessage");

  const directionInputs = document.querySelectorAll(
    'input[name="direction"]'
  );

  const gameForms = {
    ets2: document.getElementById("ets2Form"),
    wot: document.getElementById("wotForm"),
    dota2: document.getElementById("dota2Form"),
    wow: document.getElementById("wowForm")
  };

  // ---------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------

  function showMessage(message, type = "error") {
    if (!formMessage) return;

    formMessage.textContent = message;
    formMessage.className = "";
    formMessage.classList.add("show", type);
  }

  function clearMessage() {
    if (!formMessage) return;

    formMessage.textContent = "";
    formMessage.className = "";
  }

  function getValue(id) {
    const element = document.getElementById(id);
    if (!element) return null;

    const value = element.value?.trim();

    return value === "" ? null : value;
  }

  function getSelectedDirection() {
    const selected = document.querySelector(
      'input[name="direction"]:checked'
    );

    return selected ? selected.value : null;
  }

  function normalizeDirection(value) {
    if (!value) return null;

    const text = String(value).trim().toLowerCase();

    if (text === "ets2" || text === "ets2/truckersmp") {
      return "ets2";
    }

    if (text === "wot" || text === "world of tanks") {
      return "wot";
    }

    if (text === "dota2" || text === "dota 2" || text === "dota") {
      return "dota2";
    }

    if (
      text === "wow" ||
      text === "world of warcraft"
    ) {
      return "wow";
    }

    return text;
  }

  function getDirectionLabel(direction) {
    switch (normalizeDirection(direction)) {
      case "ets2":
        return "🚛 ETS2 / TruckersMP";

      case "wot":
        return "🪖 World of Tanks";

      case "dota2":
        return "⚔️ Dota 2";

      case "wow":
        return "🐉 World of Warcraft";

      default:
        return String(direction || "напрямок");
    }
  }

  function calculateAge(birthDate) {
    if (!birthDate) return null;

    const birth = new Date(`${birthDate}T00:00:00`);

    if (Number.isNaN(birth.getTime())) {
      return null;
    }

    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();

    const monthDifference =
      today.getMonth() - birth.getMonth();

    if (
      monthDifference < 0 ||
      (
        monthDifference === 0 &&
        today.getDate() < birth.getDate()
      )
    ) {
      age--;
    }

    return age >= 0 ? age : null;
  }

  function getFallbackName(user, profile) {
    return (
      profile?.display_name?.trim() ||
      user?.user_metadata?.full_name?.trim() ||
      user?.user_metadata?.name?.trim() ||
      user?.user_metadata?.display_name?.trim() ||
      user?.email?.split("@")[0]?.trim() ||
      null
    );
  }

  function setFormEnabled(container, enabled) {
    if (!container) return;

    const controls = container.querySelectorAll(
      "input, select, textarea, button"
    );

    controls.forEach((control) => {
      control.disabled = !enabled;
    });
  }

  function hideAllGameForms() {
    Object.values(gameForms).forEach((form) => {
      if (!form) return;

      form.classList.remove("active");
      setFormEnabled(form, false);
    });
  }

  function showGameForm(direction) {
    hideAllGameForms();

    const form = gameForms[normalizeDirection(direction)];

    if (!form) return;

    form.classList.add("active");
    setFormEnabled(form, true);
  }

  function getDirectionsFromApplication(application) {
    const result = [];

    if (application?.direction) {
      result.push(application.direction);
    }

    const directions = application?.directions;

    if (Array.isArray(directions)) {
      result.push(...directions);
    } else if (typeof directions === "string") {
      try {
        const parsed = JSON.parse(directions);

        if (Array.isArray(parsed)) {
          result.push(...parsed);
        } else {
          result.push(directions);
        }
      } catch {
        result.push(directions);
      }
    }

    return result
      .map(normalizeDirection)
      .filter(Boolean);
  }

  function isActiveApplicationStatus(status) {
    const normalized = String(status || "")
      .trim()
      .toLowerCase();

    return [
      "pending",
      "approved",
      "new",
      "review",
      "under_review",
      "in_review"
    ].includes(normalized);
  }

  // ---------------------------------------------------------
  // Auth
  // ---------------------------------------------------------

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError) {
    console.error(
      "UA LEGION: помилка отримання користувача:",
      authError
    );

    showMessage(
      "Не вдалося перевірити авторизацію. Оновіть сторінку.",
      "error"
    );

    return;
  }

  if (!user) {
    showMessage(
      "Щоб подати заявку, спочатку увійдіть у свій акаунт.",
      "error"
    );

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1200);

    return;
  }

  // ---------------------------------------------------------
  // Завантаження профілю
  // ---------------------------------------------------------

  const {
    data: profile,
    error: profileError
  } = await supabase
    .from("profiles")
    .select(
      "display_name,birth_date,discord_username,discord_user_id,steam_id,game_nickname"
    )
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error(
      "UA LEGION: помилка завантаження профілю:",
      profileError
    );

    showMessage(
      "Не вдалося завантажити дані профілю.",
      "error"
    );

    return;
  }

  const profileName = getFallbackName(user, profile);
  const profileAge = calculateAge(profile?.birth_date);

  // Ім'я та дата народження потрібні для заявки.
  // Не даємо створити заявку з NULL у applications.name.
  if (!profileName) {
    showMessage(
      "Спочатку заповніть ім'я у своєму профілі.",
      "error"
    );
    return;
  }

  if (profileAge === null) {
    showMessage(
      "Спочатку заповніть дату народження у своєму профілі.",
      "error"
    );
    return;
  }

  // ---------------------------------------------------------
  // Вибір напрямку
  // ---------------------------------------------------------

  hideAllGameForms();

  directionInputs.forEach((input) => {
    input.addEventListener("change", () => {
      clearMessage();
      showGameForm(input.value);
    });
  });

  const initialDirection = getSelectedDirection();

  if (initialDirection) {
    showGameForm(initialDirection);
  }

  // ---------------------------------------------------------
  // Submit
  // ---------------------------------------------------------

  if (!applicationForm) {
    console.error(
      "UA LEGION: #applicationForm не знайдено."
    );
    return;
  }

  applicationForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    clearMessage();

    const direction = normalizeDirection(
      getSelectedDirection()
    );

    if (!direction) {
      showMessage(
        "Оберіть напрямок, до якого хочете подати заявку.",
        "error"
      );
      return;
    }

    // -------------------------------------------------------
    // Перевірка активної заявки саме в цьому напрямку
    // -------------------------------------------------------

    const {
      data: existingApplications,
      error: existingError
    } = await supabase
      .from("applications")
      .select(
        "id,status,direction,directions,created_at"
      )
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false
      });

    if (existingError) {
      console.error(
        "UA LEGION: помилка перевірки попередніх заявок:",
        existingError
      );

      showMessage(
        "Не вдалося перевірити попередні заявки. Спробуйте ще раз.",
        "error"
      );

      return;
    }

    const applications = existingApplications || [];

    const sameDirectionActiveApplication =
      applications.find((application) => {
        const applicationDirections =
          getDirectionsFromApplication(application);

        const sameDirection =
          applicationDirections.includes(direction);

        return (
          sameDirection &&
          isActiveApplicationStatus(application.status)
        );
      });

    if (sameDirectionActiveApplication) {
      showMessage(
        `У вас уже є активна заявка для напрямку ${getDirectionLabel(
          direction
        )}.`,
        "error"
      );

      return;
    }

    // -------------------------------------------------------
    // Дані заявки
    // -------------------------------------------------------

    const applicationData = {
      // Основний користувач
      user_id: user.id,

      // Дані з профілю — повторно у формі їх вводити не треба
      name: profileName,
      age: profileAge,
      discord_nick:
        profile?.discord_username || null,
      discord_id:
        profile?.discord_user_id || null,
      steam_id:
        profile?.steam_id || null,

      // Напрямок
      direction: direction,
      directions: [direction.toUpperCase()],

      // Статус
      status: "pending",

      // Загальна інформація
      about: getValue("about")
    };

    // -------------------------------------------------------
    // ETS2
    // -------------------------------------------------------

    if (direction === "ets2") {
      applicationData.truckersmp_nick =
        getValue("truckersmpNick");

      applicationData.truckersmp_id =
        getValue("truckersmpId");

      applicationData.truckershub_username =
        getValue("truckershubUsername");

      applicationData.truckershub_id =
        getValue("truckershubId");

      // Сумісність зі старим полем, якщо воно використовується
      applicationData.game_nick =
        applicationData.truckersmp_nick ||
        profile?.game_nickname ||
        null;
    }

    // -------------------------------------------------------
    // World of Tanks
    // -------------------------------------------------------

    if (direction === "wot") {
      applicationData.wot_nickname =
        getValue("wotNickname");

      applicationData.wargaming_id =
        getValue("wargamingId");

      applicationData.wot_region =
        getValue("wotRegion");

      applicationData.game_nick =
        applicationData.wot_nickname ||
        profile?.game_nickname ||
        null;
    }

    // -------------------------------------------------------
    // Dota 2
    // -------------------------------------------------------

    if (direction === "dota2") {
      applicationData.dota_nickname =
        getValue("dotaNickname");

      applicationData.dota_friend_id =
        getValue("dotaFriendId");

      applicationData.dota_rank =
        getValue("dotaRank");

      applicationData.game_nick =
        applicationData.dota_nickname ||
        profile?.game_nickname ||
        null;
    }

    // -------------------------------------------------------
    // World of Warcraft
    // -------------------------------------------------------

    if (direction === "wow") {
      applicationData.battle_tag =
        getValue("battleTag");

      applicationData.wow_character =
        getValue("wowCharacter");

      applicationData.wow_realm =
        getValue("wowRealm");

      applicationData.wow_faction =
        getValue("wowFaction");

      applicationData.wow_class =
        getValue("wowClass");

      applicationData.game_nick =
        applicationData.wow_character ||
        profile?.game_nickname ||
        null;
    }

    // ---------------------------------------------------------
    // Submit UI
    // ---------------------------------------------------------

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.dataset.originalText =
        submitButton.textContent;

      submitButton.textContent = "Відправлення...";
    }

    try {
      console.log(
        "UA LEGION: відправляємо заявку:",
        applicationData
      );

      const {
        data: insertedApplication,
        error: insertError
      } = await supabase
        .from("applications")
        .insert(applicationData)
        .select()
        .single();

      if (insertError) {
        console.error(
          "UA LEGION: помилка створення заявки:",
          insertError
        );

        if (
          insertError.code === "23502" &&
          String(insertError.message || "").includes("name")
        ) {
          showMessage(
            "Не вдалося створити заявку: у профілі не заповнене ім'я.",
            "error"
          );
        } else {
          showMessage(
            `Не вдалося відправити заявку: ${
              insertError.message || "невідома помилка"
            }`,
            "error"
          );
        }

        return;
      }

      console.log(
        "UA LEGION: заявку створено:",
        insertedApplication
      );

      showMessage(
        `Заявку на напрямок ${getDirectionLabel(
          direction
        )} успішно відправлено.`,
        "success"
      );

      setTimeout(() => {
        window.location.href = "profile.html";
      }, 1500);

    } catch (error) {
      console.error(
        "UA LEGION: неочікувана помилка:",
        error
      );

      showMessage(
        "Сталася неочікувана помилка. Спробуйте ще раз.",
        "error"
      );

    } finally {
      if (submitButton) {
        submitButton.disabled = false;

        submitButton.textContent =
          submitButton.dataset.originalText ||
          "Подати заявку";
      }
    }
  });
});
