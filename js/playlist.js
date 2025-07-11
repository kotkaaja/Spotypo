((app) => {
    app.playlist = {
        init: () => {
            // Referensi ke elemen modal baru
            const createModal = document.getElementById('create-playlist-modal');
            const newPlaylistInput = document.getElementById('new-playlist-name');
            const saveBtn = document.getElementById('create-playlist-save-btn');
            const cancelBtn = document.getElementById('create-playlist-cancel-btn');

            app.playlist.render();
            
            // Listener untuk tombol '+' utama di koleksi
            document.getElementById('create-playlist-btn').addEventListener('click', () => {
                newPlaylistInput.value = ''; // Kosongkan input setiap kali modal dibuka
                createModal.classList.remove('hidden');
                newPlaylistInput.focus();
            });

            // Listener untuk tombol Batal di modal
            cancelBtn.addEventListener('click', () => {
                createModal.classList.add('hidden');
            });

            // Listener untuk tombol Simpan di modal
            saveBtn.addEventListener('click', () => {
                const newName = newPlaylistInput.value.trim();
                if (newName && !app.userData.playlists[newName]) {
                    app.userData.playlists[newName] = [];
                    app.saveUserData();
                    app.playlist.render();
                    createModal.classList.add('hidden');
                } else if (!newName) {
                    alert("Nama playlist tidak boleh kosong!");
                } else {
                    alert("Nama playlist sudah ada!");
                }
            });

            // Listener untuk klik item di koleksi (playlist atau album)
            document.getElementById('user-playlists-container').addEventListener('click', (e) => {
                const item = e.target.closest('.library-item');
                if (!item) return;

                const name = item.dataset.name;
                const type = item.dataset.type;

                const deleteButton = e.target.closest('.delete-playlist-btn');
                
                if (deleteButton) {
                    e.stopPropagation(); // Mencegah klik menyebar ke item utama
                    app.playlist.delete(name);
                } else if (type === 'playlist') {
                    app.playlist.view(name);
                } else if (type === 'album') {
                    app.renderAlbumView(name);
                }
            });
            
            // Listener untuk tombol 'Tambah ke Playlist' di footer
            app.dom.addToPlaylistBtn.addEventListener('click', app.playlist.openAddToPlaylistModal);
            // Listener untuk tombol tutup modal lama (untuk 'Tambah ke Playlist')
            app.dom.modalCloseBtn.addEventListener('click', () => app.dom.modalContainer.classList.add('hidden'));
        },

        render: () => {
            const container = document.getElementById('user-playlists-container');
            container.innerHTML = ''; 
            
            const playlistOrder = ['Lagu Disukai', ...Object.keys(app.userData.playlists).filter(name => name !== 'Lagu Disukai')];
            playlistOrder.forEach(name => {
                const li = document.createElement('div');
                li.className = 'library-item p-2 rounded-md hover:bg-zinc-800 flex items-center gap-4 cursor-pointer';
                li.dataset.name = name;
                li.dataset.type = 'playlist';

                li.innerHTML = `
                    <img src="https://picsum.photos/seed/${name}/48" class="w-12 h-12 rounded-md">
                    <div>
                        <p class="font-bold text-white truncate">${name}</p>
                        <p class="text-sm text-zinc-400">Playlist • ${app.currentUser}</p>
                    </div>
                `;
                
                if (name !== 'Lagu Disukai') {
                    const deleteBtnWrapper = document.createElement('div');
                    deleteBtnWrapper.className = 'ml-auto pl-2';
                    deleteBtnWrapper.innerHTML = `<button class="delete-playlist-btn text-zinc-400 hover:text-white"><i class="fa-solid fa-trash"></i></button>`;
                    li.appendChild(deleteBtnWrapper);
                }
                container.appendChild(li);
            });
            
            Object.values(app.albums).forEach(album => {
                const li = document.createElement('div');
                li.className = 'library-item p-2 rounded-md hover:bg-zinc-800 flex items-center gap-4 cursor-pointer';
                li.dataset.name = album.title;
                li.dataset.type = 'album';

                li.innerHTML = `
                    <img src="${album.cover}" class="w-12 h-12 rounded-md">
                    <div>
                        <p class="font-bold text-white truncate">${album.title}</p>
                        <p class="text-sm text-zinc-400">Album • ${album.artist}</p>
                    </div>
                `;
                container.appendChild(li);
            });
        },
        
        view: (playlistName) => {
            app.renderPlaylistView(playlistName);
        },

        delete: (playlistName) => {
            if (confirm(`Yakin ingin menghapus playlist "${playlistName}"?`)) {
                delete app.userData.playlists[playlistName];
                app.saveUserData();
                app.playlist.render();
                app.dom.mainContentTitle.textContent = "Lagu untukmu";
                app.renderSongCards(app.allSongs);
            }
        },
        
        openAddToPlaylistModal: () => {
            if (app.currentSongIndex === -1) {
                alert("Pilih lagu terlebih dahulu!");
                return;
            }
            const modalList = app.dom.modalPlaylistList;
            modalList.innerHTML = '';
            
            Object.keys(app.userData.playlists).forEach(playlistName => {
                const li = document.createElement('li');
                const button = document.createElement('button');
                button.className = 'w-full text-left p-2 hover:bg-zinc-700 rounded-md';
                button.textContent = playlistName;
                button.onclick = () => app.playlist.addSong(playlistName);
                li.appendChild(button);
                modalList.appendChild(li);
            });
            
            app.dom.modalContainer.classList.remove('hidden');
        },
        
        addSong: (playlistName) => {
            const songId = app.allSongs[app.currentSongIndex].id;
            if (!app.userData.playlists[playlistName].includes(songId)) {
                app.userData.playlists[playlistName].push(songId);
                app.saveUserData();
                alert(`Lagu "${app.allSongs[app.currentSongIndex].title}" telah ditambahkan ke ${playlistName}.`);
            } else {
                alert("Lagu sudah ada di dalam playlist tersebut.");
            }
            app.dom.modalContainer.classList.add('hidden');
        }
    };
})(App);