const clientId = 'ee12908a55c842ce93ae53fca4f370a7'; 
const redirectUri = window.location.href.includes("localhost") 
  ? 'http://localhost:3000/' 
  : 'https://dandayo.github.io/jammming/';
let accessToken;

const Spotify = {
  // Получение токена доступа
  getAccessToken() {
    if (accessToken) {
      return accessToken;
    }

    const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
    const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);
    if (accessTokenMatch && expiresInMatch) {
      accessToken = accessTokenMatch[1];
      const expiresIn = Number(expiresInMatch[1]);
      window.setTimeout(() => accessToken = '', expiresIn * 1000);
      window.history.pushState('Access Token', null, '/'); 
      return accessToken;
    } else {
      const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`;
      window.location = accessUrl;
    }
  },

   checkTokenValidity(token) {
    // Примерная логика проверки токена
    const url = 'https://api.spotify.com/v1/me';
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    return fetch(url, { headers })
      .then((response) => {
        if (response.ok) {
          return true; // Токен действителен
        } else {
          throw new Error('Invalid token');
        }
      })
      .catch((error) => {
        console.error('Token validation failed:', error);
        return false; // Токен недействителен
      });
  },

  // Получение плейлистов пользователя
  getUserPlaylists() {
    const accessToken = this.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };
  
    return fetch("https://api.spotify.com/v1/me/playlists", { headers })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch playlists.");
        }
        return response.json();
      })
      .then((data) => {
        return data.items.map((playlist) => ({
          id: playlist.id,
          name: playlist.name,
        }));
      });
  },

  // Получение информации о плейлисте по его ID
  getPlaylist(playlistId) {
    const accessToken = this.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };

    return fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
      headers,
    })
      .then((response) => response.json())
      .then((data) => ({
        name: data.name,
        tracks: data.tracks.items.map((item) => ({
          id: item.track.id,
          name: item.track.name,
          artist: item.track.artists[0].name,
          album: item.track.album.name,
          uri: item.track.uri,
        })),
      }));
  },

  // Обновление существующего плейлиста
  updatePlaylist(playlistId, name, uris) {
    const accessToken = this.getAccessToken();
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    // Обновление имени плейлиста
    return fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ name }),
    })
      .then(() =>
        // Обновление треков в плейлисте
        fetch(
          `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
          {
            method: "PUT",
            headers,
            body: JSON.stringify({ uris }),
          }
        )
      )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update playlist tracks.");
        }
      });
  },

  // Поиск треков по запросу
  search(term) {
    const accessToken = this.getAccessToken();
    return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}&limit=10`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }).then(response => {
      return response.json();
    }).then(jsonResponse => {
      if (!jsonResponse.tracks) {
        return [];
      }
      return jsonResponse.tracks.items.map(track => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        uri: track.uri
      }));
    });
  },

  // Сохранение плейлиста (новый или обновление)
  savePlaylist(name, trackUris, playlistId = null) {
    const accessToken = this.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };
  
    if (playlistId) {
      return fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
        method: "PUT",
        headers: headers,
        body: JSON.stringify({ name: name }),
      }).then(() => {
        return fetch(
          `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
          {
            method: "PUT",
            headers: headers,
            body: JSON.stringify({ uris: trackUris }),
          }
        );
      });
    } else {
      return fetch("https://api.spotify.com/v1/me/playlists", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ name: name }),
      })
        .then((response) => response.json())
        .then((jsonResponse) => {
          const playlistId = jsonResponse.id;
          return fetch(
            `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
            {
              method: "POST",
              headers: headers,
              body: JSON.stringify({ uris: trackUris }),
            }
          );
        });
    }
  },

  // Удаление плейлиста
  deletePlaylist(playlistId) {
    const accessToken = this.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };
  
    return fetch(`https://api.spotify.com/v1/playlists/${playlistId}/followers`, {
      method: "DELETE",
      headers,
    }).then((response) => {
      if (!response.ok) {
        return response.json().then((data) => {
          throw new Error(data.error.message || "Failed to delete playlist.");
        });
      }
    });
  },

  // Удаление пустого плейлиста (если не содержит треков)
  deleteEmptyPlaylist(playlistId) {
    return this.getPlaylist(playlistId).then(playlist => {
      if (playlist.tracks.length === 0) {
        return this.deletePlaylist(playlistId);
      }
    });
  }
};

export default Spotify;
