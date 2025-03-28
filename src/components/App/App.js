import React, { useState, useEffect } from "react";
import "./App.css";

import Playlist from "../Playlist/Playlist";
import SearchBar from "../SearchBar/SearchBar";
import SearchResults from "../SearchResults/SearchResults";
import Spotify from "../../util/Spotify";
import PlaylistSelector from "../PlaylistSelector/PlaylistSelector";
import LoginScreen from '../LoginScreen/LoginScreen';

const App = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [playlistName, setPlaylistName] = useState("New Playlist");
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [showPlaylistSection, setShowPlaylistSection] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  // Метод для получения плейлистов
  const fetchPlaylists = () => {
    Spotify.getUserPlaylists()
      .then((fetchedPlaylists) => setPlaylists(fetchedPlaylists)) // Обновляем состояние
      .catch((error) => console.error("Error fetching playlists:", error));
  };

  // Проверка аутентификации
  const checkAuthentication = () => {
    const token = Spotify.getAccessToken();
    if (token) {
      setIsAuthenticated(true);
      fetchPlaylists();
    }
  };

  // Эффект для проверки токена при загрузке и после редиректа
  useEffect(() => {
    // Проверяем, есть ли токен в URL (после редиректа от Spotify)
    if (window.location.href.includes('access_token')) {
      checkAuthentication();
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      
      if (scrollPosition > windowHeight * 0.3) { // Показываем контент после 30% скролла
        setContentVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Добавление трека в плейлист
  const addTrack = (track) => {
    if (playlistTracks.find((savedTrack) => savedTrack.id === track.id)) {
      return;
    }
    setPlaylistTracks([...playlistTracks, track]);
  };

  // Удаление трека из плейлиста
  const removeTrack = (track) => {
    setPlaylistTracks(playlistTracks.filter((savedTrack) => savedTrack.id !== track.id));
  };

  // Обновление имени плейлиста
  const updatePlaylistName = (name) => {
    setPlaylistName(name);
  };

  // Создание нового плейлиста
  const createNewPlaylist = () => {
    setSelectedPlaylistId(null);
    setPlaylistName("New Playlist");
    setPlaylistTracks([]);
    setShowPlaylistSection(true);
  };

  // Выбор существующего плейлиста
  const handleSelectPlaylist = (playlistId) => {
    setSelectedPlaylistId(playlistId);
    setShowPlaylistSection(true);
    Spotify.getPlaylist(playlistId)
      .then((playlist) => {
        setPlaylistName(playlist.name);
        setPlaylistTracks(playlist.tracks);
      })
      .catch((error) => console.error("Failed to load playlist:", error));
  };

  const savePlaylist = () => {
    setIsLoading(true);
    const trackUris = playlistTracks.map((track) => track.uri);
  
    if (selectedPlaylistId && trackUris.length === 0) {
      // Удаление пустого плейлиста
      Spotify.deletePlaylist(selectedPlaylistId)
        .then(() => {
          setPlaylistName("New Playlist");
          setPlaylistTracks([]);
          setSelectedPlaylistId(null);
          return Spotify.getUserPlaylists(); // Обновляем список плейлистов после удаления
        })
        .then((updatedPlaylists) => {
          setPlaylists(updatedPlaylists); // Обновляем плейлисты
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error deleting playlist:", error);
          setIsLoading(false);
        });
    } else if (selectedPlaylistId) {
      // Обновление существующего плейлиста
      Spotify.updatePlaylist(selectedPlaylistId, playlistName, trackUris)
        .then(() => Spotify.getUserPlaylists()) // После обновления получаем актуальный список
        .then((updatedPlaylists) => {
          setPlaylists(updatedPlaylists); // Обновляем плейлисты
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error updating playlist:", error);
          setIsLoading(false);
        });
    } else {
      // Создание нового плейлиста
      Spotify.savePlaylist(playlistName, trackUris)
        .then(() => Spotify.getUserPlaylists()) // Получаем актуальный список после сохранения
        .then((updatedPlaylists) => {
          setPlaylists(updatedPlaylists); // Обновляем плейлисты
          setPlaylistName("New Playlist");
          setPlaylistTracks([]);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error saving new playlist:", error);
          setIsLoading(false);
        });
    }
  };
  


  const search = (term) => {
    if (!term.trim()) {
      return;
    }
    setIsLoading(true);
    Spotify.search(term)
      .then((results) => {
        setSearchResults(results);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Search failed:', error);
        setIsLoading(false);
      });
  };

  // Обработчик клика по кнопке логина
  const handleLogin = () => {
    Spotify.initiateLogin();
  };

  return (
    <div>
      {!isAuthenticated ? (
        <LoginScreen onLoginClick={handleLogin} />
      ) : (
        <div className="App">
          <div className="title-section">
            <div className="title-container">
              <h1>Ja<span className="highlight">mmm</span>ing</h1>
              <h1>Ja<span className="highlight">mmm</span>ing</h1>
              <h1>Ja<span className="highlight">mmm</span>ing</h1>
              <h1>Ja<span className="highlight">mmm</span>ing</h1>
              <h1>Ja<span className="highlight">mmm</span>ing</h1>
              <h1>Ja<span className="highlight">mmm</span>ing</h1>
              <h1>Ja<span className="highlight">mmm</span>ing</h1>
              <h1>Ja<span className="highlight">mmm</span>ing</h1>
              <h1>Ja<span className="highlight">mmm</span>ing</h1>
            </div>
          </div>
          <div className={`content-section ${contentVisible ? 'visible' : ''}`}>
            {isLoading && <div className="loading-overlay">Loading...</div>}
            <PlaylistSelector
              playlists={playlists} 
              onSelect={handleSelectPlaylist}
              selectedPlaylistId={selectedPlaylistId}
              onCreateNew={createNewPlaylist}
            />
            <div className={`playlist-section ${showPlaylistSection ? 'visible' : ''}`}>
              {showPlaylistSection && (
                <>
                  <SearchBar onSearch={search} />
                  <div className="AppPlaylist">
                    <SearchResults searchResults={searchResults} onAdd={addTrack} />
                    <div className="Playlists">
                      <div className="PlaylistNameForm">
                        <input
                          type="text"
                          value={playlistName}
                          onChange={(e) => updatePlaylistName(e.target.value)}
                          placeholder="Enter playlist name"
                        />
                      </div>
                      <Playlist
                        playlistName={playlistName}
                        playlistTracks={playlistTracks}
                        onRemove={removeTrack}
                        onSave={savePlaylist}
                        buttonText={playlistTracks.length === 0 ? "Delete" : "Save to Spotify"}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
