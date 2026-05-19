(function () {
  function hashString(value) {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i += 1) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function randomFromSeed(seed) {
    let state = seed >>> 0;
    return function () {
      state += 0x6d2b79f5;
      let value = state;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  function localDayKey() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function escapeAttribute(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function buildAvatar(seed, name) {
    const hash = hashString(seed);
    const random = randomFromSeed(hash);
    const hue = hash % 360;
    const bgId = `daily-avatar-bg-${hash.toString(16)}`;
    const accent = `hsl(${hue} 62% 44%)`;
    const accentDark = `hsl(${(hue + 22) % 360} 58% 34%)`;
    const bgA = `hsl(${(hue + 205) % 360} 70% 94%)`;
    const bgB = `hsl(${(hue + 245) % 360} 65% 88%)`;
    const cells = [];

    for (let y = 0; y < 5; y += 1) {
      for (let x = 0; x < 3; x += 1) {
        if (random() > 0.44) {
          cells.push([x, y]);
          if (x !== 2) {
            cells.push([4 - x, y]);
          }
        }
      }
    }

    if (cells.length < 7) {
      cells.push([2, 0], [1, 1], [3, 1], [2, 2], [0, 3], [4, 3], [2, 4]);
    }

    const rects = cells
      .map(function ([x, y], index) {
        const fill = index % 3 === 0 ? accentDark : accent;
        return `<rect x="${12 + x * 16}" y="${12 + y * 16}" width="13" height="13" rx="3" fill="${fill}"/>`;
      })
      .join("");

    return [
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img" aria-label="${escapeAttribute(name)} daily avatar">`,
      "<defs>",
      `<linearGradient id="${bgId}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bgA}"/><stop offset="1" stop-color="${bgB}"/></linearGradient>`,
      "</defs>",
      `<rect width="100" height="100" fill="url(#${bgId})"/>`,
      '<g opacity="0.92">',
      rects,
      "</g>",
      "</svg>",
    ].join("");
  }

  function renderDailyAvatars() {
    const dayKey = localDayKey();
    document.querySelectorAll("[data-daily-avatar]").forEach(function (element) {
      const seed = `${element.dataset.avatarSeed || ""}:${dayKey}`;
      const name = element.dataset.avatarName || "Generated";
      element.innerHTML = buildAvatar(seed, name);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderDailyAvatars);
  } else {
    renderDailyAvatars();
  }
})();
