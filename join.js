// ======================================
// UA LEGION — JOIN APPLICATION SYSTEM
// join.js
// ======================================

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

    const form =
      document.getElementById(
        "applicationForm"
      );


    const formMessage =
      document.getElementById(
        "formMessage"
      );


    const submitButton =
      document.getElementById(
        "submitApplication"
      );


    if (!form) {

      console.error(
        "Форма заявки не знайдена"
      );

      return;

    }


    // ======================================
    // CHECK AUTHORIZATION
    // ======================================

    const {
      data: {
        user
      },
      error: authError
    } =
      await supabase.auth.getUser();


    if (
      authError ||
      !user
    ) {

      window.location.href =
        "login.html";

      return;

    }


    // ======================================
    // DIRECTIONS
    // ======================================

    const directions = [

      "ets2",

      "wot",

      "dota2",

      "wow"

    ];


    // ======================================
    // HIDE ALL GAME FORMS
    // ======================================

    function hideAllGameForms() {

      directions.forEach(
        function (
          direction
        ) {

          const gameForm =
            document.getElementById(
              direction + "Form"
            );


          if (
            gameForm
          ) {

            gameForm.classList.remove(
              "active"
            );

          }

        }
      );

    }


    // ======================================
    // SHOW SELECTED GAME FORM
    // ======================================

    function showGameForm(
      direction
    ) {

      hideAllGameForms();


      const selectedForm =
        document.getElementById(
          direction + "Form"
        );


      if (
        selectedForm
      ) {

        selectedForm.classList.add(
          "active"
        );

      }

    }


    // ======================================
    // DIRECTION CHANGE
    // ======================================

    const directionInputs =
      document.querySelectorAll(
        'input[name="direction"]'
      );


    directionInputs.forEach(
      function (
        input
      ) {

        input.addEventListener(
          "change",
          function () {

            showGameForm(
              this.value
            );

          }
        );

      }
    );


    // ======================================
    // MESSAGE
    // ======================================

    function showMessage(
      text,
      type
    ) {

      if (
        !formMessage
      ) {
        return;
      }


      formMessage.textContent =
        text;


      formMessage.className =
        type || "";

    }


    // ======================================
    // GET VALUE
    // ======================================

    function getValue(
      id
    ) {

      const element =
        document.getElementById(
          id
        );


      if (
        !element
      ) {

        return null;

      }


      return (
        element.value ||
        ""
      )
        .trim();

    }


    // ======================================
    // GET SELECTED DIRECTION
    // ======================================

    function getSelectedDirection() {

      const selected =
        document.querySelector(
          'input[name="direction"]:checked'
        );


      if (
        !selected
      ) {

        return null;

      }


      return selected.value;

    }


    // ======================================
    // SUBMIT APPLICATION
    // ======================================

    form.addEventListener(
      "submit",
      async function (
        event
      ) {

        event.preventDefault();


        // ================================
        // SELECTED DIRECTION
        // ================================

        const direction =
          getSelectedDirection();


        if (
          !direction
        ) {

          showMessage(
            "Оберіть напрямок.",
            "error"
          );

          return;

        }


        // ================================
        // DISABLE BUTTON
        // ================================

        if (
          submitButton
        ) {

          submitButton.disabled =
            true;


          submitButton.textContent =
            "НАДСИЛАННЯ...";

        }


        showMessage(
          "Надсилаємо заявку...",
          ""
        );


        // ================================
        // APPLICATION DATA
        // ================================

        const applicationData = {

          user_id:
            user.id,

          direction:
            direction,

          status:
            "pending",

          about:
            getValue(
              "about"
            ),

          truckersmp_nick:
            null,

          truckersmp_id:
            null,

          truckershub_username:
            null,

          truckershub_id:
            null,

          wot_nickname:
            null,

          wargaming_id:
            null,

          wot_region:
            null,

          dota_nickname:
            null,

          dota_friend_id:
            null,

          dota_rank:
            null,

          battletag:
            null,

          wow_character:
            null,

          wow_realm:
            null,

          wow_faction:
            null,

          wow_class:
            null

        };


        // ================================
        // ETS2 DATA
        // ================================

        if (
          direction === "ets2"
        ) {

          applicationData.truckersmp_nick =
            getValue(
              "truckersmpNick"
            );


          applicationData.truckersmp_id =
            getValue(
              "truckersmpId"
            );


          applicationData.truckershub_username =
            getValue(
              "truckershubUsername"
            );


          applicationData.truckershub_id =
            getValue(
              "truckershubId"
            );

        }


        // ================================
        // WOT DATA
        // ================================

        if (
          direction === "wot"
        ) {

          applicationData.wot_nickname =
            getValue(
              "wotNickname"
            );


          applicationData.wargaming_id =
            getValue(
              "wargamingId"
            );


          applicationData.wot_region =
            getValue(
              "wotRegion"
            );

        }


        // ================================
        // DOTA 2 DATA
        // ================================

        if (
          direction === "dota2"
        ) {

          applicationData.dota_nickname =
            getValue(
              "dotaNickname"
            );


          applicationData.dota_friend_id =
            getValue(
              "dotaFriendId"
            );


          applicationData.dota_rank =
            getValue(
              "dotaRank"
            );

        }


        // ================================
        // WOW DATA
        // ================================

        if (
          direction === "wow"
        ) {

          applicationData.battletag =
            getValue(
              "battleTag"
            );


          applicationData.wow_character =
            getValue(
              "wowCharacter"
            );


          applicationData.wow_realm =
            getValue(
              "wowRealm"
            );


          applicationData.wow_faction =
            getValue(
              "wowFaction"
            );


          applicationData.wow_class =
            getValue(
              "wowClass"
            );

        }


        // ================================
        // CHECK EXISTING APPLICATION
        // ================================

        const {
          data:
            existingApplication,

          error:
            checkError

        } =
          await supabase
            .from(
              "applications"
            )
            .select(
              "id, status"
            )
            .eq(
              "user_id",
              user.id
            )
            .eq(
              "direction",
              direction
            )
            .maybeSingle();


        if (
          checkError
        ) {

          console.error(
            checkError
          );

        }


        if (
          existingApplication
        ) {

          showMessage(
            "Ви вже подавали заявку на цей напрямок.",
            "error"
          );


          if (
            submitButton
          ) {

            submitButton.disabled =
              false;


            submitButton.textContent =
              "НАДІСЛАТИ ЗАЯВКУ";

          }


          return;

        }


        // ================================
        // INSERT APPLICATION
        // ================================

        const {
          error:
            insertError

        } =
          await supabase
            .from(
              "applications"
            )
            .insert(
              applicationData
            );


        // ================================
        // ERROR
        // ================================

        if (
          insertError
        ) {

          console.error(
            insertError
          );


          showMessage(
            "Помилка при надсиланні заявки: " +
            insertError.message,
            "error"
          );


          if (
            submitButton
          ) {

            submitButton.disabled =
              false;


            submitButton.textContent =
              "НАДІСЛАТИ ЗАЯВКУ";

          }


          return;

        }


        // ================================
        // SUCCESS
        // ================================

        showMessage(
          "Заявку успішно надіслано!",
          "success"
        );


        form.reset();


        hideAllGameForms();


        if (
          submitButton
        ) {

          submitButton.disabled =
            true;


          submitButton.textContent =
            "ЗАЯВКУ НАДІСЛАНО";

        }


        // ================================
        // REDIRECT
        // ================================

        setTimeout(
          function () {

            window.location.href =
              "profile.html";

          },
          1500
        );

      }
    );

  }
);
