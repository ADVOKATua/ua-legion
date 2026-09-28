// ======================================
// UA LEGION — WORLD OF TANKS VERIFICATION
// wot-profile.js
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
        "WOT: Supabase не підключений"
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
      await supabase.auth.getUser();


    if (
      userError ||
      !user
    ) {

      console.warn(
        "WOT: користувач не авторизований"
      );

      return;
    }


    // ======================================
    // ELEMENTS
    // ======================================

    const nicknameInput =
      document.getElementById(
        "wotNickname"
      );


    const regionSelect =
      document.getElementById(
        "wotRegion"
      );


    const wargamingIdInput =
      document.getElementById(
        "wargamingId"
      );


    const verifyButton =
      document.getElementById(
        "verifyWotButton"
      );


    const statusBox =
      document.getElementById(
        "wotAccountStatus"
      );


    const resultBox =
      document.getElementById(
        "wotAccountResult"
      );


    const resultNickname =
      document.getElementById(
        "wotResultNickname"
      );


    const resultAccountId =
      document.getElementById(
        "wotResultAccountId"
      );


    const resultRegion =
      document.getElementById(
        "wotResultRegion"
      );


    // ======================================
    // CHECK ELEMENTS
    // ======================================

    if (
      !nicknameInput ||
      !regionSelect ||
      !wargamingIdInput ||
      !verifyButton ||
      !statusBox ||
      !resultBox ||
      !resultNickname ||
      !resultAccountId ||
      !resultRegion
    ) {

      console.warn(
        "WOT: елементи форми не знайдені"
      );

      return;
    }


    // ======================================
    // STATUS
    // ======================================

    function setStatus(
      message,
      type = "info"
    ) {

      statusBox.textContent =
        message;

      statusBox.className =
        "wot-account-status " +
        type;
    }


    // ======================================
    // REGION NAME
    // ======================================

    function getRegionName(
      region
    ) {

      switch (
        String(
          region || ""
        ).toLowerCase()
      ) {

        case "eu":
          return "EU";

        case "na":
          return "NA";

        case "asia":
          return "ASIA";

        default:
          return region || "";

      }
    }


    // ======================================
    // SHOW VERIFIED RESULT
    // ======================================

    function showVerifiedResult(
      nickname,
      accountId,
      region
    ) {

      resultNickname.textContent =
        nickname || "";

      resultAccountId.textContent =
        accountId || "";

      resultRegion.textContent =
        getRegionName(
          region
        );


      wargamingIdInput.value =
        accountId || "";


      resultBox.hidden =
        false;


      setStatus(
        "🟢 WoT акаунт успішно підтверджено.",
        "success"
      );
    }


    // ======================================
    // CLEAR VERIFICATION
    // ======================================

    function clearVerification(
      showMessage = true
    ) {

      resultBox.hidden =
        true;


      wargamingIdInput.value =
        "";


      if (showMessage) {

        setStatus(
          "Дані WoT змінено. Потрібно повторно підтвердити акаунт.",
          "info"
        );
      }
    }


    // ======================================
    // LOAD EXISTING WOT PROFILE
    // ======================================

    async function loadWotProfile() {

      const {
        data,
        error
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


      if (error) {

        console.error(
          "WOT: помилка завантаження:",
          error
        );

        return;
      }


      if (!data) {

        return;
      }


      // ==================================
      // NICKNAME
      // ==================================

      if (
        data.wot_nickname
      ) {

        nicknameInput.value =
          data.wot_nickname;
      }


      // ==================================
      // REGION
      // ==================================

      if (
        data.wot_region
      ) {

        regionSelect.value =
          String(
            data.wot_region
          ).toLowerCase();
      }


      // ==================================
      // VERIFIED
      // ==================================

      if (
        data.wot_account_id
      ) {

        showVerifiedResult(
          data.wot_nickname,
          data.wot_account_id,
          data.wot_region
        );

      }
    }


    // ======================================
    // NICKNAME CHANGED
    // ======================================

    nicknameInput.addEventListener(
      "input",
      () => {

        clearVerification();

      }
    );


    // ======================================
    // REGION CHANGED
    // ======================================

    regionSelect.addEventListener(
      "change",
      () => {

        clearVerification();

      }
    );


    // ======================================
    // VERIFY WOT ACCOUNT
    // ======================================

    verifyButton.addEventListener(
      "click",
      async () => {

        const nickname =
          nicknameInput.value.trim();


        const region =
          String(
            regionSelect.value || ""
          ).toLowerCase();


        // ==================================
        // VALIDATE NICKNAME
        // ==================================

        if (!nickname) {

          setStatus(
            "Введіть нік у World of Tanks.",
            "error"
          );

          nicknameInput.focus();

          return;
        }


        if (
          nickname.length < 2 ||
          nickname.length > 24
        ) {

          setStatus(
            "Нік повинен містити від 2 до 24 символів.",
            "error"
          );

          nicknameInput.focus();

          return;
        }


        // ==================================
        // VALIDATE REGION
        // ==================================

        if (
          ![
            "eu",
            "na",
            "asia"
          ].includes(
            region
          )
        ) {

          setStatus(
            "Оберіть коректний регіон.",
            "error"
          );

          return;
        }


        // ==================================
        // LOADING
        // ==================================

        verifyButton.disabled =
          true;


        resultBox.hidden =
          true;


        wargamingIdInput.value =
          "";


        setStatus(
          "🔎 Перевіряємо акаунт у Wargaming...",
          "info"
        );


        try {

          // =================================
          // CALL SUPABASE EDGE FUNCTION
          // =================================

          const {
            data,
            error
          } =
            await supabase.functions.invoke(
              "clever-service",
              {
                body: {

                  nickname,

                  region

                }
              }
            );


          // =================================
          // EDGE FUNCTION ERROR
          // =================================

          if (error) {

            console.error(
              "WOT: Edge Function:",
              error
            );

            throw new Error(
              error.message ||
              "Помилка перевірки акаунта."
            );
          }


          // =================================
          // ACCOUNT NOT VERIFIED
          // =================================

          if (
            !data ||
            data.verified !== true
          ) {

            setStatus(
              data?.error ||
              "🔴 Акаунт з таким ніком не знайдено у вибраному регіоні.",
              "error"
            );

            return;
          }


          // =================================
          // NORMALIZE RESULT
          // =================================

          const verifiedNickname =
            data.nickname ||
            nickname;


          const verifiedAccountId =
            data.account_id;


          const verifiedRegion =
            String(
              data.region ||
              region
            ).toLowerCase();


          if (
            !verifiedAccountId
          ) {

            throw new Error(
              "Wargaming не повернув Account ID."
            );
          }


          // =================================
          // SAVE TO PROFILE
          // =================================

          const {
            error: saveError
          } =
            await supabase
              .from("profiles")
              .update({

                wot_nickname:
                  verifiedNickname,

                wot_account_id:
                  verifiedAccountId,

                wot_region:
                  verifiedRegion,

                wot_verified_at:
                  new Date()
                    .toISOString()

              })
              .eq(
                "id",
                user.id
              );


          // =================================
          // SAVE ERROR
          // =================================

          if (saveError) {

            console.error(
              "WOT: помилка збереження:",
              saveError
            );

            throw new Error(
              "Акаунт знайдено, але не вдалося зберегти його у профіль."
            );
          }


          // =================================
          // UPDATE UI
          // =================================

          nicknameInput.value =
            verifiedNickname;


          regionSelect.value =
            verifiedRegion;


          showVerifiedResult(
            verifiedNickname,
            verifiedAccountId,
            verifiedRegion
          );

        }


        catch (error) {

          console.error(
            "WOT: помилка перевірки:",
            error
          );


          setStatus(
            "❌ " +
            (
              error?.message ||
              "Не вдалося перевірити акаунт."
            ),
            "error"
          );

        }


        finally {

          verifyButton.disabled =
            false;

        }

      }
    );


    // ======================================
    // INITIAL LOAD
    // ======================================

    await loadWotProfile();


    console.log(
      "WOT PROFILE: готово"
    );

  }
);
