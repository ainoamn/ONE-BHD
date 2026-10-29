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
        return response.json();
      });
    },
    me: function () {
      return request("/api/auth/me").then(function (result) {
        emit("bhd-identity-me", result.body);
        return result;
      });
    },
    switchAccount: function (sub) {
      return request("/api/auth/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sub: sub }),
      }).then(function (result) {
        emit("bhd-account-changed", result.body);
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
})(typeof window !== "undefined" ? window : this);
