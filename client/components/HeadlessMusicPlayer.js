import React, {useState, useCallback} from 'react';
import {Button} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';

export default function HeadlessMusicPlayer({videoId, onVideoEnded}) {
  const [playing, setPlaying] = useState(false);

  const onStateChange = useCallback(state => {
    if (state === 'ended') {
      setPlaying(false);
      onVideoEnded();
    }
  }, []);

  const togglePlaying = useCallback(() => {
    setPlaying(prev => !prev);
  }, []);

  return (
    <>
      <YoutubePlayer
        height={30}
        play={playing}
        videoId={videoId}
        onChangeState={onStateChange}
      />
      <Button title={playing ? 'pause' : 'play'} onPress={togglePlaying} />
    </>
  );
}
