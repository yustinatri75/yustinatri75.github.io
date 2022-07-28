window.iDB = null;

function initIDB() {
    // https://dexie.org/docs/API-Reference#quick-reference
    const db = new Dexie('pwa-database');
    db.version(2).stores({
        karyawan: '++id, &kar_id, nama, alamat, no_hp, tgl_lahir, image',
        karyawan_add : '++id, nama, alamat'
    });
    iDB = db;
}

document.addEventListener('DOMContentLoaded', async function () {
    initIDB();
});