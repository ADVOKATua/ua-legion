/* =========================================================
   UA LEGION — JOIN SYSTEM

   Подача заявки + профіль + напрямок

   ВАЖЛИВО:
   - email НЕ використовується як ім'я
   - одна заявка = один напрямок
   - активний напрямок блокує повторну заявку
   - pending/new заявка блокує повторну заявку
   - rejected дозволяє подати повторно
========================================================= */


document.addEventListener(
  "DOMContentLoaded",

  async () => {

    // =====================================================
    // SUPABASE
    // =====================================================

    const supabase =
      window.supabaseClient;


    if (!supabase) {

      console.error(
        "UA LEGION: Supabase client не знайдено."
      );

      return;

    }


    // =====================================================
    // ELEMENTS
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
      Array.from(
        document.querySelectorAll(
          'input[name="direction"]'
        )
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


      formMessage.className =
        type;

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
    // VALUE
    // =====================================================

    function getValue(
      id
    ) {

      const element =
        document.getElementById(
          id
        );


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
        text === "ets2/truckersmp" ||
        text === "ets2 / truckersmp"
      ) {

        return "ets2";

      }


      if (
        text === "wot" ||
        text === "world of tanks" ||
        text === "world_of_tanks"
      ) {

        return "wot";

      }


      if (
        text === "dota" ||
        text === "dota2" ||
        text === "dota 2"
      ) {

        return "dota2";

      }


      if (
        text === "wow" ||
        text === "world of warcraft" ||
        text === "world_of_warcraft"
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

          return "🚛 ETS2 / TruckersMP";


        case "wot":

          return "🪖 World of Tanks";


        case "dota2":

          return "⚔️ Dota 2";


        case "wow":

          return "🐉 World of Warcraft";


        default:

          return String(
            direction ||
            "напрямок"
          );

      }

    }


    // =====================================================
    // AGE
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
    // CHECK EMAIL-LIKE VALUE
    // =====================================================

    function isEmailLike(
      value
    ) {

      if (!value) {
        return false;
      }


      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(
          String(value).trim()
        );

    }


    // =====================================================
    // GET APPLICATION NAME
    //
    // Email НІКОЛИ не використовується.
    // =====================================================

    function getApplicationName(
      user,
      profile
    ) {

      const profileName =
        String(
          profile?.display_name ||
          ""
        )
          .trim();


      if (
        profileName &&
        !isEmailLike(
          profileName
        )
      ) {

        return profileName;

      }


      const metadataFullName =
        String(
          user?.user_metadata?.full_name ||
          ""
        )
          .trim();


      if (
        metadataFullName &&
        !isEmailLike(
          metadataFullName
        )
      ) {

        return metadataFullName;

      }


      const metadataName =
        String(
          user?.user_metadata?.name ||
          ""
        )
          .trim();


      if (
        metadataName &&
        !isEmailLike(
          metadataName
        )
      ) {

        return metadataName;

      }


      const metadataDisplayName =
        String(
          user?.user_metadata?.display_name ||
          ""
        )
          .trim();


      if (
        metadataDisplayName &&
        !isEmailLike(
          metadataDisplayName
        )
      ) {

        return metadataDisplayName;

      }


      const gameNickname =
        String(
          profile?.game_nickname ||
          ""
        )
          .trim();


      if (
        gameNickname &&
        !isEmailLike(
          gameNickname
        )
      ) {

        return gameNickname;

      }


      const discordNickname =
        String(
          profile?.discord_username ||
          ""
        )
          .trim();


      if (
        discordNickname &&
        !isEmailLike(
          discordNickname
        )
      ) {

        return discordNickname;

      }


      return null;

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


      container
        .querySelectorAll(
          "input, select, textarea, button"
        )
        .forEach(
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

      Object
        .values(gameForms)
        .forEach(
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


      const key =
        normalizeDirection(
          direction
        );


      const form =
        gameForms[key];


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
    // =====================================================

    function isActiveApplicationStatus(
      status
    ) {

      return [

        "pending",
        "new",
        "review",
        "under_review",
        "in_review"

      ].includes(

        String(
          status || ""
        )
          .trim()
          .toLowerCase()

      );

    }


    // =====================================================
    // GET DIRECTION
    // =====================================================

    async function getDirectionRecord(
      direction
    ) {

      const key =
        normalizeDirection(
          direction
        );


      if (!key) {
        return null;
      }


      try {

        const {
          data,
          error
        } =
          await supabase
            .from("directions")
            .select(
              "id,code,slug,name,is_active"
            )
            .or(
              `slug.eq.${key},code.eq.${key}`
            )
            .limit(1)
            .maybeSingle();


        if (error) {

          console.error(
            "UA LEGION: помилка пошуку напрямку:",
            error
          );


          return null;

        }


        return data || null;

      }

      catch (error) {

        console.error(
          "UA LEGION: помилка пошуку напрямку:",
          error
        );


        return null;

      }

    }


    // =====================================================
    // ACTIVE MEMBERSHIP
    // =====================================================

    async function hasActiveDirectionMembership(
      userId,
      direction
    ) {

      const key =
        normalizeDirection(
          direction
        );


      if (
        !userId ||
        !key
      ) {

        return false;

      }


      try {

        const directionRecord =
          await getDirectionRecord(
            key
          );


        if (
          !directionRecord?.id
        ) {

          return false;

        }


        const {
          data,
          error
        } =
          await supabase
            .from("user_directions")
            .select(
              "id,user_id,direction_id,status"
            )
            .eq(
              "user_id",
              userId
            )
            .eq(
              "direction_id",
              directionRecord.id
            )
            .eq(
              "status",
              "active"
            )
            .limit(1)
            .maybeSingle();


        if (error) {

          console.error(
            "UA LEGION: помилка перевірки user_directions:",
            error
          );


          return false;

        }


        return Boolean(
          data?.id
        );

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
    // DISABLE DIRECTION
    // =====================================================

    function markDirectionAsDisabled(
      input
    ) {

      if (!input) {
        return;
      }


      input.disabled =
        true;


      input.checked =
        false;


      let label =
        document.querySelector(
          `label[for="${input.id}"]`
        );


      if (!label) {

        label =
          input.parentElement
            ?.querySelector(
              "label"
            );

      }


      if (label) {

        label.classList.add(
          "direction-disabled"
        );


        label.title =
          "Ви вже є учасником цього напрямку";

      }

    }


    // =====================================================
    // DISABLE ACTIVE DIRECTIONS
    // =====================================================

    async function disableActiveDirections() {

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

          markDirectionAsDisabled(
            input
          );

        }

      }


      hideAllGameForms();

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


    // =====================================================
    // APPLICATION NAME
    // =====================================================

    const applicationName =
      getApplicationName(
        user,
        profile
      );


    // =====================================================
    // AGE
    // =====================================================

    const profileAge =
      calculateAge(
        profile?.birth_date
      );


    // =====================================================
    // PROFILE DISPLAY
    // =====================================================

    const joinProfileName =
      document.getElementById(
        "joinProfileName"
      );


    const joinProfileAge =
      document.getElementById(
        "joinProfileAge"
      );


    const joinProfileDiscord =
      document.getElementById(
        "joinProfileDiscord"
      );


    const joinProfileDiscordId =
      document.getElementById(
        "joinProfileDiscordId"
      );


    const joinProfileSteam =
      document.getElementById(
        "joinProfileSteam"
      );


    const joinProfileGameNick =
      document.getElementById(
        "joinProfileGameNick"
      );


    if (joinProfileName) {

      joinProfileName.textContent =
        applicationName ||
        "Не заповнено";

    }


    if (joinProfileAge) {

      joinProfileAge.textContent =
        profileAge === null
          ? "Не заповнено"
          : String(
              profileAge
            );

    }


    if (joinProfileDiscord) {

      joinProfileDiscord.textContent =
        profile?.discord_username ||
        "Не заповнено";

    }


    if (joinProfileDiscordId) {

      joinProfileDiscordId.textContent =
        profile?.discord_user_id ||
        "Не заповнено";

    }


    if (joinProfileSteam) {

      joinProfileSteam.textContent =
        profile?.steam_id ||
        "Не заповнено";

    }


    if (joinProfileGameNick) {

      joinProfileGameNick.textContent =
        profile?.game_nickname ||
        "Не заповнено";

    }


    // =====================================================
    // PROFILE VALIDATION
    // =====================================================

    if (!applicationName) {

      showMessage(
        "Спочатку заповніть нормальне ім'я або нікнейм у своєму профілі. Email не може використовуватися як ім'я.",
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
    // FORM SELECTION
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
    // ACTIVE DIRECTIONS
    // =====================================================

    await disableActiveDirections();


    // =====================================================
    // URL DIRECTION
    // =====================================================

    const urlParams =
      new URLSearchParams(
        window.location.search
      );


    const requestedDirection =
      normalizeDirection(
        urlParams.get(
          "direction"
        )
      );


    if (
      requestedDirection
    ) {

      const requestedInput =
        directionInputs.find(
          input =>

            !input.disabled &&

            normalizeDirection(
              input.value
            ) ===
            requestedDirection
        );


      if (
        requestedInput
      ) {

        requestedInput.checked =
          true;


        showGameForm(
          requestedInput.value
        );

      }

    }


    // =====================================================
    // FORM
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


        // =================================================
        // ACTIVE MEMBERSHIP
        // =================================================

        const alreadyActive =
          await hasActiveDirectionMembership(
            user.id,
            direction
          );


        if (
          alreadyActive
        ) {

          showMessage(
            `Ви вже є активним учасником напрямку ${getDirectionLabel(
              direction
            )}. Повторна заявка не потрібна.`,
            "error"
          );


          const selectedInput =
            directionInputs.find(
              input =>

                normalizeDirection(
                  input.value
                ) ===
                direction
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


        // =================================================
        // EXISTING APPLICATIONS
        // =================================================

        const {
          data: existingApplications,
          error: existingError
        } =
          await supabase
            .from("applications")
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


        if (
          existingError
        ) {

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


        const sameDirectionActiveApplication =
          applications.find(
            application => {

              const applicationDirections =
                getDirectionsFromApplication(
                  application
                );


              return (

                applicationDirections.includes(
                  direction
                ) &&

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
        // WOT VERIFICATION
        // =================================================

        let verifiedWotProfile =
          null;


        if (
          direction ===
          "wot"
        ) {

          const {
            data: wotProfile,
            error: wotProfileError
          } =
            await supabase
              .from("profiles")
              .select(
                "wot_nickname,wot_account_id,wot_region,wot_verified_at"
              )
              .eq(
                "id",
                user.id
              )
              .maybeSingle();


          if (
            wotProfileError
          ) {

            console.error(
              "UA LEGION: помилка перевірки WoT профілю:",
              wotProfileError
            );


            showMessage(
              "Не вдалося перевірити підтвердження WoT акаунта. Спробуйте ще раз.",
              "error"
            );


            return;

          }


          verifiedWotProfile =
            wotProfile;


          if (
            !wotProfile ||
            !wotProfile.wot_account_id
          ) {

            showMessage(
              "Спочатку підтвердьте свій World of Tanks акаунт через Wargaming.",
              "error"
            );


            const wotForm =
              document.getElementById(
                "wotForm"
              );


            if (wotForm) {

              wotForm.classList.add(
                "active"
              );


              setFormEnabled(
                wotForm,
                true
              );

            }


            return;

          }


          const formNickname =
            getValue(
              "wotNickname"
            );


          const formRegion =
            String(
              getValue(
                "wotRegion"
              ) || ""
            )
              .toLowerCase();


          const profileNickname =
            String(
              wotProfile.wot_nickname ||
              ""
            ).trim();


          const profileRegion =
            String(
              wotProfile.wot_region ||
              ""
            )
              .toLowerCase();


          if (
            !formNickname ||
            !formRegion ||
            formNickname !==
              profileNickname ||
            formRegion !==
              profileRegion
          ) {

            showMessage(
              "Дані WoT акаунта змінено. Повторно підтвердьте акаунт через Wargaming.",
              "error"
            );


            return;

          }

        }


        // =================================================
        // APPLICATION DATA
        // =================================================

        const applicationData = {

          user_id:
            user.id,

          name:
            applicationName,

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

          direction:
            direction,

          directions:
            [
              direction.toUpperCase()
            ],

          status:
            "pending",

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
            applicationData.truckersmp_nick ||
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
            verifiedWotProfile?.wot_nickname ||
            getValue(
              "wotNickname"
            );


          applicationData.wargaming_id =
            String(
              verifiedWotProfile?.wot_account_id ||
              ""
            );


          applicationData.wot_region =
            verifiedWotProfile?.wot_region ||
            getValue(
              "wotRegion"
            );


          applicationData.game_nick =
            applicationData.wot_nickname ||
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
            applicationData.dota_nickname ||
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

          // ВАЖЛИВО:
          // У таблиці applications колонка називається
          // battletag, а не battle_tag.

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


          applicationData.game_nick =
            applicationData.wow_character ||
            profile?.game_nickname ||
            null;

        }


        // =================================================
        // BUTTON
        // =================================================

        if (submitButton) {

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
            data: insertedApplication,
            error: insertError
          } =
            await supabase
              .from("applications")
              .insert(
                applicationData
              )
              .select()
              .single();


          if (
            insertError
          ) {

            console.error(
              "UA LEGION: помилка створення заявки:",
              insertError
            );


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
                "Не вдалося створити заявку: у профілі не заповнене ім'я або нікнейм.",
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


          setTimeout(
            () => {

              window.location.href =
                "profile.html";

            },
            1500
          );

        }

        catch (error) {

          console.error(
            "UA LEGION: неочікувана помилка:",
            error
          );


          showMessage(
            "Сталася неочікувана помилка. Спробуйте ще раз.",
            "error"
          );

        }


        finally {

          if (submitButton) {

            submitButton.disabled =
              false;


            submitButton.textContent =
              submitButton
                .dataset
                .originalText ||
              "НАДІСЛАТИ ЗАЯВКУ";

          }

        }

      }

    );

  }

);
