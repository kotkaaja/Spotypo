((app) => {
    app.search = {
        init: () => {
            const searchInput = document.getElementById('search-input');
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                if (query) {
                    const filtered = app.allSongs.filter(song => 
                        song.title.toLowerCase().includes(query) || 
                        song.artist.toLowerCase().includes(query)
                    );
                    document.getElementById('main-content-title').textContent = `Hasil untuk "${query}"`;
                    app.renderSongCards(filtered);
                } else {
                    // Kembali ke tampilan default jika search kosong
                    document.getElementById('main-content-title').textContent = "Lagu untukmu";
                    app.renderSongCards(app.allSongs);
                }
            });
        }
    };
})(App);