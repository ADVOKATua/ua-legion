// ==========================================
// UA LEGION
// ADMIN APPLICATIONS SYSTEM
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


    // ======================================
    // DATA
    // ======================================

    let allApplications =
      [];


    let allRoles =
      [];


    let allDirections =
      [];


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
          .from("user_roles")
          .select(`
            role_id,

            roles (
              code
            )
          `)
          .eq(
            "user_id",
            user.id
          );


      if (error) {

        console.error(
          "Помилка перевірки ролі:",
          error
        );

        return false;

      }


      const staffRoles = [

        "owner",

        "deputy_owner",

        "top_manager",

        "hr_manager"

      ];


      return (
        data || []
      )
      .some(

        item =>

          staffRoles.includes(

            item.roles?.code

          )

      );

    }


    // ======================================
    // ACCESS CHECK
    // ======================================

    const hasStaffAccess =
      await checkStaffAccess();


    if (!hasStaffAccess) {

      showMessage(
        "У вас немає доступу до розділу заявок.",
        "error"
      );


      setTimeout(

        () => {

          window.location.href =
            "profile.html";

        },

        1500

      );


      return;

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


        showMessage(
          "Не вдалося завантажити ролі: " +
          error.message,
          "error"
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
          .from("directions")
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


        showMessage(
          "Не вдалося завантажити напрямки: " +
          error.message,
          "error"
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

          Завантаження заявок...

        </div>

      `;


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
              ascending: false
            }
          );


      if (error) {

        console.error(
          "Помилка завантаження заявок:",
          error
        );


        applicationsList.innerHTML = `

          <div class="applications-empty">

            Не вдалося завантажити заявки.

          </div>

        `;


        return;

      }


      allApplications =
        data || [];


      updateStatistics();

      renderApplications();

    }


    // ======================================
    // STATISTICS
    // ======================================

    function updateStatistics() {

      const newCount =
        allApplications.filter(

          item =>
            item.status === "new"

        ).length;


      const approvedCount =
        allApplications.filter(

          item =>
            item.status === "approved"

        ).length;


      const rejectedCount =
        allApplications.filter(

          item =>
            item.status === "rejected"

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
    // FILTER
    // ======================================

    function getFilteredApplications() {

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

            name.includes(search)

            ||

            discord.includes(search)

            ||

            gameNickname.includes(search);


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
            status,

          className:
            ""

        }

      );

    }


    // ======================================
    // DATE
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
    // DIRECTIONS FORMAT
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
    // FIND DIRECTION
    // FROM APPLICATION
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


        return foundByName?.id ||
          null;

      }


      const direction =
        allDirections.find(

          item =>
            item.slug === slug

        );


      return direction?.id ||
        null;

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
              String(item.id) ===
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
    // RENDER
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


          card.innerHTML = `

            <!-- HEADER -->

            <div
              class="application-card-header"
            >

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


            <!-- INFO -->

            <div
              class="application-grid"
            >

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


            <!-- DIRECTION -->

            <div
              class="application-section"
            >

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


            <!-- ABOUT -->

            <div
              class="application-section"
            >

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


            <!-- SOURCE -->

            <div
              class="application-section"
            >

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


            <!-- DATE -->

            <div
              class="application-date"
            >

              Подано:

              ${formatDate(
                application.created_at
              )}

            </div>


            <!-- ROLE ASSIGNMENT -->

            <div
              class="application-section"
            >

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


            <!-- ADMIN COMMENT -->

            <div
              class="admin-comment-block"
            >

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


            <!-- ACTIONS -->

            <div
              class="application-actions"
            >

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


          applicationsList.appendChild(
            card
          );

        }

      );


      attachApplicationEvents();

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
            String(item.id) ===
            String(applicationId)

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


      // ================================
      // DIRECTION
      // ================================

      const finalDirectionId =

        directionId === "global"

          ?

          null

          :

          Number(
            directionId
          );


      // ================================
      // CHECK EXISTING ROLE
      // ================================

      let roleQuery =
        supabase
          .from("user_roles")
          .select(
            "user_id, role_id, direction_id"
          )
          .eq(
            "user_id",
            application.user_id
          )
          .eq(
            "role_id",
            Number(roleId)
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

        console.error(
          "Помилка перевірки ролі:",
          existingRoleError
        );


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


      // ================================
      // INSERT ROLE
      // ================================

      if (
        !existingRoles ||
        existingRoles.length === 0
      ) {

        const {
          error: roleError
        } =
          await supabase
            .from("user_roles")
            .insert({

              user_id:
                application.user_id,


              role_id:
                Number(roleId),


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


      // ================================
      // APPROVE APPLICATION
      // ================================

      const {
        error: applicationError
      } =
        await supabase
          .from("applications")
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

        console.error(
          "Помилка схвалення заявки:",
          applicationError
        );


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
        "🎉 Заявку схвалено. Роль успішно призначено користувачу.",
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
          .from("applications")
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

        console.error(
          "Помилка відхилення заявки:",
          error
        );


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
        "Заявку відхилено.",
        "success"
      );


      await loadApplications();

    }


    // ======================================
    // EVENTS
    // ======================================

    function attachApplicationEvents() {

      // APPROVE

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


      // REJECT

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

      renderApplications

    );


    searchInput?.addEventListener(

      "input",

      renderApplications

    );


    // ======================================
    // START
    // ======================================

    await loadRoles();

    await loadDirections();

    await loadApplications();

  }

);
