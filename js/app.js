/* Sancity Graphics & Prints - interactive site */
(function () {
  "use strict";
  var SERVICES = window.SERVICES || [];
  var state = { items: [] };
  var lastInquiry = "";

  function curService() {
    var b = document.body.getAttribute("data-service");
    if (b) return b.toLowerCase();
    var m = (location.search || "").match(/[?&]svc=([^&]+)/);
    return m ? decodeURIComponent(m[1].replace(/\+/g, " ")).toLowerCase() : "";
  }

  /* ---------- Calculator ---------- */
  function money(n) {
    return "P" + Number(n).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function initCalculator() {
    var root = document.getElementById("calculator");
    if (!root) return;
    var svcSel = root.querySelector("[data-role=svc]");
    var optSel = root.querySelector("[data-role=opt]");
    var qty = root.querySelector("[data-role=qty]");
    var qhint = root.querySelector("[data-role=qhint]");
    var sw = root.querySelector("[data-role=sw]");
    var sh = root.querySelector("[data-role=sh]");
    var sun = root.querySelector("[data-role=sun]");
    var sizebox = root.querySelector("[data-role=sizebox]");
    var addBtn = root.querySelector("[data-role=add]");
    var clearBtn = root.querySelector("[data-role=clear]");
    var list = root.querySelector("[data-role=items]");
    var totalEl = root.querySelector("[data-role=total]");
    var countEl = root.querySelector("[data-role=count]");
    var cur = curService();

    function unitWord(u) { return u === "sqft" ? "per sq ft" : u === "sqin" ? "per sq in" : "each"; }
    function unitAbbr(u) { return u === "sqft" ? "ft" : u === "sqin" ? "in" : ""; }

    /* pick the unit price for a quantity given tier minimums */
    function tierPrice(tiers, q, base) {
      if (!tiers || !tiers.length) return base;
      var p = base, m = -1;
      tiers.forEach(function (t) {
        if (q >= t.m && t.m >= m) { m = t.m; p = t.p; }
      });
      return p;
    }

    function fillServices() {
      SERVICES.forEach(function (s) {
        var o = document.createElement("option");
        o.value = s.slug;
        o.textContent = s.name;
        svcSel.appendChild(o);
      });
      if (cur) svcSel.value = cur;
      fillOptions();
    }
    function fillOptions() {
      var s = bySlug(svcSel.value);
      if (!s) return;
      optSel.innerHTML = "";
      s.calc.forEach(function (c, i) {
        var o = document.createElement("option");
        o.value = i;
        o.setAttribute("data-label", c.n);
        o.textContent = c.n + " — " + money(c.p) + (c.t && c.t.length > 1 ? " (bulk rates)" : "");
        optSel.appendChild(o);
      });
      updateSizeField();
      updateQtyHint();
    }
    function selectedOpt() {
      var s = bySlug(svcSel.value);
      if (!s) return null;
      var i = parseInt(optSel.value, 10);
      if (isNaN(i) || i < 0 || i >= s.calc.length) return null;
      return s.calc[i];
    }
    function bySlug(slug) {
      for (var i = 0; i < SERVICES.length; i++) if (SERVICES[i].slug === slug) return SERVICES[i];
      return null;
    }
    function q() {
      var n = parseInt(qty.value, 10);
      return isNaN(n) || n < 1 ? 1 : n;
    }
    function dims() {
      var w = parseFloat(sw.value), h = parseFloat(sh.value);
      if (isNaN(w) || w <= 0) w = 1;
      if (isNaN(h) || h <= 0) h = 1;
      return { w: w, h: h };
    }
    function pieceArea() {
      var d = dims();
      return d.w * d.h;
    }
    function totalArea() {
      return pieceArea() * q();
    }
    function updateSizeField() {
      var c = selectedOpt();
      if (!c || !c.u) {
        if (sizebox) sizebox.hidden = true;
        return;
      }
      if (sun) sun.textContent = c.u === "sqft" ? "sq ft" : "sq in";
      if (sizebox) sizebox.hidden = false;
    }
    function updateQtyHint() {
      var c = selectedOpt();
      if (!c) return;
      var basis = c.u ? totalArea() : q();
      var bword = c.u ? (c.u === "sqft" ? "sq ft" : "sq in") : "pcs";
      if (!c.t || c.t.length < 2) {
        if (qhint) qhint.style.display = "none";
        return;
      }
      var up = tierPrice(c.t, basis, c.p);
      var parts = [];
      if (up < c.p) parts.push("Bulk rate applied: " + money(up) + " " + unitWord(c.u));
      for (var i = 0; i < c.t.length; i++) {
        if (c.t[i].m > basis) {
          parts.push(c.t[i].m + "+ " + bword + ": " + money(c.t[i].p) + " " + unitWord(c.u));
          break;
        }
      }
      if (!parts.length) parts.push("Base rate: " + money(c.p) + " " + unitWord(c.u));
      if (qhint) { qhint.textContent = parts.join(" · "); qhint.style.display = "block"; }
    }
    function add() {
      var s = bySlug(svcSel.value);
      var c = selectedOpt();
      if (!s || !c) return;
      var qn = q();
      var ar = c.u ? pieceArea() : null;
      var basis = c.u ? ar * qn : qn;
      var unit = tierPrice(c.t, basis, c.p);
      var d = dims();
      var size = c.u ? d.w + " x " + d.h + " " + unitAbbr(c.u) : null;
      state.items.push({ svc: s.name, opt: c.n, unit: unit, base: c.p, qty: qn, u: c.u, area: ar, size: size });
      render();
    }
    function render() {
      list.innerHTML = "";
      var total = 0;
      state.items.forEach(function (it, i) {
        var li = document.createElement("li");
        var info = document.createElement("div");
        info.className = "li-info";
        var amt = it.area ? it.unit * it.area * it.qty : it.unit * it.qty;
        var bulk = it.unit < it.base ? ' <em class="bulk">bulk rate</em>' : "";
        info.innerHTML = "<strong>" + esc(it.svc) + "</strong><small>" + esc(it.opt) +
          (it.size ? " &middot; " + it.size : "") + " &middot; x" + it.qty + " @ " + money(it.unit) + " " + unitWord(it.u) + bulk + "</small>";
        var elAmt = document.createElement("div");
        elAmt.className = "li-amt";
        elAmt.textContent = money(amt);
        var rm = document.createElement("button");
        rm.className = "btn danger del";
        rm.textContent = "Remove";
        rm.onclick = function () { state.items.splice(i, 1); render(); };
        li.appendChild(info);
        li.appendChild(elAmt);
        li.appendChild(rm);
        total += amt;
        list.appendChild(li);
      });
      totalEl.textContent = money(total);
      countEl.textContent = state.items.length + " item(s)";
    }
    function esc(s) {
      var d = document.createElement("div");
      d.textContent = s;
      return d.innerHTML;
    }
    svcSel.onchange = function () { fillOptions(); };
    optSel.onchange = function () { updateSizeField(); updateQtyHint(); };
    qty.addEventListener("input", updateQtyHint);
    sw.addEventListener("input", updateQtyHint);
    sh.addEventListener("input", updateQtyHint);
    addBtn.onclick = add;
    clearBtn.onclick = function () { state.items = []; render(); };

    /* sync calculator items into the contact message */
    var useBtn = root.querySelector("[data-role=use]");
    if (useBtn) useBtn.onclick = function () {
      var msg = document.querySelector("[data-role=cmessage]");
      var t = "Hi, I would like to inquire about the following:\n";
      state.items.forEach(function (it) {
        var amt = it.area ? it.unit * it.area * it.qty : it.unit * it.qty;
        t += "- " + it.svc + ": " + it.opt + (it.size ? " (" + it.size + ")" : "") +
          " x" + it.qty + " @ " + money(it.unit) + " " + unitWord(it.u) + " = " + money(amt) + "\n";
      });
      if (state.items.length) t += "Estimated total: " + money(state.items.reduce(function (a, b) {
        return a + (b.area ? b.unit * b.area * b.qty : b.unit * b.qty);
      }, 0)) + "\n\n";
      if (msg) {
        msg.value = t;
        if (state.items.length) setServiceOfInterest(state.items[0].svc);
        var c = document.getElementById("contact");
        if (c) c.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.href = "/inquiry?est=" + encodeURIComponent(t);
      }
    };
    fillServices();
    render();
  }

  /* ---------- Contact form ---------- */
  function setServiceOfInterest(name) {
    var sel = document.querySelector("[data-role=csvc]");
    if (!sel) return;
    for (var i = 0; i < sel.options.length; i++) {
      if (sel.options[i].value === name || sel.options[i].text === name) { sel.selectedIndex = i; return; }
    }
  }

  function initContact() {
    var f = document.getElementById("contactForm");
    if (!f) return;
    var est = (location.search || "").match(/[?&]est=([^&]+)/);
    if (est) {
      var msgEl = f.querySelector("[data-role=cmessage]");
      if (msgEl) msgEl.value = decodeURIComponent(est[1].replace(/\+/g, " "));
    }
    var svcSel = f.querySelector("[data-role=csvc]");
    if (svcSel && SERVICES.length) {
      SERVICES.forEach(function (s) {
        var o = document.createElement("option");
        o.value = s.name;
        o.textContent = s.name;
        svcSel.appendChild(o);
      });
      var cur = curService();
      if (cur) {
        for (var i = 0; i < SERVICES.length; i++) if (SERVICES[i].slug === cur) { svcSel.value = SERVICES[i].name; break; }
      } else if (est) {
        var mm = (f.querySelector("[data-role=cmessage]").value || "").match(/^- ([^:]+):/m);
        if (mm) setServiceOfInterest(mm[1].trim());
      }
    }
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = f.querySelector("[data-role=cname]").value.trim();
      var contact = f.querySelector("[data-role=ccontact]").value.trim();
      var svc = f.querySelector("[data-role=csvc]").value;
      var msg = f.querySelector("[data-role=cmessage]").value.trim();
      var subject = "Inquiry: " + svc + (name ? " - " + name : "");
      var btn = f.querySelector("[type=submit]");
      var ok = f.parentNode.querySelector(".form-success");
      var orig = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "Sending..."; }
      fetch("https://formsubmit.co/ajax/sancity.studio@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          _subject: subject,
          _template: "table",
          _captcha: "false",
          Name: name,
          Contact: contact,
          "Service of Interest": svc,
          Message: msg
        })
      }).then(function (r) { return r.json(); }).then(function (data) {
        if (data && (data.success === "true" || data.success === true)) {
          lastInquiry = "Hi, I would like to inquire about the following:\n\nName: " + name +
            "\nContact: " + contact + "\nService of Interest: " + svc + "\n\nMessage:\n" + msg;
          if (ok) ok.style.display = "block";
          f.reset();
        } else {
          alert("Sorry, the inquiry could not be sent. Please email us at sancity.studio@gmail.com or try again.");
        }
        if (btn) { btn.disabled = false; btn.textContent = orig; }
      }).catch(function () {
        alert("Network error. Please email us at sancity.studio@gmail.com or try again.");
        if (btn) { btn.disabled = false; btn.textContent = orig; }
      });
    });
  }

  function copyText(t) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(t);
    var ta = document.createElement("textarea");
    ta.value = t;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
    return Promise.resolve();
  }

  function initMmeCopy() {
    var link = document.getElementById("mmeLink");
    if (!link) return;
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var text = lastInquiry || "Hi! I'd like to inquire about your services.";
      var open = function () { window.open(link.href, "_blank"); };
      copyText(text).then(open, open);
    });
  }

  function boot() { initCalculator(); initContact(); initMmeCopy(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
