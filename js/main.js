const App = {};

document.addEventListener('DOMContentLoaded', () => {
    App.allSongs = songDatabase.map((song, index) => {
        const songSource = song.url ? song.url : `music/${song.filename}.mp3`;
        return {
            id: index,
            title: song.title,
            artist: song.artist,
            album: song.album,
            src: songSource,
            cover: `https://picsum.photos/seed/${song.album || song.title}/200`,
            artistBio: `Dengarkan lebih banyak dari ${song.artist} di album ${song.album}.`
        };
    });

    // --- State Management ---
    App.currentUser = '';
    App.userData = { likedSongs: [], playlists: {} };
    App.albums = {};
    App.currentSongIndex = -1;
    App.isPlaying = false;
    App.currentlyPlayingList = [...App.allSongs];

    // --- Elemen DOM ---
    App.dom = {
        audio: document.getElementById('audio-player'),
        songCardContainer: document.getElementById('song-card-container'),
        mainContent: document.getElementById('main-content'),
        playPauseBtn: document.getElementById('play-pause-btn'),
        playIcon: document.getElementById('play-icon'),
        prevBtn: document.getElementById('prev-btn'),
        nextBtn: document.getElementById('next-btn'),
        progressSlider: document.getElementById('progress-slider'),
        volumeSlider: document.getElementById('volume-slider'),
        currentTimeEl: document.getElementById('current-time'),
        durationEl: document.getElementById('duration'),
        footerCover: document.getElementById('footer-cover'),
        footerTitle: document.getElementById('footer-title'),
        footerArtist: document.getElementById('footer-artist'),
        likeBtn: document.getElementById('like-btn'),
        usernameDisplay: document.getElementById('username-display'),
        rightSidebar: document.getElementById('right-sidebar'),
        rightSidebarContent: document.getElementById('right-sidebar-content'),
        mainContentTitle: document.getElementById('main-content-title'),
        addToPlaylistBtn: document.getElementById('add-to-playlist-btn'),
        modalContainer: document.getElementById('modal-container'),
        modalPlaylistList: document.getElementById('modal-playlist-list'),
        modalCloseBtn: document.getElementById('modal-close-btn'),
        homeBtn: document.getElementById('home-btn'),
        searchBtn: document.getElementById('search-btn'),
        searchInput: document.getElementById('search-input'),
        userAccountBtn: document.getElementById('user-account-btn'),
    };

    // --- Fungsi Pengelolaan Data & Pengguna ---
    App.saveUserData = () => {
        localStorage.setItem(`spotypo_user_${App.currentUser}`, JSON.stringify(App.userData));
    };

    App.loadUserData = () => {
        const data = localStorage.getItem(`spotypo_user_${App.currentUser}`);
        if (data) {
            App.userData = JSON.parse(data);
            if (!App.userData.playlists) App.userData.playlists = {};
            if (!App.userData.likedSongs) App.userData.likedSongs = [];
            if (!App.userData.playlists['Lagu Disukai']) App.userData.playlists['Lagu Disukai'] = [];
        } else {
            App.userData = { likedSongs: [], playlists: { 'Lagu Disukai': [] } };
            App.saveUserData();
        }
    };

    App.groupAlbums = () => {
        const tempAlbums = {};
        App.allSongs.forEach(song => {
            if (!song.album) return;
            if (!tempAlbums[song.album]) {
                tempAlbums[song.album] = {
                    title: song.album,
                    artist: song.artist,
                    cover: song.cover,
                    songs: []
                };
            }
            tempAlbums[song.album].songs.push(song.id);
        });

        App.albums = {};
        for (const albumName in tempAlbums) {
            if (tempAlbums[albumName].songs.length > 3) {
                App.albums[albumName] = tempAlbums[albumName];
            }
        }
    };

    // --- Fungsi Render Tampilan ---
    const clearMainContent = () => {
        App.dom.mainContentTitle.classList.add('hidden');
        App.dom.songCardContainer.classList.add('hidden');
        App.dom.songCardContainer.innerHTML = '';
        const albumView = document.getElementById('album-view');
        if (albumView) albumView.remove();
        const playlistView = document.getElementById('playlist-view');
        if (playlistView) playlistView.remove();
    };

    App.renderSongCards = (songList) => {
        clearMainContent();
        App.dom.mainContentTitle.classList.remove('hidden');
        App.dom.songCardContainer.classList.remove('hidden');

        songList.forEach(song => {
            const card = document.createElement('div');
            card.className = "song-card";
            card.innerHTML = `
                <div class="relative">
                    <img src="${song.cover}" class="w-full h-auto rounded-md mb-4 aspect-square object-cover">
                    <div class="play-button-overlay">
                        <i class="fa-solid fa-play text-black text-2xl"></i>
                    </div>
                </div>
                <h3 class="font-bold text-white truncate">${song.title}</h3>
                <p class="text-sm text-zinc-400 mt-1">${song.artist}</p>
            `;
            card.addEventListener('click', () => {
                App.playFromList(song.id, songList);
            });
            App.dom.songCardContainer.appendChild(card);
        });
    };

    App.renderPlaylistView = (playlistName) => {
        clearMainContent();
        const songIds = App.userData.playlists[playlistName];
        if (!songIds) return;

        const playlistSongs = songIds.map(id => App.allSongs.find(s => s.id === id)).filter(Boolean);

        const playlistViewHTML = `
            <div id="playlist-view">
                <div class="flex items-end gap-6 mb-8">
                    <img src="https://picsum.photos/seed/${playlistName}/200" class="w-48 h-48 shadow-lg rounded-md">
                    <div>
                        <p class="text-sm font-bold">Playlist</p>
                        <h1 class="text-6xl font-bold text-white">${playlistName}</h1>
                        <p class="mt-4 text-white">${App.currentUser} • ${playlistSongs.length} lagu</p>
                    </div>
                </div>
                
                <div class="view-controls">
                    <button id="view-play-btn" class="play-btn-green"><i class="fa-solid fa-play"></i></button>
                    <button id="view-shuffle-btn" class="icon-btn-secondary"><i class="fa-solid fa-shuffle"></i></button>
                </div>

                <table class="w-full text-left">
                    <thead>
                        <tr class="text-zinc-400 border-b border-zinc-700">
                            <th class="p-2 font-normal text-center">#</th>
                            <th class="p-2 font-normal">Judul</th>
                            <th class="p-2 font-normal">Artis</th>
                            <th class="p-2 font-normal">Album</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${playlistSongs.map((song, index) => `
                            <tr class="song-row hover:bg-zinc-800 rounded-lg" data-song-id="${song.id}">
                                <td class="p-3 text-zinc-400 text-center">${index + 1}</td>
                                <td class="p-3 text-white">${song.title}</td>
                                <td class="p-3 text-zinc-400">${song.artist}</td>
                                <td class="p-3 text-zinc-400">${song.album}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        App.dom.mainContent.insertAdjacentHTML('beforeend', playlistViewHTML);

        document.getElementById('view-play-btn').addEventListener('click', () => {
            if (playlistSongs.length > 0) App.playFromList(playlistSongs[0].id, playlistSongs);
        });
        document.getElementById('view-shuffle-btn').addEventListener('click', () => {
            if (playlistSongs.length > 0) {
                const shuffled = [...playlistSongs].sort(() => Math.random() - 0.5);
                App.playFromList(shuffled[0].id, shuffled);
            }
        });
        document.querySelectorAll('.song-row').forEach(row => {
            row.addEventListener('click', (e) => {
                const songId = parseInt(e.currentTarget.dataset.songId, 10);
                App.playFromList(songId, playlistSongs);
            });
        });
    };

    App.renderAlbumView = (albumName) => {
        clearMainContent();
        const album = App.albums[albumName];
        if (!album) return;
        
        const albumSongs = album.songs.map(id => App.allSongs[id]);
        
        const albumViewHTML = `
            <div id="album-view">
                <div class="flex items-end gap-6 mb-8">
                    <img src="${album.cover}" class="w-48 h-48 shadow-lg rounded-md">
                    <div>
                        <p class="text-sm font-bold">Album</p>
                        <h1 class="text-6xl font-bold text-white">${album.title}</h1>
                        <p class="mt-4 text-white">${album.artist} • ${albumSongs.length} lagu</p>
                    </div>
                </div>

                <div class="view-controls">
                    <button id="view-play-btn" class="play-btn-green"><i class="fa-solid fa-play"></i></button>
                    <button id="view-shuffle-btn" class="icon-btn-secondary"><i class="fa-solid fa-shuffle"></i></button>
                </div>

                <table class="w-full text-left">
                     <thead>
                        <tr class="text-zinc-400 border-b border-zinc-700">
                            <th class="p-2 font-normal text-center">#</th>
                            <th class="p-2 font-normal">Judul</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${albumSongs.map((song, index) => `
                            <tr class="song-row hover:bg-zinc-800 rounded-lg" data-song-id="${song.id}">
                                <td class="p-3 text-zinc-400 text-center">${index + 1}</td>
                                <td class="p-3">
                                    <p class="text-white">${song.title}</p>
                                    <p class="text-sm">${song.artist}</p>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        App.dom.mainContent.insertAdjacentHTML('beforeend', albumViewHTML);

        document.getElementById('view-play-btn').addEventListener('click', () => {
            if (albumSongs.length > 0) App.playFromList(albumSongs[0].id, albumSongs);
        });
        document.getElementById('view-shuffle-btn').addEventListener('click', () => {
             if (albumSongs.length > 0) {
                const shuffled = [...albumSongs].sort(() => Math.random() - 0.5);
                App.playFromList(shuffled[0].id, shuffled);
            }
        });
        document.querySelectorAll('.song-row').forEach(row => {
            row.addEventListener('click', (e) => {
                const songId = parseInt(e.currentTarget.dataset.songId, 10);
                App.playFromList(songId, albumSongs);
            });
        });
    };

    App.playFromList = (songId, songList) => {
        App.currentlyPlayingList = [...songList];
        const songIndexInAllSongs = App.allSongs.findIndex(s => s.id === songId);
        App.loadSong(songIndexInAllSongs);
        App.playSong();
    };
    
    App.updateRightSidebar = (song) => {
        if (song) {
            App.dom.rightSidebar.classList.remove('hidden');
            App.dom.rightSidebar.classList.add('flex');
            App.dom.rightSidebarContent.innerHTML = `
                <img src="${song.cover}" class="w-full rounded-lg shadow-lg mb-4">
                <h3 class="text-2xl font-bold text-white">${song.artist}</h3>
                <p class="text-zinc-300 mt-2 text-sm">${song.artistBio}</p>
            `;
        }
    };

    App.updateLikeButton = () => {
        const likeIcon = App.dom.likeBtn.querySelector('i');
        if (App.currentSongIndex === -1) {
            likeIcon.className = 'far fa-heart text-xl';
            return;
        }
        const songId = App.allSongs[App.currentSongIndex].id;
        if (App.userData.likedSongs.includes(songId)) {
            likeIcon.className = 'fa-solid fa-heart text-xl text-green-500';
        } else {
            likeIcon.className = 'far fa-heart text-xl';
        }
    };

    // --- Fungsi Logika Player ---
    App.loadSong = (songIndex) => {
        App.currentSongIndex = songIndex;
        const song = App.allSongs[songIndex];
        if (!song) return;
        App.dom.audio.src = song.src;
        App.dom.footerTitle.textContent = song.title;
        App.dom.footerArtist.textContent = song.artist;
        App.dom.footerCover.src = song.cover;
        App.updateRightSidebar(song);
        App.updateLikeButton();
    };

    App.playSong = () => {
        if (App.currentSongIndex === -1) App.loadSong(0);
        App.dom.audio.play().then(() => {
            App.isPlaying = true;
            App.dom.playIcon.className = 'fa-solid fa-pause text-lg';
        }).catch(err => console.error("Playback Error:", err));
    };

    App.pauseSong = () => {
        App.isPlaying = false;
        App.dom.audio.pause();
        App.dom.playIcon.className = 'fa-solid fa-play text-lg';
    };

    App.playNext = () => {
        if (App.currentlyPlayingList.length === 0) return;
        const currentId = App.allSongs[App.currentSongIndex]?.id;
        const currentIndexInPlaylist = App.currentlyPlayingList.findIndex(s => s.id === currentId);
        const nextIndex = (currentIndexInPlaylist + 1) % App.currentlyPlayingList.length;
        const nextSongId = App.currentlyPlayingList[nextIndex].id;
        const nextIndexInAllSongs = App.allSongs.findIndex(s => s.id === nextSongId);
        App.loadSong(nextIndexInAllSongs);
        App.playSong();
    };

    App.playPrev = () => {
        if (App.currentlyPlayingList.length === 0) return;
        const currentId = App.allSongs[App.currentSongIndex]?.id;
        const currentIndexInPlaylist = App.currentlyPlayingList.findIndex(s => s.id === currentId);
        const prevIndex = (currentIndexInPlaylist - 1 + App.currentlyPlayingList.length) % App.currentlyPlayingList.length;
        const prevSongId = App.currentlyPlayingList[prevIndex].id;
        const prevIndexInAllSongs = App.allSongs.findIndex(s => s.id === prevSongId);
        App.loadSong(prevIndexInAllSongs);
        App.playSong();
    };

    App.toggleLike = () => {
        if (App.currentSongIndex === -1) return;
        const songId = App.allSongs[App.currentSongIndex].id;
        const likedIndex = App.userData.likedSongs.indexOf(songId);

        if (likedIndex > -1) {
            App.userData.likedSongs.splice(likedIndex, 1);
            App.userData.playlists['Lagu Disukai'] = App.userData.playlists['Lagu Disukai'].filter(id => id !== songId);
        } else {
            App.userData.likedSongs.push(songId);
            if (!App.userData.playlists['Lagu Disukai'].includes(songId)) {
                App.userData.playlists['Lagu Disukai'].push(songId);
            }
        }
        App.saveUserData();
        App.updateLikeButton();
        App.playlist.render();
    };

    function updateVolumeSliderStyle(value) {
        const percentage = (value - 0) / (100 - 0) * 100;
        App.dom.volumeSlider.style.backgroundSize = `${percentage}% 100%`;
    }

    // --- Inisialisasi Aplikasi ---
    function init() {
        App.currentUser = localStorage.getItem('spotypo_current_user') || prompt("Masukkan nama Anda:", "Pengguna1") || "Pengguna1";
        localStorage.setItem('spotypo_current_user', App.currentUser);
        App.dom.usernameDisplay.textContent = App.currentUser;

        App.loadUserData();
        App.groupAlbums();
        App.renderSongCards(App.allSongs);

        App.playlist.init();
        App.search.init();

        // Event listener untuk ubah nama pengguna
        App.dom.userAccountBtn.addEventListener('click', () => {
            const newUsername = prompt("Masukkan nama pengguna baru:", App.currentUser);
            if (newUsername && newUsername.trim() !== "") {
                App.currentUser = newUsername.trim();
                localStorage.setItem('spotypo_current_user', App.currentUser);
                App.dom.usernameDisplay.textContent = App.currentUser;
                App.loadUserData();
                App.playlist.render();
                App.dom.mainContentTitle.textContent = "Lagu untukmu";
                App.renderSongCards(App.allSongs);
            }
        });

        // --- Event Listeners ---
        App.dom.homeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            App.dom.mainContentTitle.textContent = "Lagu untukmu";
            App.renderSongCards(App.allSongs);
        });

        App.dom.searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            App.dom.searchInput.focus();
        });

        App.dom.playPauseBtn.addEventListener('click', () => (App.isPlaying ? App.pauseSong() : App.playSong()));
        App.dom.nextBtn.addEventListener('click', App.playNext);
        App.dom.prevBtn.addEventListener('click', App.playPrev);
        App.dom.likeBtn.addEventListener('click', App.toggleLike);
        App.dom.audio.addEventListener('ended', App.playNext);

        App.dom.audio.addEventListener('timeupdate', () => {
            if (isNaN(App.dom.audio.duration)) return;
            const progress = (App.dom.audio.currentTime / App.dom.audio.duration) * 100;
            App.dom.progressSlider.value = progress;
            App.dom.progressSlider.style.backgroundSize = `${progress}% 100%`;
            App.dom.currentTimeEl.textContent = new Date(App.dom.audio.currentTime * 1000).toISOString().substr(14, 5);
        });
        App.dom.audio.addEventListener('loadedmetadata', () => {
            if (isNaN(App.dom.audio.duration)) return;
            App.dom.durationEl.textContent = new Date(App.dom.audio.duration * 1000).toISOString().substr(14, 5);
        });
        App.dom.progressSlider.addEventListener('input', (e) => {
            if (isNaN(App.dom.audio.duration)) return;
            App.dom.audio.currentTime = (e.target.value / 100) * App.dom.audio.duration;
        });
        App.dom.volumeSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            App.dom.audio.volume = value / 100;
            updateVolumeSliderStyle(value);
        });

        updateVolumeSliderStyle(App.dom.volumeSlider.value);
    }

    init();
});