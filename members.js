// ==========================================
// UA LEGION
// MEMBERS SYSTEM
// members.js
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
    // ELEMENTS
    // ======================================

    const membersList =
      document.getElementById(
        "membersList"
      );


    const membersSearch =
      document.getElementById(
        "membersSearch"
      );


    const membersCount =
      document.getElementById(
        "membersCount"
      );


    const membersMessage =
      document.getElementById(
        "membersMessage"
      );


    // ======================================
    // DATA
    // ======================================

    let allMembers =
      [];


    // ======================================
    // MESSAGE
    // ======================================

    function showMessage(
      message,
      type = "info"
    ) {

      if (!membersMessage) {

        return;

      }


      membersMessage.textContent =
        message;


      membersMessage.className =
        "members-message " +
        type;

    }


    // ======================================
    // ESCAPE HTML
    // ======================================

    function escapeHtml(
      value
    ) {

      if (

        value === null
        ||

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
    // AUTH CHECK
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

      userError
      ||

      !user

    ) {

      window.location.href =
        "login.html";

      return;

    }


    // ======================================
    // CHECK ACCESS
    // ======================================

    async function checkAccess() {

      const {

        data,
        error

      } =

        await supabase
          .rpc(
            "can_view_ua_legion_members"
          );


      if (error) {

        console.error(
          "Помилка перевірки доступу:",
          error
        );

        return false;

      }


      return data === true;

    }


    const hasAccess =
      await checkAccess();


    // ======================================
    // NO ACCESS
    // ======================================

    if (!hasAccess) {

      if (membersList) {

        membersList.innerHTML = `

          <div
            class="members-empty"
          >

            🔒 Доступ до списку учасників
            доступний тільки учасникам
            UA LEGION.

          </div>

        `;

      }


      return;

    }


    // ======================================
    // LOAD MEMBERS
    // ======================================

    async function loadMembers() {

      if (!membersList) {

        return;

      }


      membersList.innerHTML = `

        <div
          class="members-loading"
        >

          ⏳ Завантаження учасників...

        </div>

      `;


      const {

        data,
        error

      } =

        await supabase
          .rpc(
            "get_ua_legion_members"
          );


      if (error) {

        console.error(
          "Помилка завантаження учасників:",
          error
        );


        showMessage(

          "❌ Не вдалося завантажити список учасників.",

          "error"

        );


        membersList.innerHTML =
          "";

        return;

      }


      allMembers =
        data || [];


      renderMembers();

    }


    // ======================================
    // GET FILTERED MEMBERS
    // ======================================

    function getFilteredMembers() {

      const search =

        (
          membersSearch?.value
          ||

          ""
        )

        .trim()

        .toLowerCase();


      if (!search) {

        return allMembers;

      }


      return allMembers.filter(

        member => {


          const name =

            (
              member.name
              ||

              ""
            )

            .toLowerCase();


          const nickname =

            (
              member.game_nickname
              ||

              ""
            )

            .toLowerCase();


          return (

            name.includes(
              search
            )

            ||

            nickname.includes(
              search
            )

          );

        }

      );

    }


    // ======================================
    // FORMAT DIRECTIONS
    // ======================================

    function formatDirections(
      directions
    ) {

      if (!directions) {

        return "UA LEGION";

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
    // RENDER MEMBERS
    // ======================================

    function renderMembers() {

      if (!membersList) {

        return;

      }


      const members =
        getFilteredMembers();


      membersList.innerHTML =
        "";


      // ====================================
      // COUNT
      // ====================================

      if (membersCount) {

        membersCount.textContent =

          `Учасників: ${members.length}`;

      }


      // ====================================
      // EMPTY
      // ====================================

      if (
        members.length === 0
      ) {

        membersList.innerHTML = `

          <div
            class="members-empty"
          >

            👤 Учасників не знайдено.

          </div>

        `;


        return;

      }


      // ====================================
      // CARDS
      // ====================================

      members.forEach(

        member => {


          const card =
            document.createElement(
              "div"
            );


          card.className =
            "member-card";


          card.innerHTML = `

            <div
              class="member-avatar"
            >

              👤

            </div>


            <div
              class="member-info"
            >


              <h2>

                ${escapeHtml(
                  member.name
                  ||
                  "Учасник UA LEGION"
                )}

              </h2>


              <div
                class="member-nickname"
              >

                🎮

                ${escapeHtml(
                  member.game_nickname
                  ||
                  "Не вказано"
                )}

              </div>


              <div
                class="member-directions"
              >

                📍

                ${escapeHtml(
                  formatDirections(
                    member.directions
                  )
                )}

              </div>


            </div>

          `;


          membersList.appendChild(
            card
          );

        }

      );

    }


    // ======================================
    // SEARCH
    // ======================================

    membersSearch?.addEventListener(

      "input",

      () => {

        renderMembers();

      }

    );


    // ======================================
    // START
    // ======================================

    await loadMembers();


  }

);
