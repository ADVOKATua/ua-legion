// ==========================================
// UA LEGION
// APPLICATIONS SYSTEM
// applications.js
// ==========================================

document.addEventListener(
  "DOMContentLoaded",

  async () => {


    // ======================================
    // SUPABASE
    // ======================================

    const supabase =
      window.supabaseClient;


    if (!supabase) {

      console.error(
        "Supabase не підключений"
      );

      return;

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


    // ======================================
    // ELEMENTS
    // ======================================

    const applicationsList =
      document.getElementById(
        "applicationsList"
      );


    const messageBox =
      document.getElementById(
        "applicationsMessage"
      );


    const statusFilter =
      document.getElementById(
        "statusFilter"
      );


    const searchInput =
      document.getElementById(
        "applicationSearch"
      );


    const adminApplicationsPanel =
      document.getElementById(
        "adminApplicationsPanel"
      );


    const userApplicationsInfo =
      document.getElementById(
        "userApplicationsInfo"
      );


    const createApplicationBlock =
      document.getElementById(
        "createApplicationBlock"
      );


    const applicationsKicker =
      document.getElementById(
        "applicationsKicker"
      );


    const applicationsTitle =
      document.getElementById(
        "applicationsTitle"
      );


    const applicationsSubtitle =
      document.getElementById(
        "applicationsSubtitle"
      );


    // ======================================
    // DATA
    // ======================================

    let allApplications =
      [];


    let allRoles =
      [];


    let allDirections =
      [];


    let isStaff =
      false;


    // ======================================
    // MESSAGE
    // ======================================

    function showMessage(
      message,
      type = "info"
    ) {

      if (!messageBox) {
        return;
      }


      messageBox.textContent =
        message;


      messageBox.className =
        "applications-message " +
        type;

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


      const div =
        document.createElement(
          "div"
        );


      div.textContent =
        String(value);


      return div.innerHTML;

    }


    // ======================================
    // STAFF ACCESS CHECK
    // ======================================

    async function checkStaffAccess() {

      const {
        data,
        error
      } =
        await supabase
          .rpc(
            "is_ua_legion_staff"
          );


      if (error) {

        console.error(
          "Помилка перевірки адміністрації:",
          error
        );

        return false;

      }


      return data === true;

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
          .from(
            "roles"
          )
          .select(
            "id, code, name"
          )
          .order(
            "id",
            {
              ascending: true
            }
          );


      if (error) {

        console.error(
          "Помилка завантаження ролей:",
          error
        );

        return;

      }


      allRoles =
        data || [];

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
          .from(
            "directions"
          )
          .select(
            "id, name, slug"
          )
          .order(
            "id",
            {
              ascending: true
            }
          );


      if (error) {

        console.error(
          "Помилка завантаження напрямків:",
          error
        );

        return;

      }


      allDirections =
        data || [];

    }


    // ======================================
    // LOAD APPLICATIONS
    // ======================================

    async function loadApplications() {

      if (!applicationsList) {
        return;
      }


      applicationsList.innerHTML = `

        <div class="applications-loading">

          ⏳ Завантаження заявок...

        </div>

      `;


      let query =
        supabase
          .from(
            "applications"
          )
          .select(
            "*"
          );


      // ====================================
      // ADMIN SEES ALL
      // USER SEES ONLY OWN
      // ====================================

      if (!isStaff) {

        query =
          query.eq(
            "user_id",
            user.id
          );

      }


      const {
        data,
        error
      } =
        await query;


      if (error) {

        console.error(
          "Помилка завантаження заявок:",
          error
        );


        applicationsList.innerHTML = `

          <div class="applications-empty">

            ❌ Не вдалося завантажити заявки.

            <br><br>

            <small>

              ${escapeHtml(
                error.message
              )}

            </small>

          </div>

        `;


        return;

      }


      allApplications =
        data || [];


      // ====================================
      // USER HAS NO APPLICATIONS
      // ====================================

      if (
        !isStaff
        &&
        allApplications.length === 0
      ) {

        applicationsList.innerHTML =
          "";


        if (createApplicationBlock) {

          createApplicationBlock.style.display =
            "block";

        }


        return;

      }


      if (createApplicationBlock) {

        createApplicationBlock.style.display =
          "none";

      }


      // ====================================
      // ADMIN STATISTICS
      // ====================================

      if (isStaff) {

        updateStatistics();

      }


      renderApplications();

    }


    // ======================================
    // STATISTICS
    // ======================================

    function updateStatistics() {

      const newCount =
        allApplications.filter(

          item =>
            item.status ===
            "new"

        ).length;


      const approvedCount =
        allApplications.filter(

          item =>
            item.status ===
            "approved"

        ).length;


      const rejectedCount =
        allApplications.filter(

          item =>
            item.status ===
            "rejected"

        ).length;


      const newElement =
        document.getElementById(
          "newApplicationsCount"
        );


      const approvedElement =
        document.getElementById(
          "approvedApplicationsCount"
        );


      const rejectedElement =
        document.getElementById(
          "rejectedApplicationsCount"
        );


      if (newElement) {

        newElement.textContent =
          newCount;

      }


      if (approvedElement) {

        approvedElement.textContent =
          approvedCount;

      }


      if (rejectedElement) {

        rejectedElement.textContent =
          rejectedCount;

      }

    }


    // ======================================
    // FILTER APPLICATIONS
    // ======================================

    function getFilteredApplications() {

      if (!isStaff) {

        return allApplications;

      }


      const status =
        statusFilter?.value ||
        "all";


      const search =
        (
          searchInput?.value ||
          ""
        )
        .trim()
        .toLowerCase();


      return allApplications.filter(

        application => {


          const statusMatch =

            status === "all"

            ||

            application.status ===
            status;


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


          const gameNickname =
            (
              application.game_nickname ||
              ""
            )
            .toLowerCase();


          const searchMatch =

            !search

            ||

            name.includes(
              search
            )

            ||

            discord.includes(
              search
            )

            ||

            gameNickname.includes(
              search
            );


          return (

            statusMatch

            &&

            searchMatch

          );

        }

      );

    }


    // ======================================
    // STATUS
    // ======================================

    function getStatusLabel(
      status
    ) {

      const statuses = {


        new: {

          label:
            "🟡 Нова",

          className:
            "status-new"

        },


        approved: {

          label:
            "🟢 Схвалено",

          className:
            "status-approved"

        },


        rejected: {

          label:
            "🔴 Відхилено",

          className:
            "status-rejected"

        }

      };


      return (

        statuses[status]

        ||

        {

          label:
            status ||
            "Невідомо",

          className:
            ""

        }

      );

    }


    // ======================================
    // FORMAT DATE
    // ======================================

    function formatDate(
      dateString
    ) {

      if (!dateString) {

        return "-";

      }


      return new Date(
        dateString
      )
      .toLocaleString(
        "uk-UA"
      );

    }


    // ======================================
    // FORMAT DIRECTIONS
    // ======================================

    function formatDirections(
      directions
    ) {

      if (!directions) {

        return "-";

      }


      if (
        Array.isArray(
          directions
        )
      ) {

        return directions.join(
          ", "
        );

      }


      return directions;

    }


    // ======================================
    // GET APPLICATION DIRECTION
    // ======================================

    function getApplicationDirectionId(
      application
    ) {

      if (
        !application.directions
      ) {

        return null;

      }


      const directions =
        Array.isArray(
          application.directions
        )

          ?

          application.directions

          :

          [
            application.directions
          ];


      const applicationDirection =
        directions[0];


      if (!applicationDirection) {

        return null;

      }


      const directionMap = {

        "ETS2":
          "ets2",

        "ETS2 / TruckersMP":
          "ets2",

        "World of Tanks":
          "wot",

        "Dota 2":
          "dota2",

        "World of Warcraft":
          "wow",

        "Streaming":
          "streaming"

      };


      const slug =
        directionMap[
          applicationDirection
        ];


      if (!slug) {

        const foundByName =
          allDirections.find(

            direction =>
              direction.name ===
              applicationDirection

          );


        return (
          foundByName?.id ||
          null
        );

      }


      const direction =
        allDirections.find(

          item =>
            item.slug ===
            slug

        );


      return (
        direction?.id ||
        null
      );

    }


    // ======================================
    // ROLE OPTIONS
    // ======================================

    function createRoleOptions() {

      let html = `

        <option value="">

          Оберіть роль...

        </option>

      `;


      allRoles.forEach(

        role => {

          html += `

            <option
              value="${role.id}"
            >

              ${escapeHtml(
                role.name
              )}

            </option>

          `;

        }

      );


      return html;

    }


    // ======================================
    // DIRECTION OPTIONS
    // ======================================

    function createDirectionOptions(
      application
    ) {

      const applicationDirectionId =
        getApplicationDirectionId(
          application
        );


      let html = `

        <option value="global">

          🌐 Глобальна роль

        </option>

      `;


      if (
        applicationDirectionId
      ) {

        const direction =
          allDirections.find(

            item =>
              String(
                item.id
              )

              ===

              String(
                applicationDirectionId
              )

          );


        if (direction) {

          html += `

            <option
              value="${direction.id}"
            >

              📍 ${escapeHtml(
                direction.name
              )}

            </option>

          `;

        }

      }


      return html;

    }


    // ======================================
    // RENDER APPLICATIONS
    // ======================================

    function renderApplications() {

      if (!applicationsList) {
        return;
      }


      const applications =
        getFilteredApplications();


      applicationsList.innerHTML =
        "";


      if (
        applications.length === 0
      ) {

        applicationsList.innerHTML = `

          <div class="applications-empty">

            📭 Заявок не знайдено.

          </div>

        `;


        return;

      }


      applications.forEach(

        application => {


          const card =
            document.createElement(
              "div"
            );


          card.className =
            "application-card";


          const status =
            getStatusLabel(
              application.status
            );


          const isNew =
            application.status ===
            "new";


          // ==================================
          // ADMIN CARD
          // ==================================

          if (isStaff) {

            card.innerHTML = `

              <div class="application-card-header">

                <div>

                  <h2>

                    👤
                    ${escapeHtml(
                      application.name ||
                      "Без імені"
                    )}

                  </h2>


                  <p>

                    🎮
                    ${escapeHtml(
                      application.game_nickname ||
                      "-"
                    )}

                  </p>

                </div>


                <span
                  class="
                    application-status
                    ${status.className}
                  "
                >

                  ${status.label}

                </span>

              </div>


              <div class="application-grid">

                <div>

                  <span>
                    🎂 Вік
                  </span>

                  <strong>

                    ${escapeHtml(
                      application.age ||
                      "-"
                    )}

                  </strong>

                </div>


                <div>

                  <span>
                    💬 Discord
                  </span>

                  <strong>

                    ${escapeHtml(
                      application.discord_nickname ||
                      "-"
                    )}

                  </strong>

                </div>


                <div>

                  <span>
                    🆔 Discord ID
                  </span>

                  <strong>

                    ${escapeHtml(
                      application.discord_id ||
                      "-"
                    )}

                  </strong>

                </div>


                <div>

                  <span>
                    🎮 Steam
                  </span>

                  <strong>

                    ${escapeHtml(
                      application.steam_id ||
                      "-"
                    )}

                  </strong>

                </div>

              </div>


              <div class="application-section">

                <span>

                  📍 Напрямок

                </span>


                <strong>

                  ${escapeHtml(
                    formatDirections(
                      application.directions
                    )
                  )}

                </strong>

              </div>


              <div class="application-section">

                <span>

                  📝 Про користувача

                </span>


                <p>

                  ${escapeHtml(
                    application.about ||
                    "Не вказано"
                  )}

                </p>

              </div>


              <div class="application-section">

                <span>

                  🔎 Звідки дізнався

                </span>


                <strong>

                  ${escapeHtml(
                    application.source ||
                    "-"
                  )}

                </strong>

              </div>


              <div class="application-date">

                📅 Подано:

                ${formatDate(
                  application.created_at
                )}

              </div>


              <div class="application-section">

                <span>

                  🎖️ Призначення ролі

                </span>


                <select
                  class="application-role-select"
                  data-id="${application.id}"
                  ${isNew ? "" : "disabled"}
                >

                  ${createRoleOptions()}

                </select>


                <select
                  class="application-direction-select"
                  data-id="${application.id}"
                  ${isNew ? "" : "disabled"}
                >

                  ${createDirectionOptions(
                    application
                  )}

                </select>

              </div>


              <div class="admin-comment-block">

                <label>

                  💬 Коментар адміністратора

                </label>


                <textarea
                  class="review-comment"
                  data-id="${application.id}"
                  placeholder="Коментар для заявки..."
                  ${isNew ? "" : "readonly"}
                >${escapeHtml(
                  application.review_comment ||
                  ""
                )}</textarea>

              </div>


              <div class="application-actions">

                <button
                  class="
                    application-btn
                    approve-btn
                  "
                  data-id="${application.id}"
                  ${isNew ? "" : "disabled"}
                >

                  🟢 СХВАЛИТИ

                </button>


                <button
                  class="
                    application-btn
                    reject-btn
                  "
                  data-id="${application.id}"
                  ${isNew ? "" : "disabled"}
                >

                  🔴 ВІДХИЛИТИ

                </button>

              </div>

            `;

          }


          // ==================================
          // NORMAL USER CARD
          // ==================================

          else {

            card.innerHTML = `

              <div class="application-card-header">

                <div>

                  <h2>

                    📄 Моя заявка

                  </h2>


                  <p>

                    🎮
                    ${escapeHtml(
                      application.game_nickname ||
                      "UA LEGION"
                    )}

                  </p>

                </div>


                <span
                  class="
                    application-status
                    ${status.className}
                  "
                >

                  ${status.label}

                </span>

              </div>


              <div class="application-section">

                <span>

                  📍 Обраний напрямок

                </span>


                <strong>

                  ${escapeHtml(
                    formatDirections(
                      application.directions
                    )
                  )}

                </strong>

              </div>


              <div class="application-date">

                📅 Заявку подано:

                ${formatDate(
                  application.created_at
                )}

              </div>


              ${

                application.review_comment

                  ?

                  `

                    <div
                      class="admin-comment-block"
                    >

                      <label>

                        💬 Відповідь адміністрації

                      </label>


                      <p>

                        ${escapeHtml(
                          application.review_comment
                        )}

                      </p>

                    </div>

                  `

                  :

                  `

                    <div
                      class="application-section"
                    >

                      <p>

                        ⏳ Ваша заявка очікує
                        на розгляд адміністрації.

                      </p>

                    </div>

                  `

              }


              ${

                application.reviewed_at

                  ?

                  `

                    <div
                      class="application-date"
                    >

                      🕒 Розглянуто:

                      ${formatDate(
                        application.reviewed_at
                      )}

                    </div>

                  `

                  :

                  ""

              }

            `;

          }


          applicationsList.appendChild(
            card
          );

        }

      );


      // ====================================
      // ADMIN EVENTS
      // ====================================

      if (isStaff) {

        attachApplicationEvents();

      }

    }


    // ======================================
    // APPROVE APPLICATION
    // ======================================

    async function approveApplication(

      applicationId,

      roleId,

      directionId,

      reviewComment,

      button

    ) {


      if (!roleId) {

        showMessage(
          "Перед схваленням потрібно вибрати роль.",
          "error"
        );

        return;

      }


      const application =
        allApplications.find(

          item =>
            String(
              item.id
            )

            ===

            String(
              applicationId
            )

        );


      if (!application) {

        showMessage(
          "Заявку не знайдено.",
          "error"
        );

        return;

      }


      if (button) {

        button.disabled =
          true;


        button.textContent =
          "СХВАЛЕННЯ...";

      }


      const finalDirectionId =

        directionId === "global"

          ?

          null

          :

          Number(
            directionId
          );


      // ====================================
      // CHECK EXISTING ROLE
      // ====================================

      let roleQuery =
        supabase
          .from(
            "user_roles"
          )
          .select(
            "user_id, role_id, direction_id"
          )
          .eq(
            "user_id",
            application.user_id
          )
          .eq(
            "role_id",
            Number(
              roleId
            )
          );


      if (
        finalDirectionId === null
      ) {

        roleQuery =
          roleQuery.is(
            "direction_id",
            null
          );

      }

      else {

        roleQuery =
          roleQuery.eq(
            "direction_id",
            finalDirectionId
          );

      }


      const {
        data: existingRoles,
        error: existingRoleError
      } =
        await roleQuery;


      if (existingRoleError) {

        showMessage(
          existingRoleError.message,
          "error"
        );


        if (button) {

          button.disabled =
            false;


          button.textContent =
            "🟢 СХВАЛИТИ";

        }


        return;

      }


      // ====================================
      // ADD ROLE
      // ====================================

      if (
        !existingRoles ||
        existingRoles.length === 0
      ) {

        const {
          error: roleError
        } =
          await supabase
            .from(
              "user_roles"
            )
            .insert({

              user_id:
                application.user_id,

              role_id:
                Number(
                  roleId
                ),

              direction_id:
                finalDirectionId

            });


        if (roleError) {

          console.error(
            "Помилка призначення ролі:",
            roleError
          );


          showMessage(
            "Не вдалося призначити роль: " +
            roleError.message,
            "error"
          );


          if (button) {

            button.disabled =
              false;


            button.textContent =
              "🟢 СХВАЛИТИ";

          }


          return;

        }

      }


      // ====================================
      // UPDATE APPLICATION
      // ====================================

      const {
        error: applicationError
      } =
        await supabase
          .from(
            "applications"
          )
          .update({

            status:
              "approved",

            review_comment:
              reviewComment,

            reviewed_at:
              new Date()
                .toISOString()

          })
          .eq(
            "id",
            applicationId
          );


      if (applicationError) {

        showMessage(
          applicationError.message,
          "error"
        );


        if (button) {

          button.disabled =
            false;


          button.textContent =
            "🟢 СХВАЛИТИ";

        }


        return;

      }


      showMessage(
        "🎉 Заявку схвалено. Роль призначено користувачу.",
        "success"
      );


      await loadApplications();

    }


    // ======================================
    // REJECT APPLICATION
    // ======================================

    async function rejectApplication(

      applicationId,

      reviewComment,

      button

    ) {


      if (button) {

        button.disabled =
          true;


        button.textContent =
          "ВІДХИЛЕННЯ...";

      }


      const {
        error
      } =
        await supabase
          .from(
            "applications"
          )
          .update({

            status:
              "rejected",

            review_comment:
              reviewComment,

            reviewed_at:
              new Date()
                .toISOString()

          })
          .eq(
            "id",
            applicationId
          );


      if (error) {

        showMessage(
          error.message,
          "error"
        );


        if (button) {

          button.disabled =
            false;


          button.textContent =
            "🔴 ВІДХИЛИТИ";

        }


        return;

      }


      showMessage(
        "🔴 Заявку відхилено.",
        "success"
      );


      await loadApplications();

    }


    // ======================================
    // ATTACH APPLICATION EVENTS
    // ======================================

    function attachApplicationEvents() {


      // ====================================
      // APPROVE
      // ====================================

      document
        .querySelectorAll(
          ".approve-btn"
        )
        .forEach(

          button => {


            button.addEventListener(

              "click",

              async () => {


                const applicationId =
                  button.dataset.id;


                const roleSelect =
                  document.querySelector(

                    `.application-role-select[data-id="${applicationId}"]`

                  );


                const directionSelect =
                  document.querySelector(

                    `.application-direction-select[data-id="${applicationId}"]`

                  );


                const commentElement =
                  document.querySelector(

                    `.review-comment[data-id="${applicationId}"]`

                  );


                const roleId =
                  roleSelect?.value ||
                  "";


                const directionId =
                  directionSelect?.value ||
                  "global";


                const reviewComment =

                  commentElement
                    ?.value
                    .trim()

                  ||

                  null;


                await approveApplication(

                  applicationId,

                  roleId,

                  directionId,

                  reviewComment,

                  button

                );

              }

            );

          }

        );


      // ====================================
      // REJECT
      // ====================================

      document
        .querySelectorAll(
          ".reject-btn"
        )
        .forEach(

          button => {


            button.addEventListener(

              "click",

              async () => {


                const applicationId =
                  button.dataset.id;


                const commentElement =
                  document.querySelector(

                    `.review-comment[data-id="${applicationId}"]`

                  );


                const reviewComment =

                  commentElement
                    ?.value
                    .trim()

                  ||

                  null;


                await rejectApplication(

                  applicationId,

                  reviewComment,

                  button

                );

              }

            );

          }

        );

    }


    // ======================================
    // FILTER EVENTS
    // ======================================

    statusFilter?.addEventListener(

      "change",

      () => {

        if (isStaff) {

          renderApplications();

        }

      }

    );


    searchInput?.addEventListener(

      "input",

      () => {

        if (isStaff) {

          renderApplications();

        }

      }

    );


    // ======================================
    // START
    // ======================================

    console.log(
      "UA LEGION Applications запущено"
    );


    // CHECK STAFF ACCESS

    isStaff =
      await checkStaffAccess();


    console.log(
      "Staff access:",
      isStaff
    );


    // ====================================
    // ADMIN MODE
    // ====================================

    if (isStaff) {


      if (applicationsKicker) {

        applicationsKicker.textContent =
          "UA LEGION ADMIN";

      }


      if (applicationsTitle) {

        applicationsTitle.textContent =
          "📋 Заявки користувачів";

      }


      if (applicationsSubtitle) {

        applicationsSubtitle.textContent =
          "Перегляд та розгляд заявок до UA LEGION.";

      }


      if (adminApplicationsPanel) {

        adminApplicationsPanel.style.display =
          "block";

      }


      if (userApplicationsInfo) {

        userApplicationsInfo.style.display =
          "none";

      }

    }


    // ====================================
    // USER MODE
    // ====================================

    else {


      if (adminApplicationsPanel) {

        adminApplicationsPanel.style.display =
          "none";

      }


      if (userApplicationsInfo) {

        userApplicationsInfo.style.display =
          "block";

      }

    }


    // ====================================
    // LOAD ADMIN DATA
    // ====================================

    if (isStaff) {

      await loadRoles();

      await loadDirections();

    }


    // ====================================
    // LOAD APPLICATIONS
    // ====================================

    await loadApplications();


  }

);
