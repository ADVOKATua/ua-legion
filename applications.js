// ==========================================
// UA LEGION
// APPLICATIONS SYSTEM
// applications.js
//
// Архітектура:
//
// - applications — джерело заявок
// - approve_application — схвалення через RPC
// - reject_application — відхилення через RPC
// - user_directions — змінюється тільки через RPC
// - ролі НЕ призначаються через заявку
//
// Доступ:
//
// GLOBAL
//   → applications.view глобально
//   → бачить усі заявки
//
// DIRECTION
//   → applications.view для конкретного напрямку
//   → бачить тільки заявки дозволених напрямків
//
// USER
//   → бачить тільки власні заявки
//
// Важливо:
// approve/reject додатково захищені RPC
// approve_application / reject_application.
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


    // ======================================
    // ACCESS MODE
    //
    // user
    // direction
    // global
    // ======================================

    let accessMode =
      "user";


    // ======================================
    // GLOBAL PERMISSIONS
    // ======================================

    let globalPermissions = {

      view: false,

      review: false,

      approve: false,

      reject: false

    };


    // ======================================
    // DIRECTION PERMISSIONS
    //
    // Map:
    //
    // direction_id => {
    //   view,
    //   review,
    //   approve,
    //   reject,
    //   direction
    // }
    // ======================================

    const directionPermissions =
      new Map();


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
          direction => {

            const directionValues = [

              direction.slug,

              direction.code,

              direction.name

            ];


            return directionValues.some(
              value =>
                normalizeDirection(
                  value
                ) === slug
            );

          }
        )
        || null
      );

    }


    // ======================================
    // GET DIRECTION BY ID
    // ======================================

    function getDirectionById(
      directionId
    ) {

      if (
        directionId === null ||
        directionId === undefined
      ) {

        return null;

      }


      return (
        allDirections.find(
          direction =>
            Number(direction.id) ===
            Number(directionId)
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
    // CHECK PERMISSION
    // ======================================

    async function checkPermission(
      permissionCode,
      directionId = null,
      globalOnly = false
    ) {

      const functionName =
        globalOnly
          ? "has_global_permission"
          : "has_permission";


      const args =
        globalOnly
          ? {
              p_permission_code:
                permissionCode
            }
          : {
              p_permission_code:
                permissionCode,

              p_direction_id:
                directionId
            };


      const {
        data,
        error
      } =
        await supabase.rpc(
          functionName,
          args
        );


      if (error) {

        console.error(
          `UA LEGION: помилка permission ${permissionCode}:`,
          error
        );

        return false;

      }


      return data === true;

    }


    // ======================================
    // CHECK APPLICATION ACCESS
    // ======================================

    async function checkApplicationAccess() {

      // ------------------------------------
      // GLOBAL VIEW
      // ------------------------------------

      const globalView =
        await checkPermission(
          "applications.view",
          null,
          true
        );


      // ------------------------------------
      // GLOBAL ACCESS
      // ------------------------------------

      if (globalView) {

        const [
          globalReview,
          globalApprove,
          globalReject
        ] =
          await Promise.all([

            checkPermission(
              "applications.review",
              null,
              true
            ),

            checkPermission(
              "applications.approve",
              null,
              true
            ),

            checkPermission(
              "applications.reject",
              null,
              true
            )

          ]);


        globalPermissions = {

          view:
            true,

          review:
            globalReview,

          approve:
            globalApprove,

          reject:
            globalReject

        };


        accessMode =
          "global";


        console.log(
          "UA LEGION: глобальний доступ до заявок."
        );


        return;

      }


      // ------------------------------------
      // DIRECTION ACCESS
      // ------------------------------------

      directionPermissions.clear();


      const activeDirections =
        allDirections.filter(
          direction =>
            direction.is_active !== false
        );


      for (
        const direction
        of activeDirections
      ) {

        const directionId =
          Number(
            direction.id
          );


        const view =
          await checkPermission(
            "applications.view",
            directionId
          );


        if (!view) {

          continue;

        }


        const [
          review,
          approve,
          reject
        ] =
          await Promise.all([

            checkPermission(
              "applications.review",
              directionId
            ),

            checkPermission(
              "applications.approve",
              directionId
            ),

            checkPermission(
              "applications.reject",
              directionId
            )

          ]);


        directionPermissions.set(
          directionId,
          {

            view,

            review,

            approve,

            reject,

            direction

          }
        );

      }


      // ------------------------------------
      // DIRECTION MODE
      // ------------------------------------

      if (
        directionPermissions.size > 0
      ) {

        accessMode =
          "direction";


        console.log(
          "UA LEGION: напрямковий доступ до заявок.",
          Array.from(
            directionPermissions.values()
          )
        );


        return;

      }


      // ------------------------------------
      // NORMAL USER
      // ------------------------------------

      accessMode =
        "user";


      console.log(
        "UA LEGION: звичайний режим заявок."
      );

    }


    // ======================================
    // GET APPLICATION ACCESS
    // ======================================

    function getApplicationAccess(
      application
    ) {

      // ------------------------------------
      // GLOBAL
      // ------------------------------------

      if (
        accessMode === "global"
      ) {

        return {

          view:
            globalPermissions.view,

          review:
            globalPermissions.review,

          approve:
            globalPermissions.approve,

          reject:
            globalPermissions.reject

        };

      }


      // ------------------------------------
      // USER
      // ------------------------------------

      if (
        accessMode === "user"
      ) {

        return {

          view:
            String(
              application?.user_id
            ) ===
            String(
              user.id
            ),

          review:
            false,

          approve:
            false,

          reject:
            false

        };

      }


      // ------------------------------------
      // DIRECTION
      // ------------------------------------

      const direction =
        getDirectionRecord(
          application
        );


      if (!direction) {

        return {

          view: false,

          review: false,

          approve: false,

          reject: false

        };

      }


      const permissions =
        directionPermissions.get(
          Number(direction.id)
        );


      if (!permissions) {

        return {

          view: false,

          review: false,

          approve: false,

          reject: false

        };

      }


      return {

        view:
          permissions.view,

        review:
          permissions.review,

        approve:
          permissions.approve,

        reject:
          permissions.reject

      };

    }


    // ======================================
    // CAN MANAGE APPLICATION
    // ======================================

    function canManageApplication(
      application
    ) {

      const access =
        getApplicationAccess(
          application
        );


      return (
        access.review ||
        access.approve ||
        access.reject
      );

    }


    // ======================================
    // GET APPLICATION QUERY VALUES
    //
    // Для direction mode враховуємо
    // slug + code + name.
    // ======================================

    function getAllowedApplicationDirections() {

      const values = [];


      directionPermissions.forEach(
        permission => {

          const direction =
            permission.direction;


          if (
            direction.slug
          ) {

            values.push(
              direction.slug
            );

          }


          if (
            direction.code
          ) {

            values.push(
              direction.code
            );

          }


          if (
            direction.name
          ) {

            values.push(
              direction.name
            );

          }

        }
      );


      return [
        ...new Set(
          values.filter(Boolean)
        )
      ];

    }


    // ======================================
    // APPLICATION BELONGS TO ALLOWED
    // DIRECTION
    // ======================================

    function applicationBelongsToAllowedDirection(
      application
    ) {

      const directionRecord =
        getDirectionRecord(
          application
        );


      if (!directionRecord) {

        return false;

      }


      return directionPermissions.has(
        Number(
          directionRecord.id
        )
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
      // NORMAL USER
      // ====================================

      if (
        accessMode === "user"
      ) {

        query =
          query.eq(
            "user_id",
            user.id
          );

      }


      // ====================================
      // DIRECTION STAFF
      // ====================================

      if (
        accessMode === "direction"
      ) {

        const allowedDirections =
          getAllowedApplicationDirections();


        if (
          allowedDirections.length === 0
        ) {

          allApplications = [];

          renderApplications();

          return;

        }


        query =
          query.in(
            "direction",
            allowedDirections
          );

      }


      // ====================================
      // GLOBAL
      //
      // Без direction filter.
      // ====================================


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


      // ====================================
      // ADDITIONAL CLIENT FILTER
      //
      // Не покладаємося лише на значення
      // direction у applications.
      // ====================================

      if (
        accessMode === "direction"
      ) {

        allApplications =
          allApplications.filter(
            application =>
              applicationBelongsToAllowedDirection(
                application
              )
          );

      }


      // ====================================
      // USER WITHOUT APPLICATIONS
      // ====================================

      if (
        accessMode === "user" &&
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


      // ====================================
      // STATISTICS
      // ====================================

      if (
        accessMode !== "user"
      ) {

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

      if (
        accessMode === "user"
      ) {

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

          // --------------------------------
          // ACCESS FOR THIS APPLICATION
          // --------------------------------

          const applicationAccess =
            getApplicationAccess(
              application
            );


          if (
            !applicationAccess.view
          ) {

            return;

          }


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
            accessMode !== "user" &&
            pending &&
            canManageApplication(
              application
            )
          ) {

            // --------------------------------
            // REVIEW COMMENT
            // --------------------------------

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


            // --------------------------------
            // ETS2 CLASS
            //
            // Потрібен тільки тому,
            // хто має approve.
            // --------------------------------

            if (
              direction === "ets2" &&
              applicationAccess.approve
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


            // --------------------------------
            // ACTION BUTTONS
            // --------------------------------

            let actionButtons =
              "";


            if (
              applicationAccess.approve
            ) {

              actionButtons += `

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

              `;

            }


            if (
              applicationAccess.reject
            ) {

              actionButtons += `

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

              `;

            }


            if (
              actionButtons
            ) {

              html += `

                <div class="application-actions">

                  ${actionButtons}

                </div>

              `;

            }

          }


          // ==================================
          // USER WAITING
          // ==================================

          if (
            accessMode === "user" &&
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


      // ====================================
      // EVENTS
      // ====================================

      if (
        accessMode !== "user"
      ) {

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


      // ------------------------------------
      // CHECK ACCESS
      // ------------------------------------

      const applicationAccess =
        getApplicationAccess(
          application
        );


      if (
        !applicationAccess.approve
      ) {

        showMessage(
          "У вас немає права схвалювати цю заявку.",
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


      // ------------------------------------
      // ETS2 DRIVER CLASS
      // ------------------------------------

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


      // ------------------------------------
      // REVIEW COMMENT
      // ------------------------------------

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


      // ------------------------------------
      // CHECK ACCESS
      // ------------------------------------

      const applicationAccess =
        getApplicationAccess(
          application
        );


      if (
        !applicationAccess.reject
      ) {

        showMessage(
          "У вас немає права відхиляти цю заявку.",
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


      // ------------------------------------
      // REVIEW COMMENT
      // ------------------------------------

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

        if (
          accessMode !== "user"
        ) {

          renderApplications();

        }

      }
    );


    searchInput?.addEventListener(
      "input",

      () => {

        if (
          accessMode !== "user"
        ) {

          renderApplications();

        }

      }
    );


    // ======================================
    // START
    // ======================================

    // --------------------------------------
    // 1. Завантажуємо напрямки
    // --------------------------------------

    await loadDirections();


    // --------------------------------------
    // 2. Визначаємо RBAC доступ
    // --------------------------------------

    await checkApplicationAccess();


    // ======================================
    // GLOBAL MODE
    // ======================================

    if (
      accessMode === "global"
    ) {

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
    // DIRECTION MODE
    // ======================================

    else if (
      accessMode === "direction"
    ) {

      if (applicationsKicker) {

        applicationsKicker.textContent =
          "UA LEGION DIRECTION";

      }


      if (applicationsTitle) {

        applicationsTitle.textContent =
          "📋 Заявки напрямків";

      }


      if (applicationsSubtitle) {

        applicationsSubtitle.textContent =
          "Заявки напрямків, для яких у вас є відповідні права.";

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
    // LOAD APPLICATIONS
    // ======================================

    await loadApplications();

  }

);
