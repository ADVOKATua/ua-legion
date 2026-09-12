// ======================================
// UA LEGION — MEMBER MANAGEMENT
// member.js
// ======================================

document.addEventListener("DOMContentLoaded", async () => {

    // ======================================
    // SUPABASE
    // ======================================

    const supabase = window.supabaseClient;

    if (!supabase) {
        console.error("Supabase не підключений");
        return;
    }


    // ======================================
    // DOM
    // ======================================

    const memberError =
        document.getElementById("memberError");

    const profileName =
        document.getElementById("profileName");

    const profileNickname =
        document.getElementById("profileNickname");

    const profileAvatar =
        document.getElementById("profileAvatar");

    const globalRoles =
        document.getElementById("globalRoles");

    const directionsContainer =
        document.getElementById("directionsContainer");

    const ets2Management =
        document.getElementById("ets2Management");


    // ======================================
    // USER ID
    // ======================================

    const params =
        new URLSearchParams(window.location.search);

    const userId =
        params.get("user_id");


    if (!userId) {
        showError("Не вказано user_id");
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
        showError("Користувач не авторизований");
        return;
    }


    // ======================================
    // HELPERS
    // ======================================

    function escapeHtml(value) {

        if (value === null || value === undefined) {
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

        console.error(message);

        if (memberError) {
            memberError.textContent = message;
            memberError.style.display = "block";
        }
    }


    function hideError() {

        if (memberError) {
            memberError.style.display = "none";
        }
    }


    function directionIcon(direction) {

        if (direction?.icon) {
            return direction.icon;
        }

        return "🎮";
    }


    // ======================================
    // PERMISSION
    // ======================================

    async function hasPermission(
        permission,
        directionId = null
    ) {

        const {
            data,
            error
        } = await supabase.rpc(
            "has_permission",
            {
                p_permission_code: permission,
                p_direction_id: directionId
            }
        );


        if (error) {

            console.error(
                "Permission error:",
                permission,
                error
            );

            return false;
        }


        return data === true;
    }


    // ======================================
    // PROFILE
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
            .eq("id", userId)
            .maybeSingle();


        if (error) {
            throw error;
        }


        if (!data) {
            throw new Error(
                "Профіль користувача не знайдено"
            );
        }


        if (profileName) {

            profileName.textContent =
                data.display_name ||
                "Без імені";
        }


        if (profileNickname) {

            profileNickname.textContent =
                data.game_nickname ||
                data.discord_username ||
                "";
        }


        if (profileAvatar) {

            if (data.avatar_url) {

                profileAvatar.src =
                    data.avatar_url;

            } else {

                profileAvatar.src =
                    "https://ui-avatars.com/api/?name=" +
                    encodeURIComponent(
                        data.display_name || "User"
                    );
            }
        }

    }


    // ======================================
    // GLOBAL ROLES
    // ======================================

    function renderGlobalRoles(roles) {

        if (!globalRoles) {
            return;
        }


        if (
            !roles ||
            !roles.length
        ) {

            globalRoles.innerHTML =
                `<span class="muted">
                    Глобальних посад немає
                </span>`;

            return;
        }


        globalRoles.innerHTML =
            roles
                .sort(
                    (a, b) =>
                        (b.level || 0) -
                        (a.level || 0)
                )
                .map(role => {

                    return `
                        <span class="role-badge">
                            ${escapeHtml(role.name)}
                        </span>
                    `;

                })
                .join("");

    }


    // ======================================
    // LOAD DIRECTION ROLE OPTIONS
    // ======================================

    async function loadDirectionRoleOptions(
        directionId
    ) {

        const {
            data,
            error
        } = await supabase.rpc(
            "get_direction_role_options",
            {
                p_direction_id: directionId
            }
        );


        if (error) {

            console.error(
                "get_direction_role_options:",
                error
            );

            return [];
        }


        return Array.isArray(data)
            ? data
            : [];
    }


    // ======================================
    // ADD USER TO DIRECTION
    // ======================================

    async function addToDirection(
        direction
    ) {

        const confirmed =
            confirm(
                `Додати користувача до напрямку "${direction.name}"?`
            );


        if (!confirmed) {
            return;
        }


        const {
            data,
            error
        } = await supabase.rpc(
            "add_user_to_direction",
            {
                p_user_id: userId,
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

            return;
        }


        if (!data?.success) {

            alert(
                data?.error ||
                "Не вдалося додати користувача"
            );

            return;
        }


        await loadPage();

    }


    // ======================================
    // REMOVE USER FROM DIRECTION
    // ======================================

    async function removeFromDirection(
        direction
    ) {

        const confirmed =
            confirm(
                `Виключити користувача з напрямку "${direction.name}"?\n\n` +
                `Усі посади цього напрямку також будуть зняті.`
            );


        if (!confirmed) {
            return;
        }


        const {
            data,
            error
        } = await supabase.rpc(
            "remove_user_from_direction",
            {
                p_user_id: userId,
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

            return;
        }


        if (!data?.success) {

            alert(
                data?.error ||
                "Не вдалося виключити користувача"
            );

            return;
        }


        await loadPage();

    }


    // ======================================
    // ASSIGN DIRECTION ROLE
    // ======================================

    async function assignDirectionRole(
        direction,
        roleId
    ) {

        if (!roleId) {

            alert("Оберіть посаду");

            return;
        }


        const {
            data,
            error
        } = await supabase.rpc(
            "assign_direction_role",
            {
                p_user_id: userId,
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

            return;
        }


        if (!data?.success) {

            alert(
                data?.error ||
                "Не вдалося призначити посаду"
            );

            return;
        }


        await loadPage();

    }


    // ======================================
    // REMOVE DIRECTION ROLE
    // ======================================

    async function removeDirectionRole(
        direction,
        roleId,
        roleName
    ) {

        const confirmed =
            confirm(
                `Зняти посаду "${roleName}"?`
            );


        if (!confirmed) {
            return;
        }


        const {
            data,
            error
        } = await supabase.rpc(
            "remove_direction_role",
            {
                p_user_id: userId,
                p_direction_id:
                    direction.direction_id,
                p_role_id:
                    Number(roleId)
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

            return;
        }


        if (!data?.success) {

            alert(
                data?.error ||
                "Не вдалося зняти посаду"
            );

            return;
        }


        await loadPage();

    }


    // ======================================
    // RENDER ONE DIRECTION
    // ======================================

    async function renderDirection(
        direction,
        management
    ) {

        const directionId =
            direction.direction_id;


        const membership =
            management?.directions?.find(
                item =>
                    Number(item.direction_id) ===
                    Number(directionId)
            );


        const isActive =
            membership?.status === "active";


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


        const canChangeClass =
            direction.code === "ets2"
                ? await hasPermission(
                    "ets2.driver_class.change",
                    directionId
                )
                : false;


        // ==================================
        // ROLE DATA
        // ==================================

        const roles =
            membership?.roles || [];


        let roleOptions = [];


        if (
            isActive &&
            (canAssignRoles ||
             canRemoveRoles)
        ) {

            roleOptions =
                await loadDirectionRoleOptions(
                    directionId
                );
        }


        // ==================================
        // CARD
        // ==================================

        const card =
            document.createElement("div");

        card.className =
            "direction-card" +
            (isActive
                ? " direction-active"
                : "");


        // ==================================
        // HEADER
        // ==================================

        let html = `

            <div class="direction-header">

                <div class="direction-title">

                    ${directionIcon(direction)}

                    ${escapeHtml(direction.name)}

                </div>

                <span class="direction-status
                    ${isActive
                        ? "status-active"
                        : "status-inactive"}">

                    ${
                        isActive
                            ? "Активний"
                            : "Не приєднаний"
                    }

                </span>

            </div>

        `;


        // ==================================
        // POSITIONS
        // ==================================

        html += `

            <div class="direction-roles-title">
                Посади
            </div>

        `;


        if (roles.length) {

            html += `
                <div class="role-badges">
            `;


            roles
                .sort(
                    (a, b) =>
                        (b.level || 0) -
                        (a.level || 0)
                )
                .forEach(role => {

                    html += `
                        <span class="role-badge">
                            ${escapeHtml(role.name)}
                        </span>
                    `;

                });


            html += `
                </div>
            `;

        } else {

            html += `
                <div class="no-role">
                    Посад немає
                </div>
            `;

        }


        // ==================================
        // NOT MEMBER
        // ==================================

        if (!isActive) {

            if (canManageMembers) {

                html += `

                    <div class="direction-actions">

                        <button
                            class="btn-primary add-direction-btn"
                            type="button">

                            + ДОДАТИ ДО НАПРЯМКУ

                        </button>

                    </div>

                `;
            }


            html += `
                <div class="direction-divider"></div>
            `;


            card.innerHTML = html;

            directionsContainer.appendChild(card);


            const addButton =
                card.querySelector(
                    ".add-direction-btn"
                );


            if (addButton) {

                addButton.addEventListener(
                    "click",
                    () => addToDirection(direction)
                );

            }


            return;
        }


        // ==================================
        // ACTIVE MEMBER
        // ==================================

        if (
            canAssignRoles &&
            roleOptions.length
        ) {

            html += `

                <div class="direction-divider"></div>

                <div class="management-title">
                    🛠 Керування посадами
                </div>

                <select
                    class="direction-role-select">

                    <option value="">
                        Оберіть посаду
                    </option>

                    ${
                        roleOptions
                            .filter(
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
                            )
                            .map(option => `

                                <option
                                    value="${option.role_id}">

                                    ${escapeHtml(option.name)}

                                </option>

                            `)
                            .join("")
                    }

                </select>

                <button
                    class="btn-primary assign-role-btn"
                    type="button">

                    + ПРИЗНАЧИТИ ПОСАДУ

                </button>

            `;
        }


        // ==================================
        // CURRENT ROLES REMOVE
        // ==================================

        if (
            canRemoveRoles &&
            roles.length
        ) {

            html += `

                <div class="current-role-actions">

            `;


            roles.forEach(role => {

                html += `

                    <button
                        type="button"
                        class="btn-danger remove-role-btn"
                        data-role-id="${role.role_id}"
                        data-role-name="${escapeHtml(role.name)}">

                        ✕ ${escapeHtml(role.name)}

                    </button>

                `;

            });


            html += `
                </div>
            `;
        }


        // ==================================
        // ETS2 DRIVER CLASS
        // ==================================

        if (direction.code === "ets2") {

            const driverClass =
                membership?.driver_class || "";


            if (canChangeClass) {

                html += `

                    <div class="driver-class-block">

                        <div class="management-title">
                            Клас водія ETS2
                        </div>

                        <select
                            class="driver-class-select">

                            <option
                                value=""
                                ${driverClass === ""
                                    ? "selected"
                                    : ""}>

                                Оберіть клас

                            </option>

                            <option
                                value="E"
                                ${driverClass === "E"
                                    ? "selected"
                                    : ""}>

                                Клас E — «Стажер»

                            </option>

                            <option
                                value="D"
                                ${driverClass === "D"
                                    ? "selected"
                                    : ""}>

                                Клас D — «Водій»

                            </option>

                            <option
                                value="C"
                                ${driverClass === "C"
                                    ? "selected"
                                    : ""}>

                                Клас C — «Досвідчений водій»

                            </option>

                            <option
                                value="B"
                                ${driverClass === "B"
                                    ? "selected"
                                    : ""}>

                                Клас B — «Старший водій»

                            </option>

                            <option
                                value="A"
                                ${driverClass === "A"
                                    ? "selected"
                                    : ""}>

                                Клас A — «Майстер водій»

                            </option>

                        </select>

                        <button
                            type="button"
                            class="btn-primary save-class-btn">

                            💾 ЗБЕРЕГТИ КЛАС

                        </button>

                    </div>

                `;

            } else {

                html += `

                    <div class="driver-class-block">

                        <div class="management-title">
                            Клас водія ETS2
                        </div>

                        <div class="driver-class-value">

                            ${
                                driverClass
                                    ? `Клас ${escapeHtml(driverClass)}`
                                    : "Не визначений"
                            }

                        </div>

                    </div>

                `;
            }
        }


        // ==================================
        // REMOVE FROM DIRECTION
        // ==================================

        if (canManageMembers) {

            html += `

                <div class="direction-divider"></div>

                <div class="direction-actions">

                    <button
                        type="button"
                        class="btn-danger remove-direction-btn">

                        ✕ ВИКЛЮЧИТИ З НАПРЯМКУ

                    </button>

                </div>

            `;
        }


        // ==================================
        // INSERT CARD
        // ==================================

        card.innerHTML = html;

        directionsContainer.appendChild(card);


        // ==================================
        // ASSIGN ROLE BUTTON
        // ==================================

        const assignButton =
            card.querySelector(
                ".assign-role-btn"
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
                        select?.value
                    );

                }
            );
        }


        // ==================================
        // REMOVE ROLE BUTTONS
        // ==================================

        card
            .querySelectorAll(
                ".remove-role-btn"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    async () => {

                        await removeDirectionRole(
                            direction,
                            button.dataset.roleId,
                            button.dataset.roleName
                        );

                    }
                );

            });


        // ==================================
        // REMOVE FROM DIRECTION
        // ==================================

        const removeDirectionButton =
            card.querySelector(
                ".remove-direction-btn"
            );


        if (removeDirectionButton) {

            removeDirectionButton.addEventListener(
                "click",
                async () => {

                    await removeFromDirection(
                        direction
                    );

                }
            );

        }


        // ==================================
        // ETS2 CLASS
        // ==================================

        const saveClassButton =
            card.querySelector(
                ".save-class-btn"
            );


        if (saveClassButton) {

            saveClassButton.addEventListener(
                "click",
                async () => {

                    const select =
                        card.querySelector(
                            ".driver-class-select"
                        );


                    await saveETS2Class(
                        select?.value
                    );

                }
            );

        }

    }


    // ======================================
    // SAVE ETS2 CLASS
    // ======================================

    async function saveETS2Class(
        driverClass
    ) {

        if (
            !["A", "B", "C", "D", "E"]
                .includes(driverClass)
        ) {

            alert("Оберіть клас водія");

            return;
        }


        // ==================================
        // CURRENT ETS2 ROLES
        // ==================================

        const {
            data,
            error
        } = await supabase.rpc(
            "get_ets2_member_management",
            {
                p_user_id: userId
            }
        );


        if (error) {

            console.error(
                "get_ets2_member_management:",
                error
            );

            alert(
                "Не вдалося отримати дані ETS2"
            );

            return;
        }


        const roleIds =
            (data?.roles || [])
                .map(
                    role =>
                        Number(role.role_id)
                )
                .filter(
                    id =>
                        !Number.isNaN(id)
                );


        // ==================================
        // SAVE
        // ==================================

        const {
            data: saveData,
            error: saveError
        } = await supabase.rpc(
            "save_ets2_member_management",
            {
                p_user_id: userId,
                p_role_ids: roleIds,
                p_driver_class: driverClass
            }
        );


        if (saveError) {

            console.error(
                "save_ets2_member_management:",
                saveError
            );

            alert(
                "Помилка збереження класу:\n" +
                saveError.message
            );

            return;
        }


        if (!saveData?.success) {

            alert(
                saveData?.error ||
                "Не вдалося зберегти клас"
            );

            return;
        }


        await loadPage();

    }


    // ======================================
    // LOAD DIRECTIONS
    // ======================================

    async function loadDirections() {

        // ==================================
        // ACTIVE DIRECTIONS
        // ==================================

        const {
            data: directions,
            error: directionsError
        } = await supabase.rpc(
            "get_active_directions"
        );


        if (directionsError) {
            throw directionsError;
        }


        // ==================================
        // USER MANAGEMENT
        // ==================================

        const {
            data: management,
            error: managementError
        } = await supabase.rpc(
            "get_user_direction_management",
            {
                // ВАЖНО:
                // правильне ім'я параметра RPC
                p_target_user_id: userId
            }
        );


        if (managementError) {
            throw managementError;
        }


        if (!directionsContainer) {
            return;
        }


        directionsContainer.innerHTML = "";


        for (
            const direction
            of (directions || [])
        ) {

            await renderDirection(
                direction,
                management
            );

        }

    }


    // ======================================
    // LOAD GLOBAL ROLES
    // ======================================

    async function loadGlobalRoles() {

        const {
            data,
            error
        } = await supabase
            .from("user_roles")
            .select(`
                role_id,
                role,
                roles (
                    code,
                    name,
                    level,
                    is_global,
                    is_active
                )
            `)
            .eq("user_id", userId)
            .is("direction_id", null);


        if (error) {

            console.error(
                "Global roles:",
                error
            );

            return;
        }


        const roles =
            (data || [])
                .map(row => {

                    const role =
                        row.roles;

                    if (
                        !role ||
                        !role.is_global ||
                        !role.is_active
                    ) {
                        return null;
                    }


                    return {

                        code: role.code,
                        name: role.name,
                        level: role.level

                    };

                })
                .filter(Boolean);


        renderGlobalRoles(roles);

    }


    // ======================================
    // OLD ETS2 MANAGEMENT
    // ======================================

    async function loadLegacyETS2Management() {

        if (!ets2Management) {
            return;
        }


        ets2Management.style.display =
            "none";

    }


    // ======================================
    // LOAD PAGE
    // ======================================

    async function loadPage() {

        try {

            hideError();


            await loadProfile();

            await loadGlobalRoles();

            await loadDirections();

            await loadLegacyETS2Management();

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

        }

    }


    // ======================================
    // START
    // ======================================

    await loadPage();

});
