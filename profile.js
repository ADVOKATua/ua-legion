// ======================================
// UA LEGION — PROFILE SYSTEM
// profile.js
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
    // ПЕРЕВІРКА АВТОРИЗАЦІЇ
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
    // ЕЛЕМЕНТИ СТОРІНКИ
    // ======================================

    const profileForm =
      document.getElementById(
        "profileForm"
      );


    const displayName =
      document.getElementById(
        "displayName"
      );


    const birthDate =
      document.getElementById(
        "birthDate"
      );


    const avatarUrl =
      document.getElementById(
        "avatarUrl"
      );


    const discordUsername =
      document.getElementById(
        "discordUsername"
      );


    const discordUserId =
      document.getElementById(
        "discordUserId"
      );


    const steamId =
      document.getElementById(
        "steamId"
      );


    const gameNickname =
      document.getElementById(
        "gameNickname"
      );


    const profileAvatar =
      document.getElementById(
        "profileAvatar"
      );


    const profileNamePreview =
      document.getElementById(
        "profileNamePreview"
      );


    const messageBox =
      document.getElementById(
        "profileMessage"
      );


    const logoutButton =
      document.getElementById(
        "logoutButton"
      );


    const rolesList =
      document.getElementById(
        "rolesList"
      );


    const applicationStatus =
      document.getElementById(
        "applicationStatus"
      );


    const joinButton =
      document.getElementById(
        "joinButton"
      );


    let currentAvatarUrl =
      null;


    let previewObjectUrl =
      null;


    // ======================================
    // ПОВІДОМЛЕННЯ
    // ======================================

    function showMessage(
      message,
      type = "success"
    ) {

      if (
        !messageBox
      ) {
        return;
      }


      messageBox.textContent =
        message;


      messageBox.className =
        "profile-message " +
        type;

    }


    // ======================================
    // ПОПЕРЕДНІЙ ПЕРЕГЛЯД АВАТАРА
    // ======================================

    if (
      avatarUrl
    ) {

      avatarUrl.addEventListener(
        "change",
        () => {

          const file =
            avatarUrl
              .files
              ?.[
                0
              ];


          if (
            !file
          ) {
            return;
          }


          if (
            !file.type.startsWith(
              "image/"
            )
          ) {

            showMessage(
              "Будь ласка, виберіть файл зображення.",
              "error"
            );


            avatarUrl.value =
              "";

            return;

          }


          if (
            file.size >
            10 * 1024 * 1024
          ) {

            showMessage(
              "Розмір аватара не повинен перевищувати 10 MB.",
              "error"
            );


            avatarUrl.value =
              "";

            return;

          }


          if (
            previewObjectUrl
          ) {

            URL.revokeObjectURL(
              previewObjectUrl
            );

          }


          previewObjectUrl =
            URL.createObjectURL(
              file
            );


          if (
            profileAvatar
          ) {

            profileAvatar.src =
              previewObjectUrl;

          }

        }
      );

    }


    // ======================================
    // ЗАВАНТАЖЕННЯ ПРОФІЛЮ
    // ======================================

    async function loadProfile() {

      const {
        data: profile,
        error
      } =
        await supabase
          .from(
            "profiles"
          )
          .select(
            "*"
          )
          .eq(
            "id",
            user.id
          )
          .maybeSingle();


      if (
        error
      ) {

        console.error(
          "Помилка завантаження профілю:",
          error
        );


        showMessage(
          error.message,
          "error"
        );

        return;

      }


      if (
        !profile
      ) {
        return;
      }


      // --------------------------------------
      // ІМ'Я
      // --------------------------------------

      if (
        profile.display_name &&
        displayName
      ) {

        displayName.value =
          profile.display_name;


        if (
          profileNamePreview
        ) {

          profileNamePreview.textContent =
            profile.display_name;

        }

      }


      // --------------------------------------
      // ДАТА НАРОДЖЕННЯ
      // --------------------------------------

      if (
        profile.birth_date &&
        birthDate
      ) {

        birthDate.value =
          profile.birth_date;

      }


      // --------------------------------------
      // АВАТАР
      // --------------------------------------

      currentAvatarUrl =
        profile.avatar_url ||
        null;


      if (
        currentAvatarUrl &&
        profileAvatar
      ) {

        profileAvatar.src =
          currentAvatarUrl;

      }


      // --------------------------------------
      // DISCORD
      // --------------------------------------

      if (
        profile.discord_username &&
        discordUsername
      ) {

        discordUsername.value =
          profile.discord_username;

      }


      if (
        profile.discord_user_id &&
        discordUserId
      ) {

        discordUserId.value =
          profile.discord_user_id;

      }


      // --------------------------------------
      // STEAM
      // --------------------------------------

      if (
        profile.steam_id &&
        steamId
      ) {

        steamId.value =
          profile.steam_id;

      }


      // --------------------------------------
      // GAME NICKNAME
      // --------------------------------------

      if (
        profile.game_nickname &&
        gameNickname
      ) {

        gameNickname.value =
          profile.game_nickname;

      }

    }


    // ======================================
    // СТАТУС МОЇХ ЗАЯВОК
    // ======================================

    async function loadApplicationStatus() {

      if (
        !applicationStatus
      ) {
        return;
      }


      // --------------------------------------
      // LOADING
      // --------------------------------------

      applicationStatus.className =
        "application-card";


      applicationStatus.innerHTML =
        `
          <h3>
            📝 Мої заявки
          </h3>

          <p>
            Завантаження заявок...
          </p>
        `;


      // --------------------------------------
      // LOAD ALL APPLICATIONS
      // --------------------------------------

      const {
        data: applications,
        error
      } =
        await supabase
          .from(
            "applications"
          )
          .select(
            "id, direction, status, created_at"
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


      // --------------------------------------
      // ERROR
      // --------------------------------------

      if (
        error
      ) {

        console.error(
          "Помилка завантаження заявок:",
          error
        );


        applicationStatus.className =
          "application-card";


        applicationStatus.innerHTML =
          `
            <h3>
              ⚠️ Не вдалося завантажити заявки
            </h3>

            <p>
              ${error.message}
            </p>
          `;


        return;

      }


      // --------------------------------------
      // DIRECTION NAMES
      // --------------------------------------

      const directionNames =
        {

          ets2:
            "🚛 ETS2 / TruckersMP",

          wot:
            "🪖 World of Tanks",

          dota2:
            "⚔️ Dota 2",

          wow:
            "🐉 World of Warcraft"

        };


      // --------------------------------------
      // STATUS INFO
      // --------------------------------------

      const statusInfo =
        {

          pending:
            {

              icon:
                "⏳",

              title:
                "На розгляді",

              description:
                "Заявка очікує рішення адміністрації."

            },


          approved:
            {

              icon:
                "✅",

              title:
                "Схвалено",

              description:
                "Вас прийнято до цього напрямку."

            },


          rejected:
            {

              icon:
                "❌",

              title:
                "Відхилено",

              description:
                "Заявку було відхилено."

            }

        };


      // --------------------------------------
      // NO APPLICATIONS
      // --------------------------------------

      if (
        !applications ||
        applications.length === 0
      ) {

        applicationStatus.className =
          "application-card none";


        applicationStatus.innerHTML =
          `
            <h3>
              📝 Заявок поки немає
            </h3>

            <p>
              Ви ще не подавали заявки
              до напрямків UA LEGION.
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


      // --------------------------------------
      // RENDER APPLICATIONS
      // --------------------------------------

      applicationStatus.className =
        "application-card";


      let applicationsHtml =
        `
          <h3>
            📝 Мої заявки
          </h3>
        `;


      applications.forEach(
        application => {

          const directionName =
            directionNames[
              application.direction
            ] ||
            application.direction ||
            "Невідомий напрямок";


          const status =
            statusInfo[
              application.status
            ] ||
            {

              icon:
                "ℹ️",

              title:
                application.status ||
                "Невідомий статус",

              description:
                ""

            };


          applicationsHtml +=
            `

              <div
                class="application-item"
              >

                <div
                  class="application-direction"
                >

                  ${directionName}

                </div>


                <div
                  class="application-status ${application.status}"
                >

                  <strong>

                    ${status.icon}
                    ${status.title}

                  </strong>


                  <span>

                    ${status.description}

                  </span>

                </div>

              </div>

            `;

        }
      );


      applicationStatus.innerHTML =
        applicationsHtml;


      // --------------------------------------
      // JOIN BUTTON
      // --------------------------------------

      if (
        joinButton
      ) {

        joinButton.style.display =
          "inline-flex";


        joinButton.href =
          "join.html";


        joinButton.textContent =
          "📝 ПОДАТИ ЗАЯВКУ НА ІНШИЙ НАПРЯМОК";

      }

    }


    // ======================================
    // ЗАВАНТАЖЕННЯ НАПРЯМКІВ ПРОФІЛЮ
    // ======================================

    async function loadDirections() {

      const {
        data: allDirections,
        error: directionsError
      } =
        await supabase
          .from(
            "directions"
          )
          .select(
            "id, slug"
          );


      if (
        directionsError
      ) {

        console.error(
          "Помилка читання directions:",
          directionsError
        );

        return;

      }


      const directionMap =
        new Map(
          (
            allDirections ||
            []
          ).map(
            direction => [
              String(
                direction.id
              ),
              direction.slug
            ]
          )
        );


      const {
        data: selectedRows,
        error: selectedError
      } =
        await supabase
          .from(
            "profile_directions"
          )
          .select(
            "direction_id"
          )
          .eq(
            "profile_id",
            user.id
          );


      if (
        selectedError
      ) {

        console.error(
          "Помилка завантаження напрямків:",
          selectedError
        );

        return;

      }


      document
        .querySelectorAll(
          'input[name="direction"]'
        )
        .forEach(
          checkbox => {

            checkbox.checked =
              false;

          }
        );


      (
        selectedRows ||
        []
      ).forEach(
        row => {

          const slug =
            directionMap.get(
              String(
                row.direction_id
              )
            );


          if (
            !slug
          ) {
            return;
          }


          const checkbox =
            document.querySelector(
              `input[name="direction"][value="${slug}"]`
            );


          if (
            checkbox
          ) {

            checkbox.checked =
              true;

          }

        }
      );

    }


    // ======================================
    // ЗАВАНТАЖЕННЯ РОЛЕЙ
    // ======================================

    async function loadUserRoles() {

      if (
        !rolesList
      ) {
        return;
      }


      rolesList.innerHTML =
        `
          <div class="roles-empty">
            Завантаження ролей...
          </div>
        `;


      const {
        data: userRoles,
        error: userRolesError
      } =
        await supabase
          .from(
            "user_roles"
          )
          .select(
            "role_id, direction_id"
          )
          .eq(
            "user_id",
            user.id
          );


      if (
        userRolesError
      ) {

        console.error(
          "Помилка user_roles:",
          userRolesError
        );


        rolesList.innerHTML =
          `
            <div class="roles-empty">
              Не вдалося завантажити ролі.
            </div>
          `;

        return;

      }


      if (
        !userRoles ||
        userRoles.length === 0
      ) {

        window.currentUserRoles =
          [];


        renderUserRoles(
          []
        );

        return;

      }


      // --------------------------------------
      // ROLE IDS
      // --------------------------------------

      const roleIds =
        [
          ...new Set(
            userRoles
              .map(
                item =>
                  item.role_id
              )
              .filter(
                Boolean
              )
          )
        ];


      const {
        data: roles,
        error: rolesError
      } =
        await supabase
          .from(
            "roles"
          )
          .select(
            "id, code, name"
          )
          .in(
            "id",
            roleIds
          );


      if (
        rolesError
      ) {

        console.error(
          "Помилка roles:",
          rolesError
        );


        rolesList.innerHTML =
          `
            <div class="roles-empty">
              Не вдалося завантажити інформацію про ролі.
            </div>
          `;

        return;

      }


      // --------------------------------------
      // DIRECTION IDS
      // --------------------------------------

      const directionIds =
        [
          ...new Set(
            userRoles
              .map(
                item =>
                  item.direction_id
              )
              .filter(
                Boolean
              )
          )
        ];


      let directions =
        [];


      if (
        directionIds.length > 0
      ) {

        const {
          data: directionsData,
          error: directionsError
        } =
          await supabase
            .from(
              "directions"
            )
            .select(
              "id, name, slug"
            )
            .in(
              "id",
              directionIds
            );


        if (
          directionsError
        ) {

          console.error(
            "Помилка directions:",
            directionsError
          );

        } else {

          directions =
            directionsData ||
            [];

        }

      }


      // --------------------------------------
      // MAPS
      // --------------------------------------

      const rolesMap =
        new Map(
          (
            roles ||
            []
          ).map(
            role => [
              String(
                role.id
              ),
              role
            ]
          )
        );


      const directionsMap =
        new Map(
          directions.map(
            direction => [
              String(
                direction.id
              ),
              direction
            ]
          )
        );


      // --------------------------------------
      // FULL ROLES
      // --------------------------------------

      const fullRoles =
        userRoles.map(
          item => ({

            role_id:
              item.role_id,

            direction_id:
              item.direction_id,

            roles:
              rolesMap.get(
                String(
                  item.role_id
                )
              ) ||
              null,

            directions:
              item.direction_id
                ? (
                    directionsMap.get(
                      String(
                        item.direction_id
                      )
                    ) ||
                    null
                  )
                : null

          })
        );


      // --------------------------------------
      // SORT
      // --------------------------------------

      fullRoles.sort(
        (
          a,
          b
        ) => {

          if (
            a.direction_id === null &&
            b.direction_id !== null
          ) {

            return -1;

          }


          if (
            a.direction_id !== null &&
            b.direction_id === null
          ) {

            return 1;

          }


          return 0;

        }
      );


      window.currentUserRoles =
        fullRoles;


      renderUserRoles(
        fullRoles
      );

    }


    // ======================================
    // ВІДОБРАЖЕННЯ РОЛЕЙ
    // ======================================

    function renderUserRoles(
      roles
    ) {

      if (
        !rolesList
      ) {
        return;
      }


      rolesList.innerHTML =
        "";


      // --------------------------------------
      // EMPTY
      // --------------------------------------

      if (
        !roles ||
        roles.length === 0
      ) {

        rolesList.innerHTML =
          `
            <div class="roles-empty">
              У вас поки немає
              призначених ролей.
            </div>
          `;

        return;

      }


      // --------------------------------------
      // GLOBAL ROLES
      // --------------------------------------

      const globalRoles =
        roles.filter(
          item =>
            (
              item.direction_id === null ||
              item.direction_id === undefined
            ) &&
            item.roles
        );


      globalRoles.forEach(
        item => {

          const roleCard =
            document.createElement(
              "div"
            );


          roleCard.className =
            "role-card global";


          const roleName =
            item.roles?.name ||
            "Невідома роль";


          const roleCode =
            item.roles?.code ||
            "";


          let roleIcon =
            "👤";


          if (
            roleCode === "owner"
          ) {

            roleIcon =
              "👑";

          } else if (
            roleCode ===
            "deputy_owner"
          ) {

            roleIcon =
              "🛡️";

          } else if (
            roleCode ===
            "top_manager"
          ) {

            roleIcon =
              "🏆";

          } else if (
            roleCode ===
            "hr_manager"
          ) {

            roleIcon =
              "👥";

          } else if (
            roleCode ===
            "logistics_manager"
          ) {

            roleIcon =
              "🚛";

          }


          roleCard.innerHTML =
            `
              <h3>

                ${roleIcon}

                ${roleName}

              </h3>

              <p>
                Глобальна роль
              </p>
            `;


          rolesList.appendChild(
            roleCard
          );

        }
      );


      // --------------------------------------
      // DIRECTION ROLES
      // --------------------------------------

      const directionGroups =
        new Map();


      roles.forEach(
        item => {

          if (
            item.direction_id === null ||
            item.direction_id === undefined ||
            !item.directions ||
            !item.roles
          ) {
            return;
          }


          const directionId =
            String(
              item.direction_id
            );


          if (
            !directionGroups.has(
              directionId
            )
          ) {

            directionGroups.set(
              directionId,
              {

                name:
                  item.directions.name ||
                  "Невідомий напрямок",

                roles:
                  []

              }
            );

          }


          const group =
            directionGroups.get(
              directionId
            );


          if (
            item.roles?.name
          ) {

            group.roles.push(
              item.roles.name
            );

          }

        }
      );


      directionGroups.forEach(
        group => {

          if (
            !group.roles ||
            group.roles.length === 0
          ) {
            return;
          }


          const directionCard =
            document.createElement(
              "div"
            );


          directionCard.className =
            "role-card";


          directionCard.innerHTML =
            `
              <h3>
                ${group.name}
              </h3>

              <p>

                Посади
                ${group.name}:

                ${group.roles.join(
                  ", "
                )}

              </p>
            `;


          rolesList.appendChild(
            directionCard
          );

        }
      );


      // --------------------------------------
      // EMPTY AFTER FILTER
      // --------------------------------------

      if (
        !rolesList.children.length
      ) {

        rolesList.innerHTML =
          `
            <div class="roles-empty">
              У вас поки немає
              призначених ролей.
            </div>
          `;

      }

    }


    // ======================================
    // ЗБЕРЕЖЕННЯ ПРОФІЛЮ
    // ======================================

    if (
      profileForm
    ) {

      profileForm.addEventListener(
        "submit",
        async event => {

          event.preventDefault();


          showMessage(
            "Збереження профілю..."
          );


          // --------------------------------------
          // SELECTED DIRECTIONS
          // --------------------------------------

          const selectedSlugs =
            Array.from(
              document.querySelectorAll(
                'input[name="direction"]:checked'
              )
            ).map(
              checkbox =>
                checkbox.value
            );


          let uploadedAvatarUrl =
            null;


          const avatarFile =
            avatarUrl
              ?.files
              ?.[
                0
              ];


          // --------------------------------------
          // UPLOAD AVATAR
          // --------------------------------------

          if (
            avatarFile
          ) {

            if (
              !avatarFile.type.startsWith(
                "image/"
              )
            ) {

              showMessage(
                "Будь ласка, виберіть файл зображення.",
                "error"
              );

              return;

            }


            if (
              avatarFile.size >
              10 * 1024 * 1024
            ) {

              showMessage(
                "Розмір аватара не повинен перевищувати 10 MB.",
                "error"
              );

              return;

            }


            showMessage(
              "Завантаження аватара..."
            );


            const originalExtension =
              avatarFile.name
                .split(
                  "."
                )
                .pop()
                ?.toLowerCase();


            const fileExtension =
              originalExtension &&
              /^[a-z0-9]+$/.test(
                originalExtension
              )
                ? originalExtension
                : "png";


            const filePath =
              `${user.id}/avatar-${Date.now()}.${fileExtension}`;


            const {
              error: uploadError
            } =
              await supabase
                .storage
                .from(
                  "avatars"
                )
                .upload(
                  filePath,
                  avatarFile,
                  {

                    cacheControl:
                      "3600",

                    upsert:
                      false,

                    contentType:
                      avatarFile.type

                  }
                );


            if (
              uploadError
            ) {

              console.error(
                "Помилка завантаження аватара:",
                uploadError
              );


              showMessage(
                "Не вдалося завантажити аватар: " +
                uploadError.message,
                "error"
              );

              return;

            }


            const {
              data: publicUrlData
            } =
              supabase
                .storage
                .from(
                  "avatars"
                )
                .getPublicUrl(
                  filePath
                );


            uploadedAvatarUrl =
              publicUrlData?.publicUrl ||
              null;


            if (
              !uploadedAvatarUrl
            ) {

              showMessage(
                "Аватар завантажено, але не вдалося отримати його URL.",
                "error"
              );

              return;

            }


            if (
              profileAvatar
            ) {

              profileAvatar.src =
                uploadedAvatarUrl;

            }

          }


          // --------------------------------------
          // SAVE PROFILE
          // --------------------------------------

          const avatarToSave =
            uploadedAvatarUrl ||
            currentAvatarUrl ||
            null;


          const {
            error: profileError
          } =
            await supabase
              .from(
                "profiles"
              )
              .upsert(
                {

                  id:
                    user.id,

                  display_name:
                    displayName
                      ?.value
                      .trim() ||
                    null,

                  birth_date:
                    birthDate
                      ?.value ||
                    null,

                  avatar_url:
                    avatarToSave,

                  discord_username:
                    discordUsername
                      ?.value
                      .trim() ||
                    null,

                  discord_user_id:
                    discordUserId
                      ?.value
                      .trim() ||
                    null,

                  steam_id:
                    steamId
                      ?.value
                      .trim() ||
                    null,

                  game_nickname:
                    gameNickname
                      ?.value
                      .trim() ||
                    null,

                  updated_at:
                    new Date()
                      .toISOString()

                },
                {

                  onConflict:
                    "id"

                }
              );


          if (
            profileError
          ) {

            console.error(
              "Помилка профілю:",
              profileError
            );


            showMessage(
              profileError.message,
              "error"
            );

            return;

          }


          // --------------------------------------
          // LOAD SELECTED DIRECTIONS
          // --------------------------------------

          let selectedDirections =
            [];


          if (
            selectedSlugs.length > 0
          ) {

            const {
              data: directions,
              error: directionsError
            } =
              await supabase
                .from(
                  "directions"
                )
                .select(
                  "id, slug"
                )
                .in(
                  "slug",
                  selectedSlugs
                );


            if (
              directionsError
            ) {

              showMessage(
                "Не вдалося зберегти напрямки: " +
                directionsError.message,
                "error"
              );

              return;

            }


            selectedDirections =
              directions ||
              [];

          }


          // --------------------------------------
          // DELETE OLD DIRECTIONS
          // --------------------------------------

          const {
            error: deleteError
          } =
            await supabase
              .from(
                "profile_directions"
              )
              .delete()
              .eq(
                "profile_id",
                user.id
              );


          if (
            deleteError
          ) {

            showMessage(
              deleteError.message,
              "error"
            );

            return;

          }


          // --------------------------------------
          // INSERT DIRECTIONS
          // --------------------------------------

          if (
            selectedDirections.length > 0
          ) {

            const rowsToInsert =
              selectedDirections.map(
                direction => ({

                  profile_id:
                    user.id,

                  direction_id:
                    direction.id

                })
              );


            const {
              error: insertError
            } =
              await supabase
                .from(
                  "profile_directions"
                )
                .insert(
                  rowsToInsert
                );


            if (
              insertError
            ) {

              showMessage(
                insertError.message,
                "error"
              );

              return;

            }

          }


          // --------------------------------------
          // UPDATE LOCAL AVATAR
          // --------------------------------------

          if (
            uploadedAvatarUrl
          ) {

            currentAvatarUrl =
              uploadedAvatarUrl;


            if (
              previewObjectUrl
            ) {

              URL.revokeObjectURL(
                previewObjectUrl
              );


              previewObjectUrl =
                null;

            }


            if (
              avatarUrl
            ) {

              avatarUrl.value =
                "";

            }

          }


          // --------------------------------------
          // UPDATE NAME PREVIEW
          // --------------------------------------

          if (
            displayName
              ?.value
              .trim() &&
            profileNamePreview
          ) {

            profileNamePreview.textContent =
              displayName
                .value
                .trim();

          }


          showMessage(
            "Профіль успішно збережено!",
            "success"
          );

        }
      );

    }


    // ======================================
    // ВИХІД
    // ======================================

    if (
      logoutButton
    ) {

      logoutButton.addEventListener(
        "click",
        async () => {

          const {
            error
          } =
            await supabase
              .auth
              .signOut();


          if (
            error
          ) {

            console.error(
              "Помилка виходу:",
              error
            );

            return;

          }


          window.location.href =
            "index.html";

        }
      );

    }


    // ======================================
    // ЗАПУСК
    // ======================================

    await loadProfile();

    await loadDirections();

    await loadApplicationStatus();

    await loadUserRoles();

  }
);
