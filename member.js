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

        // ==================================
        // LOAD MEMBER THROUGH SECURE RPC
        // ==================================
        // Не читаємо чужий profiles напряму:
        // RLS може не дозволяти адміністратору
        // звичайний SELECT.
        //
        // get_ua_legion_members() повертає дані
        // учасників через RPC.

        const {
            data,
            error
        } = await supabase.rpc(
            "get_ua_legion_members"
        );

        if (error) {
            throw error;
        }

        if (!Array.isArray(data)) {
            throw new Error(
                "Не вдалося отримати список учасників"
            );
        }

        const member =
            data.find(
                item =>
                    String(item?.user_id) ===
                    String(targetUserId)
            );

        if (!member) {
            throw new Error(
                "Профіль користувача не знайдено"
            );
        }

        const displayName =
            String(
                member.display_name || ""
            ).trim();

        const gameNickname =
            String(
                member.game_nickname || ""
            ).trim();

        const isEmail =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                displayName
            );

        const memberDisplayName =
            displayName &&
            !isEmail
                ? displayName
                : gameNickname ||
                  "Учасник UA LEGION";

        if (memberName) {
            memberName.textContent =
                memberDisplayName;
        }

        if (memberNickname) {
            memberNickname.textContent =
                gameNickname || "";
        }

        if (memberAvatar) {

            if (member.avatar_url) {

                memberAvatar.src =
                    member.avatar_url;

                memberAvatar.classList.remove(
                    "avatar-empty"
                );

            } else {

                memberAvatar.src =
                    "https://ui-avatars.com/api/?name=" +
                    encodeURIComponent(
                        memberDisplayName ||
                        gameNickname ||
                        "User"
                    ) +
                    "&background=171a20&color=ffffff";

                memberAvatar.classList.add(
                    "avatar-empty"
                );
            }
        }

        // Повертаємо учасника для fallback
        // при недоступності management RPC.
        return member;
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
    // RENDER DIRECTIONS
    // ======================================

    async function renderDirections(
        directions,
        management
    ) {

        if (!directionsList) {
            return;
        }


        directionsList.innerHTML = "";


        if (
            !Array.isArray(directions) ||
            !directions.length
        ) {

            directionsList.innerHTML = `
                <div class="direction-empty">
                    Користувач не має активних напрямків.
                </div>
            `;

            return;
        }


        const managementDirections =
            Array.isArray(
                management?.directions
            )
                ? management.directions
                : [];


        for (
            const direction of directions
        ) {

            const directionId =
                direction.id ??
                direction.direction_id;


            const directionCode =
                String(
                    direction.code ||
                    direction.slug ||
                    ""
                ).toLowerCase();


            const directionName =
                direction.name ||
                direction.title ||
                directionCode ||
                "Напрямок";


            const managementDirection =
                managementDirections.find(
                    item =>
                        String(
                            item.direction_id ??
                            item.id
                        ) ===
                        String(directionId)
                );


            const directionRoles =
                Array.isArray(
                    managementDirection?.roles
                )
                    ? managementDirection.roles
                    : [];


            const directionData =
                managementDirection?.direction_data ||
                managementDirection?.data ||
                {};


            const driverClass =
                managementDirection?.driver_class ||
                directionData?.driver_class ||
                null;


            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "member-direction-card";


            card.dataset.directionId =
                directionId;


            // ==================================
            // GAME DATA
            // ==================================

            const gameData =
                getGameData(
                    directionCode,
                    directionData
                );


            const gameDataHtml =
                renderGameData(
                    directionCode,
                    gameData
                );


            // ==================================
            // ROLES
            // ==================================

            const rolesHtml =
                directionRoles.length
                    ? directionRoles
                        .map(role => `
                            <span class="role-badge">
                                ${escapeHtml(
                                    role.name ||
                                    role.role_name ||
                                    role.code ||
                                    "Посада"
                                )}
                            </span>
                        `)
                        .join("")
                    : `
                        <span class="empty-role">
                            Посад немає
                        </span>
                    `;


            // ==================================
            // DRIVER CLASS
            // ==================================

            const driverClassHtml =
                directionCode === "ets2"
                    ? `
                        <div class="member-info-row">
                            <span class="member-info-label">
                                Клас водія
                            </span>

                            <span class="member-info-value">
                                ${escapeHtml(
                                    driverClass ||
                                    "Не призначено"
                                )}
                            </span>
                        </div>
                    `
                    : "";


            // ==================================
            // DIRECTION CARD
            // ==================================

            card.innerHTML = `
                <div class="member-direction-header">

                    <div class="member-direction-title">
                        ${escapeHtml(
                            directionName
                        )}
                    </div>

                    <div class="member-direction-status">
                        ACTIVE
                    </div>

                </div>


                <div class="member-direction-body">

                    <div class="member-info-section">

                        <div class="member-info-title">
                            Посади
                        </div>

                        <div class="member-roles">
                            ${rolesHtml}
                        </div>

                    </div>


                    ${
                        driverClassHtml
                    }


                    <div class="member-info-section">

                        <div class="member-info-title">
                            Ігрові дані
                        </div>

                        <div class="member-game-data">

                            ${
                                gameDataHtml ||
                                `
                                <div class="member-game-empty">
                                    Ігрові дані не вказані
                                </div>
                                `
                            }

                        </div>

                    </div>


                    <div
                        class="member-direction-management"
                        data-management-direction="${escapeHtml(
                            directionId
                        )}"
                    ></div>

                </div>
            `;


            directionsList.appendChild(
                card
            );


            // ==================================
            // MANAGEMENT
            // ==================================

            await renderDirectionManagement(
                card,
                direction,
                managementDirection
            );
        }
    }


    // ======================================
    // GAME DATA
    // ======================================

    function getGameData(
        directionCode,
        directionData
    ) {

        const data =
            directionData || {};


        switch (
            directionCode
        ) {

            // ==================================
            // ETS2
            // ==================================

            case "ets2":

            case "truckersmp":

            case "truckers":

                return {

                    truckersmp_nick:
                        data.truckersmp_nick ||
                        data.truckersmp_username ||
                        data.username ||
                        "",

                    truckersmp_id:
                        data.truckersmp_id ||
                        data.truckersmp_user_id ||
                        "",

                    truckershub_username:
                        data.truckershub_username ||
                        data.truckershub_nick ||
                        "",

                    truckershub_id:
                        data.truckershub_id ||
                        ""
                };


            // ==================================
            // WORLD OF TANKS
            // ==================================

            case "wot":

            case "worldoftanks":

            case "world_of_tanks":

                return {

                    wot_nickname:
                        data.wot_nickname ||
                        data.nickname ||
                        "",

                    wargaming_id:
                        data.wargaming_id ||
                        data.wot_account_id ||
                        data.account_id ||
                        "",

                    wot_region:
                        data.wot_region ||
                        data.region ||
                        ""
                };


            // ==================================
            // DOTA 2
            // ==================================

            case "dota2":

            case "dota":

                return {

                    dota_nickname:
                        data.dota_nickname ||
                        data.nickname ||
                        "",

                    dota_friend_id:
                        data.dota_friend_id ||
                        data.friend_id ||
                        "",

                    dota_rank:
                        data.dota_rank ||
                        data.rank ||
                        ""
                };


            // ==================================
            // WORLD OF WARCRAFT
            // ==================================

            case "wow":

            case "worldofwarcraft":

            case "world_of_warcraft":

                return {

                    battletag:
                        data.battletag ||
                        data.battle_tag ||
                        "",

                    wow_character:
                        data.wow_character ||
                        data.character ||
                        "",

                    wow_realm:
                        data.wow_realm ||
                        data.realm ||
                        "",

                    wow_faction:
                        data.wow_faction ||
                        data.faction ||
                        "",

                    wow_class:
                        data.wow_class ||
                        data.class ||
                        ""
                };


            // ==================================
            // UNKNOWN
            // ==================================

            default:

                return {};
        }
    }


    // ======================================
    // RENDER GAME DATA
    // ======================================

    function renderGameData(
        directionCode,
        data
    ) {

        if (!data) {
            return "";
        }


        const rows = [];


        // ==================================
        // ETS2
        // ==================================

        if (
            directionCode === "ets2" ||
            directionCode === "truckersmp" ||
            directionCode === "truckers"
        ) {

            if (
                data.truckersmp_nick
            ) {

                rows.push(
                    renderDataRow(
                        "TruckersMP",
                        data.truckersmp_nick
                    )
                );
            }


            if (
                data.truckersmp_id
            ) {

                rows.push(
                    renderDataRow(
                        "TruckersMP ID",
                        data.truckersmp_id
                    )
                );
            }


            if (
                data.truckershub_username
            ) {

                rows.push(
                    renderDataRow(
                        "TruckersHub",
                        data.truckershub_username
                    )
                );
            }


            if (
                data.truckershub_id
            ) {

                rows.push(
                    renderDataRow(
                        "TruckersHub ID",
                        data.truckershub_id
                    )
                );
            }
        }


        // ==================================
        // WOT
        // ==================================

        if (
            directionCode === "wot" ||
            directionCode === "worldoftanks" ||
            directionCode === "world_of_tanks"
        ) {

            if (
                data.wot_nickname
            ) {

                rows.push(
                    renderDataRow(
                        "Нікнейм",
                        data.wot_nickname
                    )
                );
            }


            if (
                data.wargaming_id
            ) {

                rows.push(
                    renderDataRow(
                        "Wargaming ID",
                        data.wargaming_id
                    )
                );
            }


            if (
                data.wot_region
            ) {

                rows.push(
                    renderDataRow(
                        "Регіон",
                        data.wot_region
                    )
                );
            }
        }


        // ==================================
        // DOTA 2
        // ==================================

        if (
            directionCode === "dota2" ||
            directionCode === "dota"
        ) {

            if (
                data.dota_nickname
            ) {

                rows.push(
                    renderDataRow(
                        "Нікнейм",
                        data.dota_nickname
                    )
                );
            }


            if (
                data.dota_friend_id
            ) {

                rows.push(
                    renderDataRow(
                        "Friend ID",
                        data.dota_friend_id
                    )
                );
            }


            if (
                data.dota_rank
            ) {

                rows.push(
                    renderDataRow(
                        "Ранг",
                        data.dota_rank
                    )
                );
            }
        }


        // ==================================
        // WOW
        // ==================================

        if (
            directionCode === "wow" ||
            directionCode === "worldofwarcraft" ||
            directionCode === "world_of_warcraft"
        ) {

            if (
                data.battletag
            ) {

                rows.push(
                    renderDataRow(
                        "BattleTag",
                        data.battletag
                    )
                );
            }


            if (
                data.wow_character
            ) {

                rows.push(
                    renderDataRow(
                        "Персонаж",
                        data.wow_character
                    )
                );
            }


            if (
                data.wow_realm
            ) {

                rows.push(
                    renderDataRow(
                        "Сервер",
                        data.wow_realm
                    )
                );
            }


            if (
                data.wow_faction
            ) {

                rows.push(
                    renderDataRow(
                        "Фракція",
                        data.wow_faction
                    )
                );
            }


            if (
                data.wow_class
            ) {

                rows.push(
                    renderDataRow(
                        "Клас",
                        data.wow_class
                    )
                );
            }
        }


        return rows.join("");
    }


    // ======================================
    // DATA ROW
    // ======================================

    function renderDataRow(
        label,
        value
    ) {

        if (
            value === null ||
            value === undefined ||
            String(value).trim() === ""
        ) {

            return "";
        }


        return `
            <div class="member-game-row">

                <span class="member-game-label">
                    ${escapeHtml(label)}
                </span>

                <span class="member-game-value">
                    ${escapeHtml(value)}
                </span>

            </div>
        `;
    }


    // ======================================
    // DIRECTION MANAGEMENT
    // ======================================

    async function renderDirectionManagement(
        card,
        direction,
        managementDirection
    ) {

        const container =
            card.querySelector(
                ".member-direction-management"
            );


        if (!container) {
            return;
        }


        const directionId =
            direction.id ??
            direction.direction_id;


        // ==================================
        // CHECK MANAGEMENT PERMISSION
        // ==================================

        const canManage =
            await hasPermission(
                "direction_members.manage",
                directionId
            );


        if (!canManage) {

            container.innerHTML =
                "";

            return;
        }


        // ==================================
        // MANAGEMENT BUTTONS
        // ==================================

        const roles =
            Array.isArray(
                managementDirection?.roles
            )
                ? managementDirection.roles
                : [];


        const driverClass =
            managementDirection?.driver_class ||
            managementDirection?.direction_data?.driver_class ||
            "";


        container.innerHTML = `

            <div class="member-management-box">

                <div class="member-management-title">
                    Управління напрямком
                </div>


                ${
                    directionCodeForManagement(
                        direction
                    ) === "ets2"
                        ? `
                        <div class="member-management-row">

                            <label>
                                Клас водія
                            </label>

                            <select
                                class="ets2-driver-class-select"
                            >

                                <option value="">
                                    Не призначено
                                </option>

                                <option
                                    value="E"
                                    ${
                                        driverClass === "E"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    E — Стажер
                                </option>

                                <option
                                    value="D"
                                    ${
                                        driverClass === "D"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    D — Водій
                                </option>

                                <option
                                    value="C"
                                    ${
                                        driverClass === "C"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    C — Досвідчений водій
                                </option>

                                <option
                                    value="B"
                                    ${
                                        driverClass === "B"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    B — Старший водій
                                </option>

                                <option
                                    value="A"
                                    ${
                                        driverClass === "A"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    A — Майстер
                                </option>

                            </select>


                            <button
                                type="button"
                                class="btn-save-ets2-class"
                            >
                                Зберегти
                            </button>

                        </div>
                        `
                        : ""
                }


                <div class="member-management-row">

                    <button
                        type="button"
                        class="btn-remove-direction"
                    >
                        Видалити з напрямку
                    </button>

                </div>

            </div>
        `;


        // ==================================
        // EVENTS
        // ==================================

        const saveClassButton =
            container.querySelector(
                ".btn-save-ets2-class"
            );


        if (saveClassButton) {

            saveClassButton.addEventListener(
                "click",
                async () => {

                    const select =
                        container.querySelector(
                            ".ets2-driver-class-select"
                        );

                    const value =
                        select?.value || null;


                    await saveETS2DriverClass(
                        directionId,
                        value,
                        managementDirection?.roles || []
                    );
                }
            );
        }


        const removeButton =
            container.querySelector(
                ".btn-remove-direction"
            );


        if (removeButton) {

            removeButton.addEventListener(
                "click",
                async () => {

                    await removeFromDirection(
                        directionId,
                        direction.name ||
                        direction.code ||
                        "напрямку"
                    );
                }
            );
        }
    }


    // ======================================
    // DIRECTION CODE
    // ======================================

    function directionCodeForManagement(
        direction
    ) {

        return String(
            direction?.code ||
            direction?.slug ||
            ""
        ).toLowerCase();
    }
    // ======================================
    // REMOVE USER FROM DIRECTION
    // ======================================

    async function removeFromDirection(
        directionId,
        directionName
    ) {

        const confirmed =
            window.confirm(
                `Видалити користувача з напрямку "${directionName}"?`
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
                p_user_id:
                    targetUserId,

                p_direction_id:
                    directionId
            }
        );


        if (error) {

            console.error(
                "REMOVE DIRECTION ERROR:",
                error
            );

            alert(
                error.message ||
                "Не вдалося видалити користувача з напрямку."
            );

            return;
        }


        if (
            data &&
            data.success === false
        ) {

            alert(
                data.error ||
                "Не вдалося видалити користувача з напрямку."
            );

            return;
        }


        alert(
            "Користувача видалено з напрямку."
        );


        await loadPage();
    }


    // ======================================
    // SAVE ETS2 DRIVER CLASS
    // ======================================

    async function saveETS2DriverClass(
        directionId,
        driverClass,
        currentRoles = []
    ) {

        const button =
            document.querySelector(
                `.member-direction-card[data-direction-id="${directionId}"] .btn-save-ets2-class`
            );


        if (button) {

            button.disabled =
                true;

            button.textContent =
                "Збереження...";
        }


        try {

            const {
                data,
                error
            } = await supabase.rpc(
                "save_ets2_member_management",
                {
                    p_target_user_id:
                        targetUserId,

                    p_role_ids:
                        (Array.isArray(currentRoles)
                            ? currentRoles
                            : []
                        )
                            .map(role =>
                                role?.role_id ??
                                role?.id
                            )
                            .filter(id =>
                                id !== null &&
                                id !== undefined &&
                                id !== ""
                            )
                            .map(id =>
                                Number(id)
                            )
                            .filter(id =>
                                Number.isFinite(id)
                            ),

                    p_driver_class:
                        driverClass || null
                }
            );


            if (error) {
                throw error;
            }


            if (
                data &&
                data.success === false
            ) {

                throw new Error(
                    data.error ||
                    "Не вдалося зберегти клас водія."
                );
            }


            alert(
                "Клас водія збережено."
            );


            await loadPage();

        } catch (error) {

            console.error(
                "SAVE ETS2 CLASS ERROR:",
                error
            );


            alert(
                error.message ||
                "Не вдалося зберегти клас водія."
            );

        } finally {

            if (button) {

                button.disabled =
                    false;

                button.textContent =
                    "Зберегти";
            }
        }
    }


    // ======================================
    // ASSIGN DIRECTION ROLE
    // ======================================

    async function assignDirectionRole(
        directionId,
        roleId
    ) {

        if (!roleId) {
            return;
        }


        const {
            data,
            error
        } = await supabase.rpc(
            "assign_direction_role",
            {
                p_user_id:
                    targetUserId,

                p_direction_id:
                    Number(directionId),

                p_role_id:
                    Number(roleId)
            }
        );


        if (error) {

            console.error(
                "ASSIGN ROLE ERROR:",
                error
            );

            alert(
                error.message ||
                "Не вдалося призначити посаду."
            );

            return;
        }


        if (
            data &&
            data.success === false
        ) {

            alert(
                data.error ||
                "Не вдалося призначити посаду."
            );

            return;
        }


        await loadPage();
    }


    // ======================================
    // REMOVE DIRECTION ROLE
    // ======================================

    async function removeDirectionRole(
        directionId,
        roleId
    ) {

        if (!roleId) {
            return;
        }


        const confirmed =
            window.confirm(
                "Зняти цю посаду з користувача?"
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
                p_user_id:
                    targetUserId,

                p_direction_id:
                    directionId,

                p_role_id:
                    roleId
            }
        );


        if (error) {

            console.error(
                "REMOVE ROLE ERROR:",
                error
            );

            alert(
                error.message ||
                "Не вдалося зняти посаду."
            );

            return;
        }


        if (
            data &&
            data.success === false
        ) {

            alert(
                data.error ||
                "Не вдалося зняти посаду."
            );

            return;
        }


        await loadPage();
    }


    // ======================================
    // LOAD AVAILABLE ROLES
    // ======================================

    async function loadAvailableRoles(
        directionId
    ) {

        const {
            data,
            error
        } = await supabase
            .from("roles")
            .select(`
                id,
                code,
                name,
                level,
                direction_id,
                is_active
            `)
            .eq(
                "direction_id",
                directionId
            )
            .eq(
                "is_active",
                true
            )
            .order(
                "level",
                {
                    ascending: false
                }
            );


        if (error) {

            console.error(
                "LOAD ROLES ERROR:",
                error
            );

            return [];
        }


        return Array.isArray(data)
            ? data
            : [];
    }


    // ======================================
    // RENDER ROLE MANAGEMENT
    // ======================================

    async function renderRoleManagement(
        container,
        directionId,
        currentRoles
    ) {

        if (!container) {
            return;
        }


        const availableRoles =
            await loadAvailableRoles(
                directionId
            );


        const currentRoleIds =
            new Set(
                (currentRoles || [])
                    .map(
                        role =>
                            String(
                                role.role_id ??
                                role.id
                            )
                    )
            );


        const availableToAssign =
            availableRoles.filter(
                role =>
                    !currentRoleIds.has(
                        String(role.id)
                    )
            );


        container.innerHTML = `

            <div class="member-role-management">

                <div class="member-management-subtitle">
                    Посади напрямку
                </div>


                ${
                    currentRoles?.length
                        ? `
                        <div class="member-current-roles">

                            ${
                                currentRoles
                                    .map(role => {

                                        const roleId =
                                            role.role_id ??
                                            role.id;

                                        return `
                                            <div class="member-current-role">

                                                <span>
                                                    ${escapeHtml(
                                                        role.name ||
                                                        role.role_name ||
                                                        role.code ||
                                                        "Посада"
                                                    )}
                                                </span>

                                                <button
                                                    type="button"
                                                    class="btn-remove-role"
                                                    data-role-id="${escapeHtml(
                                                        roleId
                                                    )}"
                                                >
                                                    Зняти
                                                </button>

                                            </div>
                                        `;
                                    })
                                    .join("")
                            }

                        </div>
                        `
                        : `
                        <div class="member-game-empty">
                            Посад немає
                        </div>
                        `
                }


                ${
                    availableToAssign.length
                        ? `
                        <div class="member-assign-role">

                            <select class="direction-role-select">

                                <option value="">
                                    Обрати посаду
                                </option>

                                ${
                                    availableToAssign
                                        .map(
                                            role => `
                                                <option
                                                    value="${escapeHtml(
                                                        role.id
                                                    )}"
                                                >
                                                    ${escapeHtml(
                                                        role.name ||
                                                        role.code
                                                    )}
                                                </option>
                                            `
                                        )
                                        .join("")
                                }

                            </select>


                            <button
                                type="button"
                                class="btn-assign-role"
                            >
                                Призначити
                            </button>

                        </div>
                        `
                        : ""
                }

            </div>
        `;


        // ==================================
        // ASSIGN
        // ==================================

        const assignButton =
            container.querySelector(
                ".btn-assign-role"
            );


        if (assignButton) {

            assignButton.addEventListener(
                "click",
                async () => {

                    const select =
                        container.querySelector(
                            ".direction-role-select"
                        );


                    const roleId =
                        select?.value;


                    if (!roleId) {

                        alert(
                            "Оберіть посаду."
                        );

                        return;
                    }


                    assignButton.disabled =
                        true;


                    try {

                        await assignDirectionRole(
                            directionId,
                            roleId
                        );

                    } finally {

                        assignButton.disabled =
                            false;
                    }
                }
            );
        }


        // ==================================
        // REMOVE
        // ==================================

        container
            .querySelectorAll(
                ".btn-remove-role"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    async () => {

                        const roleId =
                            button.dataset.roleId;


                        button.disabled =
                            true;


                        try {

                            await removeDirectionRole(
                                directionId,
                                roleId
                            );

                        } finally {

                            button.disabled =
                                false;
                        }
                    }
                );
            });
    }


    // ======================================
    // EXTENDED DIRECTION MANAGEMENT
    // ======================================

    async function renderExtendedManagement(
        card,
        direction,
        managementDirection
    ) {

        const container =
            card.querySelector(
                ".member-direction-management"
            );


        if (!container) {
            return;
        }


        const directionId =
            direction.id ??
            direction.direction_id;


        const canManage =
            await hasPermission(
                "direction_members.manage",
                directionId
            );


        if (!canManage) {
            return;
        }


        const currentRoles =
            Array.isArray(
                managementDirection?.roles
            )
                ? managementDirection.roles
                : [];


        const roleContainer =
            document.createElement(
                "div"
            );


        roleContainer.className =
            "member-role-management-wrapper";


        container.appendChild(
            roleContainer
        );


        await renderRoleManagement(
            roleContainer,
            directionId,
            currentRoles
        );
    }


    // ======================================
    // PATCH MANAGEMENT RENDER
    // ======================================

    const originalRenderDirectionManagement =
        renderDirectionManagement;


    renderDirectionManagement =
        async function (
            card,
            direction,
            managementDirection
        ) {

            await originalRenderDirectionManagement(
                card,
                direction,
                managementDirection
            );


            await renderExtendedManagement(
                card,
                direction,
                managementDirection
            );
        };


    // ======================================
    // HIDE LEGACY ETS2 BLOCK
    // ======================================

    function hideLegacyETS2Block() {

        if (!ets2Management) {
            return;
        }


        // Старий блок більше не є
        // основним джерелом управління.
        //
        // Управління тепер відбувається
        // безпосередньо всередині картки
        // відповідного напрямку.

        ets2Management.style.display =
            "none";


        if (ets2ManagementCard) {

            ets2ManagementCard.style.display =
                "none";
        }
    }
    // ======================================
    // LOAD PAGE
    // ======================================

    async function loadPage() {

        try {

            clearError();


            // ==================================
            // LOADING
            // ==================================

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


            // ==================================
            // PROFILE
            // ==================================

            const memberData =
                await loadProfile();


            // ==================================
            // GLOBAL ROLES
            // ==================================

            await loadGlobalRoles();


            // ==================================
            // DIRECTIONS
            // ==================================

            const directions =
                await loadActiveDirections();


            // ==================================
            // MANAGEMENT
            // ==================================
            // Якщо management RPC недоступний
            // через RBAC, сторінка все одно
            // показує дані учасника.

            let management =
                null;


            try {

                management =
                    await loadDirectionManagement();

            }
            catch (
                managementError
            ) {

                console.warn(
                    "MEMBER PAGE: management RPC недоступний, використовую дані учасника:",
                    managementError
                );


                management = {

                    success:
                        true,

                    directions:
                        Array.isArray(
                            memberData?.directions
                        )
                            ? memberData.directions
                            : []

                };

            }


            // ==================================
            // RENDER
            // ==================================

            await renderDirections(
                directions,
                management
            );


            // ==================================
            // OLD ETS2 BLOCK
            // ==================================

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
