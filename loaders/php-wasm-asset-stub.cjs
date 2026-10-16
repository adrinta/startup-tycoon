/**
 * Loader stub untuk aset non-JS dari @php-wasm/web (.dat/.so/.la).
 *
 * Paket PHP-WASM mengimpor aset-aset ini sebagai modul (pola Vite `?url`).
 * Turbopack tidak mengenal tipe file tersebut. Karena gim ini TIDAK memakai
 * ekstensi intl/eksternal PHP, jalur impor itu tidak pernah dieksekusi saat
 * runtime — cukup diganti modul JS kecil agar build tetap hijau.
 */
module.exports = function phpWasmAssetStubLoader() {
  const url = "/php-wasm-asset-stub";
  return "export default " + JSON.stringify(url) + ";";
};
