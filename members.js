// ======================================
// UA LEGION — MEMBERS SYSTEM
// members.js
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

    const membersList =
        document.getElementById("membersList");

    const membersSearch =
        document.getElementById("membersSearch");

    const membersCount =
        document.getElementById("membersCount");

    const membersMessage =
        document.getElementById("membersMessage");


    // ======================================
    // STATE
    // ======================================

    let members = [];


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


    function showMessage(message) {

        if (!membersMessage) {
            return;
        }

        membersMessage.textContent =
            message || "";

        membersMessage.style.display =
            message ? "block" : "none";
    }


    function getAvatarUrl(member) {

        if (member?.avatar_url) {

            return member.avatar_url;
        }


        const name =
            member?.display_name ||
            member?.name ||
            "User";


        return (
            "https://ui-avatars.com/api/?" +
            "name=" +
            encodeURIComponent(name) +
            "&background=171a20&color=ffffff"
        );
    }


    // ======================================
    // FORMAT GLOBAL ROLES
    // ======================================

    function formatGlobalRoles(
        globalRoles
    ) {

        if (
            !Array.isArray(globalRoles) ||
            !globalRoles.length
        ) {

            return `
                <span class="member-empty">
                    Без глобальної посади
                </span>
            `;
        }


        return globalRoles
            .map(role => {

                if (
                    !role ||
                    typeof role !== "object"
                ) {

                    return "";
                }


                return `
                    <span class="member-role-badge">
                        ${escapeHtml(
                            role.name ||
                            role.code ||
                            "Без назви"
                        )}
                    </span>
                `;

            })
            .filter(Boolean)
            .join("");
    }


    // ======================================
    // FORMAT DIRECTIONS
    // ======================================

    function formatDirections(
        directions
    ) {

        if (
            !Array.isArray(directions) ||
            !directions.length
        ) {

            return `
                <div class="member-empty">
                    Не приєднаний до напрямків
                </div>
            `;
        }


        return directions
            .map(direction => {

                if (
                    !direction ||
                    typeof direction !== "object"
                ) {

                    return "";
                }


                const icon =
                    direction.icon ||
                    "🎮";


                const name =
                    direction.name ||
                    direction.code ||
                    "Без назви";


                const status =
                    direction.status ||
                    "";


                const driverClass =
                    direction.driver_class ||
                    "";


                const roles =
                    Array.isArray(
                        direction.roles
                    )
                        ? direction.roles
                        : [];


                let rolesHtml = "";


                if (roles.length) {

                    rolesHtml = roles
                        .map(role => {

                            if (
                                !role ||
                                typeof role !== "object"
                            ) {

                                return "";
                            }


                            return `
                                <span class="member-direction-role">
                                    ${escapeHtml(
                                        role.name ||
                                        role.code ||
                                        "Без назви"
                                    )}
                                </span>
                            `;

                        })
                        .filter(Boolean)
                        .join("");
                }


                return `
                    <div class="member-direction">

                        <div class="member-direction-header">

                            <span class="member-direction-name">
                                ${escapeHtml(icon)}
                                ${escapeHtml(name)}
                            </span>

                            ${
                                status
                                    ? `
                                        <span class="member-direction-status">
                                            ${escapeHtml(status)}
                                        </span>
                                    `
                                    : ""
                            }

                        </div>


                        ${
                            rolesHtml
                                ? `
                                    <div class="member-direction-roles">
                                        ${rolesHtml}
                                    </div>
                                `
                                : `
                                    <div class="member-empty">
                                        Посад немає
                                    </div>
                                `
                        }


                        ${
                            direction.code === "ets2" &&
                            driverClass
                                ? `
                                    <div class="member-driver-class">
                                        🚛 Клас водія:
                                        <strong>
                                            ${escapeHtml(
                                                driverClass
                                            )}
                                        </strong>
                                    </div>
                                `
                                : ""
                        }

                    </div>
                `;

            })
            .filter(Boolean)
            .join("");
    }


    // ======================================
    // SEARCH TEXT
    // ======================================

    function getMemberSearchText(
        member
    ) {

        const parts = [];


        parts.push(
            member?.display_name || ""
        );


        parts.push(
            member?.name || ""
        );


        parts.push(
            member?.game_nickname || ""
        );


        parts.push(
            member?.discord_username || ""
        );


        // GLOBAL ROLES

        if (
            Array.isArray(
                member?.global_roles
            )
        ) {

            member.global_roles
                .forEach(role => {

                    if (!role) {
                        return;
                    }


                    parts.push(
                        role.name || ""
                    );


                    parts.push(
                        role.code || ""
                    );

                });
        }


        // DIRECTIONS

        if (
            Array.isArray(
                member?.directions
            )
        ) {

            member.directions
                .forEach(direction => {

                    if (!direction) {
                        return;
                    }


                    parts.push(
                        direction.name || ""
                    );


                    parts.push(
                        direction.code || ""
                    );


                    parts.push(
                        direction.slug || ""
                    );


                    parts.push(
                        direction.driver_class || ""
                    );


                    if (
                        Array.isArray(
                            direction.roles
                        )
                    ) {

                        direction.roles
                            .forEach(role => {

                                if (!role) {
                                    return;
                                }


                                parts.push(
                                    role.name || ""
                                );


                                parts.push(
                                    role.code || ""
                                );

                            });
                    }

                });
        }


        return parts
            .join(" ")
            .toLowerCase();
    }


    // ======================================
    // RENDER ONE MEMBER
    // ======================================

    function renderMember(
        member
    ) {

        const userId =
            member?.user_id ||
            member?.id ||
            "";


        const displayName =
            member?.display_name ||
            member?.name ||
            "Без імені";


        const nickname =
            member?.game_nickname ||
            "";


        const avatarUrl =
            getAvatarUrl(member);


        const globalRolesHtml =
            formatGlobalRoles(
                member?.global_roles
            );


        const directionsHtml =
            formatDirections(
                member?.directions
            );


        const card =
            document.createElement(
                "div"
            );


        card.className =
            "member-card";


        card.innerHTML = `

            <div class="member-card-header">

                <img
                    class="member-avatar"
                    src="${escapeHtml(
                        avatarUrl
                    )}"
                    alt=""
                >


                <div class="member-main-info">

                    <div class="member-name">

                        ${escapeHtml(
                            displayName
                        )}

                    </div>


                    ${
                        nickname
                            ? `
                                <div class="member-nickname">

                                    🎮
                                    ${escapeHtml(
                                        nickname
                                    )}

                                </div>
                            `
                            : ""
                    }

                </div>

            </div>


            <div class="member-section">

                <div class="member-section-title">

                    ГЛОБАЛЬНІ ПОСАДИ

                </div>


                <div class="member-roles">

                    ${globalRolesHtml}

                </div>

            </div>


            <div class="member-section">

                <div class="member-section-title">

                    НАПРЯМКИ

                </div>


                <div class="member-directions">

                    ${directionsHtml}

                </div>

            </div>


            ${
                userId
                    ? `
                        <div class="member-actions">

                            <a
                                class="member-open-button"
                                href="member.html?user_id=${encodeURIComponent(
                                    userId
                                )}"
                            >
                                ВІДКРИТИ КАБІНЕТ
                            </a>

                        </div>
                    `
                    : ""
            }

        `;


        return card;
    }


    // ======================================
    // RENDER MEMBERS
    // ======================================

    function renderMembers(
        list
    ) {

        if (!membersList) {
            return;
        }


        membersList.innerHTML =
            "";


        if (!list.length) {

            membersList.innerHTML = `

                <div class="members-empty">

                    Користувачів не знайдено.

                </div>

            `;


            if (membersCount) {

                membersCount.textContent =
                    "0";
            }


            return;
        }


        list.forEach(member => {

            membersList.appendChild(
                renderMember(member)
            );

        });


        if (membersCount) {

            membersCount.textContent =
                String(list.length);
        }
    }


    // ======================================
    // APPLY SEARCH
    // ======================================

    function applySearch() {

        const query =
            (
                membersSearch?.value ||
                ""
            )
                .trim()
                .toLowerCase();


        if (!query) {

            renderMembers(
                members
            );

            return;
        }


        const filtered =
            members.filter(member => {

                return getMemberSearchText(
                    member
                ).includes(query);

            });


        renderMembers(
            filtered
        );
    }


    // ======================================
    // LOAD MEMBERS
    // ======================================

    async function loadMembers() {

        try {

            showMessage(
                "Завантаження учасників..."
            );


            // ----------------------------------
            // AUTH
            // ----------------------------------

            const {
                data: {
                    user
                },
                error: authError
            } = await supabase.auth.getUser();


            if (
                authError ||
                !user
            ) {

                throw new Error(
                    "Користувач не авторизований"
                );
            }


            // ----------------------------------
            // PERMISSION
            // ----------------------------------

            const {
                data: canView,
                error: permissionError
            } = await supabase.rpc(
                "can_view_ua_legion_members"
            );


            if (permissionError) {

                console.error(
                    "Members permission error:",
                    permissionError
                );


                throw permissionError;
            }


            if (canView !== true) {

                throw new Error(
                    "У вас немає доступу до списку учасників"
                );
            }


            // ----------------------------------
            // LOAD MEMBERS
            // ----------------------------------

            const {
                data,
                error
            } = await supabase.rpc(
                "get_ua_legion_members"
            );


            if (error) {

                console.error(
                    "get_ua_legion_members error:",
                    error
                );


                throw error;
            }


            // ----------------------------------
            // NORMALIZE RESPONSE
            // ----------------------------------

            let result =
                data;


            if (
                data &&
                typeof data === "object" &&
                !Array.isArray(data)
            ) {

                if (
                    Array.isArray(
                        data.members
                    )
                ) {

                    result =
                        data.members;

                } else if (
                    Array.isArray(
                        data.data
                    )
                ) {

                    result =
                        data.data;

                } else {

                    result = [];
                }
            }


            if (
                !Array.isArray(result)
            ) {

                result = [];
            }


            members =
                result;


            // ----------------------------------
            // DONE
            // ----------------------------------

            showMessage("");


            renderMembers(
                members
            );

        }
        catch (error) {

            console.error(
                "MEMBERS PAGE ERROR:",
                error
            );


            members = [];


            if (membersList) {

                membersList.innerHTML = `

                    <div class="members-empty">

                        Не вдалося завантажити
                        список учасників.

                    </div>

                `;
            }


            if (membersCount) {

                membersCount.textContent =
                    "0";
            }


            showMessage(
                error?.message ||
                "Помилка завантаження"
            );
        }
    }


    // ======================================
    // SEARCH EVENT
    // ======================================

    if (membersSearch) {

        membersSearch.addEventListener(
            "input",
            applySearch
        );
    }


    // ======================================
    // START
    // ======================================

    await loadMembers();

});
