import React, {useEffect, useState, useCallback} from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import Slider from 'react-native-slider';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default function SoundPlayer({sound}) {
  const [seekTime, setSeekTime] = useState(0);
  const [playState, setPlayState] = useState(0);
  const [duration, setduration] = useState(0);
  const [sliderEditing, setSliderEditing] = useState(false);
  var timer = null;

  // debugging section Start
  // useEffect(() => {
  //   console.log('SoundPlayer: seekTime=', seekTime);
  // }, [seekTime]);
  // useEffect(() => {
  //   console.log('SoundPlayer: playState=', playState);
  // }, [playState]);
  // debugging section End

  useEffect(() => {
    console.log('SoundPlayer: sound=', sound);
    if (sound?.isLoaded()) {
      setduration(sound.getDuration() || 0);
      console.log('SoundPlayer: duration in seconds: ' + sound.getDuration());
    }
  }, [sound]);

  useEffect(() => {
    console.log('SoundPlayer: playState=', playState);
    () => {
      if (timer) {
        clearInterval(timer);
      }
      if (this.sound) {
        this.sound.release();
        this.sound = null;
      }
    };
  }, [sound, timer]);

  const onPlayPress = useCallback(() => {
    const newPlayState = playState !== 1 ? 1 : 2;
    setPlayState(newPlayState);
    if (newPlayState == 1) {
      sound?.play(success => {
        if (success) {
          console.log('SoundPlayer: playing');
        } else {
          console.log(
            'SoundPlayer: playback failed due to audio decoding errors',
          );
        }
      });
      timer = setInterval(() => {
        if (newPlayState === 1 && !sliderEditing) {
          sound?.getCurrentTime((seconds, isPlaying) => {
            setSeekTime(seconds);
          });
        }
      }, 200);
    }
    if (newPlayState == 2) {
      sound?.pause(success => {
        if (success) {
          console.log('SoundPlayer: paused');
        } else {
          console.log(
            'SoundPlayer: playback failed due to audio decoding errors',
          );
        }
      });
    }
  }, [playState, sound, sliderEditing]);

  const onStopPress = useCallback(() => {
    sound?.stop();
    setPlayState(0);
    sound?.setCurrentTime(0);
    setSeekTime(0);
    if (timer) {
      clearInterval(timer);
    }
  }, [sound, timer]);

  const onValueChange = value => {
    if (sound) {
      setSeekTime(value);
      sound?.setCurrentTime(value);
    }
  };
  const onSlidingStart = () => {
    setSliderEditing(true);
  };
  const onSlidingComplete = () => {
    setSliderEditing(false);
  };

  const getAudioTimeString = seconds => {
    const h = parseInt(seconds / (60 * 60));
    const m = parseInt((seconds % (60 * 60)) / 60);
    const s = parseInt(seconds % 60);

    return (
      (h == 0 ? '' : h < 10 ? `0${h}:` : `${h}:`) +
      (m < 10 ? '0' + m : m) +
      ':' +
      (s < 10 ? '0' + s : s)
    );
  };
  const currentTimeString = getAudioTimeString(seekTime);
  const durationString = getAudioTimeString(duration);

  return (
    <View style={styles.rootStyle}>
      <View style={styles.container}>
        <View style={styles.sliderContainer}>
          <Slider
            value={seekTime}
            maximumValue={duration}
            onValueChange={onValueChange}
            onSlidingStart={onSlidingStart}
            onSlidingComplete={onSlidingComplete}
          />
        </View>
        <Pressable onPress={onPlayPress} style={styles.button}>
          {playState !== 1 && (
            <MaterialIcons name="play-circle" size={30} color="black" />
          )}
          {playState === 1 && (
            <MaterialIcons name="pause-circle" size={30} color="black" />
          )}
        </Pressable>
        <Pressable onPress={onStopPress} style={styles.button}>
          <MaterialIcons name="stop-circle" size={30} color="black" />
        </Pressable>
      </View>
      <View style={styles.container}>
        <Text>
          {currentTimeString}/{durationString}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rootStyle: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
    paddingHorizontal: 10,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
  },
  sliderContainer: {
    flex: 1,
    paddingRight: 10,
  },
  button: {
    paddingRight: 10,
  },
});
