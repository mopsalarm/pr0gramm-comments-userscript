// ==UserScript==
// @match http://pr0gramm.com/*
// @match https://pr0gramm.com/*
// ==/UserScript==

function injectScript(url) {
  var scriptTag = document.createElement("script");
  scriptTag.src = url;

  var body = document.getElementsByTagName("body");
  body[0].appendChild(scriptTag);
}

injectScript("//mopsalarm.github.io/pr0gramm-comments-userscript/md5.js")
injectScript("//mopsalarm.github.io/pr0gramm-comments-userscript/script.js");
