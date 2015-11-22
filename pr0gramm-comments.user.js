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

injectScript("http://localhost:8000/md5.js")
injectScript("http://localhost:8000/script.js");
