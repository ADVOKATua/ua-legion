// ======================================
// UA LEGION — PROFILE SYSTEM
// profile.js
// ======================================

document.addEventListener("DOMContentLoaded", async () => {
  const supabase = window.supabaseClient;

  if (!supabase) {
    console.error("Supabase не підключений");
    return;
  }

  // ======================================
  // ПЕРЕВІРКА АВТОРИЗАЦІЇ
  // ======================================

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    window.location.href = "login.html";
    return;
  }

  // ======================================
  // ЕЛЕМЕНТИ СТОРІНКИ
  // ======================================

  const profileForm = document.getElementById("profileForm");
  const displayName = document.getElementById("displayName");
  const birthDate = document.getElementById("birthDate");
  const avatarUrl = document.getElementById("avatarUrl");
  const discordUsername = document.getElementById("discordUsername");
  const discordUserId = document.getElementById("discordUserId");
  const steamId = document.getElementById("steamId");
  const gameNickname = document.getElementById("gameNickname");
  const profileAvatar = document.getElementById("profileAvatar");
  const profileNamePreview = document.getElementById("profileNamePreview");
  const messageBox = document.getElementById("profileMessage");
  const logoutButton = document.getElementById("logoutButton");
  const rolesList = document.getElementById("rolesList");
  const applicationStatus = document.getElementById("applicationStatus");
  const joinButton = document.getElementById("joinButton");

  // URL аватара, який уже збережений у профілі.
  // Input type="file" НЕ зберігає URL файлу.
  let currentAvatarUrl = null;
  let previewObjectUrl = null;

  // ======================================
  // ПОВІДОМЛЕННЯ
  // ======================================

  function showMessage(message, type = "success") {
    if (!messageBox) return;
    messageBox.textContent = message;
    messageBox.className = "profile-message " + type;
  }

  // ======================================
  // ПОПЕРЕДНІЙ ПЕРЕГЛЯД АВАТАРА
  // ======================================

  if (avatarUrl) {
    avatarUrl.addEventListener("change", () => {
      const file = avatarUrl.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        showMessage("Будь ласка, виберіть файл зображення.", "error");
        avatarUrl.value = "";
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        showMessage("Розмір аватара не повинен перевищувати 10 MB.", "error");
        avatarUrl.value = "";
        return;
      }

      if (previewObjectUrl) {
        URL.revokeObjectURL(previewObjectUrl);
      }

      previewObjectUrl = URL.createObjectURL(file);

      if (profileAvatar) {
        profileAvatar.src = previewObjectUrl;
      }
    });
  }

  // ======================================
  // ЗАВАНТАЖЕННЯ ПРОФІЛЮ
  // ======================================

  async function loadProfile() {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Помилка завантаження профілю:", error);
      showMessage(error.message, "error");
      return;
    }

    if (!profile) return;

    if (profile.display_name && displayName) {
      displayName.value = profile.display_name;

      if (profileNamePreview) {
        profileNamePreview.textContent = profile.display_name;
      }
    }

    if (profile.birth_date && birthDate) {
      birthDate.value = profile.birth_date;
    }

    // ВАЖЛИВО: URL записуємо тільки в <img>, а НЕ в input type=file.
    currentAvatarUrl = profile.avatar_url || null;

    if (currentAvatarUrl && profileAvatar) {
      profileAvatar.src = currentAvatarUrl;
    }

    if (profile.discord_username && discordUsername) {
      discordUsername.value = profile.discord_username;
    }

    if (profile.discord_user_id && discordUserId) {
      discordUserId.value = profile.discord_user_id;
    }

    if (profile.steam_id && steamId) {
      steamId.value = profile.steam_id;
    }

    if (profile.game_nickname && gameNickname) {
      gameNickname.value = profile.game_nickname;
    }
  }

  // ======================================
  // СТАТУС ЗАЯВКИ
  // ======================================

  async function loadApplicationStatus() {
    if (!applicationStatus) return;

    applicationStatus.className = "application-card";
    applicationStatus.innerHTML = `
      <h3>Завантаження...</h3>
      <p>Перевіряємо інформацію про вашу заявку.</p>
    `;

    const { data: applications, error } = await supabase
      .from("applications")
      .select("id, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Помилка завантаження заявки:", error);

      applicationStatus.innerHTML = `
        <h3>⚠️ Не вдалося перевірити заявку</h3>
        <p>${error.message}</p>
      `;

      return;
    }

    const application = applications?.[0] || null;

    if (!application) {
      applicationStatus.className = "application-card none";

      applicationStatus.innerHTML = `
        <h3>📝 Заявка ще не подана</h3>
        <p>Ви можете подати заявку на вступ до UA LEGION.</p>
      `;

      if (joinButton) {
        joinButton.style.display = "inline-flex";
        joinButton.href = "join.html";
        joinButton.textContent = "📝 ПОДАТИ ЗАЯВКУ";
      }

      return;
    }

    const status = application.status;

    if (status === "pending") {
      applicationStatus.className = "application-card pending";

      applicationStatus.innerHTML = `
        <h3>⏳ Заявка на розгляді</h3>
        <p>Ваша заявка отримана та очікує рішення адміністрації.</p>
      `;

      if (joinButton) {
        joinButton.style.display = "none";
      }

      return;
    }

    if (status === "approved") {
      applicationStatus.className = "application-card approved";

      applicationStatus.innerHTML = `
        <h3>✅ Ви учасник UA LEGION</h3>
        <p>Ваша заявка схвалена. Тепер вам доступний список учасників UA LEGION.</p>
        <a href="members.html" class="members-link">
          👥 УЧАСНИКИ UA LEGION
        </a>
      `;

      if (joinButton) {
        joinButton.style.display = "none";
      }

      return;
    }

    if (status === "rejected") {
      applicationStatus.className = "application-card rejected";

      applicationStatus.innerHTML = `
        <h3>❌ Заявку відхилено</h3>
        <p>Ваша заявка була відхилена. Ви можете подати нову заявку.</p>
      `;

      if (joinButton) {
        joinButton.style.display = "inline-flex";
        joinButton.href = "join.html";
        joinButton.textContent = "📝 ПОДАТИ НОВУ ЗАЯВКУ";
      }

      return;
    }

    applicationStatus.innerHTML = `
      <h3>ℹ️ Статус заявки</h3>
      <p>Поточний статус: ${status}</p>
    `;

    if (joinButton) {
      joinButton.style.display = "none";
    }
  }

  // ======================================
  // ЗАВАНТАЖЕННЯ НАПРЯМКІВ
  // ======================================

  async function loadDirections() {
    const { data: allDirections, error: directionsError } = await supabase
      .from("directions")
      .select("id, slug");

    if (directionsError) {
      console.error("Помилка читання directions:", directionsError);
      return;
    }

    const directionMap = new Map(
      (allDirections || []).map(direction => [
        String(direction.id),
        direction.slug
      ])
    );

    const { data: selectedRows, error: selectedError } = await supabase
      .from("profile_directions")
      .select("direction_id")
      .eq("profile_id", user.id);

    if (selectedError) {
      console.error("Помилка завантаження напрямків:", selectedError);
      return;
    }

    document
      .querySelectorAll('input[name="direction"]')
      .forEach(checkbox => {
        checkbox.checked = false;
      });

    (selectedRows || []).forEach(row => {
      const slug = directionMap.get(String(row.direction_id));

      if (!slug) return;

      const checkbox = document.querySelector(
        `input[name="direction"][value="${slug}"]`
      );

      if (checkbox) {
        checkbox.checked = true;
      }
    });
  }

  // ======================================
  // ЗАВАНТАЖЕННЯ РОЛЕЙ
  // ======================================

  async function loadUserRoles() {
    if (!rolesList) return;

    rolesList.innerHTML = `
      <div class="roles-empty">
        Завантаження ролей...
      </div>
    `;

    const { data: userRoles, error: userRolesError } = await supabase
      .from("user_roles")
      .select("role_id, direction_id")
      .eq("user_id", user.id);

    if (userRolesError) {
      console.error("Помилка user_roles:", userRolesError);

      rolesList.innerHTML = `
        <div class="roles-empty">
          Не вдалося завантажити ролі.
        </div>
      `;

      return;
    }

    if (!userRoles || userRoles.length === 0) {
      renderUserRoles([]);
      return;
    }

    const roleIds = [
      ...new Set(
        userRoles
          .map(item => item.role_id)
          .filter(Boolean)
      )
    ];

    const { data: roles, error: rolesError } = await supabase
      .from("roles")
      .select("id, code, name")
      .in("id", roleIds);

    if (rolesError) {
      console.error("Помилка roles:", rolesError);

      rolesList.innerHTML = `
        <div class="roles-empty">
          Не вдалося завантажити інформацію про ролі.
        </div>
      `;

      return;
    }

    const directionIds = [
      ...new Set(
        userRoles
          .map(item => item.direction_id)
          .filter(Boolean)
      )
    ];

    let directions = [];

    if (directionIds.length > 0) {
      const {
        data: directionsData,
        error: directionsError
      } = await supabase
        .from("directions")
        .select("id, name, slug")
        .in("id", directionIds);

      if (directionsError) {
        console.error("Помилка directions:", directionsError);
      } else {
        directions = directionsData || [];
      }
    }

    const rolesMap = new Map(
      (roles || []).map(role => [
        String(role.id),
        role
      ])
    );

    const directionsMap = new Map(
      directions.map(direction => [
        String(direction.id),
        direction
      ])
    );

    const fullRoles = userRoles.map(item => ({
      role_id: item.role_id,
      direction_id: item.direction_id,

      roles:
        rolesMap.get(String(item.role_id)) || null,

      directions:
        item.direction_id
          ? directionsMap.get(String(item.direction_id)) || null
          : null
    }));

    fullRoles.sort((a, b) => {
      if (a.direction_id === null && b.direction_id !== null) {
        return -1;
      }

      if (a.direction_id !== null && b.direction_id === null) {
        return 1;
      }

      return 0;
    });

    renderUserRoles(fullRoles);
  }

  // ======================================
  // ВІДОБРАЖЕННЯ РОЛЕЙ
  // ======================================

  function renderUserRoles(roles) {
    if (!rolesList) return;

    rolesList.innerHTML = "";

    if (!roles || roles.length === 0) {
      rolesList.innerHTML = `
        <div class="roles-empty">
          У вас поки немає призначених ролей.
        </div>
      `;

      return;
    }

    roles.forEach(item => {
      const roleCard = document.createElement("div");

      roleCard.className = "role-card";

      const roleName =
        item.roles?.name || "Невідома роль";

      const roleCode =
        item.roles?.code || "";

      const isGlobal =
        item.direction_id === null;

      const directionName =
        item.directions?.name || "Глобальна роль";

      let roleIcon = "👤";

      if (roleCode === "owner") {
        roleIcon = "👑";
      }

      else if (roleCode === "deputy_owner") {
        roleIcon = "🛡️";
      }

      else if (roleCode === "top_manager") {
        roleIcon = "🏆";
      }

      else if (roleCode === "hr_manager") {
        roleIcon = "👥";
      }

      else if (roleCode === "logistics_manager") {
        roleIcon = "🚛";
      }

      if (isGlobal) {
        roleCard.classList.add("global");
      }

      roleCard.innerHTML = `
        <h3>${roleIcon} ${roleName}</h3>
        <p>${directionName}</p>
      `;

      rolesList.appendChild(roleCard);
    });
  }

  // ======================================
  // ЗБЕРЕЖЕННЯ ПРОФІЛЮ + АВАТАР
  // ======================================

  if (profileForm) {
    profileForm.addEventListener(
      "submit",
      async event => {

        event.preventDefault();

        showMessage("Збереження профілю...");

        const selectedSlugs = Array.from(
          document.querySelectorAll(
            'input[name="direction"]:checked'
          )
        ).map(checkbox => checkbox.value);

        let uploadedAvatarUrl = null;

        const avatarFile =
          avatarUrl?.files?.[0];

        // --------------------------------------
        // ЗАВАНТАЖЕННЯ НОВОГО АВАТАРА У STORAGE
        // --------------------------------------

        if (avatarFile) {
          if (!avatarFile.type.startsWith("image/")) {
            showMessage(
              "Будь ласка, виберіть файл зображення.",
              "error"
            );

            return;
          }

          if (avatarFile.size > 10 * 1024 * 1024) {
            showMessage(
              "Розмір аватара не повинен перевищувати 10 MB.",
              "error"
            );

            return;
          }

          showMessage("Завантаження аватара...");

          const originalExtension = avatarFile.name
            .split(".")
            .pop()
            ?.toLowerCase();

          const fileExtension =
            originalExtension &&
            /^[a-z0-9]+$/.test(originalExtension)
              ? originalExtension
              : "png";

          // Кожен аватар має унікальний шлях
          const filePath =
            `${user.id}/avatar-${Date.now()}.${fileExtension}`;

          const { error: uploadError } = await supabase
            .storage
            .from("avatars")
            .upload(
              filePath,
              avatarFile,
              {
                cacheControl: "3600",
                upsert: false,
                contentType: avatarFile.type
              }
            );

          if (uploadError) {
            console.error(
              "Помилка завантаження аватара:",
              uploadError
            );

            showMessage(
              "Не вдалося завантажити аватар: " +
              uploadError.message,
              "error"
            );

            return;
          }

          // Отримуємо Public URL
          const { data: publicUrlData } = supabase
            .storage
            .from("avatars")
            .getPublicUrl(filePath);

          uploadedAvatarUrl =
            publicUrlData?.publicUrl || null;

          if (!uploadedAvatarUrl) {
            showMessage(
              "Аватар завантажено, але не вдалося отримати його URL.",
              "error"
            );

            return;
          }

          // Показуємо новий аватар
          if (profileAvatar) {
            profileAvatar.src =
              uploadedAvatarUrl;
          }
        }

        // --------------------------------------
        // ЗБЕРЕЖЕННЯ ПРОФІЛЮ
        // --------------------------------------

        const avatarToSave =
          uploadedAvatarUrl ||
          currentAvatarUrl ||
          null;

        const { error: profileError } = await supabase
          .from("profiles")
          .upsert(
            {
              id: user.id,

              display_name:
                displayName?.value.trim() || null,

              birth_date:
                birthDate?.value || null,

              avatar_url:
                avatarToSave,

              discord_username:
                discordUsername?.value.trim() || null,

              discord_user_id:
                discordUserId?.value.trim() || null,

              steam_id:
                steamId?.value.trim() || null,

              game_nickname:
                gameNickname?.value.trim() || null,

              updated_at:
                new Date().toISOString()
            },
            {
              onConflict: "id"
            }
          );

        if (profileError) {
          console.error(
            "Помилка профілю:",
            profileError
          );

          showMessage(
            profileError.message,
            "error"
          );

          return;
        }

        // --------------------------------------
        // ЗБЕРЕЖЕННЯ НАПРЯМКІВ
        // --------------------------------------

        let selectedDirections = [];

        if (selectedSlugs.length > 0) {
          const {
            data: directions,
            error: directionsError
          } = await supabase
            .from("directions")
            .select("id, slug")
            .in("slug", selectedSlugs);

          if (directionsError) {
            showMessage(
              "Не вдалося зберегти напрямки: " +
              directionsError.message,
              "error"
            );

            return;
          }

          selectedDirections =
            directions || [];
        }

        const { error: deleteError } = await supabase
          .from("profile_directions")
          .delete()
          .eq(
            "profile_id",
            user.id
          );

        if (deleteError) {
          showMessage(
            deleteError.message,
            "error"
          );

          return;
        }

        if (selectedDirections.length > 0) {
          const rowsToInsert =
            selectedDirections.map(
              direction => ({
                profile_id: user.id,
                direction_id: direction.id
              })
            );

          const { error: insertError } = await supabase
            .from("profile_directions")
            .insert(rowsToInsert);

          if (insertError) {
            showMessage(
              insertError.message,
              "error"
            );

            return;
          }
        }

        // --------------------------------------
        // ОНОВЛЕННЯ ЛОКАЛЬНОГО СТАНУ
        // --------------------------------------

        if (uploadedAvatarUrl) {
          currentAvatarUrl =
            uploadedAvatarUrl;

          if (previewObjectUrl) {
            URL.revokeObjectURL(
              previewObjectUrl
            );

            previewObjectUrl = null;
          }

          // Очищаємо вибір файлу.
          // Сам аватар залишається на екрані.
          if (avatarUrl) {
            avatarUrl.value = "";
          }
        }

        if (
          displayName?.value.trim() &&
          profileNamePreview
        ) {
          profileNamePreview.textContent =
            displayName.value.trim();
        }

        showMessage(
          "Профіль успішно збережено!",
          "success"
        );
      }
    );
  }

  // ======================================
  // ВИХІД
  // ======================================

  if (logoutButton) {
    logoutButton.addEventListener(
      "click",
      async () => {

        const { error } = await supabase
          .auth
          .signOut();

        if (error) {
          console.error(
            "Помилка виходу:",
            error
          );

          return;
        }

        window.location.href =
          "index.html";
      }
    );
  }

  // ======================================
  // ЗАПУСК
  // ======================================

  await loadProfile();

  await loadDirections();

  await loadApplicationStatus();

  await loadUserRoles();
});
