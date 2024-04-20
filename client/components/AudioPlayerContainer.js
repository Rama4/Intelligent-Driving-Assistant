import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';

import HeadlessMusicPlayer from './HeadlessMusicPlayer';
import ApiService from '../services/apiService';

export default function AudioPlayerContainer({fetchPlaylist, onDoneFetching}) {
  [playerState, setPlayerState] = useState(0);
  [videoIDList, setVideoIDList] = useState([]);
  [totalSongs, setTotalSongs] = useState(0);
  [currentSongIndex, setCurrentSongIndex] = useState(0);
  const {getTopVideoIdsFromArtist, getArtistBasedOnLocation} = ApiService();
  const currentSongName = videoIDList?.length
    ? videoIDList[currentSongIndex]
    : '';

  useEffect(() => {
    console.log('audioPlayer playerState=', playerState);
    if (playerState === 0) {
      return;
    }
    if (playerState === 1) {
      console.log('still fetching');
    }
  }, [playerState]);

  useEffect(() => {
    console.log('fetchPlaylist=', fetchPlaylist);
    const handleFetchPlaylist = async () => {
      if (fetchPlaylist) {
        await initSongsList();
      }
    };
    handleFetchPlaylist();
  }, [fetchPlaylist]);

  useEffect(() => {
    console.log('videoIDList=', videoIDList);
  }, [videoIDList]);

  const initSongsList = async () => {
    try {
      console.log('initSongsList()');

      const artists = await getArtistBasedOnLocation();
      console.log('initSongsList() artists=', artists);

      const videoIdList = [];
      for (const artistName of artists) {
        const newVideoIdList = await getTopVideoIdsFromArtist(artistName);
        setVideoIDList(vl => {
          const _v = [...vl];
          const nv = _v.concat(newVideoIdList);
          return nv;
        });
      }

      if (videoIdList.length) {
        setTotalSongs(videoIdList.length);
        setCurrentSongIndex(0);
        onDoneFetching(true);
      } else {
        console.log('initSongsList() video list is empty!');
        onDoneFetching(false);
      }
    } catch (error) {
      console.error('initSongsList() Error:', error);
      onDoneFetching(false);
      return null;
    }
  };

  const onMusicEnded = () => {
    console.log('onMusicEnded()');
    setCurrentSongIndex(i => {
      if (i <= totalSongs - 1) {
        return i + 1;
      } else {
        return i;
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text>{currentSongName}</Text>
      <HeadlessMusicPlayer
        videoId={currentSongName}
        onVideoEnded={onMusicEnded}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  headline: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
});
