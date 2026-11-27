// Shared server-call layer (replaces google.script.run and the 3 duplicated copies).
const WEB_APP_URL = window.PMICC_CONFIG.WEB_APP_URL;

// Random per-install ID so one volunteer's typos never lock out everyone else.
const PMICC_DEVICE_ID = (function () {
  try {
    let id = localStorage.getItem('pmicc_device_id');
    if (!id) { id = (self.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2); localStorage.setItem('pmicc_device_id', id); }
    return id;
  } catch (e) { return ''; }
})();

async function callServer(fn, args) {
  let response;
  try {
    response = await fetch(WEB_APP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },   // keeps it a CORS "simple request"
      body: JSON.stringify({ fn: fn, args: args || [], device: PMICC_DEVICE_ID })
    });
  } catch (networkErr) {
    throw new Error('Network error — check your connection and try again.');
  }
  if (!response.ok) throw new Error('Server returned HTTP ' + response.status);
  const data = await response.json();
  if (data && data.success === false && data.message && data.message.indexOf('Server error:') === 0) {
    throw new Error(data.message);
  }
  return data;
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
}
