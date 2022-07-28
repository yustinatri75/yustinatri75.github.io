importScripts('https://yustinatri75.github.io/js/dexie.js')

let cacheName = 'pwa-cache';
const db = new Dexie('pwa-database');
db.version(2).stores({
    karyawan: '++id, &kar_id, nama, alamat, no_hp, tgl_lahir, image',
    karyawan_add: '++id, nama, alamat'
});

const isValidUrl = urlString => {
    let url;
    try {
        url = new URL(urlString);
    } catch (e) {
        return false;
    }
    if (url.host === 'https://yustinatri75.github.io/') {
        return url.protocol === 'http:' || url.protocol === 'https:';
    }
    return false
}

self.addEventListener('install', (event) => {
    //caching
    event.waitUntil((async () => {
        const cache = await caches.open(cacheName)
        console.log('mulai caching saat install');
        await cache.addAll([
            '/index.html',
            // '/karyawan.html',
            // '/pushnotif.html',
            '/css/materialize.min.css',
            '/js/materialize.min.js',
            '/js/jquery-3.6.0.min.js',
            '/js/main.js'
        ])
        await self.skipWaiting();
    })());
});

self.addEventListener('fetch', (event) => {
    event.waitUntil((async () => {
        if (event.request.url.endsWith('.png') ||
            event.request.url.endsWith('.css') ||
            event.request.url.endsWith('.js') ||
            event.request.url.endsWith('.html')) {
            caches.open(cacheName).then((cache) => {
                // check apakah URL valid atau chrome ekstensi
                console.log(event.request.url);
                if (isValidUrl(event.request.url)) {
                    cache.add(event.request)
                }
            })
        }

        event.respondWith(
            caches.match(event.request)
                  .then((resp) => {
                      return resp || fetch(event.request);
                  })
        )
    })());
});

self.addEventListener('sync', async (event) => {
    if (event.tag === 'syncAddKaryawan') {
        console.log('ambil data dari IDB');
        const dataKaryawan = await fetchDataFromIDB();
        dataKaryawan.map(async e => {
            console.log('mengirim ke server ', e.nama);
            await sendDataToServer({nama: e.nama, alamat: e.alamat})

            console.log('menghapus data dari IDB yang berhasil dikirim ke server');
            await db.karyawan_add.delete(e.id);
        })
    }
});

async function fetchDataFromIDB() {
    return await db.karyawan_add.toArray();
}

async function sendDataToServer(payload) {
    try {
        const response = await fetch('https://pwa-service.hydrogendioxide.net/api/karyawan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        return await response.json();
    } catch (err) {
        console.log(err)
        throw err
    }
}
self.addEventListener('push', function (event) {
	const eventData = event.data.json().data

	const options = {
		body: 'Here is a notification body!',
		icon: 'https://miro.medium.com/max/432/1*gYmM9tPZOxnBr_sjUAgVBw.png',
		data: {url: 'https://google.com'} // allows us to identify notification
	};

	event.waitUntil(self.registration.showNotification(eventData.title, options));
});

self.addEventListener('notificationclick', function (event) {
	console.log('tessssssssssssssssssssss');
	console.log(event.notification)
	clients.openWindow(event.notification.data.url);
});