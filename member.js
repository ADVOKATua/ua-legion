// ======================================
// UA LEGION — MEMBER PAGE
// member.js
// ======================================

document.addEventListener("DOMContentLoaded", async () => {

    // ======================================
    // SUPABASE
    // ======================================

    const supabase = window.supabaseClient;

    if (!supabase) {
        console.error(
            "UA LEGION: Supabase не підключений"
        );
        return;
    }


    // ======================================
    // DOM
    // ======================================

    const memberAvatar =
        document.getElementById("memberAvatar");

    const memberName =
        document.getElementById("memberName");

    const memberNickname =
        document.getElementById("memberNickname");

    const memberGlobalRoles =
        document.getElementById("memberGlobalRoles");

    const directionsList =
        document.getElementById("directionsList");

    const ets2Management =
        document.getElementById("ets2Management");

    const ets2ManagementCard =
        document.getElementById("ets2ManagementCard");

    const memberError =
        document.getElementById("memberError");


    // ======================================
    // USER ID
    // ======================================

    const params =
        new URLSearchParams(
            window.location.search
        );

    const targetUserId =
        params.get("user_id");


    if (!targetUserId) {

        showError(
            "Не вказано user_id"
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
        error: authError
    } = await supabase.auth.getUser();


    if (authError || !user) {

        showError(
            "Користувач не авторизований"
        );

        return;
    }


    // ======================================
    // HELPERS
    // ======================================

    function escapeHtml(value) {

        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }

        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }


    function showError(message) {

        console.error(
            "MEMBER PAGE ERROR:",
            message
        );


        if (memberError) {

            memberError.textContent =
                message;

            memberError.style.display =
                "block";
        }
    }


    function clearError() {

        if (memberError) {

            memberError.textContent =
                "";

            memberError.style.display =
                "none";
        }
    }


    function setLoading(
        element,
        text
    ) {

        if (!element) {
            return;
        }


        element.innerHTML = `
            <div class="management-locked">
                ⏳ ${escapeHtml(text)}
            </div>
        `;
    }


    // ======================================
    // PERMISSION
    // ======================================

    async function hasPermission(
        permissionCode,
        directionId = null
    ) {

        const {
            data,
            error
        } = await supabase.rpc(
            "has_permission",
            {
                p_permission_code:
                    permissionCode,

                p_direction_id:
                    directionId
            }
        );


        if (error) {

            console.error(
                "Permission error:",
                permissionCode,
                error
            );

            return false;
        }


        return data === true;
    }


    // ======================================
    // LOAD PROFILE
    // ======================================

    async function loadProfile() {

        const {
            data,
            error
        } = await supabase
            .from("profiles")
            .select(`
                id,
                display_name,
                game_nickname,
                avatar_url,
                discord_username
            `)
            .eq(
                "id",
                targetUserId
            )
            .maybeSingle();


        if (error) {
            throw error;
        }


        if (!data) {

            throw new Error(
                "Профіль користувача не знайдено"
            );
        }


        // ----------------------------------
        // NAME
        // ----------------------------------

        if (memberName) {

            memberName.textContent =
                data.display_name ||
                "Без імені";
        }


        // ----------------------------------
        // NICKNAME
        // ----------------------------------

        if (memberNickname) {

            memberNickname.textContent =
                data.game_nickname ||
                data.discord_username ||
                "";
        }


        // ----------------------------------
        // AVATAR
        // ----------------------------------

        if (memberAvatar) {

            if (data.avatar_url) {

                memberAvatar.src =
                    data.avatar_url;

                memberAvatar.classList.remove(
                    "avatar-empty"
                );

            } else {

                memberAvatar.src =
                    "https://ui-avatars.com/api/?name=" +
                    encodeURIComponent(
                        data.display_name ||
                        "User"
                    ) +
                    "&background=171a20&color=ffffff";

                memberAvatar.classList.add(
                    "avatar-empty"
                );
            }
        }

    }


    // ======================================
    // LOAD GLOBAL ROLES
    // ======================================

    async function loadGlobalRoles() {

        if (!memberGlobalRoles) {
            return;
        }


        const {
            data,
            error
        } = await supabase
            .from("user_roles")
            .select(`
                role_id,
                role,
                direction_id,
                roles (
                    code,
                    name,
                    level,
                    is_global,
                    is_active
                )
            `)
            .eq(
                "user_id",
                targetUserId
            )
            .is(
                "direction_id",
                null
            );


        if (error) {

            console.error(
                "GLOBAL roles error:",
                error
            );


            memberGlobalRoles.innerHTML = `
                <span class="empty-role">
                    Не вдалося завантажити глобальні посади
                </span>
            `;

            return;
        }


        const roles =
            (data || [])
                .map(row => {

                    const role =
                        row.roles;


                    if (
                        !role ||
                        role.is_global !== true ||
                        role.is_active !== true
                    ) {

                        return null;
                    }


                    return {

                        role_id:
                            row.role_id,

                        code:
                            role.code,

                        name:
                            role.name,

                        level:
                            role.level
                    };

                })
                .filter(Boolean)
                .sort(
                    (a, b) =>
                        (b.level || 0) -
                        (a.level || 0)
                );


        if (!roles.length) {

            memberGlobalRoles.innerHTML = `
                <span class="empty-role">
                    Глобальних посад немає
                </span>
            `;

            return;
        }


        memberGlobalRoles.innerHTML =
            roles
                .map(role => `
                    <span class="role-badge">
                        ${escapeHtml(
                            role.name
                        )}
                    </span>
                `)
                .join("");

    }


    // ======================================
    // LOAD ACTIVE DIRECTIONS
    // ======================================

    async function loadActiveDirections() {

        const {
            data,
            error
        } = await supabase.rpc(
            "get_active_directions"
        );


        if (error) {
            throw error;
        }


        return Array.isArray(data)
            ? data
            : [];
    }


    // ======================================
    // LOAD USER DIRECTION MANAGEMENT
    // ======================================

    async function loadDirectionManagement() {

        const {
            data,
            error
        } = await supabase.rpc(
            "get_user_direction_management",
            {
                p_target_user_id:
                    targetUserId
            }
        );


        if (error) {
            throw error;
        }


        if (
            !data ||
            data.success !== true
        ) {

            throw new Error(
                data?.error ||
                "Не вдалося отримати дані напрямків"
            );
        }


        return data;
    }


    // ======================================
    // LOAD ROLE OPTIONS
    // ======================================

    async function loadRoleOptions(
        directionId
    ) {

        const {
            data,
            error
        } = await supabase.rpc(
            "get_direction_role_options",
            {
                p_direction_id:
                    directionId
            }
        );


        if (error) {

            console.error(
                "Role options error:",
                error
            );

            return [];
        }


        if (
            !data ||
            data.success !== true
        ) {

            console.error(
                "Role options response:",
                data
            );

            return [];
        }


        // RPC returns:
        //
        // {
        //     success: true,
        //     direction_id: 1,
        //     roles: [...]
        // }
        //

        return Array.isArray(data.roles)
            ? data.roles
            : [];
    }


    // ======================================
    // ADD USER TO DIRECTION
    // ======================================

    async function addToDirection(
        direction,
        button
    ) {

        const confirmed =
            window.confirm(
                `Додати користувача до напрямку "${direction.name}"?`
            );


        if (!confirmed) {
            return;
        }


        if (button) {
            button.disabled = true;
        }


        const {
            data,
            error
        } = await supabase.rpc(
            "add_user_to_direction",
            {
                p_user_id:
                    targetUserId,

                p_direction_id:
                    direction.direction_id
            }
        );


        if (error) {

            console.error(
                "add_user_to_direction:",
                error
            );


            alert(
                "Помилка додавання до напрямку:\n" +
                error.message
            );


            if (button) {
                button.disabled = false;
            }


            return;
        }


        if (!data?.success) {

            alert(
                data?.error ||
                "Не вдалося додати користувача до напрямку"
            );


            if (button) {
                button.disabled = false;
            }


            return;
        }


        await loadPage();

    }


    // ======================================
    // REMOVE USER FROM DIRECTION
    // ======================================

    async function removeFromDirection(
        direction,
        button
    ) {

        const confirmed =
            window.confirm(
                `Виключити користувача з напрямку "${direction.name}"?\n\n` +
                `Усі посади цього напрямку також будуть зняті.`
            );


        if (!confirmed) {
            return;
        }


        if (button) {
            button.disabled = true;
        }


        const {
            data,
            error
        } = await supabase.rpc(
            "remove_user_from_direction",
            {
                p_user_id:
                    targetUserId,

                p_direction_id:
                    direction.direction_id
            }
        );


        if (error) {

            console.error(
                "remove_user_from_direction:",
                error
            );


            alert(
                "Помилка виключення:\n" +
                error.message
            );


            if (button) {
                button.disabled = false;
            }


            return;
        }


        if (!data?.success) {

            alert(
                data?.error ||
                "Не вдалося виключити користувача"
            );


            if (button) {
                button.disabled = false;
            }


            return;
        }


        await loadPage();

    }


    // ======================================
    // ASSIGN DIRECTION ROLE
    // ======================================

    async function assignDirectionRole(
        direction,
        roleId,
        button
    ) {

        if (!roleId) {

            alert(
                "Оберіть посаду"
            );

            return;
        }


        if (button) {
            button.disabled = true;
        }


        // ==================================
        // IMPORTANT:
        // assign_direction_role signature:
        //
        // p_user_id uuid
        // p_direction_id bigint
        // p_role_id bigint
        // ==================================

        const {
            data,
            error
        } = await supabase.rpc(
            "assign_direction_role",
            {
                p_user_id:
                    targetUserId,

                p_direction_id:
                    direction.direction_id,

                p_role_id:
                    Number(roleId)
            }
        );


        if (error) {

            console.error(
                "assign_direction_role:",
                error
            );


            alert(
                "Помилка призначення посади:\n" +
                error.message
            );


            if (button) {
                button.disabled = false;
            }


            return;
        }


        if (!data?.success) {

            alert(
                data?.error ||
                "Не вдалося призначити посаду"
            );


            if (button) {
                button.disabled = false;
            }


            return;
        }


        await loadPage();

    }


    // ======================================
    // REMOVE DIRECTION ROLE
    // ======================================

    async function removeDirectionRole(
        direction,
        role,
        button
    ) {

        const confirmed =
            window.confirm(
                `Зняти посаду "${role.name}"?`
            );


        if (!confirmed) {
            return;
        }


        if (button) {
            button.disabled = true;
        }


        const {
            data,
            error
        } = await supabase.rpc(
            "remove_direction_role",
            {
                p_user_id:
                    targetUserId,

                p_direction_id:
                    direction.direction_id,

                p_role_id:
                    Number(role.role_id)
            }
        );


        if (error) {

            console.error(
                "remove_direction_role:",
                error
            );


            alert(
                "Помилка зняття посади:\n" +
                error.message
            );


            if (button) {
                button.disabled = false;
            }


            return;
        }


        if (!data?.success) {

            alert(
                data?.error ||
                "Не вдалося зняти посаду"
            );


            if (button) {
                button.disabled = false;
            }


            return;
        }


        await loadPage();

    }


    // ======================================
    // SAVE ETS2 DRIVER CLASS
    // ======================================

    async function saveETS2DriverClass(
        direction,
        membership,
        select,
        button
    ) {

        const driverClass =
            select?.value || "";


        if (
            ![
                "A",
                "B",
                "C",
                "D",
                "E"
            ].includes(driverClass)
        ) {

            alert(
                "Оберіть клас водія"
            );

            return;
        }


        if (button) {
            button.disabled = true;
        }


        // ==================================
        // CURRENT ROLE IDS
        // ==================================

        const roleIds =
            (membership.roles || [])
                .map(
                    role =>
                        Number(
                            role.role_id
                        )
                )
                .filter(
                    roleId =>
                        !Number.isNaN(
                            roleId
                        )
                );


        // ==================================
        // DEBUG
        // ==================================

        console.log(
            "SAVE ETS2 MEMBER MANAGEMENT:",
            {
                p_target_user_id:
                    targetUserId,

                p_role_ids:
                    roleIds,

                p_driver_class:
                    driverClass
            }
        );


        // ==================================
        // IMPORTANT:
        //
        // REAL FUNCTION SIGNATURE:
        //
        // save_ets2_member_management(
        //     p_target_user_id uuid,
        //     p_role_ids bigint[],
        //     p_driver_class text
        // )
        //
        // ==================================

        const {
            data,
            error
        } = await supabase.rpc(
            "save_ets2_member_management",
            {
                p_target_user_id:
                    targetUserId,

                p_role_ids:
                    roleIds,

                p_driver_class:
                    driverClass
            }
        );


        if (error) {

            console.error(
                "save_ets2_member_management:",
                error
            );


            alert(
                "Помилка збереження класу:\n" +
                error.message
            );


            if (button) {
                button.disabled = false;
            }


            return;
        }


        if (!data?.success) {

            alert(
                data?.error ||
                "Не вдалося зберегти клас"
            );


            if (button) {
                button.disabled = false;
            }


            return;
        }


        console.log(
            "ETS2 MEMBER MANAGEMENT SAVED:",
            data
        );


        await loadPage();

    }


    // ======================================
    // DRIVER CLASS NAME
    // ======================================

    function getDriverClassName(
        driverClass
    ) {

        const names = {

            E:
                "«Стажер»",

            D:
                "«Водій»",

            C:
                "«Досвідчений водій»",

            B:
                "«Старший водій»",

            A:
                "«Майстер водій»"
        };


        return names[driverClass] ||
            "";
    }


    // ======================================
    // RENDER ONE DIRECTION
    // ======================================

    async function renderDirection(
        direction,
        management
    ) {

        const directionId =
            Number(
                direction.direction_id
            );


        // ==================================
        // FIND USER MEMBERSHIP
        // ==================================

        const membership =
            (management.directions || [])
                .find(
                    item =>
                        Number(
                            item.direction_id
                        ) ===
                        directionId
                );


        const isActive =
            membership?.status ===
            "active";


        // ==================================
        // PERMISSIONS
        // ==================================

        const canManageMembers =
            await hasPermission(
                "direction_members.manage",
                directionId
            );


        const canAssignRoles =
            await hasPermission(
                "direction_roles.assign",
                directionId
            );


        const canRemoveRoles =
            await hasPermission(
                "direction_roles.remove",
                directionId
            );


        const canChangeDriverClass =
            direction.code === "ets2"
                ? await hasPermission(
                    "ets2.driver_class.change",
                    directionId
                )
                : false;


        // ==================================
        // CURRENT ROLES
        // ==================================

        const roles =
            Array.isArray(
                membership?.roles
            )
                ? [...membership.roles]
                : [];


        roles.sort(
            (a, b) =>
                (b.level || 0) -
                (a.level || 0)
        );


        // ==================================
        // CREATE CARD
        // ==================================

        const card =
            document.createElement(
                "div"
            );


        card.className =
            "direction-card" +
            (
                isActive
                    ? " direction-active"
                    : ""
            );


        // ==================================
        // HEADER
        // ==================================

        const statusClass =
            isActive
                ? "active"
                : "not-active";


        const statusText =
            isActive
                ? "Активний"
                : "Не приєднаний";


        let html = `

            <div class="direction-head">

                <div>

                    <div class="direction-title">

                        ${escapeHtml(
                            direction.icon ||
                            "🎮"
                        )}

                        ${escapeHtml(
                            direction.name
                        )}

                    </div>

                </div>


                <span class="direction-status ${statusClass}">

                    ${statusText}

                </span>

            </div>


            <div class="direction-content">

                <div class="direction-label">
                    Посади
                </div>

        `;


        // ==================================
        // ROLES
        // ==================================

        if (roles.length) {

            html += `
                <div class="direction-roles">
            `;


            roles.forEach(role => {

                html += `
                    <span class="role-badge">
                        ${escapeHtml(
                            role.name
                        )}
                    </span>
                `;

            });


            html += `
                </div>
            `;

        } else {

            html += `
                <div class="empty-role">
                    Посад немає
                </div>
            `;
        }


        // ==================================
        // ETS2 DRIVER CLASS — VIEW
        // ==================================

        if (
            isActive &&
            direction.code === "ets2"
        ) {

            const driverClass =
                membership?.driver_class ||
                "";


            if (driverClass) {

                html += `

                    <div class="direction-class">

                        🚛 Клас
                        ${escapeHtml(
                            driverClass
                        )}
                        —
                        ${escapeHtml(
                            getDriverClassName(
                                driverClass
                            )
                        )}

                    </div>

                `;

            } else {

                html += `

                    <div class="direction-class">

                        🚛 Клас не визначений

                    </div>

                `;
            }
        }


        // ==================================
        // NOT MEMBER
        // ==================================

        if (!isActive) {

            if (canManageMembers) {

                html += `

                    <div class="direction-actions">

                        <button
                            type="button"
                            class="direction-button primary add-direction-button">

                            + ДОДАТИ ДО НАПРЯМКУ

                        </button>

                    </div>

                `;
            }


            html += `
                </div>
            `;


            card.innerHTML =
                html;


            directionsList.appendChild(
                card
            );


            const addButton =
                card.querySelector(
                    ".add-direction-button"
                );


            if (addButton) {

                addButton.addEventListener(
                    "click",
                    () =>
                        addToDirection(
                            direction,
                            addButton
                        )
                );
            }


            return;
        }


        // ==================================
        // ROLE MANAGEMENT
        // ==================================

        if (
            canAssignRoles ||
            canRemoveRoles
        ) {

            const roleOptions =
                await loadRoleOptions(
                    directionId
                );


            html += `

                <div class="direction-management">

                    <h4>
                        🛠 Керування посадами
                    </h4>

            `;


            // ==================================
            // ASSIGN ROLE
            // ==================================

            if (
                canAssignRoles &&
                roleOptions.length
            ) {

                const availableRoles =
                    roleOptions.filter(
                        option =>
                            !roles.some(
                                role =>
                                    Number(
                                        role.role_id
                                    ) ===
                                    Number(
                                        option.role_id
                                    )
                            )
                    );


                if (
                    availableRoles.length
                ) {

                    html += `

                        <select
                            class="role-select direction-role-select">

                            <option value="">
                                Оберіть посаду
                            </option>

                            ${
                                availableRoles
                                    .map(
                                        option => `
                                            <option
                                                value="${option.role_id}">

                                                ${escapeHtml(
                                                    option.name
                                                )}

                                            </option>
                                        `
                                    )
                                    .join("")
                            }

                        </select>


                        <div class="role-management-actions">

                            <button
                                type="button"
                                class="direction-button primary assign-role-button">

                                + ПРИЗНАЧИТИ ПОСАДУ

                            </button>

                        </div>

                    `;
                }
            }


            // ==================================
            // REMOVE CURRENT ROLES
            // ==================================

            if (
                canRemoveRoles &&
                roles.length
            ) {

                html += `

                    <div class="role-management-actions">

                `;


                roles.forEach(role => {

                    html += `

                        <button
                            type="button"
                            class="direction-button danger remove-role-button"
                            data-role-id="${role.role_id}">

                            ✕ ${escapeHtml(
                                role.name
                            )}

                        </button>

                    `;

                });


                html += `
                    </div>
                `;
            }


            html += `
                </div>
            `;
        }


        // ==================================
        // ETS2 DRIVER CLASS MANAGEMENT
        // ==================================

        if (
            isActive &&
            direction.code === "ets2" &&
            canChangeDriverClass
        ) {

            const driverClass =
                membership?.driver_class ||
                "";


            html += `

                <div class="direction-management">

                    <h4>
                        Клас водія ETS2
                    </h4>


                    <select
                        class="role-select ets2-driver-class-select">

                        <option
                            value=""
                            ${
                                !driverClass
                                    ? "selected"
                                    : ""
                            }>

                            Оберіть клас

                        </option>


                        <option
                            value="E"
                            ${
                                driverClass === "E"
                                    ? "selected"
                                    : ""
                            }>

                            Клас E — «Стажер»

                        </option>


                        <option
                            value="D"
                            ${
                                driverClass === "D"
                                    ? "selected"
                                    : ""
                            }>

                            Клас D — «Водій»

                        </option>


                        <option
                            value="C"
                            ${
                                driverClass === "C"
                                    ? "selected"
                                    : ""
                            }>

                            Клас C — «Досвідчений водій»

                        </option>


                        <option
                            value="B"
                            ${
                                driverClass === "B"
                                    ? "selected"
                                    : ""
                            }>

                            Клас B — «Старший водій»

                        </option>


                        <option
                            value="A"
                            ${
                                driverClass === "A"
                                    ? "selected"
                                    : ""
                            }>

                            Клас A — «Майстер водій»

                        </option>

                    </select>


                    <div class="role-management-actions">

                        <button
                            type="button"
                            class="direction-button primary save-driver-class-button">

                            💾 ЗБЕРЕГТИ КЛАС

                        </button>

                    </div>

                </div>

            `;
        }


        // ==================================
        // REMOVE FROM DIRECTION
        // ==================================

        if (canManageMembers) {

            html += `

                <div class="direction-actions">

                    <button
                        type="button"
                        class="direction-button danger remove-direction-button">

                        ✕ ВИКЛЮЧИТИ З НАПРЯМКУ

                    </button>

                </div>

            `;
        }


        // ==================================
        // CLOSE CONTENT
        // ==================================

        html += `
            </div>
        `;


        // ==================================
        // INSERT CARD
        // ==================================

        card.innerHTML =
            html;


        directionsList.appendChild(
            card
        );


        // ==================================
        // ASSIGN ROLE BUTTON
        // ==================================

        const assignButton =
            card.querySelector(
                ".assign-role-button"
            );


        if (assignButton) {

            assignButton.addEventListener(
                "click",
                async () => {

                    const select =
                        card.querySelector(
                            ".direction-role-select"
                        );


                    await assignDirectionRole(
                        direction,
                        select?.value,
                        assignButton
                    );

                }
            );
        }


        // ==================================
        // REMOVE ROLE BUTTONS
        // ==================================

        card
            .querySelectorAll(
                ".remove-role-button"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    async () => {

                        const roleId =
                            Number(
                                button.dataset.roleId
                            );


                        const role =
                            roles.find(
                                item =>
                                    Number(
                                        item.role_id
                                    ) ===
                                    roleId
                            );


                        if (!role) {
                            return;
                        }


                        await removeDirectionRole(
                            direction,
                            role,
                            button
                        );

                    }
                );

            });


        // ==================================
        // SAVE ETS2 CLASS
        // ==================================

        const saveClassButton =
            card.querySelector(
                ".save-driver-class-button"
            );


        if (saveClassButton) {

            const classSelect =
                card.querySelector(
                    ".ets2-driver-class-select"
                );


            saveClassButton.addEventListener(
                "click",
                async () => {

                    await saveETS2DriverClass(
                        direction,
                        membership,
                        classSelect,
                        saveClassButton
                    );

                }
            );
        }


        // ==================================
        // REMOVE FROM DIRECTION
        // ==================================

        const removeDirectionButton =
            card.querySelector(
                ".remove-direction-button"
            );


        if (removeDirectionButton) {

            removeDirectionButton.addEventListener(
                "click",
                async () => {

                    await removeFromDirection(
                        direction,
                        removeDirectionButton
                    );

                }
            );
        }

    }


    // ======================================
    // RENDER ALL DIRECTIONS
    // ======================================

    async function renderDirections(
        directions,
        management
    ) {

        if (!directionsList) {

            throw new Error(
                "У HTML не знайдено #directionsList"
            );
        }


        directionsList.innerHTML =
            "";


        if (!directions.length) {

            directionsList.innerHTML = `
                <div class="management-locked">
                    Немає активних напрямків.
                </div>
            `;

            return;
        }


        for (
            const direction
            of directions
        ) {

            await renderDirection(
                direction,
                management
            );

        }

    }


    // ======================================
    // HIDE OLD ETS2 BLOCK
    // ======================================

    function hideLegacyETS2Block() {

        if (ets2ManagementCard) {

            ets2ManagementCard.style.display =
                "none";
        }


        if (ets2Management) {

            ets2Management.innerHTML =
                "";
        }

    }


    // ======================================
    // LOAD PAGE
    // ======================================

    async function loadPage() {

        try {

            clearError();


            // ----------------------------------
            // LOADING
            // ----------------------------------

            if (memberName) {

                memberName.textContent =
                    "Завантаження...";
            }


            if (memberGlobalRoles) {

                memberGlobalRoles.innerHTML = `
                    <span class="empty-role">
                        Завантаження...
                    </span>
                `;
            }


            setLoading(
                directionsList,
                "Завантаження напрямків..."
            );


            // ----------------------------------
            // PROFILE
            // ----------------------------------

            await loadProfile();


            // ----------------------------------
            // GLOBAL ROLES
            // ----------------------------------

            await loadGlobalRoles();


            // ----------------------------------
            // DIRECTIONS + MANAGEMENT
            // ----------------------------------

            const [
                directions,
                management
            ] = await Promise.all([

                loadActiveDirections(),

                loadDirectionManagement()

            ]);


            // ----------------------------------
            // RENDER
            // ----------------------------------

            await renderDirections(
                directions,
                management
            );


            // ----------------------------------
            // OLD ETS2 BLOCK
            // ----------------------------------

            hideLegacyETS2Block();

        }
        catch (error) {

            console.error(
                "MEMBER PAGE ERROR:",
                error
            );


            showError(
                error?.message ||
                "Не вдалося завантажити сторінку"
            );


            if (directionsList) {

                directionsList.innerHTML = `
                    <div class="management-locked">
                        Не вдалося завантажити напрямки.
                    </div>
                `;
            }

        }

    }


    // ======================================
    // START
    // ======================================

    await loadPage();

});
