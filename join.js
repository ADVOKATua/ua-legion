/* =========================================================
   UA LEGION — join.js
   Подача заявки на вступ

   Логіка:
   - Дані профілю (ім'я, вік, Discord, Steam) беремо з profiles.
   - Одна заявка = один напрямок.
   - Повторна заявка дозволена для іншого напрямку.
   - Активний учасник напрямку не може подати повторну заявку.
   - pending / new / review / under_review / in_review
     блокують повторну заявку.
   - approved сам по собі НЕ блокує повторну заявку,
     якщо напрямок фактично не активний у user_directions.
   - rejected дозволяє подати заявку повторно.
   - Активні напрямки блокуються прямо у формі.
   - Перед INSERT повторно перевіряється активне членство.
   - Неактивні форми ігрових напрямків вимикаються,
     щоб required-поля прихованих форм не заважали submit.
   - Streaming НЕ використовується.
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    const supabase =
      window.supabaseClient;


    // =====================================================
    // SUPABASE
    // =====================================================

    if (!supabase) {

      console.error(
        "UA LEGION: Supabase client не знайдено."
      );

      return;
    }


    // =====================================================
    // DOM
    // =====================================================

    const applicationForm =
      document.getElementById(
        "applicationForm"
      );

    const submitButton =
      document.getElementById(
        "submitApplication"
      );

    const formMessage =
      document.getElementById(
        "formMessage"
      );

    const directionInputs =
      document.querySelectorAll(
        'input[name="direction"]'
      );


    const gameForms = {

      ets2:
        document.getElementById(
          "ets2Form"
        ),

      wot:
        document.getElementById(
          "wotForm"
        ),

      dota2:
        document.getElementById(
          "dota2Form"
        ),

      wow:
        document.getElementById(
          "wowForm"
        )

    };


    // =====================================================
    // MESSAGE
    // =====================================================

    function showMessage(
      message,
      type = "error"
    ) {

      if (!formMessage) {
        return;
      }

      formMessage.textContent =
        message;

      formMessage.className = "";

      formMessage.classList.add(
        "show",
        type
      );
    }


    function clearMessage() {

      if (!formMessage) {
        return;
      }

      formMessage.textContent =
        "";

      formMessage.className =
        "";
    }


    // =====================================================
    // GET VALUE
    // =====================================================

    function getValue(id) {

      const element =
        document.getElementById(id);

      if (!element) {
        return null;
      }

      const value =
        element.value?.trim();

      return value === ""
        ? null
        : value;
    }


    // =====================================================
    // SELECTED DIRECTION
    // =====================================================

    function getSelectedDirection() {

      const selected =
        document.querySelector(
          'input[name="direction"]:checked'
        );

      return selected
        ? selected.value
        : null;
    }


    // =====================================================
    // NORMALIZE DIRECTION
    // =====================================================

    function normalizeDirection(
      value
    ) {

      if (!value) {
        return null;
      }

      const text =
        String(value)
          .trim()
          .toLowerCase();


      if (
        text === "ets2" ||
        text === "ets2/truckersmp"
      ) {

        return "ets2";
      }


      if (
        text === "wot" ||
        text === "world of tanks"
      ) {

        return "wot";
      }


      if (
        text === "dota2" ||
        text === "dota 2" ||
        text === "dota"
      ) {

        return "dota2";
      }


      if (
        text === "wow" ||
        text === "world of warcraft"
      ) {

        return "wow";
      }


      return text;
    }


    // =====================================================
    // DIRECTION LABEL
    // =====================================================

    function getDirectionLabel(
      direction
    ) {

      switch (
        normalizeDirection(
          direction
        )
      ) {

        case "ets2":

          return (
            "🚛 ETS2 / TruckersMP"
          );


        case "wot":

          return (
            "🪖 World of Tanks"
          );


        case "dota2":

          return (
            "⚔️ Dota 2"
          );


        case "wow":

          return (
            "🐉 World of Warcraft"
          );


        default:

          return String(
            direction ||
            "напрямок"
          );
      }
    }


    // =====================================================
    // CALCULATE AGE
    // =====================================================

    function calculateAge(
      birthDate
    ) {

      if (!birthDate) {
        return null;
      }


      const birth =
        new Date(
          `${birthDate}T00:00:00`
        );


      if (
        Number.isNaN(
          birth.getTime()
        )
      ) {

        return null;
      }


      const today =
        new Date();


      let age =
        today.getFullYear() -
        birth.getFullYear();


      const monthDifference =
        today.getMonth() -
        birth.getMonth();


      if (
        monthDifference < 0 ||
        (
          monthDifference === 0 &&
          today.getDate() <
            birth.getDate()
        )
      ) {

        age--;
      }


      return age >= 0
        ? age
        : null;
    }


    // =====================================================
    // FALLBACK NAME
    // =====================================================

    function getFallbackName(
      user,
      profile
    ) {

      return (

        profile?.display_name?.trim() ||

        user?.user_metadata
          ?.full_name
          ?.trim() ||

        user?.user_metadata
          ?.name
          ?.trim() ||

        user?.user_metadata
          ?.display_name
          ?.trim() ||

        user?.email
          ?.split("@")[0]
          ?.trim() ||

        null

      );
    }


    // =====================================================
    // ENABLE / DISABLE FORM
    // =====================================================

    function setFormEnabled(
      container,
      enabled
    ) {

      if (!container) {
        return;
      }


      const controls =
        container.querySelectorAll(
          "input, select, textarea, button"
        );


      controls.forEach(
        control => {

          control.disabled =
            !enabled;

        }
      );
    }


    // =====================================================
    // HIDE ALL GAME FORMS
    // =====================================================

    function hideAllGameForms() {

      Object.values(
        gameForms
      ).forEach(
        form => {

          if (!form) {
            return;
          }


          form.classList.remove(
            "active"
          );


          setFormEnabled(
            form,
            false
          );

        }
      );
    }


    // =====================================================
    // SHOW GAME FORM
    // =====================================================

    function showGameForm(
      direction
    ) {

      hideAllGameForms();


      const normalizedDirection =
        normalizeDirection(
          direction
        );


      const form =
        gameForms[
          normalizedDirection
        ];


      if (!form) {
        return;
      }


      form.classList.add(
        "active"
      );


      setFormEnabled(
        form,
        true
      );
    }


    // =====================================================
    // APPLICATION DIRECTIONS
    // =====================================================

    function getDirectionsFromApplication(
      application
    ) {

      const result = [];


      if (
        application?.direction
      ) {

        result.push(
          application.direction
        );
      }


      const directions =
        application?.directions;


      if (
        Array.isArray(
          directions
        )
      ) {

        result.push(
          ...directions
        );

      }

      else if (
        typeof directions ===
        "string"
      ) {

        try {

          const parsed =
            JSON.parse(
              directions
            );


          if (
            Array.isArray(
              parsed
            )
          ) {

            result.push(
              ...parsed
            );

          }

          else {

            result.push(
              directions
            );
          }

        }

        catch {

          result.push(
            directions
          );

        }
      }


      return result
        .map(
          normalizeDirection
        )
        .filter(Boolean);
    }


    // =====================================================
    // ACTIVE APPLICATION STATUS
    //
    // approved тут спеціально НЕМАЄ.
    // =====================================================

    function isActiveApplicationStatus(
      status
    ) {

      const normalized =
        String(
          status || ""
        )
          .trim()
          .toLowerCase();


      return [

        "pending",

        "new",

        "review",

        "under_review",

        "in_review"

      ].includes(
        normalized
      );
    }


    // =====================================================
    // CHECK ACTIVE MEMBERSHIP
    //
    // Використовуємо RPC:
    //
    // is_user_active_in_direction
    //
    // який ми вже створили в Supabase.
    // =====================================================

    async function hasActiveDirectionMembership(
      userId,
      direction
    ) {

      const normalizedDirection =
        normalizeDirection(
          direction
        );


      if (
        !userId ||
        !normalizedDirection
      ) {

        return false;
      }


      try {

        const {
          data,
          error
        } = await supabase.rpc(
          "is_user_active_in_direction",
          {

            p_user_id:
              userId,

            p_direction_code:
              normalizedDirection

          }
        );


        if (error) {

          console.error(
            "UA LEGION: помилка RPC перевірки активного напрямку:",
            error
          );

          return false;
        }


        return data === true;

      }

      catch (error) {

        console.error(
          "UA LEGION: помилка перевірки членства:",
          error
        );

        return false;
      }
    }


    // =====================================================
    // BLOCK ACTIVE DIRECTION
    // =====================================================

    function markDirectionAsDisabled(
      input
    ) {

      if (!input) {
        return;
      }


      input.disabled =
        true;


      if (input.checked) {

        input.checked =
          false;
      }


      // Найчастіше radio знаходиться
      // безпосередньо всередині label.
      let label =
        input.closest(
          "label"
        );


      // Якщо label не знайдено,
      // пробуємо знайти батьківський блок.
      if (!label) {

        label =
          input.parentElement;
      }


      if (label) {

        label.classList.add(
          "direction-disabled"
        );


        label.style.opacity =
          "0.45";


        label.style.cursor =
          "not-allowed";


        label.style.pointerEvents =
          "none";


        label.title =
          "Ви вже є учасником цього напрямку";
      }
    }


    // =====================================================
    // CHECK ALL ACTIVE DIRECTIONS
    // =====================================================

    async function disableActiveDirections() {

      let activeDirectionsCount =
        0;


      for (
        const input
        of directionInputs
      ) {

        const direction =
          normalizeDirection(
            input.value
          );


        if (!direction) {
          continue;
        }


        const isActive =
          await hasActiveDirectionMembership(
            user.id,
            direction
          );


        if (isActive) {

          activeDirectionsCount++;

          markDirectionAsDisabled(
            input
          );
        }
      }


      // ---------------------------------------------------
      // Знаходимо доступний напрямок
      // ---------------------------------------------------

      const availableDirection =
        Array.from(
          directionInputs
        ).find(
          input =>
            !input.disabled
        );


      const selectedDirection =
        getSelectedDirection();


      // ---------------------------------------------------
      // Якщо вже був вибраний доступний напрямок
      // ---------------------------------------------------

      if (
        selectedDirection
      ) {

        const selectedInput =
          Array.from(
            directionInputs
          ).find(
            input =>
              !input.disabled &&
              normalizeDirection(
                input.value
              ) ===
                normalizeDirection(
                  selectedDirection
                )
          );


        if (selectedInput) {

          showGameForm(
            selectedInput.value
          );

          return;
        }
      }


      // ---------------------------------------------------
      // Якщо є доступний напрямок —
      // вибираємо його
      // ---------------------------------------------------

      if (
        availableDirection
      ) {

        availableDirection.checked =
          true;


        showGameForm(
          availableDirection.value
        );


        return;
      }


      // ---------------------------------------------------
      // Усі напрямки активні
      // ---------------------------------------------------

      hideAllGameForms();


      if (
        activeDirectionsCount > 0
      ) {

        showMessage(
          "Ви вже є активним учасником усіх доступних напрямків.",
          "error"
        );
      }
    }


    // =====================================================
    // AUTH
    // =====================================================

    const {
      data: {
        user
      },
      error: authError
    } =
      await supabase.auth.getUser();


    if (authError) {

      console.error(
        "UA LEGION: помилка отримання користувача:",
        authError
      );


      showMessage(
        "Не вдалося перевірити авторизацію. Оновіть сторінку.",
        "error"
      );


      return;
    }


    if (!user) {

      showMessage(
        "Щоб подати заявку, спочатку увійдіть у свій акаунт.",
        "error"
      );


      setTimeout(
        () => {

          window.location.href =
            "login.html";

        },
        1200
      );


      return;
    }


    // =====================================================
    // PROFILE
    // =====================================================

    const {
      data: profile,
      error: profileError
    } =
      await supabase
        .from("profiles")
        .select(
          "display_name,birth_date,discord_username,discord_user_id,steam_id,game_nickname"
        )
        .eq(
          "id",
          user.id
        )
        .maybeSingle();


    if (profileError) {

      console.error(
        "UA LEGION: помилка завантаження профілю:",
        profileError
      );


      showMessage(
        "Не вдалося завантажити дані профілю.",
        "error"
      );


      return;
    }


    const profileName =
      getFallbackName(
        user,
        profile
      );


    const profileAge =
      calculateAge(
        profile?.birth_date
      );


    // =====================================================
    // REQUIRED PROFILE DATA
    // =====================================================

    if (!profileName) {

      showMessage(
        "Спочатку заповніть ім'я у своєму профілі.",
        "error"
      );


      return;
    }


    if (
      profileAge === null
    ) {

      showMessage(
        "Спочатку заповніть дату народження у своєму профілі.",
        "error"
      );


      return;
    }


    // =====================================================
    // DIRECTION SELECTION
    // =====================================================

    hideAllGameForms();


    directionInputs.forEach(
      input => {

        input.addEventListener(
          "change",
          () => {

            if (
              input.disabled
            ) {

              return;
            }


            clearMessage();


            showGameForm(
              input.value
            );
          }
        );
      }
    );


    // =====================================================
    // BLOCK ACTIVE DIRECTIONS
    // =====================================================

    await disableActiveDirections();


    // =====================================================
    // APPLICATION FORM
    // =====================================================

    if (!applicationForm) {

      console.error(
        "UA LEGION: #applicationForm не знайдено."
      );


      return;
    }


    // =====================================================
    // SUBMIT
    // =====================================================

    applicationForm.addEventListener(
      "submit",
      async event => {

        event.preventDefault();


        clearMessage();


        // -------------------------------------------------
        // SELECTED DIRECTION
        // -------------------------------------------------

        const direction =
          normalizeDirection(
            getSelectedDirection()
          );


        if (!direction) {

          showMessage(
            "Оберіть напрямок, до якого хочете подати заявку.",
            "error"
          );


          return;
        }


        // -------------------------------------------------
        // CHECK ACTIVE MEMBERSHIP
        //
        // Повторна перевірка перед INSERT.
        // -------------------------------------------------

        const alreadyActive =
          await hasActiveDirectionMembership(
            user.id,
            direction
          );


        if (alreadyActive) {

          showMessage(
            `Ви вже є активним учасником напрямку ${getDirectionLabel(
              direction
            )}. Повторна заявка не потрібна.`,
            "error"
          );


          // Додатково блокуємо напрямок
          const selectedInput =
            Array.from(
              directionInputs
            ).find(
              input =>
                normalizeDirection(
                  input.value
                ) === direction
            );


          if (
            selectedInput
          ) {

            markDirectionAsDisabled(
              selectedInput
            );
          }


          return;
        }


        // -------------------------------------------------
        // CHECK EXISTING APPLICATIONS
        // -------------------------------------------------

        const {
          data:
            existingApplications,
          error:
            existingError
        } =
          await supabase
            .from(
              "applications"
            )
            .select(
              "id,status,direction,directions,created_at"
            )
            .eq(
              "user_id",
              user.id
            )
            .order(
              "created_at",
              {
                ascending:
                  false
              }
            );


        if (existingError) {

          console.error(
            "UA LEGION: помилка перевірки попередніх заявок:",
            existingError
          );


          showMessage(
            "Не вдалося перевірити попередні заявки. Спробуйте ще раз.",
            "error"
          );


          return;
        }


        const applications =
          existingApplications ||
          [];


        // -------------------------------------------------
        // FIND ACTIVE APPLICATION
        // -------------------------------------------------

        const sameDirectionActiveApplication =
          applications.find(
            application => {

              const applicationDirections =
                getDirectionsFromApplication(
                  application
                );


              const sameDirection =
                applicationDirections.includes(
                  direction
                );


              return (
                sameDirection &&
                isActiveApplicationStatus(
                  application.status
                )
              );
            }
          );


        if (
          sameDirectionActiveApplication
        ) {

          showMessage(
            `У вас уже є активна заявка для напрямку ${getDirectionLabel(
              direction
            )}. Дочекайтеся її розгляду.`,
            "error"
          );


          return;
        }


        // =================================================
        // APPLICATION DATA
        // =================================================

        const applicationData = {

          // ------------------------------------------------
          // USER
          // ------------------------------------------------

          user_id:
            user.id,


          // ------------------------------------------------
          // PROFILE DATA
          // ------------------------------------------------

          name:
            profileName,


          age:
            profileAge,


          discord_nick:
            profile?.discord_username ||
            null,


          discord_id:
            profile?.discord_user_id ||
            null,


          steam_id:
            profile?.steam_id ||
            null,


          // ------------------------------------------------
          // DIRECTION
          // ------------------------------------------------

          direction:
            direction,


          directions:
            [
              direction.toUpperCase()
            ],


          // ------------------------------------------------
          // STATUS
          // ------------------------------------------------

          status:
            "pending",


          // ------------------------------------------------
          // ABOUT
          // ------------------------------------------------

          about:
            getValue(
              "about"
            )

        };


        // =================================================
        // ETS2
        // =================================================

        if (
          direction ===
          "ets2"
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


          applicationData.game_nick =
            applicationData
              .truckersmp_nick ||

            profile?.game_nickname ||

            null;
        }


        // =================================================
        // WORLD OF TANKS
        // =================================================

        if (
          direction ===
          "wot"
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


          applicationData.game_nick =
            applicationData
              .wot_nickname ||

            profile?.game_nickname ||

            null;
        }


        // =================================================
        // DOTA 2
        // =================================================

        if (
          direction ===
          "dota2"
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


          applicationData.game_nick =
            applicationData
              .dota_nickname ||

            profile?.game_nickname ||

            null;
        }


        // =================================================
        // WORLD OF WARCRAFT
        // =================================================

        if (
          direction ===
          "wow"
        ) {

          applicationData.battle_tag =
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


          applicationData.game_nick =
            applicationData
              .wow_character ||

            profile?.game_nickname ||

            null;
        }


        // =================================================
        // SUBMIT BUTTON
        // =================================================

        if (
          submitButton
        ) {

          submitButton.disabled =
            true;


          submitButton.dataset.originalText =
            submitButton.textContent;


          submitButton.textContent =
            "Відправлення...";
        }


        // =================================================
        // INSERT
        // =================================================

        try {

          console.log(
            "UA LEGION: відправляємо заявку:",
            applicationData
          );


          const {
            data:
              insertedApplication,
            error:
              insertError
          } =
            await supabase
              .from(
                "applications"
              )
              .insert(
                applicationData
              )
              .select()
              .single();


          // ------------------------------------------------
          // INSERT ERROR
          // ------------------------------------------------

          if (
            insertError
          ) {

            console.error(
              "UA LEGION: помилка створення заявки:",
              insertError
            );


            // ----------------------------------------------
            // NOT NULL name
            // ----------------------------------------------

            if (
              insertError.code ===
                "23502" &&

              String(
                insertError.message ||
                ""
              ).includes(
                "name"
              )
            ) {

              showMessage(
                "Не вдалося створити заявку: у профілі не заповнене ім'я.",
                "error"
              );

            }

            else {

              showMessage(
                `Не вдалося відправити заявку: ${
                  insertError.message ||
                  "невідома помилка"
                }`,
                "error"
              );
            }


            return;
          }


          // ------------------------------------------------
          // SUCCESS
          // ------------------------------------------------

          console.log(
            "UA LEGION: заявку створено:",
            insertedApplication
          );


          showMessage(
            `Заявку на напрямок ${getDirectionLabel(
              direction
            )} успішно відправлено.`,
            "success"
          );


          // ------------------------------------------------
          // REDIRECT
          // ------------------------------------------------

          setTimeout(
            () => {

              window.location.href =
                "profile.html";

            },
            1500
          );


        }

        // =================================================
        // UNEXPECTED ERROR
        // =================================================

        catch (
          error
        ) {

          console.error(
            "UA LEGION: неочікувана помилка:",
            error
          );


          showMessage(
            "Сталася неочікувана помилка. Спробуйте ще раз.",
            "error"
          );

        }


        // =================================================
        // RESTORE BUTTON
        // =================================================

        finally {

          if (
            submitButton
          ) {

            submitButton.disabled =
              false;


            submitButton.textContent =
              submitButton
                .dataset
                .originalText ||

              "Подати заявку";
          }
        }

      }
    );

  }
);
