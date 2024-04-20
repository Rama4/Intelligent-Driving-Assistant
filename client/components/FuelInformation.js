import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {setUpdateIntervalForType, SensorTypes} from 'react-native-sensors';

setUpdateIntervalForType(
  SensorTypes.accelerometer,
  AccelerometerUpdateIntervalMS,
);

const MaxVolume = 10;
const MinVolume = 0;
const FuelCapacityMiles = 100;

export default function FuelInformation() {
  [miles, setMiles] = useState(FuelCapacityMiles);
  [drivingScore, setDrivingScore] = useState(5);

  useEffect(() => {
    console.log('miles=', miles);
  }, [miles]);

  const onVolumeChange = (increase = true) => {
    console.log('onVolumeChange()');
    setVolume(v => {
      if (increase && v < MaxVolume) {
        return v + 1;
      } else if (!increase && v > MinVolume) {
        return v - 1;
      } else {
        return v;
      }
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
