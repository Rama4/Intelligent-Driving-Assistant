import React, {useEffect, useState, useCallback} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {
  accelerometer,
  setUpdateIntervalForType,
  SensorTypes,
} from 'react-native-sensors';
import {pairwise, startWith, skip} from 'rxjs/operators';
import Button from './shared/Button';

import {useSelector, useDispatch} from 'react-redux';
import {selectRespRate, setRespRate} from '../redux/slices/appSlice';
import {
  incrementPeaks,
  updatePeaks,
  selectPeaks,
} from '../redux/slices/emergencySlice';

const MeasuringIntervalSeconds = 45;
const AccelerometerUpdateIntervalMS = 300;
const RespiratoryMeasurementThreshold = 0.08;
const RespRateMultiplicationFactor = 60;
const NumReadingsSkip = 1000 / AccelerometerUpdateIntervalMS;

setUpdateIntervalForType(
  SensorTypes.accelerometer,
  AccelerometerUpdateIntervalMS,
);

const MaxVolume = 10;
const MinVolume = 0;
const FuelCapacityMiles = 100;

export default function FuelInformation() {
  const dispatch = useDispatch();
  const _respRate = useSelector(selectRespRate);
  const _peaks = useSelector(selectPeaks);

  [miles, setMiles] = useState(FuelCapacityMiles);
  [drivingScore, setDrivingScore] = useState(5);
  let readingValues = [];

  useEffect(() => {
    console.log('miles=', miles);
  }, [miles]);

  const onVolumeChange = (increase = true) => {
    console.log('onVolumeChange()');
    setVolume(v => {
      if (increase && v < MaxVolume) return v + 1;
      else if (!increase && v > MinVolume) return v - 1;
      else return v;
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headline}>Miles remaining: {miles}</Text>
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
