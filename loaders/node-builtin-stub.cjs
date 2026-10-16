/**
 * Stub modul builtin Node untuk bundle browser (@php-wasm/universal memuat
 * worker_threads pada jalur sinkronisasi Node yang tidak dipakai di web).
 */
function receiveMessageOnPort() {
  return undefined;
}

module.exports = { receiveMessageOnPort };
