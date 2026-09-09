  // ======================================
  // СТАТУС ЗАЯВОК
  // ПОКАЗУЄМО ТІЛЬКИ ОСТАННЮ ЗАЯВКУ
  // ДЛЯ КОЖНОГО НАПРЯМКУ
  // ======================================

  async function loadApplicationStatus() {

    if (!applicationStatus) {
      return;
    }


    applicationStatus.className =
      "application-card";


    applicationStatus.innerHTML = `
      <h3>📝 Мої заявки</h3>

      <p>
        Завантаження заявок...
      </p>
    `;


    // ======================================
    // ЗАВАНТАЖУЄМО ВСІ ЗАЯВКИ КОРИСТУВАЧА
    // ======================================

    const {
      data: applications,
      error
    } =
      await supabase
        .from(
          "applications"
        )
        .select(
          `
            id,
            direction,
            directions,
            status,
            created_at
          `
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


    // ======================================
    // ПОМИЛКА
    // ======================================

    if (
      error
    ) {

      console.error(
        "Помилка завантаження заявок:",
        error
      );


      applicationStatus.className =
        "application-card";


      applicationStatus.innerHTML = `
        <h3>
          ⚠️ Не вдалося перевірити заявки
        </h3>

        <p>
          ${error.message}
        </p>
      `;


      return;

    }


    // ======================================
    // НЕМАЄ ЗАЯВОК
    // ======================================

    if (
      !applications ||
      applications.length === 0
    ) {

      applicationStatus.className =
        "application-card none";


      applicationStatus.innerHTML = `
        <h3>
          📝 Заявок ще немає
        </h3>

        <p>
          Ви можете подати заявку
          на вступ до UA LEGION.
        </p>
      `;


      if (
        joinButton
      ) {

        joinButton.style.display =
          "inline-flex";


        joinButton.href =
          "join.html";


        joinButton.textContent =
          "📝 ПОДАТИ ЗАЯВКУ";

      }


      return;

    }


    // ======================================
    // ВИЗНАЧАЄМО НАПРЯМОК
    // ПІДТРИМКА СТАРИХ І НОВИХ ЗАЯВОК
    // ======================================

    function getApplicationDirection(
      application
    ) {

      // --------------------------------------
      // НОВА СТРУКТУРА
      // direction = "ets2"
      // --------------------------------------

      if (
        application.direction &&
        String(
          application.direction
        ).trim()
      ) {

        return String(
          application.direction
        )
          .trim()
          .toLowerCase();

      }


      // --------------------------------------
      // СТАРА СТРУКТУРА
      // directions = ["ETS2"]
      // --------------------------------------

      if (
        Array.isArray(
          application.directions
        ) &&
        application.directions.length > 0
      ) {

        return String(
          application.directions[0]
        )
          .trim()
          .toLowerCase();

      }


      // --------------------------------------
      // ІНКОЛИ JSONB МОЖЕ ПРИЙТИ
      // ЯК ТЕКСТ
      // --------------------------------------

      if (
        typeof application.directions ===
        "string"
      ) {

        const value =
          application.directions
            .trim();


        if (
          value
        ) {

          return value
            .replace(
              /[\[\]"]/g,
              ""
            )
            .trim()
            .toLowerCase();

        }

      }


      return null;

    }


    // ======================================
    // НАЗВИ НАПРЯМКІВ
    // ======================================

    function getDirectionName(
      direction
    ) {

      const directionNames = {

        ets2:
          "ETS2 / TruckersMP",

        wot:
          "World of Tanks",

        dota2:
          "Dota 2",

        dota:
          "Dota 2",

        wow:
          "World of Warcraft",

        "world of tanks":
          "World of Tanks",

        "world of warcraft":
          "World of Warcraft",

        ets:
          "ETS2 / TruckersMP"

      };


      return (
        directionNames[
          String(
            direction
          ).toLowerCase()
        ] ||
        String(
          direction
        ).toUpperCase()
      );

    }


    // ======================================
    // БЕРЕМО ТІЛЬКИ ОСТАННЮ ЗАЯВКУ
    // ДЛЯ КОЖНОГО НАПРЯМКУ
    // ======================================

    const latestApplications =
      new Map();


    applications.forEach(
      application => {

        const direction =
          getApplicationDirection(
            application
          );


        // Якщо напрямок визначити неможливо —
        // не показуємо цей старий запис.
        if (
          !direction
        ) {

          return;

        }


        // Оскільки запит уже відсортований
        // від найновішої заявки до найстарішої,
        // перша знайдена заявка — остання.
        if (
          !latestApplications.has(
            direction
          )
        ) {

          latestApplications.set(
            direction,
            application
          );

        }

      }
    );


    // ======================================
    // ПЕРЕТВОРЮЄМО MAP У МАСИВ
    // ======================================

    const latestList =
      Array.from(
        latestApplications.entries()
      ).map(
        (
          [
            direction,
            application
          ]
        ) => ({

          direction:
            direction,

          application:
            application

        })
      );


    // ======================================
    // ЯКЩО НЕМАЄ КОРЕКТНИХ ЗАЯВОК
    // ======================================

    if (
      latestList.length === 0
    ) {

      applicationStatus.className =
        "application-card none";


      applicationStatus.innerHTML = `
        <h3>
          📝 Заявок ще немає
        </h3>

        <p>
          У ваших заявках не знайдено
          визначеного напрямку.
        </p>
      `;


      if (
        joinButton
      ) {

        joinButton.style.display =
          "inline-flex";


        joinButton.href =
          "join.html";


        joinButton.textContent =
          "📝 ПОДАТИ ЗАЯВКУ";

      }


      return;

    }


    // ======================================
    // СТВОРЮЄМО HTML
    // ======================================

    let applicationsHtml =
      `
        <h3>
          📝 Мої заявки
        </h3>
      `;


    let hasPending =
      false;


    latestList.forEach(
      item => {

        const directionName =
          getDirectionName(
            item.direction
          );


        const status =
          item.application.status;


        // --------------------------------------
        // PENDING
        // --------------------------------------

        if (
          status === "pending"
        ) {

          hasPending =
            true;


          applicationsHtml += `

            <div
              class="application-item pending"
            >

              <h4>
                ⏳ На розгляді
              </h4>

              <p>
                Ваша заявка очікує
                рішення адміністрації.
              </p>

              <strong>
                ${directionName}
              </strong>

            </div>

          `;

        }


        // --------------------------------------
        // APPROVED
        // --------------------------------------

        else if (
          status === "approved"
        ) {

          applicationsHtml += `

            <div
              class="application-item approved"
            >

              <h4>
                ✅ Схвалено
              </h4>

              <p>
                Ваша заявка схвалена.
              </p>

              <strong>
                ${directionName}
              </strong>

            </div>

          `;

        }


        // --------------------------------------
        // REJECTED
        // --------------------------------------

        else if (
          status === "rejected"
        ) {

          applicationsHtml += `

            <div
              class="application-item rejected"
            >

              <h4>
                ❌ Відхилено
              </h4>

              <p>
                Ваша заявка була відхилена.
              </p>

              <strong>
                ${directionName}
              </strong>

            </div>

          `;

        }


        // --------------------------------------
        // ІНШИЙ СТАТУС
        // --------------------------------------

        else {

          applicationsHtml += `

            <div
              class="application-item"
            >

              <h4>
                ℹ️ Статус заявки
              </h4>

              <p>
                Поточний статус:
                ${status}
              </p>

              <strong>
                ${directionName}
              </strong>

            </div>

          `;

        }

      }
    );


    // ======================================
    // ВИВОДИМО ЗАЯВКИ
    // ======================================

    applicationStatus.className =
      "application-card";


    applicationStatus.innerHTML =
      applicationsHtml;


    // ======================================
    // КНОПКА НОВОЇ ЗАЯВКИ
    // ======================================

    if (
      joinButton
    ) {

      if (
        hasPending
      ) {

        joinButton.style.display =
          "none";

      } else {

        joinButton.style.display =
          "inline-flex";


        joinButton.href =
          "join.html";


        joinButton.textContent =
          "📝 ПОДАТИ ЗАЯВКУ НА ІНШИЙ НАПРЯМОК";

      }

    }

  }
