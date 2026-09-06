// ==========================================
// UA LEGION
// ADMIN PANEL
// admin.js
// ==========================================

document.addEventListener(
  "DOMContentLoaded",

  async () => {


    const supabase =
      window.supabaseClient;


    // ======================================
    // SUPABASE CHECK
    // ======================================

    if (!supabase) {

      console.error(
        "Supabase не підключений"
      );

      return;

    }


    // ======================================
    // VARIABLES
    // ======================================

    let currentUser =
      null;


    let currentApplication =
      null;


    let allApplications =
      [];


    let availableRoles =
      [];


    let availableDirections =
      [];


    // ======================================
    // ELEMENTS
    // ======================================

    const applicationsList =
      document.getElementById(
        "applicationsList"
      );


    const adminMessage =
      document.getElementById(
        "adminMessage"
      );


    const adminUserName =
      document.getElementById(
        "adminUserName"
      );


    const totalCount =
      document.getElementById(
        "totalCount"
      );


    const pendingCount =
      document.getElementById(
        "pendingCount"
      );


    const approvedCount =
      document.getElementById(
        "approvedCount"
      );


    const rejectedCount =
      document.getElementById(
        "rejectedCount"
      );


    const searchApplications =
      document.getElementById(
        "searchApplications"
      );


    const statusFilter =
      document.getElementById(
        "statusFilter"
      );


    const refreshButton =
      document.getElementById(
        "refreshApplications"
      );


    const applicationsCountLabel =
      document.getElementById(
        "applicationsCountLabel"
      );


    // MODAL

    const modal =
      document.getElementById(
        "applicationModal"
      );


    const closeModal =
      document.getElementById(
        "closeModal"
      );


    const modalApplicationName =
      document.getElementById(
        "modalApplicationName"
      );


    const modalApplicationInfo =
      document.getElementById(
        "modalApplicationInfo"
      );


    const assignRole =
      document.getElementById(
        "assignRole"
      );


    const assignDirection =
      document.getElementById(
        "assignDirection"
      );


    const reviewComment =
      document.getElementById(
        "reviewComment"
      );


    const markPending =
      document.getElementById(
        "markPending"
      );


    const approveApplication =
      document.getElementById(
        "approveApplication"
      );


    const rejectApplication =
      document.getElementById(
        "rejectApplication"
      );


    // ======================================
    // MESSAGE
    // ======================================

    function showMessage(
      message,
      type = "success"
    ) {

      if (!adminMessage) {
        return;
      }


      adminMessage.textContent =
        message;


      adminMessage.className =
        "admin-message " +
        type;


      adminMessage.style.display =
        "block";

    }


    // ======================================
    // AUTH
    // ======================================

    const {
      data: {
        user
      },
      error: userError
    } =
      await supabase
        .auth
        .getUser();


    if (
      userError ||
      !user
    ) {

      window.location.href =
        "login.html";

      return;

    }


    currentUser =
      user;


    // ======================================
    // LOAD PROFILE NAME
    // ======================================

    async function loadAdminProfile() {

      const {
        data: profile
      } =
        await supabase
          .from("profiles")
          .select(
            "display_name, game_nickname"
          )
          .eq(
            "id",
            currentUser.id
          )
          .maybeSingle();


      if (
        profile &&
        adminUserName
      ) {

        adminUserName.textContent =
          profile.display_name ||
          profile.game_nickname ||
          "Адміністратор";

      }

    }


    // ======================================
    // CHECK ADMIN ROLE
    // ======================================

    async function checkAdminAccess() {

      const {
        data,
        error
      } =
        await supabase
          .from("user_roles")
          .select(`
            role_id,

            roles (
              code,
              name
            )
          `)
          .eq(
            "user_id",
            currentUser.id
          );


      if (error) {

        console.error(
          "Помилка перевірки ролей:",
          error
        );

        return false;

      }


      const allowedRoles = [

        "owner",

        "deputy_owner",

        "top_manager",

        "hr_manager"

      ];


      const hasAccess =
        data.some(
          item =>

            allowedRoles.includes(
              item.roles?.code
            )
        );


      return hasAccess;

    }


    // ======================================
    // LOAD ROLES
    // ======================================

    async function loadRoles() {

      const {
        data,
        error
      } =
        await supabase
          .from("roles")
          .select(
            "id, code, name"
          )
          .order(
            "id"
          );


      if (error) {

        console.error(
          "Помилка завантаження ролей:",
          error
        );

        return;

      }


      availableRoles =
        data || [];


      if (!assignRole) {
        return;
      }


      assignRole.innerHTML =
        `
          <option value="">
            Без призначення ролі
          </option>
        `;


      availableRoles.forEach(
        role => {

          const option =
            document.createElement(
              "option"
            );


          option.value =
            role.id;


          option.textContent =
            role.name;


          assignRole.appendChild(
            option
          );

        }
      );

    }


    // ======================================
    // LOAD DIRECTIONS
    // ======================================

    async function loadDirections() {

      const {
        data,
        error
      } =
        await supabase
          .from("directions")
          .select(
            "id, slug, name"
          )
          .order(
            "id"
          );


      if (error) {

        console.error(
          "Помилка завантаження напрямків:",
          error
        );

        return;

      }


      availableDirections =
        data || [];


      if (!assignDirection) {
        return;
      }


      assignDirection.innerHTML =
        `
          <option value="">
            Глобальна роль
          </option>
        `;


      availableDirections.forEach(
        direction => {

          const option =
            document.createElement(
              "option"
            );


          option.value =
            direction.id;


          option.textContent =
            direction.name;


          assignDirection.appendChild(
            option
          );

        }
      );

    }


    // ======================================
    // LOAD APPLICATIONS
    // ======================================

    async function loadApplications() {

      if (applicationsList) {

        applicationsList.innerHTML =
          `
            <div class="applications-loading">
              Завантаження заявок...
            </div>
          `;

      }


      const {
        data,
        error
      } =
        await supabase
          .from("applications")
          .select("*")
          .order(
            "created_at",
            {
              ascending:
                false
            }
          );


      if (error) {

        console.error(
          "Помилка завантаження заявок:",
          error
        );


        showMessage(
          "Не вдалося завантажити заявки: " +
          error.message,
          "error"
        );


        if (applicationsList) {

          applicationsList.innerHTML =
            `
              <div class="applications-empty">
                Не вдалося завантажити заявки.
              </div>
            `;

        }


        return;

      }


      allApplications =
        data || [];


      updateStatistics();


      renderApplications(
        allApplications
      );

    }


    // ======================================
    // STATISTICS
    // ======================================

    function updateStatistics() {

      const total =
        allApplications.length;


      const pending =
        allApplications.filter(

          application =>

            application.status === "new" ||
            application.status === "pending" ||
            application.status === "review"

        ).length;


      const approved =
        allApplications.filter(

          application =>
            application.status === "approved"

        ).length;


      const rejected =
        allApplications.filter(

          application =>
            application.status === "rejected"

        ).length;


      if (totalCount) {

        totalCount.textContent =
          total;

      }


      if (pendingCount) {

        pendingCount.textContent =
          pending;

      }


      if (approvedCount) {

        approvedCount.textContent =
          approved;

      }


      if (rejectedCount) {

        rejectedCount.textContent =
          rejected;

      }

    }


    // ======================================
    // STATUS
    // ======================================

    function getStatusInfo(
      status
    ) {

      const statuses = {

        new: {
          label: "🆕 Нова",
          className: "new"
        },


        pending: {
          label: "⏳ На розгляді",
          className: "pending"
        },


        review: {
          label: "🔎 Розглядається",
          className: "review"
        },


        approved: {
          label: "✅ Схвалено",
          className: "approved"
        },


        rejected: {
          label: "❌ Відхилено",
          className: "rejected"
        }

      };


      return (
        statuses[status] ||
        {
          label: status,
          className: ""
        }
      );

    }


    // ======================================
    // DATE FORMAT
    // ======================================

    function formatDate(
      value
    ) {

      if (!value) {
        return "—";
      }


      return new Date(
        value
      ).toLocaleString(
        "uk-UA"
      );

    }


    // ======================================
    // ESCAPE HTML
    // ======================================

    function escapeHtml(
      value
    ) {

      if (
        value === null ||
        value === undefined
      ) {

        return "";

      }


      return String(value)

        .replace(
          /&/g,
          "&amp;"
        )

        .replace(
          /</g,
          "&lt;"
        )

        .replace(
          />/g,
          "&gt;"
        )

        .replace(
          /"/g,
          "&quot;"
        )

        .replace(
          /'/g,
          "&#039;"
        );

    }


    // ======================================
    // RENDER APPLICATIONS
    // ======================================

    function renderApplications(
      applications
    ) {

      if (!applicationsList) {
        return;
      }


      applicationsList.innerHTML =
        "";


      if (
        applicationsCountLabel
      ) {

        applicationsCountLabel.textContent =
          applications.length +
          " заявок";

      }


      if (
        applications.length === 0
      ) {

        applicationsList.innerHTML =
          `
            <div class="applications-empty">
              Заявок не знайдено.
            </div>
          `;

        return;

      }


      applications.forEach(
        application => {

          const status =
            getStatusInfo(
              application.status
            );


          const directions =
            Array.isArray(
              application.directions
            )

              ? application.directions.join(
                  ", "
                )

              : (
                  application.directions ||
                  "Не вказано"
                );


          const card =
            document.createElement(
              "div"
            );


          card.className =
            "application-card";


          card.innerHTML =
            `

              <div
                class="application-main"
              >

                <div
                  class="application-avatar"
                >

                  👤

                </div>


                <div
                  class="application-summary"
                >

                  <h3>

                    ${escapeHtml(
                      application.name
                    )}

                  </h3>


                  <div
                    class="application-meta"
                  >

                    <span>

                      💬 ${escapeHtml(
                        application.discord_nickname
                      )}

                    </span>


                    <span>

                      🎮 ${escapeHtml(
                        directions
                      )}

                    </span>


                    <span>

                      📅 ${formatDate(
                        application.created_at
                      )}

                    </span>

                  </div>

                </div>


              </div>


              <div
                class="application-right"
              >

                <span
                  class="
                    application-status
                    ${status.className}
                  "
                >

                  ${status.label}

                </span>


                <button
                  class="view-application"
                  type="button"
                >

                  ВІДКРИТИ

                </button>

              </div>

            `;


          card
            .querySelector(
              ".view-application"
            )
            .addEventListener(
              "click",

              function () {

                openApplication(
                  application
                );

              }
            );


          applicationsList.appendChild(
            card
          );

        }
      );

    }


    // ======================================
    // OPEN APPLICATION
    // ======================================

    function openApplication(
      application
    ) {

      currentApplication =
        application;


      if (modalApplicationName) {

        modalApplicationName.textContent =
          application.name ||
          "Заявка";

      }


      const directions =
        Array.isArray(
          application.directions
        )

          ? application.directions.join(
              ", "
            )

          : (
              application.directions ||
              "—"
            );


      if (modalApplicationInfo) {

        modalApplicationInfo.innerHTML =
          `

            <div class="detail-grid">


              <div class="detail-item">

                <span>👤 Ім'я</span>

                <strong>

                  ${escapeHtml(
                    application.name
                  )}

                </strong>

              </div>


              <div class="detail-item">

                <span>🎂 Вік</span>

                <strong>

                  ${escapeHtml(
                    application.age
                  )}

                </strong>

              </div>


              <div class="detail-item">

                <span>💬 Discord</span>

                <strong>

                  ${escapeHtml(
                    application.discord_nickname
                  )}

                </strong>

              </div>


              <div class="detail-item">

                <span>🆔 Discord ID</span>

                <strong>

                  ${escapeHtml(
                    application.discord_id
                  )}

                </strong>

              </div>


              <div class="detail-item">

                <span>🎮 Ігровий нік</span>

                <strong>

                  ${escapeHtml(
                    application.game_nickname
                  )}

                </strong>

              </div>


              <div class="detail-item">

                <span>🚛 TruckersMP</span>

                <strong>

                  ${escapeHtml(
                    application.truckersmp_nickname ||
                    "—"
                  )}

                </strong>

              </div>


              <div class="detail-item">

                <span>🆔 TruckersMP ID</span>

                <strong>

                  ${escapeHtml(
                    application.truckersmp_id ||
                    "—"
                  )}

                </strong>

              </div>


              <div class="detail-item">

                <span>🎮 Steam ID</span>

                <strong>

                  ${escapeHtml(
                    application.steam_id ||
                    "—"
                  )}

                </strong>

              </div>


              <div class="detail-item full">

                <span>📍 Напрямок</span>

                <strong>

                  ${escapeHtml(
                    directions
                  )}

                </strong>

              </div>


              <div class="detail-item">

                <span>🔗 Як знайшов нас</span>

                <strong>

                  ${escapeHtml(
                    application.source ||
                    "—"
                  )}

                </strong>

              </div>


              <div class="detail-item">

                <span>📅 Дата заявки</span>

                <strong>

                  ${formatDate(
                    application.created_at
                  )}

                </strong>

              </div>


              <div class="detail-item full">

                <span>📝 Про себе</span>

                <strong>

                  ${escapeHtml(
                    application.about ||
                    "Не вказано"
                  )}

                </strong>

              </div>


            </div>

          `;

      }


      if (reviewComment) {

        reviewComment.value =
          application.review_comment ||
          "";

      }


      if (assignRole) {

        assignRole.value =
          "";

      }


      if (assignDirection) {

        assignDirection.value =
          "";

      }


      if (modal) {

        modal.classList.add(
          "active"
        );

      }

    }


    // ======================================
    // CLOSE MODAL
    // ======================================

    function closeApplicationModal() {

      if (modal) {

        modal.classList.remove(
          "active"
        );

      }


      currentApplication =
        null;

    }


    // ======================================
    // ASSIGN ROLE
    // ======================================

    async function assignSelectedRole() {

      if (
        !currentApplication ||
        !assignRole.value
      ) {

        return true;

      }


      const roleId =
        Number(
          assignRole.value
        );


      const directionId =
        assignDirection.value

          ? Number(
              assignDirection.value
            )

          : null;


      // Перевіряємо,
      // чи вже існує така роль

      let query =
        supabase
          .from("user_roles")
          .select(
            "user_id"
          )
          .eq(
            "user_id",
            currentApplication.user_id
          )
          .eq(
            "role_id",
            roleId
          );


      if (
        directionId === null
      ) {

        query =
          query.is(
            "direction_id",
            null
          );

      }

      else {

        query =
          query.eq(
            "direction_id",
            directionId
          );

      }


      const {
        data: existing,
        error: existingError
      } =
        await query;


      if (existingError) {

        console.error(
          existingError
        );

        return false;

      }


      if (
        existing &&
        existing.length > 0
      ) {

        return true;

      }


      // ДОДАЄМО РОЛЬ

      const {
        error
      } =
        await supabase
          .from("user_roles")
          .insert({

            user_id:
              currentApplication.user_id,


            role_id:
              roleId,


            direction_id:
              directionId

          });


      if (error) {

        console.error(
          "Помилка призначення ролі:",
          error
        );


        showMessage(
          "Не вдалося призначити роль: " +
          error.message,
          "error"
        );


        return false;

      }


      return true;

    }


    // ======================================
    // UPDATE APPLICATION
    // ======================================

    async function updateApplicationStatus(
      newStatus
    ) {

      if (
        !currentApplication
      ) {

        return;

      }


      // При схваленні
      // спочатку призначаємо роль

      if (
        newStatus === "approved"
      ) {

        const roleResult =
          await assignSelectedRole();


        if (!roleResult) {

          return;

        }

      }


      showMessage(
        "Збереження рішення...",
        "info"
      );


      const updateData = {

        status:
          newStatus,


        review_comment:

          reviewComment
            ? reviewComment.value.trim()
            : null,


        reviewed_at:

          new Date()
            .toISOString(),


        updated_at:

          new Date()
            .toISOString()

      };


      const {
        error
      } =
        await supabase
          .from("applications")
          .update(
            updateData
          )
          .eq(
            "id",
            currentApplication.id
          );


      if (error) {

        console.error(
          "Помилка оновлення заявки:",
          error
        );


        showMessage(
          "Помилка: " +
          error.message,
          "error"
        );

        return;

      }


      showMessage(
        "Заявку успішно оновлено.",
        "success"
      );


      closeApplicationModal();


      await loadApplications();

    }


    // ======================================
    // FILTERS
    // ======================================

    function applyFilters() {

      const search =
        searchApplications
          ? searchApplications
              .value
              .toLowerCase()
              .trim()
          : "";


      const status =
        statusFilter
          ? statusFilter.value
          : "all";


      const filtered =
        allApplications.filter(
          application => {


            const name =
              (
                application.name ||
                ""
              )
              .toLowerCase();


            const discord =
              (
                application.discord_nickname ||
                ""
              )
              .toLowerCase();


            const matchesSearch =

              !search ||

              name.includes(
                search
              ) ||

              discord.includes(
                search
              );


            const matchesStatus =

              status === "all" ||

              application.status ===
                status;


            return (

              matchesSearch &&
              matchesStatus

            );

          }
        );


      renderApplications(
        filtered
      );

    }


    // ======================================
    // EVENTS
    // ======================================

    if (searchApplications) {

      searchApplications.addEventListener(
        "input",
        applyFilters
      );

    }


    if (statusFilter) {

      statusFilter.addEventListener(
        "change",
        applyFilters
      );

    }


    if (refreshButton) {

      refreshButton.addEventListener(
        "click",

        async function () {

          await loadApplications();

          showMessage(
            "Список заявок оновлено.",
            "success"
          );

        }
      );

    }


    if (closeModal) {

      closeModal.addEventListener(
        "click",
        closeApplicationModal
      );

    }


    if (modal) {

      modal.addEventListener(
        "click",

        function (
          event
        ) {

          if (
            event.target ===
            modal
          ) {

            closeApplicationModal();

          }

        }
      );

    }


    if (markPending) {

      markPending.addEventListener(
        "click",

        function () {

          updateApplicationStatus(
            "pending"
          );

        }
      );

    }


    if (approveApplication) {

      approveApplication.addEventListener(
        "click",

        function () {

          updateApplicationStatus(
            "approved"
          );

        }
      );

    }


    if (rejectApplication) {

      rejectApplication.addEventListener(
        "click",

        function () {

          updateApplicationStatus(
            "rejected"
          );

        }
      );

    }


    // ======================================
    // START
    // ======================================

    await loadAdminProfile();


    const hasAccess =
      await checkAdminAccess();


    if (!hasAccess) {

      alert(
        "У вас немає доступу до адміністративної панелі."
      );


      window.location.href =
        "profile.html";


      return;

    }


    await loadRoles();

    await loadDirections();

    await loadApplications();


  }
);
