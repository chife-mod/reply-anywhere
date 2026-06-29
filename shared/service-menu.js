/**
 * Service Menu — preview-only floating navigator + 12-column grid toggle.
 *
 * Generic across projects. Configure per-project by setting either of these
 * BEFORE this script loads (or via a small inline <script> on each page):
 *
 *   <script>
 *     window.PREVIEW_PROJECT_NAME = "My Project";    // shown in panel header
 *     window.PREVIEW_VERSIONS = [
 *       { id: "launcher",  label: "Launcher",  desc: "Index of all versions",         path: "" },
 *       { id: "concept-1", label: "Concept 1", desc: "Short description for the pill", path: "concept-1/" },
 *       // ...
 *     ];
 *     window.PREVIEW_DEFAULT_VERSION = "concept-1";  // surfaced on launcher page
 *   </script>
 *   <link  rel="stylesheet" href="../shared/service-menu.css">
 *   <script defer src="../shared/service-menu.js"></script>
 *
 * Falls back to a single "Launcher" version if nothing is configured.
 * Grid-overlay state persisted in localStorage as "preview-grid".
 */

(function () {
  "use strict";

  if (window.__previewServiceMenuInited) return;
  window.__previewServiceMenuInited = true;

  /* ── Config (read from window globals, with sensible defaults) ── */

  var PROJECT_NAME = window.PREVIEW_PROJECT_NAME || "Project Preview";

  var VERSIONS = (Array.isArray(window.PREVIEW_VERSIONS) && window.PREVIEW_VERSIONS.length)
    ? window.PREVIEW_VERSIONS
    : [{ id: "launcher", label: "Launcher", desc: "Index of all preview versions", path: "" }];

  var DEFAULT_VERSION_ID = window.PREVIEW_DEFAULT_VERSION || VERSIONS[0].id;

  /* ── Base-URL detection (project root, relative to this script) ── */

  function detectBase() {
    var scripts = document.querySelectorAll('script[src*="service-menu"]');
    if (!scripts.length) return "/";
    var src = scripts[scripts.length - 1].getAttribute("src");
    var url = new URL(src, window.location.href);
    var idx = url.pathname.lastIndexOf("/shared/");
    return idx >= 0 ? url.pathname.substring(0, idx + 1) : "/";
  }

  function detectActive(base) {
    var path = window.location.pathname;
    for (var i = 0; i < VERSIONS.length; i++) {
      var v = VERSIONS[i];
      if (!v.path) continue;
      if (
        path.indexOf(base + v.path) === 0 ||
        path.endsWith("/" + v.path) ||
        path.endsWith("/" + v.path + "index.html")
      ) {
        return v.id;
      }
    }
    return DEFAULT_VERSION_ID;
  }

  /* ── Inline SVGs ── */

  function svgLayers() {
    return (
      '<svg class="service-menu__icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<path d="M12 3 2 8l10 5 10-5-10-5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>' +
      '<path d="m2 16 10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      "</svg>"
    );
  }

  function svgCaret() {
    return (
      '<svg class="service-menu__caret" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
      "</svg>"
    );
  }

  function svgGrid() {
    return (
      '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<rect x="3.5" y="3.5" width="7" height="7" stroke="currentColor" stroke-width="1.5" rx="1.5"/>' +
      '<rect x="13.5" y="3.5" width="7" height="7" stroke="currentColor" stroke-width="1.5" rx="1.5"/>' +
      '<rect x="3.5" y="13.5" width="7" height="7" stroke="currentColor" stroke-width="1.5" rx="1.5"/>' +
      '<rect x="13.5" y="13.5" width="7" height="7" stroke="currentColor" stroke-width="1.5" rx="1.5"/>' +
      "</svg>"
    );
  }

  /* ── Build & mount: version chip ── */

  function build() {
    var base = detectBase();
    var activeId = detectActive(base);
    var activeVersion = VERSIONS.find(function (v) { return v.id === activeId; }) || VERSIONS[0];

    var root = document.createElement("div");
    root.className = "service-menu";
    root.setAttribute("data-open", "false");

    var capsule = document.createElement("button");
    capsule.type = "button";
    capsule.className = "service-menu__capsule";
    capsule.setAttribute("aria-expanded", "false");
    capsule.setAttribute("aria-haspopup", "menu");
    capsule.setAttribute("aria-label", "Switch preview version");
    capsule.innerHTML =
      svgLayers() +
      '<span class="service-menu__label">' +
      escapeHtml(activeVersion.label) +
      "</span>" +
      svgCaret();

    var panel = document.createElement("div");
    panel.className = "service-menu__panel";
    panel.setAttribute("role", "menu");

    var header = document.createElement("div");
    header.className = "service-menu__panel-header";
    header.textContent = PROJECT_NAME + " — Preview";
    panel.appendChild(header);

    var list = document.createElement("ul");
    list.className = "service-menu__list";
    VERSIONS.forEach(function (v) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.className = "service-menu__item";
      a.href = base + v.path;
      a.setAttribute("role", "menuitem");
      if (v.id === activeId) a.setAttribute("data-active", "true");
      a.innerHTML =
        '<div class="service-menu__item-title">' + escapeHtml(v.label) + "</div>" +
        '<div class="service-menu__item-desc">' + escapeHtml(v.desc) + "</div>";
      li.appendChild(a);
      list.appendChild(li);
    });
    panel.appendChild(list);

    var footer = document.createElement("div");
    footer.className = "service-menu__footer";
    footer.textContent = "Internal preview · not for distribution";
    panel.appendChild(footer);

    root.appendChild(capsule);
    root.appendChild(panel);
    document.body.appendChild(root);

    function setOpen(open) {
      root.setAttribute("data-open", open ? "true" : "false");
      capsule.setAttribute("aria-expanded", open ? "true" : "false");
    }
    capsule.addEventListener("click", function (e) {
      e.stopPropagation();
      setOpen(root.getAttribute("data-open") !== "true");
    });
    document.addEventListener("click", function (e) {
      if (!root.contains(e.target)) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ── Grid overlay (12-column system reference) ──────────────
     Independent of the version chip. Toggle button (circle) sits
     to the LEFT of the chip; click flips the .grid-overlay
     visibility. State persisted in localStorage so it stays on
     across page navigation. */

  function buildGrid() {
    var overlay = document.createElement("div");
    overlay.className = "grid-overlay";

    var frame = document.createElement("div");
    frame.className = "grid-overlay__frame";

    var cols = document.createElement("div");
    cols.className = "grid-overlay__cols";
    for (var i = 0; i < 12; i++) {
      var col = document.createElement("div");
      col.className = "grid-overlay__col";
      cols.appendChild(col);
    }
    frame.appendChild(cols);
    overlay.appendChild(frame);
    document.body.appendChild(overlay);

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "grid-toggle";
    btn.setAttribute("aria-label", "Toggle 12-column grid overlay");
    btn.innerHTML = svgGrid();

    /* Attach inside .service-menu (created by build() above) so the toggle
       sits as a flex sibling LEFT of the version capsule. */
    var menu = document.querySelector(".service-menu");
    if (menu) menu.insertBefore(btn, menu.firstChild);
    else document.body.appendChild(btn);

    var stored = false;
    try { stored = localStorage.getItem("preview-grid") === "on"; } catch (_) {}
    if (stored) {
      overlay.classList.add("is-on");
      btn.classList.add("is-on");
    }

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var on = !overlay.classList.contains("is-on");
      overlay.classList.toggle("is-on", on);
      btn.classList.toggle("is-on", on);
      try { localStorage.setItem("preview-grid", on ? "on" : "off"); } catch (_) {}
    });
  }

  function init() { build(); buildGrid(); }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
