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

  const params = new URLSearchParams(window.location.search);
  const targetUserId = params.get("user_id");

  const memberName = document.getElementById("memberName");
  const memberNickname = document.getElementById("memberNickname");
  const memberAvatar = document.getElementById("memberAvatar");
  const memberRoles = document.getElementById("memberRoles");
  const ets2Panel = document.getElementById("ets2Management");
  const ets2Message = document.getElementById("ets2Message");
  const saveButton = document.getElementById("saveEts2");

  const classNames = {
    A: 'Клас A — «Майстер водій»',
    B: 'Клас B — «Старший водій»',
    C: 'Клас C — «Досвідчений водій»',
    D: 'Клас D — «Водій»',
    E: 'Клас E — «Стажер»'
  };

  if (!targetUserId) {
    document.getElementById("memberError").textContent =
      "Не вказано учасника.";
    return;
  }

  const {
    data: authData,
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !authData?.user) {
    window.location.href = "login.html";
    return;
  }

  function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value ?? "";
    return div.innerHTML;
  }

  function showMessage(text, type = "info") {
    if (!ets2Message) return;
    ets2Message.textContent = text;
    ets2Message.className = "member-message " + type;
  }

  function renderRoles(roles) {
    if (!memberRoles) return;

    if (!roles?.length) {
      memberRoles.innerHTML = '<span class="empty-role">Посад ETS2 немає</span>';
      return;
    }

    memberRoles.innerHTML = roles
      .map(role => `<span class="role-badge">${escapeHtml(role.name)}</span>`)
      .join("");
  }

  function renderManagement(data) {
    const profile = data.profile || {};
    const roles = Array.isArray(data.roles) ? data.roles : [];
    const available = Array.isArray(data.available_roles)
      ? data.available_roles
      : [];

    if (memberName) {
      memberName.textContent = profile.display_name || "Учасник UA LEGION";
    }

    if (memberNickname) {
      memberNickname.textContent =
        profile.game_nickname || "Ігровий нік не вказано";
    }

    if (memberAvatar) {
      memberAvatar.src = profile.avatar_url || "";
      memberAvatar.alt = profile.display_name || "Учасник";
      if (!profile.avatar_url) {
        memberAvatar.classList.add("avatar-empty");
      }
    }

    renderRoles(roles);

    const canManage = data.can_manage === true;

    if (!canManage) {
      ets2Panel.innerHTML = `
        <div class="management-locked">
          🔒 У вас немає повноважень для зміни посад або класу цього учасника.
        </div>
      `;
      return;
    }

    const selectedIds = new Set(
      roles.map(role => String(role.id))
    );

    ets2Panel.innerHTML = `
      <div class="management-head">
        <div>
          <h2>🛠 Керування ETS2</h2>
          <p>Зміни виконуються без повторної заявки.</p>
        </div>
      </div>

      <div class="management-block">
        <h3>Посади ETS2</h3>
        <div class="role-checkboxes">
          ${available.map(role => `
            <label class="role-option">
              <input
                type="checkbox"
                class="ets2-role"
                value="${escapeHtml(role.id)}"
                ${selectedIds.has(String(role.id)) ? "checked" : ""}
              >
              <span>${escapeHtml(role.name)}</span>
            </label>
          `).join("")}
        </div>
      </div>

      <div class="management-block">
        <label for="ets2DriverClass">Клас водія</label>
        <select id="ets2DriverClass">
          ${Object.entries(classNames).map(([code, name]) => `
            <option value="${code}" ${data.driver_class === code ? "selected" : ""}>
              ${escapeHtml(name)}
            </option>
          `).join("")}
        </select>
      </div>

      <button id="saveEts2" class="save-management">
        💾 ЗБЕРЕГТИ ЗМІНИ
      </button>

      <div id="ets2Message" class="member-message"></div>
    `;

    const save = document.getElementById("saveEts2");
    const message = document.getElementById("ets2Message");

    save.addEventListener("click", async () => {
      save.disabled = true;
      message.className = "member-message info";
      message.textContent = "Збереження...";

      const roleIds = Array.from(
        document.querySelectorAll(".ets2-role:checked")
      ).map(input => Number(input.value));

      const driverClass =
        document.getElementById("ets2DriverClass").value;

      const { data: result, error } = await supabase.rpc(
        "save_ets2_member_management",
        {
          p_target_user_id: targetUserId,
          p_role_ids: roleIds,
          p_driver_class: driverClass
        }
      );

      if (error) {
        console.error("ETS2 management error:", error);
        message.className = "member-message error";
        message.textContent =
          "❌ Не вдалося зберегти: " + error.message;
        save.disabled = false;
        return;
      }

      message.className = "member-message success";
      message.textContent = "✅ Посади та клас ETS2 успішно збережено.";

      setTimeout(() => window.location.reload(), 700);
    });
  }

  const { data, error } = await supabase.rpc(
    "get_ets2_member_management",
    { p_target_user_id: targetUserId }
  );

  if (error) {
    console.error("Member cabinet error:", error);
    document.getElementById("memberError").textContent =
      "❌ Не вдалося завантажити кабінет учасника: " + error.message;
    return;
  }

  renderManagement(data);
});
