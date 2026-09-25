// ==========================================
// UA LEGION — SUPPORT
// support.js
// ==========================================

document.addEventListener(
  "DOMContentLoaded",
  async function () {

    const supabase =
      window.supabaseClient;


    if (!supabase) {

      console.error(
        "Supabase не підключений"
      );

      return;

    }


    // ======================================
    // STATE
    // ======================================

    let currentUser = null;

    let isStaff = false;

    let directions = [];

    let categories = [];

    let dataFields = [];

    let activeDirectionData = {};

    let myTickets = [];

    let staffTickets = [];

    let currentTicket = null;

    let profileCurrentValues = {};

    let memberSummaryCache = {};


    // ======================================
    // ELEMENT HELPER
    // ======================================

    const el =
      id =>
        document.getElementById(id);


    // ======================================
    // MAIN ELEMENTS
    // ======================================

    const supportMessage =
      el("supportMessage");

    const ticketForm =
      el("ticketForm");

    const ticketDirection =
      el("ticketDirection");

    const ticketCategory =
      el("ticketCategory");

    const ticketSubject =
      el("ticketSubject");

    const ticketPriority =
      el("ticketPriority");

    const ticketMessage =
      el("ticketMessage");

    const dataChangeBuilder =
      el("dataChangeBuilder");

    const dataChangeRows =
      el("dataChangeRows");

    const addChangeButton =
      el("addChangeButton");

    const myTicketsList =
      el("myTicketsList");

    const staffPanel =
      el("staffPanel");

    const staffTicketsList =
      el("staffTicketsList");

    const staffSearch =
      el("staffSearch");

    const staffStatusFilter =
      el("staffStatusFilter");

    const staffDirectionFilter =
      el("staffDirectionFilter");


    // ======================================
    // MODAL ELEMENTS
    // ======================================

    const ticketModal =
      el("ticketModal");

    const closeTicketModal =
      el("closeTicketModal");

    const modalTitle =
      el("modalTitle");

    const modalMeta =
      el("modalMeta");

    const modalTicketBody =
      el("modalTicketBody");

    const modalChanges =
      el("modalChanges");

    const modalMessages =
      el("modalMessages");

    const replyMessage =
      el("replyMessage");

    const internalMessageWrap =
      el("internalMessageWrap");

    const internalMessage =
      el("internalMessage");

    const sendReplyButton =
      el("sendReplyButton");

    const staffDecision =
      el("staffDecision");

    const decisionComment =
      el("decisionComment");

    const approveTicketButton =
      el("approveTicketButton");

    const rejectTicketButton =
      el("rejectTicketButton");


    // ======================================
    // ASSIGNMENT ELEMENTS
    // ======================================

    const ticketAssignmentPanel =
      el("ticketAssignmentPanel");

    const assignmentCurrent =
      el("assignmentCurrent");

    const assignmentHistory =
      el("assignmentHistory");

    const takeTicketButton =
      el("takeTicketButton");


    // ======================================
    // ESCAPE HTML
    // ======================================

    function escapeHtml(value) {

      return String(
        value == null
          ? ""
          : value
      )

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
    // MESSAGE
    // ======================================

    function showMessage(
      message,
      type = "info"
    ) {

      supportMessage.textContent =
        message || "";

      supportMessage.className =
        "support-message " +
        type;

      supportMessage.style.display =
        "block";

      clearTimeout(
        showMessage.timer
      );

      showMessage.timer =
        setTimeout(
          () => {

            supportMessage.style.display =
              "none";

          },
          5000
        );

    }


    // ======================================
    // DATE
    // ======================================

    function formatDate(
      value
    ) {

      if (!value) {

        return "—";

      }


      try {

        const date =
          new Date(value);


        if (
          Number.isNaN(
            date.getTime()
          )
        ) {

          return String(value);

        }


        const day =
          String(
            date.getDate()
          ).padStart(
            2,
            "0"
          );


        const month =
          String(
            date.getMonth() + 1
          ).padStart(
            2,
            "0"
          );


        const year =
          date.getFullYear();


        const hours =
          String(
            date.getHours()
          ).padStart(
            2,
            "0"
          );


        const minutes =
          String(
            date.getMinutes()
          ).padStart(
            2,
            "0"
          );


        return (
          `${day}.${month}.${year} ` +
          `${hours}:${minutes}`
        );

      } catch {

        return String(value);

      }

    }


    // ======================================
    // STATUS
    // ======================================

    function statusLabel(
      status
    ) {

      return {

        new:
          "Нове",

        in_progress:
          "В роботі",

        resolved:
          "Вирішено",

        closed:
          "Закрито"

      }[
        status
      ] ||
        status ||
        "—";

    }


    // ======================================
    // PRIORITY
    // ======================================

    function priorityLabel(
      priority
    ) {

      return {

        low:
          "Низький",

        normal:
          "Звичайний",

        high:
          "Високий",

        urgent:
          "Терміновий"

      }[
        priority
      ] ||
        priority ||
        "—";

    }


    // ======================================
    // LOAD USER
    // ======================================

    async function loadUser() {

      const result =
        await supabase.auth.getUser();


      if (
        result.error ||
        !result.data.user
      ) {

        window.location.href =
          "login.html";

        return false;

      }


      currentUser =
        result.data.user;


      return true;

    }


    // ======================================
    // PROFILE LINK
    // ======================================

    function profileLink(
      userId,
      nickname
    ) {

      if (!userId) {

        return escapeHtml(
          nickname || "—"
        );

      }


      const url =
        "member.html?user_id=" +
        encodeURIComponent(
          userId
        );


      return `
        <a
          href="${url}"
          target="_blank"
          rel="noopener"
          style="
            color:#f5c451;
            text-decoration:none;
            font-weight:700;
          "
        >
          ${escapeHtml(
            nickname || "Користувач"
          )}
        </a>
      `;

    }


    // ======================================
    // MEMBER SUMMARY
    // ======================================

    async function loadMemberSummary(
      userId
    ) {

      if (!userId) {

        return null;

      }


      if (
        memberSummaryCache[userId]
      ) {

        return memberSummaryCache[
          userId
        ];

      }


      const profileResult =
        await supabase
          .from("profiles")
          .select(
            "id,display_name"
          )
          .eq(
            "id",
            userId
          )
          .maybeSingle();


      if (profileResult.error) {

        console.error(
          "Member profile:",
          profileResult.error
        );

      }


      const profile =
        profileResult.data || {};


      let roleName =
        "";

      let roleLevel =
        null;


      const userRolesResult =
        await supabase
          .from("user_roles")
          .select(
            "role_id,role"
          )
          .eq(
            "user_id",
            userId
          );


      if (
        !userRolesResult.error &&
        userRolesResult.data?.length
      ) {

        const roleIds =
          userRolesResult.data
            .map(
              row =>
                row.role_id
            )
            .filter(
              id =>
                id != null
            );


        if (roleIds.length) {

          const rolesResult =
            await supabase
              .from("roles")
              .select(
                "id,name,level,is_active"
              )
              .in(
                "id",
                roleIds
              )
              .eq(
                "is_active",
                true
              )
              .order(
                "level",
                {
                  ascending:
                    false
                }
              )
              .limit(1);


          if (
            !rolesResult.error &&
            rolesResult.data?.length
          ) {

            roleName =
              rolesResult.data[0]
                .name ||
              "";

            roleLevel =
              rolesResult.data[0]
                .level ?? null;

          }

        }

      }


      const summary = {

        id:
          userId,

        display_name:
          profile.display_name ||
          "Користувач",

        role_name:
          roleName ||
          "Працівник UA LEGION",

        role_level:
          roleLevel

      };


      memberSummaryCache[userId] =
        summary;


      return summary;

    }


    // ======================================
    // MARK READ
    // ======================================

    async function markTicketAsRead(
      ticketId
    ) {

      if (
        !currentUser ||
        !ticketId
      ) {

        return false;

      }


      const result =
        await supabase.rpc(
          "mark_support_ticket_read",
          {
            p_ticket_id:
              ticketId
          }
        );


      if (result.error) {

        console.error(
          "mark_support_ticket_read:",
          result.error
        );

        return false;

      }


      return result.data === true;

    }


    // ======================================
    // PROFILE CURRENT VALUES
    // ======================================

    async function loadProfileCurrentValues() {

      const result =
        await supabase
          .from("profiles")
          .select(
            "display_name,birth_date,discord_username,discord_user_id,steam_id,game_nickname"
          )
          .eq(
            "id",
            currentUser.id
          )
          .maybeSingle();


      if (result.error) {

        console.error(
          "Profile:",
          result.error
        );

        return {};

      }


      const p =
        result.data || {};


      return {

        "profile.display_name":
          p.display_name ?? "",

        "profile.birth_date":
          p.birth_date ?? "",

        "profile.discord_username":
          p.discord_username ?? "",

        "profile.discord_user_id":
          p.discord_user_id ?? "",

        "profile.steam_id":
          p.steam_id ?? "",

        "profile.game_nickname":
          p.game_nickname ?? ""

      };

    }


    // ======================================
    // DIRECTIONS
    // ======================================

    async function loadDirections() {

      const result =
        await supabase
          .from("directions")
          .select(
            "id,name,slug,code,is_active"
          )
          .eq(
            "is_active",
            true
          )
          .order("id");


      if (result.error) {

        console.error(
          "Directions:",
          result.error
        );

        showMessage(
          "Не вдалося завантажити напрямки.",
          "error"
        );

        return;

      }


      directions =
        result.data || [];


      const membership =
        await supabase
          .from("user_directions")
          .select(
            "direction_id,status,direction_data"
          )
          .eq(
            "user_id",
            currentUser.id
          );


      if (!membership.error) {

        (
          membership.data || []
        ).forEach(
          row => {

            if (
              row.status ===
              "active"
            ) {

              activeDirectionData[
                String(
                  row.direction_id
                )
              ] =
                row.direction_data ||
                {};

            }

          }
        );

      }


      ticketDirection.innerHTML =
        '<option value="">' +
        '🇺🇦 UA LEGION / Загальне' +
        '</option>';


      directions.forEach(
        direction => {

          if (
            activeDirectionData[
              String(
                direction.id
              )
            ] !== undefined
          ) {

            ticketDirection.insertAdjacentHTML(
              "beforeend",

              `
                <option
                  value="${direction.id}"
                >
                  ${escapeHtml(
                    direction.name
                  )}
                </option>
              `
            );

          }

        }
      );


      staffDirectionFilter.innerHTML =
        '<option value="all">' +
        'Усі напрямки' +
        '</option>' +

        '<option value="global">' +
        '🇺🇦 UA LEGION / Загальні' +
        '</option>';


      directions.forEach(
        direction => {

          staffDirectionFilter.insertAdjacentHTML(

            "beforeend",

            `
              <option
                value="${direction.id}"
              >
                ${escapeHtml(
                  direction.name
                )}
              </option>
            `

          );

        }
      );

    }


    // ======================================
    // CATEGORIES
    // ======================================

    async function loadCategories() {

      const result =
        await supabase
          .from("support_categories")
          .select(
            "id,code,name,icon,description"
          )
          .eq(
            "is_active",
            true
          )
          .order("id");


      if (result.error) {

        console.error(
          "Categories:",
          result.error
        );

        showMessage(
          "Не вдалося завантажити категорії.",
          "error"
        );

        return;

      }


      categories =
        result.data || [];


      ticketCategory.innerHTML =

        categories
          .map(
            category =>

              `
                <option
                  value="${escapeHtml(
                    category.code
                  )}"
                >
                  ${escapeHtml(
                    (
                      category.icon ||
                      ""
                    ) +
                    " " +
                    category.name
                  )}
                </option>
              `

          )
          .join("");


      updateDataChangeVisibility();

    }


    // ======================================
    // DATA FIELDS
    // ======================================

    async function loadDataFields() {

      const result =
        await supabase
          .from(
            "support_data_fields"
          )
          .select(
            "field_key,field_name,direction_id,json_key,input_type,is_active"
          )
          .eq(
            "is_active",
            true
          )
          .order("id");


      if (result.error) {

        console.error(
          "Data fields:",
          result.error
        );

        showMessage(
          "Не вдалося завантажити поля для зміни даних.",
          "error"
        );

        return;

      }


      dataFields =
        result.data || [];

    }


    // ======================================
    // FIELDS FOR DIRECTION
    // ======================================

    function fieldsForCurrentDirection() {

      const directionId =
        ticketDirection.value;


      return dataFields.filter(
        field => {

          if (
            field.field_key
              .startsWith(
                "profile."
              )
          ) {

            return true;

          }


          return (
            directionId &&
            String(
              field.direction_id
            ) ===
            String(
              directionId
            )
          );

        }
      );

    }


    // ======================================
    // CURRENT FIELD VALUE
    // ======================================

    function getCurrentValue(
      field
    ) {

      if (!field) {

        return "";

      }


      if (
        field.field_key
          .startsWith(
            "profile."
          )
      ) {

        return (
          profileCurrentValues[
            field.field_key
          ] ?? ""
        );

      }


      const data =
        activeDirectionData[
          String(
            field.direction_id
          )
        ] || {};


      return (
        data[
          field.json_key
        ] ?? ""
      );

    }


    // ======================================
    // FIELD OPTIONS
    // ======================================

    function buildFieldOptions(
      selectedKey
    ) {

      return (

        fieldsForCurrentDirection()

          .map(
            field =>

              `
                <option
                  value="${escapeHtml(
                    field.field_key
                  )}"
                  ${
                    field.field_key ===
                    selectedKey
                      ? "selected"
                      : ""
                  }
                >
                  ${escapeHtml(
                    field.field_name
                  )}
                </option>
              `

          )

          .join("")

      );

    }


    // ======================================
    // ADD CHANGE ROW
    // ======================================

    function addChangeRow(
      selectedKey
    ) {

      const fields =
        fieldsForCurrentDirection();


      if (!fields.length) {

        showMessage(
          "Для вибраного напрямку немає доступних полів.",
          "error"
        );

        return;

      }


      const field =
        fields.find(
          item =>
            item.field_key ===
            selectedKey
        ) ||
        fields[0];


      const row =
        document.createElement(
          "div"
        );


      row.className =
        "change-row";


      row.innerHTML = `

        <div>

          <label>
            Поле
          </label>

          <select
            class="change-field"
          >

            ${buildFieldOptions(
              field.field_key
            )}

          </select>

        </div>


        <div>

          <label>
            Поточне значення
          </label>

          <input
            class="change-current"
            type="text"
            readonly
          >

        </div>


        <div>

          <label>
            Нове значення / причина
          </label>

          <input
            class="change-new"
            type="text"
            placeholder="Нове значення"
          >

          <textarea
            class="change-reason"
            rows="2"
            placeholder="Причина зміни"
          ></textarea>

        </div>


        <button
          class="remove-change"
          type="button"
          title="Видалити"
        >
          ✕
        </button>

      `;


      dataChangeRows
        .appendChild(
          row
        );


      const fieldSelect =
        row.querySelector(
          ".change-field"
        );


      const currentInput =
        row.querySelector(
          ".change-current"
        );


      function refreshCurrent() {

        const selected =
          dataFields.find(
            item =>
              item.field_key ===
              fieldSelect.value
          );


        currentInput.value =
          selected
            ? getCurrentValue(
                selected
              )
            : "";

      }


      fieldSelect.addEventListener(
        "change",
        refreshCurrent
      );


      row
        .querySelector(
          ".remove-change"
        )
        .addEventListener(
          "click",
          () => {

            row.remove();

          }
        );


      refreshCurrent();

    }


    // ======================================
    // DATA CHANGE VISIBILITY
    // ======================================

    function updateDataChangeVisibility() {

      const active =
        ticketCategory.value ===
        "data_change";


      dataChangeBuilder.hidden =
        !active;


      if (!active) {

        dataChangeRows.innerHTML =
          "";

        return;

      }


      if (
        !dataChangeRows.children.length
      ) {

        addChangeRow();

      }

    }


    // ======================================
    // COLLECT CHANGES
    // ======================================

    function collectChanges() {

      return Array.from(

        dataChangeRows
          .querySelectorAll(
            ".change-row"
          )

      ).map(
        row => {

          const fieldKey =
            row.querySelector(
              ".change-field"
            ).value;


          const field =
            dataFields.find(
              item =>
                item.field_key ===
                fieldKey
            );


          const oldValue =
            row.querySelector(
              ".change-current"
            ).value;


          const newValue =
            row.querySelector(
              ".change-new"
            ).value.trim();


          const reason =
            row.querySelector(
              ".change-reason"
            ).value.trim();


          return {

            field_key:
              fieldKey,

            field_name:
              field?.field_name ||
              fieldKey,

            old_value:
              oldValue === ""
                ? null
                : oldValue,

            new_value:
              newValue === ""
                ? null
                : newValue,

            reason:
              reason || null

          };

        }
      );

    }


    // ======================================
    // VALIDATE CHANGES
    // ======================================

    function validateChanges(
      changes
    ) {

      if (
        ticketCategory.value !==
        "data_change"
      ) {

        return true;

      }


      if (!changes.length) {

        showMessage(
          "Додайте хоча б одну зміну.",
          "error"
        );

        return false;

      }


      const used =
        new Set();


      for (
        const change of changes
      ) {

        if (
          used.has(
            change.field_key
          )
        ) {

          showMessage(
            "Одне й те саме поле не можна додати двічі.",
            "error"
          );

          return false;

        }


        used.add(
          change.field_key
        );


        if (
          !change.new_value
        ) {

          showMessage(
            "Нове значення не може бути порожнім.",
            "error"
          );

          return false;

        }


        if (
          !change.reason
        ) {

          showMessage(
            "Для кожної зміни вкажіть причину.",
            "error"
          );

          return false;

        }

      }


      return true;

    }


    // ======================================
    // CREATE TICKET
    // ======================================

    async function createTicket(
      event
    ) {

      event.preventDefault();


      const subject =
        ticketSubject.value.trim();


      const message =
        ticketMessage.value.trim();


      if (
        !subject ||
        !message
      ) {

        showMessage(
          "Заповніть тему та повідомлення.",
          "error"
        );

        return;

      }


      const changes =
        collectChanges();


      if (
        !validateChanges(
          changes
        )
      ) {

        return;

      }


      const button =
        el(
          "submitTicketButton"
        );


      button.disabled =
        true;


      button.textContent =
        "НАДСИЛАННЯ...";


      const result =
        await supabase.rpc(
          "create_support_ticket",
          {

            p_direction_id:

              ticketDirection.value

                ? Number(
                    ticketDirection.value
                  )

                : null,

            p_category_code:
              ticketCategory.value,

            p_subject:
              subject,

            p_message:
              message,

            p_priority:
              ticketPriority.value,

            p_changes:
              changes

          }
        );


      button.disabled =
        false;


      button.textContent =
        "📨 НАДІСЛАТИ ЗВЕРНЕННЯ";


      if (result.error) {

        console.error(
          "create_support_ticket:",
          result.error
        );


        showMessage(
          "Не вдалося створити звернення: " +
          result.error.message,
          "error"
        );

        return;

      }


      const ticketNumber =
        result.data?.ticket_number;


      ticketForm.reset();


      ticketDirection.value =
        "";


      dataChangeRows.innerHTML =
        "";


      updateDataChangeVisibility();


      showMessage(
        "Звернення №" +
        (
          ticketNumber ||
          "створено"
        ) +
        " успішно створено.",
        "success"
      );


      await loadMyTickets();


      if (isStaff) {

        await loadStaffTickets();

      }

    }


    // ======================================
    // RENDER TICKET LIST
    // ======================================

    function renderTicketList(
      list,
      target,
      staffMode
    ) {

      if (!list.length) {

        target.innerHTML =
          '<div class="support-empty">' +
          'Звернень немає.' +
          '</div>';

        return;

      }


      target.innerHTML =

        list
          .map(
            ticket => {

              const category =
                ticket.support_categories ||
                {};

              const direction =
                ticket.directions ||
                {};

              const user =
                ticket.profiles ||
                {};


              const assignedText =
                ticket.assigned_user_id
                  ? "👨‍💼 Є відповідальний"
                  : "⚪ Не взято в роботу";


              return `

                <div
                  class="ticket-row"
                  data-ticket-id="${ticket.id}"
                >

                  <div
                    class="ticket-row-top"
                  >

                    <span
                      class="ticket-number"
                    >
                      #${escapeHtml(
                        ticket.ticket_number
                      )}
                    </span>


                    <span
                      class="ticket-status ${
                        escapeHtml(
                          ticket.status
                        )
                      }"
                    >
                      ${escapeHtml(
                        statusLabel(
                          ticket.status
                        )
                      )}
                    </span>

                  </div>


                  <div
                    class="ticket-subject"
                  >
                    ${escapeHtml(
                      ticket.subject
                    )}
                  </div>


                  <div
                    class="ticket-row-bottom"
                  >

                    <span>

                      ${escapeHtml(

                        (
                          category.icon ||
                          ""
                        ) +
                        " " +
                        (
                          category.name ||
                          "Категорія"
                        )

                      )}

                      ·

                      ${escapeHtml(
                        direction.name ||
                        "UA LEGION"
                      )}

                    </span>


                    <span>

                      ${escapeHtml(
                        formatDate(
                          ticket.updated_at ||
                          ticket.created_at
                        )
                      )}

                    </span>

                  </div>


                  ${
                    staffMode

                      ? `

                        <div
                          class="ticket-user"
                        >

                          Користувач:

                          ${escapeHtml(
                            user.display_name ||
                            ticket.user_id
                          )}

                        </div>


                        <div
                          class="ticket-user"
                        >

                          ${assignedText}

                        </div>

                      `

                      : ""

                  }

                </div>

              `;

            }
          )
          .join("");


      target
        .querySelectorAll(
          ".ticket-row"
        )
        .forEach(
          row => {

            row.addEventListener(
              "click",
              () => {

                openTicket(
                  Number(
                    row.dataset
                      .ticketId
                  )
                );

              }
            );

          }
        );

    }


    // ======================================
    // LOAD MY TICKETS
    // ======================================

    async function loadMyTickets() {

      const result =
        await supabase
          .from(
            "support_tickets"
          )
          .select(

            "id,ticket_number,user_id,direction_id,category_id,subject,status,priority,assigned_user_id,created_at,updated_at,resolved_at,reviewed_by,reviewed_at,support_categories(name,code,icon),directions(name,code)"

          )
          .eq(
            "user_id",
            currentUser.id
          )
          .order(
            "updated_at",
            {
              ascending:
                false
            }
          );


      if (result.error) {

        console.error(
          "My tickets:",
          result.error
        );


        myTicketsList.innerHTML =
          '<div class="support-empty">' +
          'Не вдалося завантажити звернення.' +
          '</div>';

        return;

      }


      myTickets =
        result.data || [];


      renderTicketList(
        myTickets,
        myTicketsList,
        false
      );

    }


    // ======================================
    // CHECK STAFF
    // ======================================

    async function checkStaff() {

      const result =
        await supabase.rpc(
          "is_ua_legion_staff"
        );


      if (result.error) {

        console.error(
          "Staff check:",
          result.error
        );

        return false;

      }


      return (
        result.data === true
      );

    }


    // ======================================
    // LOAD STAFF TICKETS
    // ======================================

    async function loadStaffTickets() {

      if (!isStaff) {

        return;

      }


      const result =
        await supabase
          .from(
            "support_tickets"
          )
          .select(

            "id,ticket_number,user_id,direction_id,category_id,subject,status,priority,assigned_user_id,created_at,updated_at,resolved_at,reviewed_by,reviewed_at,support_categories(name,code,icon),directions(name,code),profiles!support_tickets_user_id_fkey(display_name)"

          )
          .order(
            "updated_at",
            {
              ascending:
                false
            }
          );


      if (result.error) {

        console.error(
          "Staff tickets:",
          result.error
        );


        staffTicketsList.innerHTML =
          '<div class="support-empty">' +
          'Не вдалося завантажити звернення.' +
          '</div>';

        return;

      }


      staffTickets =
        result.data || [];


      applyStaffFilters();

    }


    // ======================================
    // STAFF FILTERS
    // ======================================

    function applyStaffFilters() {

      const search =
        staffSearch.value
          .trim()
          .toLowerCase();


      const status =
        staffStatusFilter.value;


      const direction =
        staffDirectionFilter.value;


      const filtered =
        staffTickets.filter(
          ticket => {

            const userName =
              ticket.profiles
                ?.display_name
                ?.toLowerCase() ||
              "";


            const matchesSearch =

              !search ||

              String(
                ticket.ticket_number
              )
                .includes(
                  search
                ) ||

              String(
                ticket.subject ||
                ""
              )
                .toLowerCase()
                .includes(
                  search
                ) ||

              userName.includes(
                search
              );


            const matchesStatus =

              status ===
                "all" ||

              ticket.status ===
                status;


            const matchesDirection =

              direction ===
                "all" ||

              (
                direction ===
                  "global" &&

                ticket.direction_id ===
                  null
              ) ||

              String(
                ticket.direction_id
              ) ===
                direction;


            return (
              matchesSearch &&
              matchesStatus &&
              matchesDirection
            );

          }
        );


      renderTicketList(
        filtered,
        staffTicketsList,
        true
      );

    }


    // ======================================
    // LOAD ASSIGNMENT HISTORY
    // ======================================

    async function loadAssignmentHistory(
      ticketId
    ) {

      const result =
        await supabase
          .from(
            "support_assignment_history"
          )
          .select(

            "id,ticket_id,previous_user_id,new_user_id,changed_by,previous_role_name,previous_role_level,new_role_name,new_role_level,action,created_at"

          )
          .eq(
            "ticket_id",
            ticketId
          )
          .order(
            "created_at",
            {
              ascending:
                true
            }
          );


      if (result.error) {

        console.error(
          "Assignment history:",
          result.error
        );

        return [];

      }


      return result.data || [];

    }


    // ======================================
    // LOAD PROFILE NAMES FOR HISTORY
    // ======================================

    async function loadProfileNames(
      userIds
    ) {

      const ids =
        [
          ...new Set(
            userIds.filter(
              Boolean
            )
          )
        ];


      if (!ids.length) {

        return {};

      }


      const result =
        await supabase
          .from("profiles")
          .select(
            "id,display_name"
          )
          .in(
            "id",
            ids
          );


      if (result.error) {

        console.error(
          "History profiles:",
          result.error
        );

        return {};

      }


      const map = {};


      (
        result.data || []
      ).forEach(
        profile => {

          map[
            profile.id
          ] =
            profile.display_name ||
            "Користувач";

        }
      );


      return map;

    }


    // ======================================
    // RENDER ASSIGNMENT HISTORY
    // ======================================

    async function renderAssignmentHistory(
      history
    ) {

      if (!history.length) {

        assignmentHistory.innerHTML = "";

        return;

      }


      const ids =
        [];


      history.forEach(
        item => {

          if (
            item.previous_user_id
          ) {

            ids.push(
              item.previous_user_id
            );

          }


          if (
            item.new_user_id
          ) {

            ids.push(
              item.new_user_id
            );

          }


          if (
            item.changed_by
          ) {

            ids.push(
              item.changed_by
            );

          }

        }
      );


      const names =
        await loadProfileNames(
          ids
        );


      assignmentHistory.innerHTML = `

        <div
          class="support-subtitle"
        >

          <span>
            🕘
          </span>

          <div>

            <h3>
              Історія відповідальних
            </h3>

            <p>
              Усі передачі звернення
              зберігаються в системі.
            </p>

          </div>

        </div>


        ${history.map(
          item => {

            const newName =
              names[
                item.new_user_id
              ] ||
              "Користувач";


            const oldName =
              names[
                item.previous_user_id
              ] ||
              "попередній відповідальний";


            const changedByName =
              names[
                item.changed_by
              ] ||
              newName;


            if (
              item.action ===
              "assigned"
            ) {

              return `

                <div
                  class="chat-message"
                >

                  <div
                    class="chat-author"
                  >
                    🔵 Взяття в роботу
                  </div>


                  <div
                    class="chat-text"
                  >

                    ${profileLink(
                      item.new_user_id,
                      newName
                    )}

                    взяв звернення
                    в роботу.

                    <br>

                    Посада:
                    <b>
                      ${escapeHtml(
                        item.new_role_name ||
                        "Працівник"
                      )}
                    </b>

                    ${
                      item.new_role_level != null
                        ? ` · рівень ${escapeHtml(
                            item.new_role_level
                          )}`
                        : ""
                    }

                  </div>


                  <div
                    class="chat-time"
                  >
                    ${escapeHtml(
                      formatDate(
                        item.created_at
                      )
                    )}
                  </div>

                </div>

              `;

            }


            return `

              <div
                class="chat-message"
              >

                <div
                  class="chat-author"
                >
                  🔄 Передача звернення
                </div>


                <div
                  class="chat-text"
                >

                  ${profileLink(
                    item.new_user_id,
                    newName
                  )}

                  перебрав звернення
                  у

                  ${profileLink(
                    item.previous_user_id,
                    oldName
                  )}.

                  <br>

                  Попередній:
                  <b>
                    ${escapeHtml(
                      item.previous_role_name ||
                      "Працівник"
                    )}
                  </b>

                  ${
                    item.previous_role_level != null
                      ? ` · рівень ${escapeHtml(
                          item.previous_role_level
                        )}`
                      : ""
                  }

                  <br>

                  Новий відповідальний:
                  <b>
                    ${escapeHtml(
                      item.new_role_name ||
                      "Працівник"
                    )}
                  </b>

                  ${
                    item.new_role_level != null
                      ? ` · рівень ${escapeHtml(
                          item.new_role_level
                        )}`
                      : ""
                  }

                </div>


                <div
                  class="chat-time"
                >

                  Передав:

                  ${profileLink(
                    item.changed_by,
                    changedByName
                  )}

                  ·

                  ${escapeHtml(
                    formatDate(
                      item.created_at
                    )
                  )}

                </div>

              </div>

            `;

          }
        ).join("")}

      `;

    }


    // ======================================
    // RENDER ASSIGNMENT
    // ======================================

    async function renderAssignment() {

      if (
        !currentTicket
      ) {

        return;

      }


      const ticket =
        currentTicket.ticket;


      if (!isStaff) {

        ticketAssignmentPanel.hidden =
          true;

        return;

      }


      ticketAssignmentPanel.hidden =
        false;


      let currentSummary =
        null;


      if (
        ticket.assigned_user_id
      ) {

        currentSummary =
          await loadMemberSummary(
            ticket.assigned_user_id
          );

      }


      if (
        currentSummary
      ) {

        assignmentCurrent.innerHTML = `

          <div
            class="change-review-title"
          >

            <span>
              👤 Поточний відповідальний
            </span>

            <span>
              ${escapeHtml(
                currentSummary.role_name
              )}
            </span>

          </div>


          <div
            class="change-review-reason"
          >

            ${profileLink(
              currentSummary.id,
              currentSummary.display_name
            )}

            <br>

            Посада:

            <b>
              ${escapeHtml(
                currentSummary.role_name
              )}
            </b>

            ${
              currentSummary.role_level != null
                ? `
                  · рівень
                  <b>
                    ${escapeHtml(
                      currentSummary.role_level
                    )}
                  </b>
                `
                : ""
            }

          </div>

        `;

      } else {

        assignmentCurrent.innerHTML = `

          <div
            class="change-review-title"
          >

            <span>
              ⚪ Відповідальний
            </span>

            <span>
              Не призначено
            </span>

          </div>


          <div
            class="change-review-reason"
          >

            Звернення ще ніхто
            не взяв у роботу.

          </div>

        `;

      }


      const history =
        await loadAssignmentHistory(
          ticket.id
        );


      await renderAssignmentHistory(
        history
      );


      if (
        ["resolved", "closed"]
          .includes(
            ticket.status
          )
      ) {

        takeTicketButton.hidden =
          true;

        return;

      }


      if (
        ticket.assigned_user_id ===
        currentUser.id
      ) {

        takeTicketButton.hidden =
          true;

        return;

      }


      takeTicketButton.hidden =
        false;


      if (
        ticket.assigned_user_id
      ) {

        takeTicketButton.textContent =
          "🔄 ПЕРЕБРАТИ ЗВЕРНЕННЯ";

      } else {

        takeTicketButton.textContent =
          "🔵 ВЗЯТИ В РОБОТУ";

      }

    }


    // ======================================
    // TAKE / REASSIGN TICKET
    // ======================================

    async function takeTicket() {

      if (
        !currentTicket ||
        !isStaff
      ) {

        return;

      }


      const ticketId =
        currentTicket.ticket.id;


      takeTicketButton.disabled =
        true;


      const hadAssignee =
        Boolean(
          currentTicket.ticket
            .assigned_user_id
        );


      takeTicketButton.textContent =
        hadAssignee
          ? "ПЕРЕДАЧА..."
          : "ВЗЯТТЯ В РОБОТУ...";


      const result =
        await supabase.rpc(
          "take_support_ticket",
          {
            p_ticket_id:
              ticketId
          }
        );


      takeTicketButton.disabled =
        false;


      if (result.error) {

        console.error(
          "take_support_ticket:",
          result.error
        );


        takeTicketButton.textContent =
          hadAssignee
            ? "🔄 ПЕРЕБРАТИ ЗВЕРНЕННЯ"
            : "🔵 ВЗЯТИ В РОБОТУ";


        showMessage(
          "Не вдалося взяти звернення: " +
          result.error.message,
          "error"
        );

        return;

      }


      showMessage(

        hadAssignee

          ? "Звернення перебрано в роботу."

          : "Звернення взято в роботу.",

        "success"

      );


      await openTicket(
        ticketId
      );


      await loadMyTickets();


      if (isStaff) {

        await loadStaffTickets();

      }

    }


    // ======================================
    // OPEN TICKET
    // ======================================

    async function openTicket(
      ticketId
    ) {

      const result =
        await supabase
          .from(
            "support_tickets"
          )
          .select(

            "id,ticket_number,user_id,direction_id,category_id,subject,status,priority,assigned_user_id,created_at,updated_at,resolved_at,reviewed_by,reviewed_at,support_categories(name,code,icon,description),directions(name,code),profiles!support_tickets_user_id_fkey(display_name)"

          )
          .eq(
            "id",
            ticketId
          )
          .maybeSingle();


      if (
        result.error ||
        !result.data
      ) {

        console.error(
          "Open ticket:",
          result.error
        );


        showMessage(
          "Не вдалося відкрити звернення.",
          "error"
        );

        return;

      }


      const ticket =
        result.data;


      // ==================================
      // MESSAGES
      // ==================================

      const messagesResult =
        await supabase
          .from(
            "support_messages"
          )
          .select(

            "id,ticket_id,sender_user_id,message,created_at,is_internal,profiles(display_name)"

          )
          .eq(
            "ticket_id",
            ticketId
          )
          .order(
            "created_at",
            {
              ascending:
                true
            }
          );


      if (
        messagesResult.error
      ) {

        console.error(
          "Messages:",
          messagesResult.error
        );


        showMessage(
          "Не вдалося завантажити діалог.",
          "error"
        );

        return;

      }


      // ==================================
      // DATA CHANGES
      // ==================================

      const changesResult =
        await supabase
          .from(
            "support_data_changes"
          )
          .select(

            "id,ticket_id,field_key,field_name,old_value,new_value,reason,status,reviewed_by,reviewed_at,review_comment,created_at"

          )
          .eq(
            "ticket_id",
            ticketId
          )
          .order(
            "id"
          );


      if (
        changesResult.error
      ) {

        console.error(
          "Changes:",
          changesResult.error
        );

      }


      // ==================================
      // MARK READ
      // ==================================

      await markTicketAsRead(
        ticketId
      );


      // ==================================
      // CURRENT TICKET
      // ==================================

      currentTicket = {

        ticket,

        messages:
          messagesResult.data ||
          [],

        changes:
          changesResult.data ||
          []

      };


      // ==================================
      // RENDER
      // ==================================

      renderModal();


      ticketModal.classList.add(
        "active"
      );


      ticketModal.setAttribute(
        "aria-hidden",
        "false"
      );

    }


    // ======================================
    // RENDER MODAL
    // ======================================

    async function renderModal() {

      const ticket =
        currentTicket.ticket;


      const category =
        ticket.support_categories ||
        {};


      const direction =
        ticket.directions ||
        {};


      modalTitle.textContent =
        `#${ticket.ticket_number} — ${ticket.subject}`;


      modalMeta.textContent =

        `${category.icon || ""} ` +

        `${category.name || "Категорія"} · ` +

        `${direction.name || "UA LEGION"} · ` +

        `${priorityLabel(
          ticket.priority
        )} · ` +

        `${statusLabel(
          ticket.status
        )}`;


      // ==================================
      // USER
      // ==================================

      const userSummary =
        await loadMemberSummary(
          ticket.user_id
        );


      // ==================================
      // REVIEWER
      // ==================================

      let reviewerSummary =
        null;


      if (
        ticket.reviewed_by
      ) {

        reviewerSummary =
          await loadMemberSummary(
            ticket.reviewed_by
          );

      }


      // ==================================
      // BASIC INFO
      // ==================================

      modalTicketBody.innerHTML = `

        <div
          class="modal-info-grid"
        >

          <div
            class="modal-info-item"
          >

            <span>
              👤 Користувач
            </span>

            <strong>

              ${
                userSummary

                  ? profileLink(
                      userSummary.id,
                      userSummary.display_name
                    )

                  : escapeHtml(
                      ticket.profiles
                        ?.display_name ||
                      ticket.user_id
                    )
              }

            </strong>

          </div>


          <div
            class="modal-info-item"
          >

            <span>
              📅 Створено
            </span>

            <strong>
              ${escapeHtml(
                formatDate(
                  ticket.created_at
                )
              )}
            </strong>

          </div>


          <div
            class="modal-info-item full"
          >

            <span>
              📝 Тема
            </span>

            <strong>
              ${escapeHtml(
                ticket.subject
              )}
            </strong>

          </div>


          <div
            class="modal-info-item"
          >

            <span>
              👨‍💼 Розглянув
            </span>

            <strong>

              ${
                reviewerSummary

                  ? `

                    ${escapeHtml(
                      reviewerSummary.role_name
                    )}

                    ·

                    ${profileLink(
                      reviewerSummary.id,
                      reviewerSummary.display_name
                    )}

                  `

                  : "Ще не розглянуто"

              }

            </strong>

          </div>


          <div
            class="modal-info-item"
          >

            <span>
              🕐 Дата розгляду
            </span>

            <strong>
              ${escapeHtml(
                formatDate(
                  ticket.reviewed_at
                )
              )}
            </strong>

          </div>

        </div>

      `;


      // ==================================
      // ASSIGNMENT
      // ==================================

      await renderAssignment();


      // ==================================
      // CHANGES
      // ==================================

      renderChanges();


      // ==================================
      // MESSAGES
      // ==================================

      renderMessages();


      // ==================================
      // REVIEW BUTTONS
      // ==================================

      const canReview =

        isStaff &&

        currentTicket.changes.some(
          change =>
            change.status ===
            "pending"
        ) &&

        ![
          "resolved",
          "closed"
        ].includes(
          ticket.status
        );


      staffDecision.hidden =
        !canReview;


      internalMessageWrap.hidden =
        !isStaff;

    }


    // ======================================
    // RENDER CHANGES
    // ======================================

    function renderChanges() {

      const changes =
        currentTicket.changes ||
        [];


      if (!changes.length) {

        modalChanges.innerHTML =
          "";

        return;

      }


      modalChanges.innerHTML = `

        <div
          class="support-subtitle"
        >

          <span>
            📝
          </span>

          <div>

            <h3>
              Запропоновані зміни
            </h3>

            <p>
              Схвалення звернення
              автоматично застосовує
              всі зміни.
            </p>

          </div>

        </div>


        ${changes.map(
          change => `

            <div
              class="change-review-card ${escapeHtml(
                change.status
              )}"
            >

              <div
                class="change-review-title"
              >

                <span>
                  ${escapeHtml(
                    change.field_name ||
                    change.field_key
                  )}
                </span>


                <span>
                  ${escapeHtml(
                    change.status
                  )}
                </span>

              </div>


              <div
                class="change-review-values"
              >

                <div
                  class="change-review-value"
                >

                  <span>
                    Було
                  </span>

                  <strong>
                    ${escapeHtml(
                      change.old_value ??
                      "—"
                    )}
                  </strong>

                </div>


                <div
                  class="change-review-value"
                >

                  <span>
                    Стане
                  </span>

                  <strong>
                    ${escapeHtml(
                      change.new_value ??
                      "—"
                    )}
                  </strong>

                </div>

              </div>


              <div
                class="change-review-reason"
              >

                <b>
                  Причина:
                </b>

                ${escapeHtml(
                  change.reason ||
                  "—"
                )}

              </div>


              ${
                change.review_comment

                  ? `

                    <div
                      class="change-review-reason"
                    >

                      <b>
                        Рішення:
                      </b>

                      ${escapeHtml(
                        change.review_comment
                      )}

                    </div>

                  `

                  : ""

              }

            </div>

          `
        ).join("")}

      `;

    }


    // ======================================
    // RENDER MESSAGES
    // ======================================

    function renderMessages() {

      const messages =
        currentTicket.messages ||
        [];


      if (!messages.length) {

        modalMessages.innerHTML =
          '<div class="support-empty">' +
          'Повідомлень ще немає.' +
          '</div>';

        return;

      }


      modalMessages.innerHTML =

        messages
          .map(
            message => {

              const mine =

                message.sender_user_id ===
                currentUser.id;


              const internal =

                message.is_internal ===
                true;


              return `

                <div
                  class="chat-message ${
                    mine
                      ? "mine"
                      : ""
                  } ${
                    internal
                      ? "internal"
                      : ""
                  }"
                >

                  <div
                    class="chat-author"
                  >

                    ${escapeHtml(

                      internal

                        ? "🔒 Внутрішнє повідомлення"

                        : (
                            message.profiles
                              ?.display_name ||
                            "Користувач"
                          )

                    )}

                  </div>


                  <div
                    class="chat-text"
                  >

                    ${escapeHtml(
                      message.message
                    )}

                  </div>


                  <div
                    class="chat-time"
                  >

                    ${escapeHtml(
                      formatDate(
                        message.created_at
                      )
                    )}

                  </div>

                </div>

              `;

            }
          )
          .join("");


      modalMessages.scrollTop =
        modalMessages.scrollHeight;

    }


    // ======================================
    // SEND REPLY
    // ======================================

    async function sendReply() {

      if (!currentTicket) {

        return;

      }


      const message =
        replyMessage.value.trim();


      if (!message) {

        showMessage(
          "Напишіть повідомлення.",
          "error"
        );

        return;

      }


      const result =
        await supabase
          .from(
            "support_messages"
          )
          .insert({

            ticket_id:
              currentTicket.ticket.id,

            sender_user_id:
              currentUser.id,

            message,

            is_internal:
              isStaff &&
              internalMessage.checked

          })
          .select(
            "id"
          )
          .single();


      if (result.error) {

        console.error(
          "Send message:",
          result.error
        );


        showMessage(
          "Не вдалося надіслати повідомлення: " +
          result.error.message,
          "error"
        );

        return;

      }


      replyMessage.value =
        "";


      internalMessage.checked =
        false;


      const ticketId =
        currentTicket.ticket.id;


      await openTicket(
        ticketId
      );


      await loadMyTickets();


      if (isStaff) {

        await loadStaffTickets();

      }

    }


    // ======================================
    // REVIEW TICKET
    // ======================================

    async function reviewTicket(
      decision
    ) {

      if (
        !currentTicket ||
        !isStaff
      ) {

        return;

      }


      const pending =
        currentTicket.changes
          .filter(
            change =>
              change.status ===
              "pending"
          );


      if (!pending.length) {

        showMessage(
          "У цьому зверненні немає змін, які очікують рішення.",
          "info"
        );

        return;

      }


      const comment =
        decisionComment.value.trim();


      if (
        decision ===
          "rejected" &&
        !comment
      ) {

        showMessage(
          "Для відхилення вкажіть причину.",
          "error"
        );

        return;

      }


      approveTicketButton.disabled =
        true;

      rejectTicketButton.disabled =
        true;


      const result =
        await supabase.rpc(
          "review_support_ticket",
          {

            p_ticket_id:
              currentTicket.ticket.id,

            p_decision:
              decision,

            p_review_comment:
              comment ||
              null

          }
        );


      approveTicketButton.disabled =
        false;

      rejectTicketButton.disabled =
        false;


      if (result.error) {

        console.error(
          "review_support_ticket:",
          result.error
        );


        showMessage(
          "Не вдалося обробити звернення: " +
          result.error.message,
          "error"
        );

        return;

      }


      decisionComment.value =
        "";


      showMessage(

        decision ===
          "approved"

          ? "Зміни схвалено та автоматично застосовано."

          : "Зміни відхилено. Дані залишилися без змін.",

        "success"

      );


      const ticketId =
        currentTicket.ticket.id;


      await openTicket(
        ticketId
      );


      await loadMyTickets();


      if (isStaff) {

        await loadStaffTickets();

      }

    }


    // ======================================
    // EVENTS
    // ======================================

    ticketCategory.addEventListener(
      "change",
      updateDataChangeVisibility
    );


    ticketDirection.addEventListener(
      "change",
      () => {

        if (
          ticketCategory.value ===
          "data_change"
        ) {

          dataChangeRows.innerHTML =
            "";

          addChangeRow();

        }

      }
    );


    addChangeButton.addEventListener(
      "click",
      () =>
        addChangeRow()
    );


    ticketForm.addEventListener(
      "submit",
      createTicket
    );


    el(
      "refreshMyTickets"
    ).addEventListener(
      "click",
      loadMyTickets
    );


    el(
      "refreshStaffTickets"
    ).addEventListener(
      "click",
      loadStaffTickets
    );


    staffSearch.addEventListener(
      "input",
      applyStaffFilters
    );


    staffStatusFilter.addEventListener(
      "change",
      applyStaffFilters
    );


    staffDirectionFilter.addEventListener(
      "change",
      applyStaffFilters
    );


    // ======================================
    // TAKE TICKET
    // ======================================

    takeTicketButton.addEventListener(
      "click",
      takeTicket
    );


    // ======================================
    // CLOSE MODAL
    // ======================================

    closeTicketModal.addEventListener(
      "click",
      () => {

        ticketModal.classList.remove(
          "active"
        );


        ticketModal.setAttribute(
          "aria-hidden",
          "true"
        );


        currentTicket =
          null;

      }
    );


    ticketModal.addEventListener(
      "click",
      event => {

        if (
          event.target ===
          ticketModal
        ) {

          closeTicketModal.click();

        }

      }
    );


    // ======================================
    // SEND MESSAGE
    // ======================================

    sendReplyButton.addEventListener(
      "click",
      sendReply
    );


    // ======================================
    // APPROVE
    // ======================================

    approveTicketButton.addEventListener(
      "click",
      () =>
        reviewTicket(
          "approved"
        )
    );


    // ======================================
    // REJECT
    // ======================================

    rejectTicketButton.addEventListener(
      "click",
      () =>
        reviewTicket(
          "rejected"
        )
    );


    // ======================================
    // INIT
    // ======================================

    if (
      !await loadUser()
    ) {

      return;

    }


    profileCurrentValues =
      await loadProfileCurrentValues();


    await loadDirections();


    await loadCategories();


    await loadDataFields();


    isStaff =
      await checkStaff();


    if (isStaff) {

      staffPanel.hidden =
        false;


      await loadStaffTickets();

    }


    await loadMyTickets();


    updateDataChangeVisibility();

  }
);
