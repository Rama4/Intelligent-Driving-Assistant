import {useEffect, useRef} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {
  selectCollisionDetected,
  updateCollisionDetected,
  updatePeaks,
} from '../redux/slices/emergencySlice';
import ApiService from './apiService';
import voicemessageService from '../services/voicemessageService';
import {SentVmsFolderPath} from '../utils/constants';

import {updateDrivingScore} from '../redux/slices/trafficContextSlice';

export default function emergencyService() {
  const dispatch = useDispatch();
  const _collisionDetected = useSelector(selectCollisionDetected);
  const {generateSampleVoiceMessage} = voicemessageService();
  const {doCollisionCheck, upload} = ApiService();
  const intervalRef = useRef(null);

  // useEffect(() => {
  //   // initiate collision detection

  //   intervalRef.current = setInterval(() => {
  //     collisionCheck();
  //   }, CollisionCheckInterval);

  //   return () => {
  //     // stop collision detection
  //     clearInterval(intervalRef.current);
  //   };
  // }, []);

  const collisionCheck = async () => {
    try {
      console.log('collisionCheck()');
      const data = await doCollisionCheck();
      // update driving score
      const drivingscore = data?.drivingscore || 100;
      console.log('collisionCheck() drivingscore = ', drivingscore);
      dispatch(updateDrivingScore(drivingscore));
      // reset the peaks
      dispatch(updatePeaks(0));
      if (data?.collision === true) {
        // collision detected
        console.log('collisionCheck() collision  DETECTED!');
        dispatch(updateCollisionDetected(true));
      } else {
        console.log('collisionCheck() collision NOT DETECTED');
      }
    } catch (error) {
      console.error('collisionCheck() Error:', error);
      return null;
    }
  };

  useEffect(() => {
    const handleCollision = async () => {
      console.log('_collisionDetected=', _collisionDetected);
      if (_collisionDetected) {
        // handle emergency
        await handleEmergency();
      }
    };
    handleCollision();
  }, [_collisionDetected]);

  useEffect(() => {
    console.log('emergencyService init');
  }, []);

  const handleEmergency = async () => {
    // do emergency actions
    // get current context (location and emergency contact name)
    console.log(
      'handleEmergency() collision detected! sending voiecmail to emergency contact.',
    );
    //create a vm to send to the caller and save as mp3 file
    const ff = await generateSampleVoiceMessage(true);
    console.log('handleEmergency() ff=', ff);

    // send the mp3 to caller
    const fileName = ff;
    const fileDirectory = SentVmsFolderPath;

    const f = await upload(fileName, fileDirectory);
    console.log('handleEmergency():', jsonDisp(f));

    console.log('handleEmergency():', 'stopping collision detection..');
    clearInterval(intervalRef.current);
  };

  return {_collisionDetected, handleEmergency};
}
