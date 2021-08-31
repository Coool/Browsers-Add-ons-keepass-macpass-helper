'use strict';

try {
  document.body.removeChild(window.iframe);
}
catch (e) {}
var iframe;

function isEditable(el) {
  const node = el && el.nodeName.toLowerCase();
  if (el && el.nodeType === 1 && (node === 'textarea' ||
    (node === 'input' && /^(?:text|email|number|search|tel|url|password)$/i.test(el.type)))) {
    return true;
  }
  return el ? el.isContentEditable : false;
}

// will be used to focus the element after text insertion
var aElement = document.activeElement;
aElement = isEditable(aElement) ? aElement : null;
// try to find used usernames
if (aElement) {
  const forms = [...document.querySelectorAll('input[type=password]')]
    .map(p => p.form)
    .filter(f => f)
    .filter((f, i, l) => l.indexOf(f) === i);

  const guesses = forms.map(f => {
    return [...f.querySelectorAll('input:not([type=password])')].filter(i => (i.type === 'text' || i.type === 'email'));
  }).reduce((p, c) => p.concat(c), [])
    .map(e => e && e.value ? e.value : null)
    .filter(n => n);

  if (guesses.length !== 0) {
    chrome.runtime.sendMessage({
      cmd: 'guesses',
      guesses
    });
  }
}

if (window === window.top) {
  let guesses = [];
  const observe = (request, sender, response) => {
    if (request.guesses) {
      guesses = guesses.concat(request.guesses);
    }
    else if (request.cmd === 'fetch-guesses') {
      response(guesses);
      chrome.runtime.onMessage.removeListener(observe);
    }
  };
  chrome.runtime.onMessage.addListener(observe);

  chrome.storage.local.get({
    embedded: false
  }, prefs => {
    if (prefs.embedded || window.inject === true) {
      // window.inject allows forced injection
      window.inject = false;
      iframe = document.createElement('iframe');
      iframe.setAttribute('style', `
        border: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        width: 550px;
        height: 400px;
        max-width: 80%;
        margin-left: auto;
        margin-right: auto;
        background-color: #414141;
        z-index: 2147483647;
      `);
      document.body.appendChild(iframe);
      iframe.src = chrome.runtime.getURL('data/cmd/index.html');
    }
  });
}

''; // https://github.com/belaviyo/keepass-macpass-helper/issues/15#issuecomment-336926598
