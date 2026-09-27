// ==========================================
// UA LEGION
// APPLICATIONS SYSTEM
// applications.js
//
// Нова архітектура:
// - applications — джерело заявок
// - approve_application — схвалення через RPC
// - reject_application — відхилення через RPC
// - user_directions — змінюється тільки через RPC
// - ролі НЕ призначаються через заявку
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
        "UA LEGION: Supabase не підключений."
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
    // DOM
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

    let allApplications = [];

    let allDirections = [];

    let isStaff = false;


    // ======================================
    // ETS2 DRIVER CLASSES
    // ======================================

    const ets2DriverClasses = [

      {
        code: "A",
        name: "Клас A"
      },

      {
        code: "B",
        name: "Клас B"
      },

      {
        code: "C",
        name: "Клас C"
      },

      {
        code: "D",
        name: "Клас D"
      },

      {
        code: "E",
        name: "Клас E"
      }

    ];


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
    // NORMALIZE STATUS
    // ======================================

    function normalizeStatus(
      status
    ) {

      const value =
        String(
          status || ""
        )
          .trim()
          .toLowerCase();


      if (
        value === "new" ||
        value === "pending"
      ) {

        return "pending";

      }


      if (
        value === "approved"
      ) {

        return "approved";

      }


      if (
        value === "rejected"
      ) {

        return "rejected";

      }


      return value;

    }


    // ======================================
    // IS PENDING
    // ======================================

    function isPendingApplication(
      application
    ) {

      return (
        normalizeStatus(
          application?.status
        ) === "pending"
      );

    }


    // ======================================
    // STAFF ACCESS
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
          "UA LEGION: помилка перевірки адміністрації:",
          error
        );

        return false;

      }


      return data === true;

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
            "id, code, slug, name, is_active"
          )
          .order(
            "id",
            {
              ascending: true
            }
          );


      if (error) {

        console.error(
          "UA LEGION: помилка завантаження напрямків:",
          error
        );

        return;

      }


      allDirections =
        data || [];

    }


    // ======================================
    // NORMALIZE DIRECTION
    // ======================================

    function normalizeDirection(
      value
    ) {

      if (!value) {
        return null;
      }


      const normalized =
        String(value)
          .trim()
          .toLowerCase();


      if (
        normalized === "ets2" ||
        normalized === "ets2/truckersmp" ||
        normalized === "ets2 / truckersmp"
      ) {

        return "ets2";

      }


      if (
        normalized === "wot" ||
        normalized === "world of tanks"
      ) {

        return "wot";

      }


      if (
        normalized === "dota" ||
        normalized === "dota2" ||
        normalized === "dota 2"
      ) {

        return "dota2";

      }


      if (
        normalized === "wow" ||
        normalized === "world of warcraft"
      ) {

        return "wow";

      }


      return normalized;

    }


    // ======================================
    // GET APPLICATION DIRECTION
    // ======================================

    function getApplicationDirection(
      application
    ) {

      if (
        application?.direction
      ) {

        return normalizeDirection(
          application.direction
        );

      }


      if (
        Array.isArray(
          application?.directions
        )
      ) {

        return normalizeDirection(
          application.directions[0]
        );

      }


      if (
        typeof application?.directions ===
        "string"
      ) {

        try {

          const parsed =
            JSON.parse(
              application.directions
            );


          if (
            Array.isArray(parsed)
          ) {

            return normalizeDirection(
              parsed[0]
            );

          }


          return normalizeDirection(
            parsed
          );

        }

        catch {

          return normalizeDirection(
            application.directions
          );

        }

      }


      return null;

    }


    // ======================================
    // GET DIRECTION RECORD
    // ======================================

    function getDirectionRecord(
      application
    ) {

      const slug =
        getApplicationDirection(
          application
        );


      if (!slug) {
        return null;
      }


      return (
        allDirections.find(
          direction =>
            normalizeDirection(
              direction.slug ||
              direction.code ||
              direction.name
            ) === slug
        )
        || null
      );

    }


    // ======================================
    // DIRECTION NAME
    // ======================================

    function getDirectionName(
      application
    ) {

      const direction =
        getDirectionRecord(
          application
        );


      if (
        direction?.name
      ) {

        return direction.name;

      }


      const slug =
        getApplicationDirection(
          application
        );


      const names = {

        ets2:
          "ETS2 / TruckersMP",

        wot:
          "World of Tanks",

        dota2:
          "Dota 2",

        wow:
          "World of Warcraft"

      };


      return (
        names[slug] ||
        slug ||
        "Не визначено"
      );

    }


    // ======================================
    // GAME NICKNAME
    // ======================================

    function getGameNickname(
      application
    ) {

      const direction =
        getApplicationDirection(
          application
        );


      if (
        direction === "ets2"
      ) {

        return (
          application.truckersmp_nickname ||
          application.truckersmp_nick ||
          application.game_nickname ||
          application.game_nick ||
          "-"
        );

      }


      if (
        direction === "wot"
      ) {

        return (
          application.wot_nickname ||
          application.game_nickname ||
          application.game_nick ||
          "-"
        );

      }


      if (
        direction === "dota2"
      ) {

        return (
          application.dota_nickname ||
          application.game_nickname ||
          application.game_nick ||
          "-"
        );

      }


      if (
        direction === "wow"
      ) {

        return (
          application.wow_character ||
          application.game_nickname ||
          application.game_nick ||
          "-"
        );

      }


      return (
        application.game_nickname ||
        application.game_nick ||
        application.truckersmp_nickname ||
        application.truckersmp_nick ||
        application.wot_nickname ||
        application.dota_nickname ||
        application.wow_character ||
        "-"
      );

    }


    // ======================================
    // DISCORD
    // ======================================

    function getDiscordNickname(
      application
    ) {

      return (
        application.discord_nickname ||
        application.discord_nick ||
        "-"
      );

    }


    // ======================================
    // STATUS LABEL
    // ======================================

    function getStatusLabel(
      status
    ) {

      const normalized =
        normalizeStatus(
          status
        );


      const statuses = {

        pending: {

          label:
            "🟡 На розгляді",

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
        statuses[normalized]
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


      const date =
        new Date(
          dateString
        );


      if (
        Number.isNaN(
          date.getTime()
        )
      ) {

        return "-";

      }


      return date.toLocaleString(
        "uk-UA"
      );

    }


    // ======================================
    // FORMAT VALUE
    // ======================================

    function displayValue(
      value
    ) {

      if (
        value === null ||
        value === undefined ||
        String(value).trim() === ""
      ) {

        return "-";

      }


      return escapeHtml(
        value
      );

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
          .from("applications")
          .select("*")
          .order(
            "created_at",
            {
              ascending: false
            }
          );


      // ====================================
      // USER:
      // ONLY OWN APPLICATIONS
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
          "UA LEGION: помилка завантаження заявок:",
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


      if (
        !isStaff &&
        allApplications.length === 0
      ) {

        applicationsList.innerHTML =
          "";


        if (
          createApplicationBlock
        ) {

          createApplicationBlock.style.display =
            "block";

        }


        return;

      }


      if (
        createApplicationBlock
      ) {

        createApplicationBlock.style.display =
          "none";

      }


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
          application =>
            isPendingApplication(
              application
            )
        ).length;


      const approvedCount =
        allApplications.filter(
          application =>
            normalizeStatus(
              application.status
            ) === "approved"
        ).length;


      const rejectedCount =
        allApplications.filter(
          application =>
            normalizeStatus(
              application.status
            ) === "rejected"
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

          const applicationStatus =
            normalizeStatus(
              application.status
            );


          let statusMatch =
            true;


          if (
            status === "new"
          ) {

            statusMatch =
              applicationStatus ===
              "pending";

          }

          else if (
            status !== "all"
          ) {

            statusMatch =
              applicationStatus ===
              status;

          }


          const name =
            String(
              application.name ||
              ""
            )
              .toLowerCase();


          const discord =
            String(
              getDiscordNickname(
                application
              )
            )
              .toLowerCase();


          const gameNickname =
            String(
              getGameNickname(
                application
              )
            )
              .toLowerCase();


          const direction =
            String(
              getDirectionName(
                application
              )
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
            )
            ||
            direction.includes(
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
    // ETS2 DRIVER CLASS OPTIONS
    // ======================================

    function createDriverClassOptions(
      selectedClass = ""
    ) {

      let html = `

        <option value="">

          Оберіть клас водія...

        </option>

      `;


      ets2DriverClasses.forEach(
        driverClass => {

          const selected =
            String(
              selectedClass
            ).toUpperCase() ===
            driverClass.code
              ? "selected"
              : "";


          html += `

            <option
              value="${driverClass.code}"
              ${selected}
            >

              ${driverClass.name}

            </option>

          `;

        }
      );


      return html;

    }


    // ======================================
    // RENDER APPLICATION DATA
    // ======================================

    function renderApplicationData(
      application
    ) {

      const direction =
        getApplicationDirection(
          application
        );


      const directionName =
        getDirectionName(
          application
        );


      let html = `

        <div class="application-grid">

          <div>

            <span>👤 Ім'я</span>

            <strong>
              ${displayValue(
                application.name
              )}
            </strong>

          </div>


          <div>

            <span>🎂 Вік</span>

            <strong>
              ${displayValue(
                application.age
              )}
            </strong>

          </div>


          <div>

            <span>💬 Discord</span>

            <strong>
              ${displayValue(
                getDiscordNickname(
                  application
                )
              )}
            </strong>

          </div>


          <div>

            <span>🎮 Ігровий нік</span>

            <strong>
              ${displayValue(
                getGameNickname(
                  application
                )
              )}
            </strong>

          </div>


          <div>

            <span>📍 Напрямок</span>

            <strong>
              ${displayValue(
                directionName
              )}
            </strong>

          </div>


          <div>

            <span>📅 Подано</span>

            <strong>
              ${displayValue(
                formatDate(
                  application.created_at
                )
              )}
            </strong>

          </div>

        </div>

      `;


      // ====================================
      // ETS2
      // ====================================

      if (
        direction === "ets2"
      ) {

        html += `

          <div class="application-section">

            <span>
              🚛 ETS2 / TruckersMP
            </span>

            <div class="application-grid">

              <div>

                <span>TruckersMP Nickname</span>

                <strong>
                  ${displayValue(
                    application.truckersmp_nickname ||
                    application.truckersmp_nick
                  )}
                </strong>

              </div>


              <div>

                <span>TruckersMP ID</span>

                <strong>
                  ${displayValue(
                    application.truckersmp_id
                  )}
                </strong>

              </div>


              <div>

                <span>TruckersHub Username</span>

                <strong>
                  ${displayValue(
                    application.truckershub_username
                  )}
                </strong>

              </div>


              <div>

                <span>TruckersHub ID</span>

                <strong>
                  ${displayValue(
                    application.truckershub_id
                  )}
                </strong>

              </div>

            </div>

          </div>

        `;

      }


      // ====================================
      // WORLD OF TANKS
      // ====================================

      if (
        direction === "wot"
      ) {

        html += `

          <div class="application-section">

            <span>
              🪖 World of Tanks
            </span>

            <div class="application-grid">

              <div>

                <span>Нікнейм</span>

                <strong>
                  ${displayValue(
                    application.wot_nickname
                  )}
                </strong>

              </div>


              <div>

                <span>Wargaming ID</span>

                <strong>
                  ${displayValue(
                    application.wargaming_id
                  )}
                </strong>

              </div>


              <div>

                <span>Регіон</span>

                <strong>
                  ${displayValue(
                    application.wot_region
                  )}
                </strong>

              </div>

            </div>

          </div>

        `;

      }


      // ====================================
      // DOTA 2
      // ====================================

      if (
        direction === "dota2"
      ) {

        html += `

          <div class="application-section">

            <span>
              ⚔️ Dota 2
            </span>

            <div class="application-grid">

              <div>

                <span>Нікнейм</span>

                <strong>
                  ${displayValue(
                    application.dota_nickname
                  )}
                </strong>

              </div>


              <div>

                <span>Friend ID</span>

                <strong>
                  ${displayValue(
                    application.dota_friend_id
                  )}
                </strong>

              </div>


              <div>

                <span>Ранг</span>

                <strong>
                  ${displayValue(
                    application.dota_rank
                  )}
                </strong>

              </div>

            </div>

          </div>

        `;

      }


      // ====================================
      // WORLD OF WARCRAFT
      // ====================================

      if (
        direction === "wow"
      ) {

        html += `

          <div class="application-section">

            <span>
              🐉 World of Warcraft
            </span>

            <div class="application-grid">

              <div>

                <span>BattleTag</span>

                <strong>
                  ${displayValue(
                    application.battletag ||
                    application.battle_tag
                  )}
                </strong>

              </div>


              <div>

                <span>Персонаж</span>

                <strong>
                  ${displayValue(
                    application.wow_character
                  )}
                </strong>

              </div>


              <div>

                <span>Realm</span>

                <strong>
                  ${displayValue(
                    application.wow_realm
                  )}
                </strong>

              </div>


              <div>

                <span>Фракція</span>

                <strong>
                  ${displayValue(
                    application.wow_faction
                  )}
                </strong>

              </div>


              <div>

                <span>Клас</span>

                <strong>
                  ${displayValue(
                    application.wow_class
                  )}
                </strong>

              </div>

            </div>

          </div>

        `;

      }


      // ====================================
      // STEAM
      // ====================================

      if (
        application.steam_id
      ) {

        html += `

          <div class="application-section">

            <span>
              🎮 Steam ID
            </span>

            <strong>
              ${displayValue(
                application.steam_id
              )}
            </strong>

          </div>

        `;

      }


      // ====================================
      // ABOUT
      // ====================================

      if (
        application.about
      ) {

        html += `

          <div class="application-section">

            <span>
              📝 Про себе
            </span>

            <p>
              ${displayValue(
                application.about
              )}
            </p>

          </div>

        `;

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

            📭 Заявок за вибраними параметрами
            не знайдено.

          </div>

        `;

        return;

      }


      applications.forEach(
        application => {

          const status =
            getStatusLabel(
              application.status
            );


          const pending =
            isPendingApplication(
              application
            );


          const direction =
            getApplicationDirection(
              application
            );


          const card =
            document.createElement(
              "article"
            );


          card.className =
            "application-card";


          // ==================================
          // HEADER
          // ==================================

          let html = `

            <div class="application-card-header">

              <div>

                <h2>

                  📄 Заявка #${escapeHtml(
                    application.id
                  )}

                </h2>

                <p>

                  🎮 ${displayValue(
                    getGameNickname(
                      application
                    )
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

          `;


          // ==================================
          // APPLICATION DATA
          // ==================================

          html +=
            renderApplicationData(
              application
            );


          // ==================================
          // REVIEW INFORMATION
          // ==================================

          if (
            application.reviewed_at
          ) {

            html += `

              <div class="application-date">

                🕒 Розглянуто:

                ${displayValue(
                  formatDate(
                    application.reviewed_at
                  )
                )}

              </div>

            `;

          }


          if (
            application.review_comment
          ) {

            html += `

              <div class="admin-comment-block">

                <label>

                  💬 Коментар адміністрації

                </label>

                <p>

                  ${displayValue(
                    application.review_comment
                  )}

                </p>

              </div>

            `;

          }


          // ==================================
          // STAFF REVIEW PANEL
          // ==================================

          if (
            isStaff &&
            pending
          ) {

            html += `

              <div class="admin-comment-block">

                <label>

                  💬 Коментар до рішення

                </label>


                <textarea
                  class="review-comment"
                  data-id="${escapeHtml(
                    application.id
                  )}"
                  placeholder="Введіть коментар адміністрації..."
                ></textarea>

              </div>

            `;


            // =================================
            // ETS2 CLASS
            // =================================

            if (
              direction === "ets2"
            ) {

              html += `

                <div class="admin-comment-block">

                  <label>

                    🚛 Клас водія ETS2

                  </label>


                  <select
                    class="application-driver-class-select"
                    data-id="${escapeHtml(
                      application.id
                    )}"
                  >

                    ${createDriverClassOptions()}

                  </select>

                </div>

              `;

            }


            // =================================
            // ACTIONS
            // =================================

            html += `

              <div class="application-actions">

                <button
                  type="button"
                  class="
                    application-btn
                    approve-btn
                  "
                  data-id="${escapeHtml(
                    application.id
                  )}"
                >

                  🟢 СХВАЛИТИ

                </button>


                <button
                  type="button"
                  class="
                    application-btn
                    reject-btn
                  "
                  data-id="${escapeHtml(
                    application.id
                  )}"
                >

                  🔴 ВІДХИЛИТИ

                </button>

              </div>

            `;

          }


          // ==================================
          // USER WAITING
          // ==================================

          if (
            !isStaff &&
            pending
          ) {

            html += `

              <div class="application-section">

                <p>

                  ⏳ Ваша заявка очікує
                  на розгляд адміністрації.

                </p>

              </div>

            `;

          }


          card.innerHTML =
            html;


          applicationsList.appendChild(
            card
          );

        }
      );


      if (isStaff) {

        attachApplicationEvents();

      }

    }


    // ======================================
    // GET REVIEW COMMENT
    // ======================================

    function getReviewComment(
      applicationId
    ) {

      const element =
        document.querySelector(
          `.review-comment[data-id="${applicationId}"]`
        );


      if (!element) {
        return null;
      }


      const value =
        element.value.trim();


      return value || null;

    }


    // ======================================
    // GET DRIVER CLASS
    // ======================================

    function getDriverClass(
      applicationId
    ) {

      const element =
        document.querySelector(
          `.application-driver-class-select[data-id="${applicationId}"]`
        );


      if (!element) {
        return null;
      }


      const value =
        element.value.trim();


      return value || null;

    }


    // ======================================
    // RPC ERROR MESSAGE
    // ======================================

    function getRpcErrorMessage(
      error
    ) {

      if (!error) {

        return "Невідома помилка.";

      }


      const message =
        String(
          error.message ||
          error.details ||
          error.hint ||
          ""
        );


      const messages = {

        AUTH_REQUIRED:
          "Потрібна авторизація.",

        INVALID_REVIEWER:
          "Некоректний користувач, який розглядає заявку.",

        APPLICATION_NOT_FOUND:
          "Заявку не знайдено.",

        APPLICATION_USER_NOT_FOUND:
          "У заявки не визначено користувача.",

        APPLICATION_IS_NOT_PENDING:
          "Ця заявка вже була розглянута.",

        APPLICATION_DIRECTION_NOT_FOUND:
          "Не вдалося визначити напрямок заявки.",

        FORBIDDEN_APPLICATION_APPROVE:
          "У вас немає права схвалювати заявки цього напрямку.",

        FORBIDDEN_APPLICATION_REJECT:
          "У вас немає права відхиляти заявки цього напрямку.",

        ETS2_DRIVER_CLASS_REQUIRED:
          "Для ETS2 потрібно обрати клас водія."

      };


      for (
        const code
        of Object.keys(messages)
      ) {

        if (
          message.includes(code)
        ) {

          return messages[code];

        }

      }


      return message ||
        "Сталася помилка під час обробки заявки.";

    }


    // ======================================
    // APPROVE APPLICATION
    // ======================================

    async function approveApplication(
      applicationId,
      button
    ) {

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


      if (
        !isPendingApplication(
          application
        )
      ) {

        showMessage(
          "Ця заявка вже була розглянута.",
          "error"
        );

        return;

      }


      const direction =
        getApplicationDirection(
          application
        );


      let driverClass =
        null;


      if (
        direction === "ets2"
      ) {

        driverClass =
          getDriverClass(
            applicationId
          );


        if (!driverClass) {

          showMessage(
            "Для ETS2 потрібно обрати клас водія.",
            "error"
          );

          return;

        }

      }


      const reviewComment =
        getReviewComment(
          applicationId
        );


      if (button) {

        button.disabled =
          true;

        button.textContent =
          "СХВАЛЕННЯ...";

      }


      // ====================================
      // RPC
      // ====================================

      const {
        data,
        error
      } =
        await supabase
          .rpc(
            "approve_application",
            {

              p_application_id:
                Number(
                  applicationId
                ),

              p_reviewer_id:
                user.id,

              p_driver_class:
                driverClass,

              p_review_comment:
                reviewComment

            }
          );


      if (error) {

        console.error(
          "UA LEGION: approve_application error:",
          error
        );


        showMessage(
          getRpcErrorMessage(
            error
          ),
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


      console.log(
        "UA LEGION: заявка схвалена:",
        data
      );


      if (
        direction === "ets2"
      ) {

        showMessage(
          `🎉 Заявку схвалено. Користувача додано до напрямку "${getDirectionName(
            application
          )}". Клас ETS2: ${driverClass}.`,
          "success"
        );

      }

      else {

        showMessage(
          `🎉 Заявку схвалено. Користувача додано до напрямку "${getDirectionName(
            application
          )}".`,
          "success"
        );

      }


      await loadApplications();

    }


    // ======================================
    // REJECT APPLICATION
    // ======================================

    async function rejectApplication(
      applicationId,
      button
    ) {

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


      if (
        !isPendingApplication(
          application
        )
      ) {

        showMessage(
          "Ця заявка вже була розглянута.",
          "error"
        );

        return;

      }


      const reviewComment =
        getReviewComment(
          applicationId
        );


      if (button) {

        button.disabled =
          true;

        button.textContent =
          "ВІДХИЛЕННЯ...";

      }


      // ====================================
      // RPC
      // ====================================

      const {
        data,
        error
      } =
        await supabase
          .rpc(
            "reject_application",
            {

              p_application_id:
                Number(
                  applicationId
                ),

              p_reviewer_id:
                user.id,

              p_review_comment:
                reviewComment

            }
          );


      if (error) {

        console.error(
          "UA LEGION: reject_application error:",
          error
        );


        showMessage(
          getRpcErrorMessage(
            error
          ),
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


      console.log(
        "UA LEGION: заявка відхилена:",
        data
      );


      showMessage(
        "🔴 Заявку відхилено.",
        "success"
      );


      await loadApplications();

    }


    // ======================================
    // EVENTS
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

                await approveApplication(
                  button.dataset.id,
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

                await rejectApplication(
                  button.dataset.id,
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

    isStaff =
      await checkStaffAccess();


    // ======================================
    // STAFF MODE
    // ======================================

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


    // ======================================
    // USER MODE
    // ======================================

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


    // ======================================
    // LOAD DIRECTIONS
    // ======================================

    await loadDirections();


    // ======================================
    // LOAD APPLICATIONS
    // ======================================

    await loadApplications();

  }

);
