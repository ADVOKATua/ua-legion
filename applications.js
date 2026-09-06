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
    // ROLE CHECK
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


      const staffRoles =
        [

          "owner",

          "deputy_owner",

          "top_manager",

          "hr_manager"

        ];


      const hasAccess =
        data.some(

          item =>

            staffRoles.includes(

              item.roles?.code

            )

        );


      return hasAccess;

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


      document.getElementById(
        "newApplicationsCount"
      ).textContent =
        newCount;


      document.getElementById(
        "approvedApplicationsCount"
      ).textContent =
        approvedCount;


      document.getElementById(
        "rejectedApplicationsCount"
      ).textContent =
        rejectedCount;

    }


    // ======================================
    // FILTER APPLICATIONS
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


          // STATUS

          const statusMatch =
            status === "all"

            ||

            application.status ===
            status;


          // SEARCH

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
            statusMatch &&
            searchMatch
          );

        }

      );

    }


    // ======================================
    // STATUS LABEL
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
    // DATE FORMAT
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
    // DIRECTIONS
    // ======================================

    function formatDirections(
      directions
    ) {

      if (
        !directions
      ) {

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
    // RENDER
    // ======================================

    function renderApplications() {


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


          card.innerHTML = `


            <!-- HEADER -->

            <div
              class="application-card-header"
            >


              <div>


                <h2>

                  👤
                  ${application.name || "Без імені"}

                </h2>


                <p>

                  🎮
                  ${application.game_nickname || "-"}

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

                  ${application.age || "-"}

                </strong>

              </div>



              <div>

                <span>

                  💬 Discord

                </span>


                <strong>

                  ${application.discord_nickname || "-"}

                </strong>

              </div>



              <div>

                <span>

                  🆔 Discord ID

                </span>


                <strong>

                  ${application.discord_id || "-"}

                </strong>

              </div>



              <div>

                <span>

                  🎮 Steam

                </span>


                <strong>

                  ${application.steam_id || "-"}

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

                ${formatDirections(
                  application.directions
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

                ${application.about || "Не вказано"}

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

                ${application.source || "-"}

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
              >${application.review_comment || ""}</textarea>


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

              >

                🟢 СХВАЛИТИ

              </button>



              <button

                class="
                  application-btn
                  reject-btn
                "

                data-id="${application.id}"

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


                await updateApplicationStatus(

                  applicationId,

                  "approved",

                  reviewComment

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


                await updateApplicationStatus(

                  applicationId,

                  "rejected",

                  reviewComment

                );

              }

            );

          }

        );

    }


    // ======================================
    // UPDATE STATUS
    // ======================================

    async function updateApplicationStatus(

      applicationId,

      status,

      reviewComment

    ) {


      const {
        error
      } =
        await supabase
          .from("applications")
          .update({

            status:
              status,


            review_comment:
              reviewComment,


            reviewed_at:
              new Date()
                .toISOString(),

          })
          .eq(
            "id",
            applicationId
          );


      if (error) {

        console.error(
          "Помилка оновлення заявки:",
          error
        );


        showMessage(

          error.message,

          "error"

        );


        return;

      }


      showMessage(

        status === "approved"

          ?

          "Заявку схвалено."

          :

          "Заявку відхилено.",

        "success"

      );


      await loadApplications();

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

    await loadApplications();


  }

);
