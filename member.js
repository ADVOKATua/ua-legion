// ==========================================
// UA LEGION — MEMBER CABINET
// member.js
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

  const supabase = window.supabaseClient;

  if (!supabase) {
    console.error("Supabase не підключений");
    return;
  }


  // ==========================================
  // TARGET USER
  // ==========================================

  const params =
    new URLSearchParams(window.location.search);

  const targetUserId =
    params.get("user_id");


  const memberName =
    document.getElementById("memberName");

  const memberNickname =
    document.getElementById("memberNickname");

  const memberAvatar =
    document.getElementById("memberAvatar");

  const memberGlobalRoles =
    document.getElementById("memberGlobalRoles");

  const directionsList =
    document.getElementById("directionsList");

  const ets2Panel =
    document.getElementById("ets2Management");

  const memberError =
    document.getElementById("memberError");


  // ==========================================
  // DRIVER CLASS
  // ==========================================

  const classNames = {

    A: 'Клас A — «Майстер водій»',

    B: 'Клас B — «Старший водій»',

    C: 'Клас C — «Досвідчений водій»',

    D: 'Клас D — «Водій»',

    E: 'Клас E — «Стажер»'

  };


  // ==========================================
  // VALIDATE TARGET
  // ==========================================

  if (!targetUserId) {

    memberError.textContent =
      "Не вказано учасника.";

    return;
  }


  // ==========================================
  // AUTH
  // ==========================================

  const {
    data: authData,
    error: authError
  } = await supabase.auth.getUser();


  if (authError || !authData?.user) {

    window.location.href =
      "login.html";

    return;
  }


  // ==========================================
  // HELPERS
  // ==========================================

  function escapeHtml(value) {

    const div =
      document.createElement("div");

    div.textContent =
      value ?? "";

    return div.innerHTML;
  }


  function showMemberError(text) {

    memberError.textContent =
      text || "";

  }


  async function hasPermission(
    permission,
    directionId = null
  ) {

    const {
      data,
      error
    } = await supabase.rpc(
      "has_permission",
      {
        p_permission_code: permission,
        p_direction_id: directionId
      }
    );


    if (error) {

      console.error(
        "Permission check error:",
        permission,
        directionId,
        error
      );

      return false;
    }


    return data === true;
  }


  // ==========================================
  // PROFILE
  // ==========================================

  function renderProfile(profile) {

    profile =
      profile || {};


    if (memberName) {

      memberName.textContent =
        profile.display_name ||
        "Учасник UA LEGION";

    }


    if (memberNickname) {

      memberNickname.textContent =
        profile.game_nickname ||
        "Ігровий нік не вказано";

    }


    if (memberAvatar) {

      if (profile.avatar_url) {

        memberAvatar.src =
          profile.avatar_url;

        memberAvatar.classList.remove(
          "avatar-empty"
        );

      } else {

        memberAvatar.removeAttribute(
          "src"
        );

        memberAvatar.classList.add(
          "avatar-empty"
        );

      }

      memberAvatar.alt =
        profile.display_name ||
        "Учасник";

    }

  }


  // ==========================================
  // GLOBAL ROLES
  // ==========================================

  function renderGlobalRoles(
    roles
  ) {

    if (!memberGlobalRoles) {
      return;
    }


    if (!Array.isArray(roles) ||
        roles.length === 0) {

      memberGlobalRoles.innerHTML =
        '<span class="empty-role">Глобальних посад немає</span>';

      return;
    }


    memberGlobalRoles.innerHTML =
      roles
        .map(
          role =>
            `<span class="role-badge">
              ${escapeHtml(role.name)}
            </span>`
        )
        .join("");

  }


  // ==========================================
  // LOAD ROLE OPTIONS
  // ==========================================

  async function loadRoleOptions(
    directionId
  ) {

    const {
      data,
      error
    } = await supabase.rpc(
      "get_direction_role_options",
      {
        p_direction_id: directionId
      }
    );


    if (error) {

      console.error(
        "Role options error:",
        error
      );

      return [];

    }


    return Array.isArray(data?.roles)
      ? data.roles
      : [];

  }


  // ==========================================
  // ADD USER TO DIRECTION
  // ==========================================

  async function addToDirection(
    directionId,
    button,
    message
  ) {

    button.disabled = true;

    message.className =
      "direction-message info";

    message.textContent =
      "Додавання до напрямку...";


    const {
      data,
      error
    } = await supabase.rpc(
      "add_user_to_direction",
      {
        p_user_id: targetUserId,
        p_direction_id: directionId
      }
    );


    if (error) {

      console.error(
        "Add direction error:",
        error
      );

      message.className =
        "direction-message error";

      message.textContent =
        "❌ " + error.message;

      button.disabled = false;

      return;
    }


    console.log(
      "Direction added:",
      data
    );


    message.className =
      "direction-message success";

    message.textContent =
      "✅ Учасника додано до напрямку.";


    setTimeout(
      () => window.location.reload(),
      600
    );

  }


  // ==========================================
  // ASSIGN DIRECTION ROLE
  // ==========================================

  async function assignDirectionRole(
    directionId,
    roleId,
    direction,
    message,
    button
  ) {

    if (!roleId) {

      message.className =
        "direction-message error";

      message.textContent =
        "Оберіть посаду.";

      return;
    }


    button.disabled = true;

    message.className =
      "direction-message info";

    message.textContent =
      "Перевірка участі у напрямку...";


    // ----------------------------------------
    // Ensure membership first
    // ----------------------------------------

    const membership =
      direction.membership;


    if (!membership) {

      const {
        error: addError
      } = await supabase.rpc(
        "add_user_to_direction",
        {
          p_user_id: targetUserId,
          p_direction_id: directionId
        }
      );


      if (addError) {

        console.error(
          "Auto-add direction error:",
          addError
        );

        message.className =
          "direction-message error";

        message.textContent =
          "❌ Не вдалося додати учасника до напрямку: " +
          addError.message;

        button.disabled = false;

        return;
      }

    }


    message.textContent =
      "Призначення посади...";


    // ----------------------------------------
    // Assign role
    // ----------------------------------------

    const {
      data,
      error
    } = await supabase.rpc(
      "assign_direction_role",
      {
        p_user_id: targetUserId,
        p_direction_id: directionId,
        p_role_id: Number(roleId)
      }
    );


    if (error) {

      console.error(
        "Assign direction role error:",
        error
      );

      message.className =
        "direction-message error";

      message.textContent =
        "❌ Не вдалося призначити посаду: " +
        error.message;

      button.disabled = false;

      return;
    }


    console.log(
      "Direction role assigned:",
      data
    );


    message.className =
      "direction-message success";

    message.textContent =
      "✅ Посаду призначено.";


    setTimeout(
      () => window.location.reload(),
      700
    );

  }


  // ==========================================
  // REMOVE DIRECTION ROLE
  // ==========================================

  async function removeDirectionRole(
    directionId,
    roleId,
    message,
    button
  ) {

    if (!roleId) {
      return;
    }


    const confirmed =
      window.confirm(
        "Зняти цю посаду з учасника?"
      );


    if (!confirmed) {
      return;
    }


    button.disabled = true;

    message.className =
      "direction-message info";

    message.textContent =
      "Зняття посади...";


    const {
      data,
      error
    } = await supabase.rpc(
      "remove_direction_role",
      {
        p_user_id: targetUserId,
        p_direction_id: directionId,
        p_role_id: Number(roleId)
      }
    );


    if (error) {

      console.error(
        "Remove direction role error:",
        error
      );

      message.className =
        "direction-message error";

      message.textContent =
        "❌ Не вдалося зняти посаду: " +
        error.message;

      button.disabled = false;

      return;
    }


    console.log(
      "Direction role removed:",
      data
    );


    message.className =
      "direction-message success";

    message.textContent =
      "✅ Посаду знято.";


    setTimeout(
      () => window.location.reload(),
      700
    );

  }


  // ==========================================
  // RENDER DIRECTION
  // ==========================================

  async function renderDirection(
    direction,
    permissions
  ) {

    const isActive =
      direction.membership === true;


    const roles =
      Array.isArray(direction.roles)
        ? direction.roles
        : [];


    const canManageMembers =
      permissions.manageMembers === true;

    const canAssignRoles =
      permissions.assignRoles === true;

    const canRemoveRoles =
      permissions.removeRoles === true;


    const card =
      document.createElement("article");

    card.className =
      "direction-card" +
      (isActive
        ? " direction-active"
        : "");


    const statusText =
      isActive
        ? "Активний"
        : "Не приєднаний";


    const statusClass =
      isActive
        ? "active"
        : "not-active";


    let rolesHtml = "";


    if (roles.length) {

      rolesHtml =
        roles
          .map(
            role =>
              `<span class="role-badge">
                ${escapeHtml(role.name)}
              </span>`
          )
          .join("");

    } else {

      rolesHtml =
        '<span class="empty-role">Посад немає</span>';

    }


    let classHtml = "";


    if (
      direction.code === "ets2" &&
      direction.driver_class
    ) {

      classHtml = `
        <div class="direction-class">
          🚛 ${escapeHtml(
            classNames[direction.driver_class] ||
            direction.driver_class
          )}
        </div>
      `;

    }


    card.innerHTML = `

      <div class="direction-head">

        <div class="direction-title">
          ${escapeHtml(direction.icon || "🎮")}
          ${escapeHtml(direction.name)}
        </div>

        <div class="direction-status ${statusClass}">
          ${statusText}
        </div>

      </div>

      <div class="direction-content">

        <div class="direction-label">
          Посади
        </div>

        <div class="direction-roles">
          ${rolesHtml}
        </div>

        ${classHtml}

        <div class="direction-actions"></div>

        <div class="direction-management"></div>

      </div>
    `;


    const actions =
      card.querySelector(
        ".direction-actions"
      );


    const management =
      card.querySelector(
        ".direction-management"
      );


    // ========================================
    // NOT MEMBER
    // ========================================

    if (!isActive) {

      if (canManageMembers) {

        const addButton =
          document.createElement("button");

        addButton.className =
          "direction-button primary";

        addButton.textContent =
          "+ ДОДАТИ ДО НАПРЯМКУ";


        const message =
          document.createElement("div");

        message.className =
          "direction-message";


        addButton.addEventListener(
          "click",
          () =>
            addToDirection(
              direction.direction_id,
              addButton,
              message
            )
        );


        actions.appendChild(
          addButton
        );

        actions.appendChild(
          message
        );

      }

      return card;
    }


    // ========================================
    // MEMBER
    // ========================================

    if (
      canAssignRoles ||
      canRemoveRoles
    ) {

      const roleOptions =
        await loadRoleOptions(
          direction.direction_id
        );


      if (
        canAssignRoles &&
        roleOptions.length
      ) {

        management.innerHTML += `

          <h4>🛠 Керування посадами</h4>

          <select class="role-select">

            <option value="">
              Оберіть посаду
            </option>

            ${roleOptions
              .map(
                role =>
                  `<option value="${role.role_id}">
                    ${escapeHtml(role.name)}
                  </option>`
              )
              .join("")}

          </select>

          <div class="role-management-actions">

            <button
              type="button"
              class="direction-button primary assign-role-button"
            >
              + ПРИЗНАЧИТИ ПОСАДУ
            </button>

          </div>

          <div class="direction-message role-message"></div>
        `;


        const select =
          management.querySelector(
            ".role-select"
          );

        const assignButton =
          management.querySelector(
            ".assign-role-button"
          );

        const roleMessage =
          management.querySelector(
            ".role-message"
          );


        assignButton.addEventListener(
          "click",
          () =>
            assignDirectionRole(
              direction.direction_id,
              select.value,
              direction,
              roleMessage,
              assignButton
            )
        );

      }

    }


    // ========================================
    // EXISTING ROLES — REMOVE
    // ========================================

    if (
      canRemoveRoles &&
      roles.length
    ) {

      const removeBlock =
        document.createElement("div");

      removeBlock.className =
        "role-management-actions";


      roles.forEach(
        role => {

          const removeButton =
            document.createElement("button");

          removeButton.type =
            "button";

          removeButton.className =
            "direction-button danger";

          removeButton.textContent =
            "✕ " + role.name;


          const message =
            document.createElement("div");

          message.className =
            "direction-message";


          removeButton.addEventListener(
            "click",
            () =>
              removeDirectionRole(
                direction.direction_id,
                role.role_id || role.id,
                message,
                removeButton
              )
          );


          removeBlock.appendChild(
            removeButton
          );

          removeBlock.appendChild(
            message
          );

        }
      );


      management.appendChild(
        removeBlock
      );

    }


    // ========================================
    // ETS2 DRIVER CLASS
    // ========================================

    if (
      direction.code === "ets2"
    ) {

      const canChangeClass =
        permissions.changeDriverClass === true;


      if (canChangeClass) {

        management.innerHTML += `

          <div class="management-block">

            <label for="universalEts2DriverClass">
              Клас водія ETS2
            </label>

            <select
              id="universalEts2DriverClass"
              class="role-select"
            >

              ${Object.entries(classNames)
                .map(
                  ([code, name]) =>
                    `<option
                      value="${code}"
                      ${direction.driver_class === code
                        ? "selected"
                        : ""}
                    >
                      ${escapeHtml(name)}
                    </option>`
                )
                .join("")}

            </select>

            <div class="role-management-actions">

              <button
                type="button"
                class="direction-button primary change-class-button"
              >
                💾 ЗБЕРЕГТИ КЛАС
              </button>

            </div>

            <div class="direction-message class-message"></div>

          </div>
        `;


        const classSelect =
          management.querySelector(
            "#universalEts2DriverClass"
          );

        const classButton =
          management.querySelector(
            ".change-class-button"
          );

        const classMessage =
          management.querySelector(
            ".class-message"
          );


        classButton.addEventListener(
          "click",
          async () => {

            classButton.disabled =
              true;

            classMessage.className =
              "direction-message info";

            classMessage.textContent =
              "Збереження класу...";


            // Використовуємо існуючий
            // перевірений RPC ETS2.
            const currentData =
              await supabase.rpc(
                "get_ets2_member_management",
                {
                  p_target_user_id:
                    targetUserId
                }
              );


            if (currentData.error) {

              classMessage.className =
                "direction-message error";

              classMessage.textContent =
                "❌ " +
                currentData.error.message;

              classButton.disabled =
                false;

              return;
            }


            const current =
              currentData.data || {};


            const currentRoles =
              Array.isArray(
                current.roles
              )
                ? current.roles
                : [];


            const roleIds =
              currentRoles
                .map(
                  role =>
                    Number(
                      role.id ||
                      role.role_id
                    )
                )
                .filter(
                  Number.isFinite
                );


            const {
              error
            } = await supabase.rpc(
              "save_ets2_member_management",
              {
                p_target_user_id:
                  targetUserId,

                p_role_ids:
                  roleIds,

                p_driver_class:
                  classSelect.value
              }
            );


            if (error) {

              classMessage.className =
                "direction-message error";

              classMessage.textContent =
                "❌ " +
                error.message;

              classButton.disabled =
                false;

              return;
            }


            classMessage.className =
              "direction-message success";

            classMessage.textContent =
              "✅ Клас ETS2 збережено.";


            setTimeout(
              () => window.location.reload(),
              700
            );

          }
        );

      }

    }


    return card;
  }


  // ==========================================
  // RENDER ALL DIRECTIONS
  // ==========================================

  async function renderDirections(
    activeDirections,
    managementData
  ) {

    if (!directionsList) {
      return;
    }


    const userDirections =
      Array.isArray(
        managementData?.directions
      )
        ? managementData.directions
        : [];


    directionsList.innerHTML = "";


    for (
      const direction of activeDirections
    ) {

      const userDirection =
        userDirections.find(
          item =>
            Number(
              item.direction_id
            ) === Number(
              direction.direction_id
            )
        );


      const merged =
        userDirection
          ? {
              ...direction,
              ...userDirection,
              membership: true
            }
          : {
              ...direction,
              membership: false,
              roles: [],
              driver_class: null
            };


      const permissions = {

        manageMembers:
          await hasPermission(
            "direction_members.manage",
            direction.direction_id
          ),

        assignRoles:
          await hasPermission(
            "direction_roles.assign",
            direction.direction_id
          ),

        removeRoles:
          await hasPermission(
            "direction_roles.remove",
            direction.direction_id
          ),

        changeDriverClass:
          direction.code === "ets2"
            ? await hasPermission(
                "ets2.driver_class.change",
                direction.direction_id
              )
            : false

      };


      const card =
        await renderDirection(
          merged,
          permissions
        );


      directionsList.appendChild(
        card
      );

    }


    if (
      !directionsList.children.length
    ) {

      directionsList.innerHTML =
        `<div class="management-locked">
          Активних напрямків поки немає.
        </div>`;

    }

  }


  // ==========================================
  // LEGACY ETS2 MANAGEMENT
  // Пока оставляем рабочий блок
  // ==========================================

  async function loadLegacyEts2Management() {

    if (!ets2Panel) {
      return;
    }


    const {
      data,
      error
    } = await supabase.rpc(
      "get_ets2_member_management",
      {
        p_target_user_id:
          targetUserId
      }
    );


    if (error) {

      console.error(
        "ETS2 management error:",
        error
      );

      ets2Panel.innerHTML = `
        <div class="management-locked">
          🔒 Окреме ETS2-керування недоступне.
        </div>
      `;

      return;
    }


    const roles =
      Array.isArray(data?.roles)
        ? data.roles
        : [];


    const available =
      Array.isArray(data?.available_roles)
        ? data.available_roles
        : [];


    const canManage =
      data?.can_manage === true;


    if (!canManage) {

      ets2Panel.innerHTML = `
        <div class="management-locked">
          🔒 Окреме ETS2-керування недоступне.
          <br>
          Основні дані ETS2 вже відображені вище.
        </div>
      `;

      return;
    }


    const selectedIds =
      new Set(
        roles.map(
          role =>
            String(
              role.id ||
              role.role_id
            )
        )
      );


    ets2Panel.innerHTML = `

      <div class="management-head">

        <div>

          <h2>🛠 Керування ETS2</h2>

          <p>
            Тимчасовий спеціалізований блок ETS2.
            Пізніше його об'єднаємо з універсальним.
          </p>

        </div>

      </div>


      <div class="management-block">

        <h3>Посади ETS2</h3>

        <div class="role-checkboxes">

          ${available
            .map(
              role =>
                `
                <label class="role-option">

                  <input
                    type="checkbox"
                    class="ets2-role"
                    value="${escapeHtml(
                      role.id ||
                      role.role_id
                    )}"
                    ${
                      selectedIds.has(
                        String(
                          role.id ||
                          role.role_id
                        )
                      )
                        ? "checked"
                        : ""
                    }
                  >

                  <span>
                    ${escapeHtml(role.name)}
                  </span>

                </label>
                `
            )
            .join("")}

        </div>

      </div>


      <div class="management-block">

        <label for="ets2DriverClass">
          Клас водія
        </label>

        <select id="ets2DriverClass">

          ${Object.entries(
            classNames
          )
            .map(
              ([code, name]) =>
                `
                <option
                  value="${code}"
                  ${
                    data.driver_class === code
                      ? "selected"
                      : ""
                  }
                >
                  ${escapeHtml(name)}
                </option>
                `
            )
            .join("")}

        </select>

      </div>


      <button
        id="saveEts2"
        class="save-management"
      >
        💾 ЗБЕРЕГТИ ЗМІНИ
      </button>


      <div
        id="ets2Message"
        class="member-message"
      ></div>

    `;


    const save =
      document.getElementById(
        "saveEts2"
      );


    const message =
      document.getElementById(
        "ets2Message"
      );


    save.addEventListener(
      "click",
      async () => {

        save.disabled =
          true;

        message.className =
          "member-message info";

        message.textContent =
          "Збереження...";


        const roleIds =
          Array.from(
            document.querySelectorAll(
              ".ets2-role:checked"
            )
          )
            .map(
              input =>
                Number(
                  input.value
                )
            );


        const driverClass =
          document.getElementById(
            "ets2DriverClass"
          ).value;


        const {
          data: result,
          error
        } = await supabase.rpc(
          "save_ets2_member_management",
          {
            p_target_user_id:
              targetUserId,

            p_role_ids:
              roleIds,

            p_driver_class:
              driverClass
          }
        );


        if (error) {

          console.error(
            "ETS2 management error:",
            error
          );

          message.className =
            "member-message error";

          message.textContent =
            "❌ Не вдалося зберегти: " +
            error.message;

          save.disabled =
            false;

          return;
        }


        console.log(
          "ETS2 management saved:",
          result
        );


        message.className =
          "member-message success";

        message.textContent =
          "✅ Посади та клас ETS2 успішно збережено.";


        setTimeout(
          () => window.location.reload(),
          700
        );

      }
    );

  }


  // ==========================================
  // LOAD ALL DATA
  // ==========================================

  try {

    const [
      profileResult,
      directionsResult,
      activeDirectionsResult
    ] = await Promise.all([

      supabase
        .from("profiles")
        .select(`
          id,
          display_name,
          avatar_url,
          game_nickname
        `)
        .eq(
          "id",
          targetUserId
        )
        .maybeSingle(),

      supabase.rpc(
        "get_user_direction_management",
        {
          p_target_user_id:
            targetUserId
        }
      ),

      supabase.rpc(
        "get_active_directions"
      )

    ]);


    // ========================================
    // PROFILE RESULT
    // ========================================

    if (
      profileResult.error
    ) {

      throw profileResult.error;

    }


    renderProfile(
      profileResult.data
    );


    // ========================================
    // MANAGEMENT RESULT
    // ========================================

    if (
      directionsResult.error
    ) {

      throw directionsResult.error;

    }


    const managementData =
      directionsResult.data || {};


    renderGlobalRoles(
      managementData.global_roles
    );


    // ========================================
    // DIRECTIONS RESULT
    // ========================================

    if (
      activeDirectionsResult.error
    ) {

      throw activeDirectionsResult.error;

    }


    const activeDirections =
      Array.isArray(
        activeDirectionsResult.data
      )
        ? activeDirectionsResult.data
        : [];


    await renderDirections(
      activeDirections,
      managementData
    );


    // ========================================
    // TEMPORARY ETS2 BLOCK
    // ========================================

    await loadLegacyEts2Management();


    console.log(
      "MEMBER CABINET RBAC:",
      {
        targetUserId,
        directions:
          activeDirections.length,
        globalRoles:
          managementData.global_roles || [],
        userDirections:
          managementData.directions || []
      }
    );

  } catch (error) {

    console.error(
      "Member cabinet error:",
      error
    );

    showMemberError(
      "❌ Не вдалося завантажити кабінет учасника: " +
      error.message
    );

  }

});
