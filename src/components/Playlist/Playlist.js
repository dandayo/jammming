import React from "react";
import TrackList from "../TrackList/TrackList";
import "./Playlist.css";

const Playlist = ({ playlistName, playlistTracks, onRemove, onSave, buttonText }) => {
  return (
    <div className="Playlist">

      <h2>{playlistName}</h2>
      <TrackList tracks={playlistTracks} onRemove={onRemove} isRemoval={true} />
      <button className="Playlist-save" onClick={onSave}>
        {buttonText}
      </button>
    </div>
  );
};

export default Playlist;
