/**
 * BHD Launcher — شبكة تطبيقات 3×3 + صورة حساب جوجل دائرية (نمط حسوب/خمسات)
 * يعتمد على bhd-identity.js
 *
 * التثبيت:
 *   <link rel="stylesheet" href="https://id.bhd-om.com/bhd-launcher.css" />
 *   <div data-bhd-launcher data-locale="ar"></div>
 *   <script src="https://id.bhd-om.com/bhd-identity.js" defer></script>
 *   <script src="https://id.bhd-om.com/bhd-launcher.js" defer></script>
 */
(function (root) {
  var ISSUER = "https://id.bhd-om.com";
  var CSS_HREF = ISSUER + "/bhd-launcher.css";

  function ensureCss() {
    if (document.querySelector('link[data-bhd-launcher-css]')) return;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = CSS_HREF;
    link.setAttribute("data-bhd-launcher-css", "1");
    document.head.appendChild(link);
  }

  function googleAvatar(url) {
    if (!url || typeof url !== "string") return "";
    try {
      if (url.indexOf("googleusercontent.com") === -1) return url;
      if (/=s\d+/.test(url)) return url.replace(/=s\d+(-c)?/, "=s96-c");
      return url + (url.indexOf("?") >= 0 ? "&" : "") + "sz=96";
    } catch (e) {
      return url;
    }
  }

  function initialOf(user) {
    var raw = ((user && (user.name || user.email)) || "B").trim();
    return raw.charAt(0).toUpperCase() || "B";
  }

  function launchHref(app) {
    if (!app) return "#";
    if (app.mode === "identity") return ISSUER + (app.workspacePath || "/account");
    if (app.startUrl) return app.startUrl;
    if (app.workspaceUrl) return app.workspaceUrl;
    return (app.origin || "") + (app.workspacePath || "/");
  }

  function Mount(el) {
    this.el = el;
    this.locale = (el.getAttribute("data-locale") || document.documentElement.lang || "ar").slice(0, 2);
    this.panel = null;
    this.apps = [];
    this.user = null;
    this.root = null;
    this.onDoc = this.onDoc.bind(this);
  }

  Mount.prototype.t = function (ar, en) {
    return this.locale === "en" ? en : ar;
  };

  Mount.prototype.onDoc = function (event) {
    if (!this.root || !this.panel) return;
    if (event.type === "keydown" && event.key === "Escape") {
      this.panel = null;
      this.render();
      return;
    }
    if (event.type === "mousedown" && !this.root.contains(event.target)) {
      this.panel = null;
      this.render();
    }
  };

  Mount.prototype.bindDoc = function (on) {
    if (on) {
      document.addEventListener("keydown", this.onDoc);
      document.addEventListener("mousedown", this.onDoc);
    } else {
      document.removeEventListener("keydown", this.onDoc);
      document.removeEventListener("mousedown", this.onDoc);
    }
  };

  Mount.prototype.setPanel = function (next) {
    this.panel = this.panel === next ? null : next;
    this.bindDoc(Boolean(this.panel));
    this.render();
  };

  Mount.prototype.renderApps = function () {
    var self = this;
    var apps = (this.apps || []).filter(function (app) {
      return app && app.enabled && app.id !== "account";
    });
    var html = '<div class="bhd-launcher-card" role="dialog" aria-label="' + self.t("تطبيقات BHD", "BHD apps") + '">';
    html += '<p class="bhd-launcher-card-head">' + self.t("تطبيقات BHD", "BHD apps") + "</p>";
    html += '<div class="bhd-launcher-apps">';
    apps.forEach(function (app) {
      var label = self.locale === "en" ? app.nameEn || app.nameAr : app.nameAr || app.nameEn;
      var mark =
        app.logoUrl
          ? '<span class="bhd-launcher-mark" style="background:' + (app.soft || "#e8f4f1") + '"><img src="' + app.logoUrl + '" alt="" /></span>'
          : '<span class="bhd-launcher-mark" style="background:' + (app.accent || "#075c45") + '">' +
            String(app.mark || label || "?").slice(0, 2) +
            "</span>";
      html +=
        '<a class="bhd-launcher-app" href="' +
        launchHref(app) +
        '" title="' +
        label +
        '">' +
        mark +
        '<span class="label">' +
        label +
        "</span></a>";
    });
    html += "</div></div>";
    return html;
  };

  Mount.prototype.renderAccount = function () {
    var user = this.user || {};
    var pic = googleAvatar(user.picture);
    var face = pic
      ? '<img src="' + pic + '" alt="" width="40" height="40" referrerpolicy="no-referrer" />'
      : "<span>" + initialOf(user) + "</span>";
    var html = '<div class="bhd-launcher-card bhd-launcher-account" role="dialog" aria-label="' + this.t("الحساب", "Account") + '">';
    html += '<div class="bhd-launcher-account-row"><span class="bhd-launcher-avatar" style="pointer-events:none">' + face + "</span>";
    html +=
      "<div><strong>" +
      (user.name || user.email || "") +
      '</strong><small dir="ltr">' +
      (user.email || "") +
      "</small></div></div>";
    html += '<a href="' + ISSUER + '/account">' + this.t("إدارة الحساب", "Manage account") + "</a>";
    html +=
      '<button type="button" data-bhd-launcher-signout>' + this.t("خروج من هذا الحساب", "Sign out") + "</button>";
    html += "</div>";
    return html;
  };

  Mount.prototype.render = function () {
    var self = this;
    var user = this.user;
    var dots = "<span aria-hidden=\"true\">" + Array(9).fill("<i></i>").join("") + "</span>";
    var html = '<div class="bhd-launcher-slot">';

    if (!user) {
      html +=
        '<a class="bhd-launcher-signin" href="/api/auth/bhd/start?returnTo=' +
        encodeURIComponent((location.pathname || "/") + (location.search || "")) +
        '">' +
        this.t("دخول BHD", "BHD sign-in") +
        "</a>";
      html +=
        '<button type="button" class="bhd-launcher-grid" aria-label="' +
        this.t("تطبيقات BHD", "BHD apps") +
        '" data-bhd-launcher-open="apps">' +
        dots +
        "</button>";
    } else {
      var pic = googleAvatar(user.picture);
      var face = pic
        ? '<img src="' + pic + '" alt="" width="32" height="32" referrerpolicy="no-referrer" />'
        : "<span>" + initialOf(user) + "</span>";
      html +=
        '<button type="button" class="bhd-launcher-avatar" aria-label="' +
        this.t("الحساب", "Account") +
        '" data-bhd-launcher-open="account">' +
        face +
        "</button>";
      html +=
        '<button type="button" class="bhd-launcher-grid" aria-label="' +
        this.t("تطبيقات BHD", "BHD apps") +
        '" data-bhd-launcher-open="apps">' +
        dots +
        "</button>";
    }

    if (this.panel === "apps") html += this.renderApps();
    if (this.panel === "account" && user) html += this.renderAccount();
    html += "</div>";

    this.el.innerHTML = html;
    this.root = this.el.querySelector(".bhd-launcher-slot");
    Array.prototype.forEach.call(this.el.querySelectorAll("[data-bhd-launcher-open]"), function (btn) {
      btn.addEventListener("click", function () {
        self.setPanel(btn.getAttribute("data-bhd-launcher-open"));
      });
    });
    var signOut = this.el.querySelector("[data-bhd-launcher-signout]");
    if (signOut) {
      signOut.addEventListener("click", function () {
        var identity = root.BhdIdentity;
        if (!identity || !identity.signOut) {
          location.assign("/api/auth/bhd/logout");
          return;
        }
        identity.signOut(false).then(function () {
          location.assign("/api/auth/bhd/logout?continue=" + encodeURIComponent(location.pathname || "/"));
        });
      });
    }
  };

  Mount.prototype.load = function () {
    var self = this;
    var identity = root.BhdIdentity;
    ensureCss();
    this.render();
    var catalogPromise = identity && identity.catalog
      ? identity.catalog()
      : fetch(ISSUER + "/api/bhd/catalog", { cache: "no-store" }).then(function (r) {
          return r.json();
        });
    catalogPromise
      .then(function (body) {
        self.apps = (body && body.apps) || body || [];
        self.render();
      })
      .catch(function () {});

    if (identity && identity.me) {
      identity
        .me()
        .then(function (result) {
          self.user = result && result.body && result.body.user ? result.body.user : null;
          self.render();
        })
        .catch(function () {});
    }

    window.addEventListener("bhd-catalog", function (event) {
      if (Array.isArray(event.detail)) {
        self.apps = event.detail;
        self.render();
      }
    });
    window.addEventListener("bhd-identity-me", function (event) {
      self.user = event.detail && event.detail.user ? event.detail.user : null;
      self.render();
    });
  };

  function boot() {
    ensureCss();
    var nodes = document.querySelectorAll("[data-bhd-launcher]");
    Array.prototype.forEach.call(nodes, function (node) {
      if (node.getAttribute("data-bhd-launcher-ready")) return;
      node.setAttribute("data-bhd-launcher-ready", "1");
      new Mount(node).load();
    });
  }

  root.BhdLauncher = { boot: boot, ensureCss: ensureCss };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(typeof window !== "undefined" ? window : this);
