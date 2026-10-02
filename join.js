/* =========================================================
   UA LEGION — join.js
   Подача заявки + огляд профілю та напрямків
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

  const supabase = window.supabaseClient;

  if (!supabase) {
    console.error("UA LEGION: Supabase client не знайдено.");
    return;
  }

  const applicationForm = document.getElementById("applicationForm");
  const submitButton = document.getElementById("submitApplication");
  const formMessage = document.getElementById("formMessage");

  const directionInputs = Array.from(
    document.querySelectorAll('input[name="direction"]')
  );

  const gameForms = {
    ets2: document.getElementById("ets2Form"),
    wot: document.getElementById("wotForm"),
    dota2: document.getElementById("dota2Form"),
    wow: document.getElementById("wowForm")
  };

  function showMessage(message, type = "error") {
    if (!formMessage) return;
    formMessage.textContent = message;
    formMessage.className = type;
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

  function normalizeDirection(value) {
    if (!value) return null;

    const text = String(value).trim().toLowerCase();

    if (
      text === "ets2" ||
      text === "ets2/truckersmp" ||
      text === "ets2 / truckersmp"
    ) {
      return "ets2";
    }

    if (
      text === "wot" ||
      text === "world of tanks" ||
      text === "world_of_tanks"
    ) {
      return "wot";
    }

    if (
      text === "dota" ||
      text === "dota2" ||
      text === "dota 2"
    ) {
      return "dota2";
    }

    if (
      text === "wow" ||
      text === "world of warcraft" ||
      text === "world_of_warcraft"
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

  function getDirectionIcon(direction) {
    switch (
      normalizeDirection(
        direction?.slug ||
        direction?.code ||
        direction?.name ||
        direction
      )
    ) {
      case "ets2":
        return "🚛";

      case "wot":
        return "🪖";

      case "dota2":
        return "🎮";

      case "wow":
        return "🐉";

      default:
        return "📍";
    }
  }

  function getDirectionName(direction) {
    const key = normalizeDirection(
      direction?.slug ||
      direction?.code ||
      direction?.name ||
      direction
    );

    switch (key) {
      case "ets2":
        return "ETS2 / TruckersMP";

      case "wot":
        return "World of Tanks";

      case "dota2":
        return "Dota 2";

      case "wow":
        return "World of Warcraft";

      default:
        return (
          direction?.name ||
          direction?.slug ||
          direction?.code ||
          "Невідомий напрямок"
        );
    }
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function calculateAge(birthDate) {
    if (!birthDate) return null;

    const birth =
      new Date(`${birthDate}T00:00:00`);

    if (Number.isNaN(birth.getTime())) {
      return null;
    }

    const today = new Date();

    let age =
      today.getFullYear() -
      birth.getFullYear();

    const monthDifference =
      today.getMonth() -
      birth.getMonth();

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

    container
      .querySelectorAll(
        "input, select, textarea, button"
      )
      .forEach(control => {
        control.disabled = !enabled;
      });
  }

  function hideAllGameForms() {
    Object.values(gameForms).forEach(form => {
      if (!form) return;

      form.classList.remove("active");

      setFormEnabled(
        form,
        false
      );
    });
  }

  function showGameForm(direction) {
    hideAllGameForms();

    const key =
      normalizeDirection(direction);

    const form =
      gameForms[key];

    if (!form) return;

    form.classList.add("active");

    setFormEnabled(
      form,
      true
    );
  }

  function getSelectedDirection() {
    const selected =
      document.querySelector(
        'input[name="direction"]:checked'
      );

    return selected
      ? selected.value
      : null;
  }

  function getDirectionsFromApplication(application) {
    const result = [];

    if (application?.direction) {
      result.push(
        application.direction
      );
    }

    const directions =
      application?.directions;

    if (Array.isArray(directions)) {

      result.push(
        ...directions
      );

    } else if (
      typeof directions === "string"
    ) {

      try {

        const parsed =
          JSON.parse(directions);

        if (Array.isArray(parsed)) {

          result.push(
            ...parsed
          );

        } else {

          result.push(
            directions
          );
        }

      } catch {

        result.push(
          directions
        );
      }
    }

    return result
      .map(normalizeDirection)
      .filter(Boolean);
  }

  function isActiveApplicationStatus(status) {
    return [
      "pending",
      "new",
      "review",
      "under_review",
      "in_review"
    ].includes(
      String(status || "")
        .trim()
        .toLowerCase()
    );
  }

  async function getDirectionRecord(direction) {
    const key =
      normalizeDirection(direction);

    if (!key) {
      return null;
    }

    try {

      const {
        data,
        error
      } = await supabase
        .from("directions")
        .select(
          "id,code,slug,name,is_active"
        )
        .or(
          `slug.eq.${key},code.eq.${key}`
        )
        .limit(1)
        .maybeSingle();

      if (error) {

        console.error(
          "UA LEGION: помилка пошуку напрямку:",
          error
        );

        return null;
      }

      return data || null;

    } catch (error) {

      console.error(
        "UA LEGION: неочікувана помилка пошуку напрямку:",
        error
      );

      return null;
    }
  }

  async function hasActiveDirectionMembership(
    userId,
    direction
  ) {
    const key =
      normalizeDirection(direction);

    if (!userId || !key) {
      return false;
    }

    try {

      const directionRecord =
        await getDirectionRecord(
          key
        );

      if (!directionRecord?.id) {

        console.warn(
          "UA LEGION: напрямок не знайдено:",
          key
        );

        return false;
      }

      const {
        data,
        error
      } = await supabase
        .from("user_directions")
        .select(
          "id,user_id,direction_id,status"
        )
        .eq(
          "user_id",
          userId
        )
        .eq(
          "direction_id",
          directionRecord.id
        )
        .eq(
          "status",
          "active"
        )
        .limit(1)
        .maybeSingle();

      if (error) {

        console.error(
          "UA LEGION: помилка перевірки user_directions:",
          error
        );

        return false;
      }

      return Boolean(
        data?.id
      );

    } catch (error) {

      console.error(
        "UA LEGION: неочікувана помилка перевірки членства:",
        error
      );

      return false;
    }
  }

  function markDirectionAsDisabled(input) {
    if (!input) {
      return;
    }

    input.disabled = true;
    input.checked = false;

    let label =
      document.querySelector(
        `label[for="${input.id}"]`
      );

    if (!label) {

      label =
        input.parentElement
          ?.querySelector("label");
    }

    if (label) {

      label.classList.add(
        "direction-disabled"
      );

      label.title =
        "Ви вже є учасником цього напрямку";
    }
  }

  async function disableActiveDirections() {

    for (
      const input
      of directionInputs
    ) {

      const direction =
        normalizeDirection(
          input.value
        );

      if (!direction) {
        continue;
      }

      const isActive =
        await hasActiveDirectionMembership(
          user.id,
          direction
        );

      if (isActive) {

        markDirectionAsDisabled(
          input
        );
      }
    }

    /*
      ВАЖЛИВО:
      При звичайному відкритті join.html
      нічого не вибираємо.
      URL ?direction=... обробляється окремо нижче.
    */

    hideAllGameForms();
  }

  function getApplicationDirectionKey(
    application,
    directions
  ) {

    if (application?.direction) {

      return normalizeDirection(
        application.direction
      );
    }

    if (
      Array.isArray(
        application?.directions
      ) &&
      application.directions.length
    ) {

      return normalizeDirection(
        application.directions[0]
      );
    }

    if (
      typeof application?.directions ===
      "string"
    ) {

      return normalizeDirection(

        application.directions
          .replace(
            /[\[\]"]/g,
            ""
          )
          .split(",")[0]

      );
    }

    if (application?.direction_id) {

      const direction =
        directions.find(
          item =>
            String(item.id) ===
            String(
              application.direction_id
            )
        );

      return direction
        ? normalizeDirection(
            direction.slug ||
            direction.code ||
            direction.name
          )
        : "";
    }

    return "";
  }

  function getLatestApplication(
    direction,
    applications,
    directions
  ) {

    const key =
      normalizeDirection(
        direction?.slug ||
        direction?.code ||
        direction?.name ||
        direction
      );

    return applications.find(
      application =>
        getApplicationDirectionKey(
          application,
          directions
        ) === key
    ) || null;
  }

  function getJoinDirectionState(
    direction,
    applications,
    management,
    directions,
    activeMemberships = []
  ) {

    const key =
      normalizeDirection(
        direction?.slug ||
        direction?.code ||
        direction?.name ||
        direction
      );

    const managementDirections =
      Array.isArray(
        management?.directions
      )
        ? management.directions
        : [];

    const managementActive =
      managementDirections.find(
        item => {

          const itemKey =
            normalizeDirection(
              item?.slug ||
              item?.code ||
              item?.direction ||
              item?.direction_code ||
              item?.name
            );

          return (
            itemKey === key &&
            String(
              item?.status || ""
            ).toLowerCase() ===
              "active"
          );
        }
      ) || null;

    const membershipActive =
      activeMemberships.find(
        item => {

          return (
            String(
              item?.direction_id
            ) ===
              String(
                direction?.id
              ) &&

            String(
              item?.status || ""
            ).toLowerCase() ===
              "active"
          );
        }
      ) || null;

    const application =
      getLatestApplication(
        direction,
        applications,
        directions
      );

    if (
      membershipActive ||
      managementActive
    ) {

      return {
        type: "active",

        active: {
          ...(membershipActive || {}),
          ...(managementActive || {}),

          direction_id:
            membershipActive?.direction_id ||
            managementActive?.direction_id ||
            direction?.id,

          status: "active"
        },

        application
      };
    }

    const status =
      String(
        application?.status || ""
      )
        .trim()
        .toLowerCase();

    if (
      [
        "pending",
        "new",
        "review",
        "under_review",
        "in_review"
      ].includes(status)
    ) {

      return {
        type: "pending",
        active: null,
        application
      };
    }

    if (
      status === "approved"
    ) {

      return {
        type: "approved_waiting",
        active: null,
        application
      };
    }

    if (
      status === "rejected"
    ) {

      return {
        type: "rejected",
        active: null,
        application
      };
    }

    return {
      type: "none",
      active: null,
      application: null
    };
  }

  function renderJoinOverview(
    profile,
    directions,
    applications,
    management,
    activeMemberships = []
  ) {

    const nameEl =
      document.getElementById(
        "joinProfileName"
      );

    const ageEl =
      document.getElementById(
        "joinProfileAge"
      );

    const discordEl =
      document.getElementById(
        "joinProfileDiscord"
      );

    const discordIdEl =
      document.getElementById(
        "joinProfileDiscordId"
      );

    const steamEl =
      document.getElementById(
        "joinProfileSteam"
      );

    const gameNickEl =
      document.getElementById(
        "joinProfileGameNick"
      );

    const directionsEl =
      document.getElementById(
        "joinDirectionsStatus"
      );

    const age =
      calculateAge(
        profile?.birth_date
      );

    if (nameEl) {

      nameEl.textContent =
        profile?.display_name ||
        "Не заповнено";
    }

    if (ageEl) {

      ageEl.textContent =
        age === null
          ? "Не заповнено"
          : String(age);
    }

    if (discordEl) {

      discordEl.textContent =
        profile?.discord_username ||
        "Не заповнено";
    }

    if (discordIdEl) {

      discordIdEl.textContent =
        profile?.discord_user_id ||
        "Не заповнено";
    }

    if (steamEl) {

      steamEl.textContent =
        profile?.steam_id ||
        "Не заповнено";
    }

    if (gameNickEl) {

      gameNickEl.textContent =
        profile?.game_nickname ||
        "Не заповнено";
    }

    if (!directionsEl) {
      return;
    }

    directionsEl.innerHTML = "";

    if (!directions.length) {

      directionsEl.innerHTML =
        '<div class="join-direction-detail">Напрямки поки недоступні.</div>';

      return;
    }

    directions.forEach(
      direction => {

        const key =
          normalizeDirection(
            direction?.slug ||
            direction?.code ||
            direction?.name
          );

        const state =
          getJoinDirectionState(
            direction,
            applications,
            management,
            directions,
            activeMemberships
          );

        const card =
          document.createElement(
            "div"
          );

        card.className =
          `join-direction-card ${state.type}`;

        let statusText =
          "⚪ Не подавав";

        if (
          state.type === "active"
        ) {

          statusText =
            "🟢 Учасник";

        } else if (
          state.type === "pending"
        ) {

          statusText =
            "🟡 Заявка на розгляді";

        } else if (
          state.type === "approved_waiting"
        ) {

          statusText =
            "🟡 Схвалено";

        } else if (
          state.type === "rejected"
        ) {

          statusText =
            "🔴 Відхилено";
        }

        let details = "";

        if (
          state.type === "active"
        ) {

          const active =
            state.active || {};

          const roles =
            Array.isArray(
              active.roles
            )
              ? active.roles
              : [];

          details += `
            <p class="join-direction-detail">
              <strong>Посади:</strong>
              ${escapeHtml(
                roles.length
                  ? roles
                      .map(
                        role =>
                          role.name ||
                          role.code ||
                          "Невідома посада"
                      )
                      .join(", ")
                  : "ще не призначено"
              )}
            </p>
          `;

          if (
            key === "ets2"
          ) {

            details += `
              <p class="join-direction-detail">
                <strong>Клас:</strong>
                ${escapeHtml(
                  active.driver_class ||
                  "не призначено"
                )}
              </p>
            `;
          }
        }

        if (
          state.type === "pending"
        ) {

          details += `
            <p class="join-direction-detail">
              Ваша заявка очікує рішення адміністрації.
            </p>
          `;
        }

        if (
          state.type === "approved_waiting"
        ) {

          details += `
            <p class="join-direction-detail">
              Заявку схвалено. Очікується активація членства.
            </p>
          `;
        }

        if (
          state.type === "rejected"
        ) {

          details += `
            <p class="join-direction-detail">
              Останню заявку було відхилено.
            </p>
          `;

          const reason =
            state.application?.review_comment ||
            state.application?.rejection_reason ||
            state.application?.review_reason;

          if (reason) {

            details += `
              <p class="join-direction-detail">
                <strong>Причина:</strong>
                ${escapeHtml(reason)}
              </p>
            `;
          }
        }

        if (
          state.type === "none"
        ) {

          details += `
            <p class="join-direction-detail">
              Ви ще не подавали заявку до цього напрямку.
            </p>
          `;
        }

        if (
          state.application?.created_at
        ) {

          details += `
            <p class="join-direction-detail">
              <strong>Остання заявка:</strong>
              ${escapeHtml(
                new Date(
                  state.application.created_at
                ).toLocaleDateString(
                  "uk-UA"
                )
              )}
            </p>
          `;
        }

        let button = "";

        if (
          state.type === "none" ||
          state.type === "rejected"
        ) {

          const text =
            state.type === "rejected"
              ? "📝 ПОДАТИ ПОВТОРНО"
              : "📝 ПОДАТИ ЗАЯВКУ";

          button = `
            <a
              class="join-direction-apply"
              href="join.html?direction=${encodeURIComponent(key)}"
            >
              ${text}
            </a>
          `;
        }

        card.innerHTML = `
          <div class="join-direction-header">

            <h3 class="join-direction-name">
              ${escapeHtml(
                getDirectionIcon(
                  direction
                )
              )}

              ${escapeHtml(
                getDirectionName(
                  direction
                )
              )}
            </h3>

            <span
              class="join-direction-status ${state.type}"
            >
              ${statusText}
            </span>

          </div>

          ${details}
          ${button}
        `;

        directionsEl.appendChild(
          card
        );
      }
    );
  }

  /*
    AUTH
  */

  const {
    data: { user },
    error: authError
  } =
    await supabase.auth.getUser();

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

    setTimeout(
      () => {
        window.location.href =
          "login.html";
      },
      1200
    );

    return;
  }

  /*
    PROFILE
  */

  const {
    data: profile,
    error: profileError
  } =
    await supabase
      .from("profiles")
      .select(
        "display_name,birth_date,discord_username,discord_user_id,steam_id,game_nickname"
      )
      .eq(
        "id",
        user.id
      )
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

  const profileName =
    getFallbackName(
      user,
      profile
    );

  const profileAge =
    calculateAge(
      profile?.birth_date
    );

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

  /*
    OVERVIEW DATA
  */

  let allDirections = [];
  let allApplications = [];
  let management = null;
  let activeMemberships = [];

  try {

    const {
      data: directionsData,
      error: directionsError
    } =
      await supabase
        .from("directions")
        .select("*")
        .order(
          "id",
          {
            ascending: true
          }
        );

    if (
      !directionsError &&
      Array.isArray(
        directionsData
      )
    ) {

      allDirections =
        directionsData;
    }

    if (
      !allDirections.length
    ) {

      allDirections = [

        {
          id: 1,
          code: "ets2",
          slug: "ets2",
          name: "ETS2 / TruckersMP",
          icon: "🚛"
        },

        {
          id: 2,
          code: "wot",
          slug: "wot",
          name: "World of Tanks",
          icon: "🪖"
        },

        {
          id: 3,
          code: "dota2",
          slug: "dota2",
          name: "Dota 2",
          icon: "🎮"
        },

        {
          id: 4,
          code: "wow",
          slug: "wow",
          name: "World of Warcraft",
          icon: "🐉"
        }

      ];
    }

    const {
      data: applicationsData,
      error: applicationsError
    } =
      await supabase
        .from("applications")
        .select("*")
        .eq(
          "user_id",
          user.id
        )
        .order(
          "created_at",
          {
            ascending: false
          }
        );

    if (
      !applicationsError &&
      Array.isArray(
        applicationsData
      )
    ) {

      allApplications =
        applicationsData;
    }

    const {
      data: activeMembershipsData,
      error: activeMembershipsError
    } =
      await supabase
        .from("user_directions")
        .select(
          "id,user_id,direction_id,status,driver_class"
        )
        .eq(
          "user_id",
          user.id
        )
        .eq(
          "status",
          "active"
        );

    if (
      !activeMembershipsError &&
      Array.isArray(
        activeMembershipsData
      )
    ) {

      activeMemberships =
        activeMembershipsData;
    }

    const {
      data: managementData,
      error: managementError
    } =
      await supabase.rpc(
        "get_user_direction_management",
        {
          p_target_user_id:
            user.id
        }
      );

    if (
      !managementError &&
      managementData &&
      managementData.success !== false
    ) {

      management =
        managementData;
    }

  } catch (error) {

    console.warn(
      "UA LEGION: помилка завантаження огляду:",
      error
    );
  }

  renderJoinOverview(
    profile,
    allDirections,
    allApplications,
    management,
    activeMemberships
  );

  /*
    DIRECTION SELECTION
  */

  hideAllGameForms();

  directionInputs.forEach(
    input => {

      input.addEventListener(
        "change",
        () => {

          if (
            input.disabled
          ) {
            return;
          }

          clearMessage();

          showGameForm(
            input.value
          );
        }
      );
    }
  );

  /*
    ACTIVE DIRECTIONS
  */

  await disableActiveDirections();

  /*
    URL:

      join.html
        -> нічого не вибрано

      join.html?direction=wot
        -> відкривається WoT

      join.html?direction=ets2
        -> відкривається ETS2

      join.html?direction=dota2
        -> відкривається Dota 2

      join.html?direction=wow
        -> відкривається WoW

  */

  const urlParams =
    new URLSearchParams(
      window.location.search
    );

  const requestedDirection =
    normalizeDirection(
      urlParams.get(
        "direction"
      )
    );

  if (
    requestedDirection
  ) {

    const requestedInput =
      directionInputs.find(
        input =>

          !input.disabled &&

          normalizeDirection(
            input.value
          ) ===
            requestedDirection
      );

    if (
      requestedInput
    ) {

      requestedInput.checked =
        true;

      showGameForm(
        requestedInput.value
      );
    }
  }

  if (!applicationForm) {

    console.error(
      "UA LEGION: #applicationForm не знайдено."
    );

    return;
  }

  /*
    SUBMIT
  */

  applicationForm.addEventListener(
    "submit",
    async event => {

      event.preventDefault();

      clearMessage();

      const direction =
        normalizeDirection(
          getSelectedDirection()
        );

      if (!direction) {

        showMessage(
          "Оберіть напрямок, до якого хочете подати заявку.",
          "error"
        );

        return;
      }

      const alreadyActive =
        await hasActiveDirectionMembership(
          user.id,
          direction
        );

      if (
        alreadyActive
      ) {

        showMessage(
          `Ви вже є активним учасником напрямку ${getDirectionLabel(direction)}. Повторна заявка не потрібна.`,
          "error"
        );

        const selectedInput =
          directionInputs.find(
            input =>
              normalizeDirection(
                input.value
              ) ===
              direction
          );

        if (
          selectedInput
        ) {

          markDirectionAsDisabled(
            selectedInput
          );
        }

        return;
      }

      /*
        EXISTING APPLICATIONS
      */

      const {
        data: existingApplications,
        error: existingError
      } =
        await supabase
          .from("applications")
          .select(
            "id,status,direction,directions,created_at"
          )
          .eq(
            "user_id",
            user.id
          )
          .order(
            "created_at",
            {
              ascending: false
            }
          );

      if (
        existingError
      ) {

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

      const applications =
        existingApplications || [];

      const sameDirectionActiveApplication =
        applications.find(
          application => {

            const applicationDirections =
              getDirectionsFromApplication(
                application
              );

            return (
              applicationDirections.includes(
                direction
              ) &&

              isActiveApplicationStatus(
                application.status
              )
            );
          }
        );

      if (
        sameDirectionActiveApplication
      ) {

        showMessage(
          `У вас уже є активна заявка для напрямку ${getDirectionLabel(direction)}. Дочекайтеся її розгляду.`,
          "error"
        );

        return;
      }

      /*
        WOT VERIFICATION
      */

      let verifiedWotProfile =
        null;

      if (
        direction === "wot"
      ) {

        const {
          data: wotProfile,
          error: wotProfileError
        } =
          await supabase
            .from("profiles")
            .select(
              "wot_nickname,wot_account_id,wot_region,wot_verified_at"
            )
            .eq(
              "id",
              user.id
            )
            .maybeSingle();

        if (
          wotProfileError
        ) {

          console.error(
            "UA LEGION: помилка перевірки WoT профілю:",
            wotProfileError
          );

          showMessage(
            "Не вдалося перевірити підтвердження WoT акаунта. Спробуйте ще раз.",
            "error"
          );

          return;
        }

        verifiedWotProfile =
          wotProfile;

        if (
          !wotProfile ||
          !wotProfile.wot_account_id
        ) {

          showMessage(
            "Спочатку підтвердьте свій World of Tanks акаунт через Wargaming.",
            "error"
          );

          const wotForm =
            document.getElementById(
              "wotForm"
            );

          if (
            wotForm
          ) {

            wotForm.classList.add(
              "active"
            );

            setFormEnabled(
              wotForm,
              true
            );
          }

          return;
        }

        const formNickname =
          getValue(
            "wotNickname"
          );

        const formRegion =
          String(
            getValue(
              "wotRegion"
            ) || ""
          ).toLowerCase();

        const profileNickname =
          String(
            wotProfile.wot_nickname ||
            ""
          ).trim();

        const profileRegion =
          String(
            wotProfile.wot_region ||
            ""
          ).toLowerCase();

        if (
          !formNickname ||
          !formRegion ||
          formNickname !==
            profileNickname ||
          formRegion !==
            profileRegion
        ) {

          showMessage(
            "Дані WoT акаунта змінено. Повторно підтвердьте акаунт через Wargaming.",
            "error"
          );

          return;
        }
      }

      /*
        APPLICATION DATA
      */

      const applicationData = {

        user_id:
          user.id,

        name:
          profileName,

        age:
          profileAge,

        discord_nick:
          profile?.discord_username ||
          null,

        discord_id:
          profile?.discord_user_id ||
          null,

        steam_id:
          profile?.steam_id ||
          null,

        direction,

        directions: [
          direction.toUpperCase()
        ],

        status:
          "pending",

        about:
          getValue("about")
      };

      /*
        ETS2
      */

      if (
        direction === "ets2"
      ) {

        applicationData.truckersmp_nick =
          getValue(
            "truckersmpNick"
          );

        applicationData.truckersmp_id =
          getValue(
            "truckersmpId"
          );

        applicationData.truckershub_username =
          getValue(
            "truckershubUsername"
          );

        applicationData.truckershub_id =
          getValue(
            "truckershubId"
          );

        applicationData.game_nick =
          applicationData.truckersmp_nick ||
          profile?.game_nickname ||
          null;
      }

      /*
        WOT
      */

      if (
        direction === "wot"
      ) {

        applicationData.wot_nickname =
          verifiedWotProfile?.wot_nickname ||
          getValue(
            "wotNickname"
          );

        applicationData.wargaming_id =
          String(
            verifiedWotProfile?.wot_account_id ||
            ""
          );

        applicationData.wot_region =
          verifiedWotProfile?.wot_region ||
          getValue(
            "wotRegion"
          );

        applicationData.game_nick =
          applicationData.wot_nickname ||
          profile?.game_nickname ||
          null;
      }

      /*
        DOTA 2
      */

      if (
        direction === "dota2"
      ) {

        applicationData.dota_nickname =
          getValue(
            "dotaNickname"
          );

        applicationData.dota_friend_id =
          getValue(
            "dotaFriendId"
          );

        applicationData.dota_rank =
          getValue(
            "dotaRank"
          );

        applicationData.game_nick =
          applicationData.dota_nickname ||
          profile?.game_nickname ||
          null;
      }

      /*
        WOW
      */

      if (
        direction === "wow"
      ) {

        applicationData.battle_tag =
          getValue(
            "battleTag"
          );

        applicationData.wow_character =
          getValue(
            "wowCharacter"
          );

        applicationData.wow_realm =
          getValue(
            "wowRealm"
          );

        applicationData.wow_faction =
          getValue(
            "wowFaction"
          );

        applicationData.wow_class =
          getValue(
            "wowClass"
          );

        applicationData.game_nick =
          applicationData.wow_character ||
          profile?.game_nickname ||
          null;
      }

      if (
        submitButton
      ) {

        submitButton.disabled =
          true;

        submitButton.dataset.originalText =
          submitButton.textContent;

        submitButton.textContent =
          "Відправлення...";
      }

      try {

        console.log(
          "UA LEGION: відправляємо заявку:",
          applicationData
        );

        const {
          data: insertedApplication,
          error: insertError
        } =
          await supabase
            .from("applications")
            .insert(
              applicationData
            )
            .select()
            .single();

        if (
          insertError
        ) {

          console.error(
            "UA LEGION: помилка створення заявки:",
            insertError
          );

          if (
            insertError.code ===
              "23502" &&

            String(
              insertError.message ||
              ""
            ).includes(
              "name"
            )
          ) {

            showMessage(
              "Не вдалося створити заявку: у профілі не заповнене ім'я.",
              "error"
            );

          } else {

            showMessage(
              `Не вдалося відправити заявку: ${
                insertError.message ||
                "невідома помилка"
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
          `Заявку на напрямок ${getDirectionLabel(direction)} успішно відправлено.`,
          "success"
        );

        setTimeout(
          () => {

            window.location.href =
              "profile.html";

          },
          1500
        );

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

        if (
          submitButton
        ) {

          submitButton.disabled =
            false;

          submitButton.textContent =
            submitButton.dataset.originalText ||
            "НАДІСЛАТИ ЗАЯВКУ";
        }
      }
    }
  );
});
