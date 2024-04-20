import {VolumeManager} from 'react-native-volume-manager';
import {useState, useEffect} from 'react';
const MaxVolume = 1;
const MinVolume = 0;
const VolumeChangeAmount = 0.1;

const presetNormal = 0.8;
const presetSlow = 0.5;
const presetJam = 0.3;

function average(array) {
  return array.reduce((x, y) => x + y) / array.length;
}

export const useVolumeControl = () => {
  const [volume, setVolume] = useState(
    average([presetJam, presetNormal, presetSlow]),
  );

  useEffect(() => {
    fetchVolume(v => setVolume(v));
  }, []);

  useEffect(() => {
    console.log('useVolumeControl: volume=', volume);
  }, [volume]);

  const fetchVolume = async () => {
    const {volume} = await VolumeManager.getVolume();
    console.log('volume =', volume);
    return volume ?? MinVolume;
  };
  const increaseVolume = async (amount = VolumeChangeAmount) => {
    const {volume} = await VolumeManager.getVolume();
    const newVolume = Math.min(volume + amount, MaxVolume);
    console.log('increaseVolume newVolume=', newVolume);
    setVolume(newVolume);
    await VolumeManager.setVolume(newVolume);
  };
  const decreaseVolume = async (amount = VolumeChangeAmount) => {
    const {volume} = await VolumeManager.getVolume();
    const newVolume = Math.max(volume - amount, MinVolume);
    console.log('decreaseVolume newVolume=', newVolume);
    setVolume(newVolume);
    await VolumeManager.setVolume(newVolume);
  };

  // Listen to volume changes
  const volumeListener = VolumeManager.addVolumeListener(data => {
    console.log('Volume changed:', data.volume);
    setVolume(data?.volume || MinVolume);
  });

  const cleanup = () => {
    // Remove the volume listener when no longer needed
    VolumeManager?.removeVolumeListener(volumeListener);
  };

  return {
    volume,
    setVolume,
    increaseVolume,
    decreaseVolume,
    volumeListener,
    cleanup,
  };
};
