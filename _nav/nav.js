/*
 * Навігатор репо: будує бокове меню з window.NAV_TREE (_nav/tree.js).
 *
 * Підключення на кожній HTML-сторінці (шляхи — відносно сторінки):
 *   <html lang="uk" data-root="../">          ← де корінь репо від цієї сторінки
 *   <link rel="stylesheet" href="../_nav/nav.css">
 *   <script src="../_nav/tree.js"></script>
 *   <script src="../_nav/nav.js" defer></script>
 *
 * Працює і з диска (file://), і на GitHub Pages.
 */
(function () {
  "use strict";

  var root = document.documentElement.getAttribute("data-root") || "./";
  if (root && root.slice(-1) !== "/") root += "/";

  function normalize(href) {
    var u = new URL(href, location.href);
    var p = u.pathname;
    if (p.slice(-1) === "/") p += "index.html";
    return u.protocol + "//" + u.host + decodeURI(p);
  }

  var here = normalize(location.href);

  function pageItem(page) {
    var li = document.createElement("li");
    var a = document.createElement("a");
    a.href = root + page.path;
    a.textContent = page.title;
    if (normalize(a.href) === here) {
      a.className = "nav-current";
      a.setAttribute("aria-current", "page");
    }
    li.appendChild(a);
    if (page.children && page.children.length) {
      li.appendChild(list(page.children, "nav-children"));
    }
    return li;
  }

  function list(pages, cls) {
    var ul = document.createElement("ul");
    ul.className = cls;
    pages.forEach(function (p) { ul.appendChild(pageItem(p)); });
    return ul;
  }

  function build() {
    var tree = window.NAV_TREE || [];
    var aside = document.createElement("aside");
    aside.className = "repo-nav";
    aside.setAttribute("aria-label", "Навігатор репо");

    var head = document.createElement("a");
    head.className = "nav-head";
    head.href = root + "index.html";
    head.textContent = "Monolead · репо";
    aside.appendChild(head);

    var top = document.createElement("ul");
    top.className = "nav-tree";
    tree.forEach(function (node) {
      if (node.branch) {
        var li = document.createElement("li");
        li.className = "nav-branch";
        var label = document.createElement("span");
        label.className = "nav-branch-label";
        label.textContent = node.branch;
        li.appendChild(label);
        li.appendChild(list(node.pages || [], "nav-pages"));
        top.appendChild(li);
      } else {
        top.appendChild(pageItem(node));
      }
    });
    aside.appendChild(top);

    document.body.insertBefore(aside, document.body.firstChild);
    document.body.classList.add("has-repo-nav");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
