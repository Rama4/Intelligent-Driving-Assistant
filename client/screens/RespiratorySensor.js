import React, {useEffect, useState, useCallback} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {
  accelerometer,
  setUpdateIntervalForType,
  SensorTypes,
} from 'react-native-sensors';
import {pairwise, startWith, skip} from 'rxjs/operators';
import Button from './Button';

const MeasuringIntervalSeconds = 45;
const AccelerometerUpdateIntervalMS = 300;
const RespiratoryMeasurementThreshold = 0.85;
const RespRateMultiplicationFactor = 60;
const NumReadingsSkip = 1000 / AccelerometerUpdateIntervalMS;

setUpdateIntervalForType(
  SensorTypes.accelerometer,
  AccelerometerUpdateIntervalMS,
);

export default function RespiratorySensor() {
  [x, setX] = useState(0);
  [y, setY] = useState(0);
  [z, setZ] = useState(0);
  [k, setK] = useState(0);
  [enableAccelerometer, setEnableAccelerometer] = useState(false);
  let readingValues = [];

  const calculateRespiratoryRate2 = useCallback(() => {
    console.log('calculateRespiratoryRate2');
    let respRate = 0;
    console.log('k=', k);
    respRate = k * RespRateMultiplicationFactor;
    respRate = Math.floor(respRate / MeasuringIntervalSeconds);
    console.log('respRate=', respRate);
  }, []);

  useEffect(() => {
    console.log('_respRate = ', _respRate);
  }, [_respRate]);

  const _getSubscription = useCallback(() => {
    return accelerometer
      .pipe(
        startWith(undefined), // emitting first empty value to fill-in the buffer
        skip(NumReadingsSkip),
        pairwise(),
      )
      .subscribe({
        next: ([previous, current]) => {
          // omit first value
          if (!previous) return;
          if (previous !== current) {
            // console.log('previous=', previous);
            // console.log('current=', current);
            const prev_x = previous.x;
            const prev_y = previous.y;
            const prev_z = previous.z;
            const curr_x = current.x;
            const curr_y = current.y;
            const curr_z = current.z;
            const prev_val = Math.sqrt(
              prev_x * prev_x + prev_y * prev_y + prev_z * prev_z,
            );
            const curr_val = Math.sqrt(
              curr_x * curr_x + curr_y * curr_y + curr_z * curr_z,
            );
            if (
              Math.abs(prev_val - curr_val) > RespiratoryMeasurementThreshold
            ) {
              setK(_k => _k + 1);
            }
          }
        },
        error: e => {
          console.error(e);
        },
      });
  }, []);

  useEffect(() => {
    let subscription = null;
    if (enableAccelerometer) {
      subscription = _getSubscription();
    }
    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [enableAccelerometer]);

  useEffect(() => {
    console.log('k=', k);
  }, [k]);

  const onStartMeasureRespiratoryRatePress = useCallback(async () => {
    console.log('started measuring..');
    setK(0);
    readingValues = [];
    setEnableAccelerometer(true);
    setTimeout(() => {
      setEnableAccelerometer(false);
      console.log('stopped measuring..');
      calculateRespiratoryRate2();
    }, MeasuringIntervalSeconds * 1000);
  }, [MeasuringIntervalSeconds]);

  return (
    <View style={styles.container}>
      {!enableAccelerometer ? (
        <>
          <Text style={styles.headline}>
            Please lay down and place the smartphone on your chest and press the
            "Start measuring Respiratory rate" button and breathe for{' '}
            {MeasuringIntervalSeconds} seconds
          </Text>
          <Button
            title="Start measuring Respiratory rate"
            onPress={onStartMeasureRespiratoryRatePress}
          />
        </>
      ) : (
        <Text style={styles.headline}>
          Now measuring Respiratory rate, keep breathing...
        </Text>
      )}
      {_respRate !== null ? (
        <Text style={[styles.headline, {fontWeight: 'bold'}]}>
          Your Respiratory Rate is: {_respRate}
        </Text>
      ) : null}
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
