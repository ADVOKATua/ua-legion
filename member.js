function renderDirectionData(direction, membership) {
    const data = membership?.direction_data || {};

    const code =
        String(
            direction?.code ||
            direction?.slug ||
            ""
        )
            .toLowerCase()
            .replace(/[\s_-]+/g, "");

    const fields = [];

    function addField(label, value) {
        if (
            value === null ||
            value === undefined ||
            String(value).trim() === ""
        ) {
            return;
        }

        fields.push({
            label,
            value: String(value).trim()
        });
    }

    /* =======================================================
       ETS2
    ======================================================= */

    if (
        code === "ets2" ||
        code === "truckersmp"
    ) {
        addField(
            "TruckersMP",
            data.truckersmp_nick
        );

        addField(
            "TruckersMP ID",
            data.truckersmp_id
        );

        addField(
            "TruckersHub",
            data.truckershub_username
        );

        addField(
            "TruckersHub ID",
            data.truckershub_id
        );
    }

    /* =======================================================
       WORLD OF TANKS
    ======================================================= */

    else if (
        code === "wot" ||
        code === "worldoftanks"
    ) {
        addField(
            "Ігровий нік",
            data.wot_nickname
        );

        addField(
            "Wargaming ID",
            data.wargaming_id ||
            data.wot_account_id
        );

        addField(
            "Регіон",
            data.wot_region
        );
    }

    /* =======================================================
       DOTA 2
    ======================================================= */

    else if (
        code === "dota2" ||
        code === "dota"
    ) {
        addField(
            "Ігровий нік",
            data.dota_nickname
        );

        addField(
            "Friend ID",
            data.dota_friend_id
        );

        addField(
            "Ранг",
            data.dota_rank
        );
    }

    /* =======================================================
       WORLD OF WARCRAFT
    ======================================================= */

    else if (
        code === "wow" ||
        code === "worldofwarcraft"
    ) {
        addField(
            "BattleTag",
            data.battletag
        );

        addField(
            "Персонаж",
            data.wow_character
        );

        addField(
            "Realm",
            data.wow_realm
        );

        addField(
            "Фракція",
            data.wow_faction
        );

        addField(
            "Клас",
            data.wow_class
        );
    }

    /* =======================================================
       НЕМАЄ ДАНИХ
    ======================================================= */

    if (fields.length === 0) {
        return `
            <div class="direction-data">
                <div class="direction-data-title">
                    🎮 Ігрові дані
                </div>

                <div class="direction-data-empty">
                    Ігрові дані не вказані
                </div>
            </div>
        `;
    }

    /* =======================================================
       ВИВІД ДАНИХ
    ======================================================= */

    return `
        <div class="direction-data">

            <div class="direction-data-title">
                🎮 Ігрові дані
            </div>

            <div class="direction-data-list">

                ${fields.map(field => `
                    <div class="direction-data-row">

                        <div class="direction-data-label">
                            ${escapeHtml(field.label)}
                        </div>

                        <div class="direction-data-value">
                            ${escapeHtml(field.value)}
                        </div>

                    </div>
                `).join("")}

            </div>

        </div>
    `;
}
