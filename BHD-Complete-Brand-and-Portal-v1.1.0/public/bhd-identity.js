/**
 * BHD Identity browser client — load from the issuer, do not copy into products.
 * <script src="https://id.bhd-om.com/bhd-identity.js" defer></script>
 */
(function (root) {
  var ISSUER = "https://id.bhd-om.com";
  var TOKEN_KEY = "bhd_window_token";
  var SIGNED_OUT_KEY = "bhd_window_signed_out";

  function capture(token) {
    if (!token || typeof sessionStorage === "undefined") return;
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.removeItem(SIGNED_OUT_KEY);
  }

  function windowHeaders(extra) {
    var headers = extra ? Object.assign({}, extra) : {};
    if (typeof sessionStorage === "undefined") return headers;
    if (sessionStorage.getItem(SIGNED_OUT_KEY) === "1") {
      headers["X-BHD-Window-Signed-Out"] = "1";
      return headers;
    }
    var token = sessionStorage.getItem(TOKEN_KEY);
    if (token) headers.Authorization = "Bearer " + token;
    else headers["X-BHD-Window-Bootstrap"] = "1";
    return headers;
  }

  function request(path, init) {
    init = init || {};
    var headers = windowHeaders(init.headers || {});
    return fetch(ISSUER + path, {
      cache: "no-store",
      credentials: "include",
      method: init.method || "GET",
      body: init.body,
      headers: headers,
    }).then(function (response) {
      return response.json().then(function (body) {
        if (body && body.token) capture(body.token);
        return { ok: response.ok, status: response.status, body: body };
      });
    });
  }

  function emit(name, detail) {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent(name, { detail: detail || {} }));
  }

  var BhdIdentity = {
    issuer: ISSUER,
    runtime: function () {
      return fetch(ISSUER + "/api/bhd/runtime", { cache: "no-store" }).then(function (response) {
        return response.json().then(function (body) {
          if (body && body.catalog && body.catalog.apps) emit("bhd-catalog", body.catalog.apps);
          return body;
        });
      });
    },
    catalog: function () {
      return fetch(ISSUER + "/api/bhd/catalog", { cache: "no-store" }).then(function (response) {
        return response.json().then(function (body) {
          if (body && body.apps) emit("bhd-catalog", body.apps);
          return body;
        });
      });
    },
    me: function () {
      return request("/api/auth/me").then(function (result) {
        emit("bhd-identity-me", result.body);
        return result;
      });
    },
    /**
     * Rebind the product tab to THIS window's account.
     * Prefer product POST /api/auth/bhd/rebind with Bearer — never bare /start after a
     * Bearer switch (shared bhd_id stays on the previous account → privacy leak).
     */
    isolate: function () {
      var here = window.location.pathname + (window.location.search || "") || "/";
      if (here.indexOf("_bhd=") < 0) {
        here += (here.indexOf("?") >= 0 ? "&" : "?") + "_bhd=" + Date.now();
      }
      if (window.location.origin.replace(/\/$/, "") === ISSUER) {
        window.location.reload();
        return Promise.resolve();
      }
      var token = typeof sessionStorage !== "undefined" ? sessionStorage.getItem(TOKEN_KEY) : "";
      if (token) {
        var form = document.createElement("form");
        form.method = "POST";
        form.action = "/api/auth/bhd/rebind";
        form.style.display = "none";
        var tokenInput = document.createElement("input");
        tokenInput.name = "token";
        tokenInput.value = token;
        var returnInput = document.createElement("input");
        returnInput.name = "returnTo";
        returnInput.value = here.charAt(0) === "/" ? here : "/";
        form.appendChild(tokenInput);
        form.appendChild(returnInput);
        document.body.appendChild(form);
        form.submit();
        return Promise.resolve();
      }
      return request("/api/auth/window-handoff", { method: "POST" }).then(function (result) {
        var ticket = result.body && result.body.ticket;
        var start = window.location.origin + "/api/auth/bhd/start?returnTo=" + encodeURIComponent(here.charAt(0) === "/" ? here : "/");
        if (ticket) {
          window.location.assign(
            ISSUER + "/auth/handoff?ticket=" + encodeURIComponent(ticket) + "&next=" + encodeURIComponent(start),
          );
          return;
        }
        // Never fall through to bare start (would use shared bhd_id = previous account).
        window.location.assign(
          window.location.origin + "/api/auth/bhd/logout?continue=" + encodeURIComponent(start),
        );
      });
    },
    switchAccount: function (sub) {
      return request("/api/auth/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sub: sub }),
      }).then(function (result) {
        emit("bhd-account-changed", result.body);
        if (result.ok) return BhdIdentity.isolate().then(function () { return result; });
        return result;
      });
    },
    signOut: function (all) {
      return request("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: Boolean(all) }),
      }).then(function (result) {
        if (all || !(result.body && result.body.user)) {
          if (typeof sessionStorage !== "undefined") {
            sessionStorage.removeItem(TOKEN_KEY);
            sessionStorage.setItem(SIGNED_OUT_KEY, "1");
          }
        }
        emit("bhd-account-changed", result.body);
        return result;
      });
    },
    captureToken: capture,
    productStart: function (returnTo) {
      var path = returnTo && returnTo.charAt(0) === "/" ? returnTo : "/";
      return "/api/auth/bhd/start?returnTo=" + encodeURIComponent(path);
    },
  };

  root.BhdIdentity = BhdIdentity;
  if (typeof window !== "undefined") {
    BhdIdentity.catalog();
    window.setInterval(function () {
      BhdIdentity.catalog();
    }, 20000);
  }
})(typeof window !== "undefined" ? window : this);
