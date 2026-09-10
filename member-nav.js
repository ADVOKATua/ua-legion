// ==========================================
// UA LEGION — MEMBERS → MEMBER CABINET
// member-nav.js
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {
  const supabase = window.supabaseClient;
  const list = document.getElementById("membersList");

  if (!supabase || !list) return;

  const { data: members, error } = await supabase.rpc(
    "get_ua_legion_members"
  );

  if (error || !Array.isArray(members)) {
    console.error("Не вдалося отримати учасників для навігації:", error);
    return;
  }

  function key(name, nickname) {
    return (
      String(name || "").trim().toLowerCase() +
      "||" +
      String(nickname || "").trim().toLowerCase()
    );
  }

  const map = new Map();

  members.forEach(member => {
    const id =
      member.id ||
      member.user_id ||
      member.profile_id;

    if (!id) return;

    map.set(
      key(member.name, member.game_nickname),
      id
    );
  });

  function attachButtons() {
    list.querySelectorAll(".member-card").forEach(card => {
      if (card.querySelector(".member-cabinet-link")) return;

      const name =
        card.querySelector(".member-main-info h2")?.textContent?.trim() || "";

      const nickname =
        card.querySelector(".member-nickname")?.textContent
          ?.replace(/^🎮\s*/, "")
          .trim() || "";

      const id = map.get(key(name, nickname));

      if (!id) return;

      const info = card.querySelector(".member-info");
      if (!info) return;

      const link = document.createElement("a");
      link.className = "member-cabinet-link";
      link.href = `member.html?user_id=${encodeURIComponent(id)}`;
      link.textContent = "👤 ВІДКРИТИ КАБІНЕТ";

      link.style.display = "inline-flex";
      link.style.marginTop = "15px";
      link.style.padding = "10px 15px";
      link.style.borderRadius = "9px";
      link.style.background = "#ffd34d";
      link.style.color = "#111";
      link.style.textDecoration = "none";
      link.style.fontWeight = "700";

      info.appendChild(link);
    });
  }

  const observer = new MutationObserver(() => {
    requestAnimationFrame(attachButtons);
  });

  observer.observe(list, {
    childList: true,
    subtree: true
  });

  attachButtons();
});
