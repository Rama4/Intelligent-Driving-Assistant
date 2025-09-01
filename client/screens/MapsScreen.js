import {useEffect, useState, useCallback, useRef} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import {
  accelerometer,
  setUpdateIntervalForType,
  SensorTypes,
} from 'react-native-sensors';

import {pairwise, startWith, skip} from 'rxjs/operators';
import Button from '../components/shared/Button';
import axios from 'axios';
import {ROUTE_API_KEY} from '@env';
import {CognitiveWorkloadType, TrafficConditionType} from '../utils/constants';
import AudioPlayer from '../components/AudioPlayer';
import {useDispatch, useSelector} from 'react-redux';

import {
  updateTrafficCondition,
  updateLegDistances,
  updateLegDurations,
  updateSpeedReadingIntervals,
  updateDestinationDistance,
  updateCurrentSpeed,
  updateDrivingDistance,
  incrementDrivingDistance,
  updateCognitiveWorkload,
  updateDrivingIntervalRef,
  updateDistanceToDestination,
  updateTimeToDestination,
  selectDrivingDistance,
  selectCognitiveWorkload,
  selectSpeedReadingIntervals,
  selectDrivingIntervalRef,
  selectDrivingScore,
  selectTimeToDestination,
  selectDistanceToDestination,
  selectDestinationDistanceP,
  updateDestinationDistanceP,
} from '../redux/slices/trafficContextSlice';
import {useVolumeControl} from '../hooks/useVolumeControl';
import {
  updateCollisionDetectedAcceleromter,
  updatePeaks,
  incrementPeaks,
  selectPeaks,
} from '../redux/slices/emergencySlice';

const DrivingMoveIntervalms = 3 * 1000;
const VolumeChangeAmount = 0.1;
const presetNormal = 0.8;
const presetSlow = 0.5;
const presetJam = 0.3;
const WindowSize = 5;
const MeasuringIntervalSeconds = 45;
const AccelerometerUpdateIntervalMS = 1500;
const RespiratoryMeasurementThreshold = 0.85;
const RespRateMultiplicationFactor = 60;
const NumReadingsSkip = 1000 / AccelerometerUpdateIntervalMS;

function averageOfLastFive(array) {
  if (array.length < 5) {
    return null; // or handle the case as per your requirement
  }
  const lastFive = array.slice(-5);
  const sum = lastFive.reduce((a, b) => a + b, 0);
  return sum / 5;
}

setUpdateIntervalForType(
  SensorTypes.accelerometer,
  AccelerometerUpdateIntervalMS,
);

function calculatePercentage(a, b) {
  if (b !== 0) {
    return Math.round((a / b) * 100);
  } else {
    // Handle division by zero
    return 0;
  }
}

export default function MapsScreen({navigation}) {
  const dispatch = useDispatch();
  const _drivingDistance = useSelector(selectDrivingDistance);
  const _destinationDistanceP = useSelector(selectDestinationDistanceP);
  const _cognitiveWorkload = useSelector(selectCognitiveWorkload);
  const _speedReadingIntervals = useSelector(selectSpeedReadingIntervals);
  const _drivingIntervalRef = useSelector(selectDrivingIntervalRef);
  const _drivingScore = useSelector(selectDrivingScore);
  const _peaks = useSelector(selectPeaks);
  const _distanceToDestination = useSelector(selectDistanceToDestination);
  const _timeToDestination = useSelector(selectTimeToDestination);

  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isFetchPlaylist, setIsFetchPlaylist] = useState(false);
  const [isLoading, setIsLoading] = useState(0);

  const [dista, setDistance] = useState(0);
  const [timeNormal, setTimeNormal] = useState(0);
  const [timeNormalTxt, setTimeNormalTxt] = useState(0);
  const [isDriving, setIsDriving] = useState(false);

  const [sourceAddress, setSourceAddress] = useState(
    'ASU Life Sciences Building E Wing',
  );
  const [destinationAddress, setDestinationAddress] = useState(
    'Phoenix Sky Harbor Airport',
  );
  const {volume, increaseVolume, decreaseVolume, setVolume, cleanup} =
    useVolumeControl();

  const [slowVolumeDiffArr, setSlowVolumeDiffArr] = useState([]);
  const [normalVolumeDiffArr, setNormalVolumeDiffArr] = useState([]);
  const [jamVolumeDiffArr, setJamVolumeDiffArr] = useState([]);

  const getslowavg = averageOfLastFive(slowVolumeDiffArr);
  const getjamavg = averageOfLastFive(jamVolumeDiffArr);
  const getnormalavg = averageOfLastFive(normalVolumeDiffArr);

  // accelerometer code with useEffect implementation
  const [enableAccelerometer, setEnableAccelerometer] = useState(false);

  const _getSubscription = useCallback(() => {
    let valueTokeepInCheck = 0;
    let peaks = 0;
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

            console.log(
              '_getSubscription() valueTokeepInCheck= ',
              valueTokeepInCheck,
            );
            const prev_val = Math.sqrt(
              prev_x * prev_x + prev_y * prev_y + prev_z * prev_z,
            );
            const curr_val = Math.sqrt(
              curr_x * curr_x + curr_y * curr_y + curr_z * curr_z,
            );

            if (
              Math.abs(prev_val - curr_val) > RespiratoryMeasurementThreshold
            ) {
              console.log('_getSubscription() peak detected by accelerometer ');
              dispatch(incrementPeaks());
            } else if (Math.abs(prev_val - curr_val) < 0.1) {
              if (valueTokeepInCheck++ >= 10) {
                console.log(
                  '_getSubscription() collision detected by accelerometer= ',
                  valueTokeepInCheck,
                );
                dispatch(updateCollisionDetectedAcceleromter(true));
              }
            }
          }
        },
        error: e => {
          console.error(e);
        },
      });
  }, [dispatch]);

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
    console.log('MapsScreen: VolumeControl init');
    const randomRoadSequence = generateRandomRoadConditionSequence(50);
    console.log(randomRoadSequence);

    for (let i = 0; i < randomRoadSequence.length; i++) {
      if (randomRoadSequence[i] === CognitiveWorkloadType.NCW) {
        //Slow
        setSlowVolumeDiffArr(p => {
          const f = [...p];
          f.push(presetJam);
          f.push(presetNormal);
          f.push(presetSlow);
          return f;
        });
        // console.log(slow_object.getAverage());
      } else if (randomRoadSequence[i] === CognitiveWorkloadType.LCW) {
        //Normal
        setNormalVolumeDiffArr(p => {
          const f = [...p];
          f.push(presetJam);
          f.push(presetNormal);
          f.push(presetSlow);
          return f;
        });
      } else {
        //TrafficJam
        setJamVolumeDiffArr(p => {
          const f = [...p];
          f.push(presetJam);
          f.push(presetNormal);
          f.push(presetSlow);
          return f;
        });
      }
    }
    return () => {
      // volume control stop listener
      cleanup();
      // stop driving
      stopDriving();
    };
  }, []);

  useEffect(() => {
    console.log('new cognitive workload= ', _cognitiveWorkload);
    // volume change code here
    let newVol = 0;
    if (_cognitiveWorkload === CognitiveWorkloadType.NCW) {
      newVol = getslowavg;
    } else if (_cognitiveWorkload === CognitiveWorkloadType.LCW) {
      newVol = getnormalavg;
    } else {
      newVol = getjamavg;
    }
    const diff = newVol - volume;
    console.log('volume change: old volume = ', volume);
    console.log('volume change: new volume = ', newVol);
    console.log('volume change: diff = ', diff);
    if (diff > 0) {
      increaseVolume(diff);
    } else {
      decreaseVolume(Math.abs(diff));
    }
  }, [_cognitiveWorkload]);

  useEffect(() => {
    // start driving and increment the traffic condition (polyline number)
    // initiate car driving
    console.log('isDriving=', isDriving);
  }, [isDriving]);

  useEffect(() => {
    console.log('_drivingDistance=', _drivingDistance);
    // get traffic condition for current distance
    // set lcw/hcw based on the traffic condition
    updateCurrentTrafficCondition();
  }, [_drivingDistance]);

  const onSourceAddressChange = text => {
    console.log(text);
    setSourceAddress(text);
  };
  const onDestinationAddressChange = text => {
    console.log(text);
    setDestinationAddress(text);
  };

  const roundDecimal = (val, nDigits = 2) => {
    return val.toFixed(nDigits);
  };

  const getRouteDistanceInfo = async () => {
    console.log('getRouteDistanceInfo()');

    try {
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/directions/json',
        {
          params: {
            origin: sourceAddress,
            destination: destinationAddress,
            key: ROUTE_API_KEY,
            mode: 'driving',
          },
        },
      );

      const data = response.data;
      console.log('getRouteDistanceInfo()', data);
      if (data.status === 'OK') {
        const route = data.routes[0];
        const legs = route.legs[0];
        console.log('Route: ', route);

        legs.steps.forEach((element, index) => {
          const duration = element.duration.text;
          const distance = element.distance.text;

          console.log(`Leg ${index + 1}: `);
          console.log('Duration:', duration);
          console.log('Distance:', distance);
        });

        const _distances = legs?.steps?.map(step => step.distance.value);
        const _durations = legs?.steps?.map(step => step.duration.value);
        dispatch(updateLegDistances(_distances));
        dispatch(updateLegDurations(_durations));

        const distanceTxt = route.legs[0].distance.text;
        setDistance(distanceTxt);
        dispatch(updateDestinationDistance(distanceTxt));

        const durationTxt = route.legs[0].duration.text;
        setTimeNormalTxt(durationTxt);

        const distanceMeters = route.legs[0].distance.value;
        const timeDuration = route.legs[0].duration.value;
        console.log(
          'getRouteDistanceInfo()',
          'total distance to destination=',
          distanceMeters,
        );
        console.log(
          'getRouteDistanceInfo()',
          'total time to destination=',
          timeDuration,
        );

        dispatch(updateDistanceToDestination(distanceMeters));
        dispatch(updateTimeToDestination(timeDuration));

        console.log('getRouteDistanceInfo()', '_durations=', _durations);
        console.log('getRouteDistanceInfo()', '_distances=', _distances);
      }
    } catch (error) {
      console.error('getRouteDistanceInfo() Error:', error);
    }
  };

  const updateCurrentTrafficCondition = async () => {
    console.log('updateCurrentTrafficCondition()');
    let tc = TrafficConditionType.SPEED_UNSPECIFIED;
    if (!_speedReadingIntervals?.length) {
      console.log('updateCurrentTrafficCondition(): getting  from API');
      await _getCurrentTrafficConditionAPI();
    } else {
      console.log('updateCurrentTrafficCondition(): getting  from cache');
      tc = await _getTrafficConditionFromCache(_drivingDistance);
    }
    dispatch(updateTrafficCondition(tc));
    //set lcw/hcw
    dispatch(
      updateCognitiveWorkload(
        tc === TrafficConditionType.NORMAL
          ? CognitiveWorkloadType.LCW
          : tc === TrafficConditionType.SLOW
          ? CognitiveWorkloadType.NCW
          : CognitiveWorkloadType.HCW,
      ),
    );
  };

  const _getTrafficConditionFromCache = currentDistance => {
    const tc =
      _speedReadingIntervals.find(interval => {
        if (
          currentDistance >= interval.startPolylinePointIndex &&
          currentDistance < interval.endPolylinePointIndex
        ) {
          return interval;
        }
      })?.speed || TrafficConditionType.SPEED_UNSPECIFIED;
    console.log('_getTrafficConditionFromCache()', 'trafficCondition=', tc);
    return tc;
  };

  const _getCurrentTrafficConditionAPI = async () => {
    console.log('_getCurrentTrafficConditionAPI()');
    const apiKey = ROUTE_API_KEY;
    const apiUrl = 'https://routes.googleapis.com/directions/v2:computeRoutes';

    const body = JSON.stringify({
      origin: {address: sourceAddress},
      destination: {address: destinationAddress},
      travelMode: 'DRIVE',
      extraComputations: ['TRAFFIC_ON_POLYLINE'],
      routingPreference: 'TRAFFIC_AWARE_OPTIMAL',
    });

    const headers = {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask':
        'routes.duration,routes.distanceMeters,routes.polyline,routes.legs.polyline,routes.travelAdvisory,routes.legs.travelAdvisory',
    };
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        body: body,
      });
      console.log('_getCurrentTrafficConditionAPI(): response=', response);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      if (response.ok) {
        const result = await response.json();
        //console.log('API Response:', result);

        const travelAdvisory = result.routes[0].travelAdvisory;
        console.log(
          '_getCurrentTrafficConditionAPI(): Travel Advisory:',
          travelAdvisory,
        );

        const speeds = travelAdvisory?.speedReadingIntervals;
        console.log('_getCurrentTrafficConditionAPI():', speeds);

        // save to redux
        dispatch(updateSpeedReadingIntervals(speeds));
        const destinationDistanceP =
          speeds[speeds.length - 1]?.endPolylinePointIndex || 0;
        console.log(
          '_getCurrentTrafficConditionAPI(): destination polyline number = ',
          destinationDistanceP,
        );
        dispatch(updateDestinationDistanceP(destinationDistanceP));
      } else {
        console.error(
          '_getCurrentTrafficConditionAPI()',
          'API Request failed:',
          response.statusText,
        );
      }
    } catch (error) {
      console.error('_getCurrentTrafficConditionAPI()', 'Error:', error);
    }
  };

  const onGetRouteTrafficInfoPress = async () => {
    console.log('onGetRouteTrafficInfoPress()');
    setIsLoading(1);

    // get and store traffic route info in redux
    await getRouteDistanceInfo();
    // get and store current traffic condition in redux
    await updateCurrentTrafficCondition();
    setIsLoading(2);
  };

  const startDriving = useCallback(() => {
    // start driving
    console.log('startDriving()');
    const intervalRef = setInterval(() => {
      // increment the car distance
      if (_drivingDistance < _destinationDistanceP) {
        dispatch(incrementDrivingDistance());
      }
    }, DrivingMoveIntervalms);
    dispatch(updateDrivingIntervalRef(intervalRef));
    setIsDriving(true);
    // music player init
    setIsFetchPlaylist(true);
    // enabling accelerometer and setting timeout to run for 10 min
    setEnableAccelerometer(true);
    setTimeout(() => {
      setEnableAccelerometer(false);
      console.log('stopped measuring..');
    }, 600 * 1000);
  }, [
    dispatch,
    DrivingMoveIntervalms,
    _drivingDistance,
    _destinationDistanceP,
  ]);

  const stopDriving = useCallback(() => {
    // stop driving
    console.log('stopDriving()');
    setIsDriving(false);
    if (_drivingIntervalRef) {
      clearInterval(_drivingIntervalRef);

      // dispatch(updateDrivingIntervalRef(null));
    }
    setEnableAccelerometer(false);
    console.log('stopped measuring..');
  }, [_drivingIntervalRef]);

  const renderDrivingInformation = useCallback(() => {
    if (isLoading === 2) {
      return (
        <>
          <Text style={styles.text}>Distance: {dista}</Text>
          <Text style={styles.text}>Time : {timeNormalTxt}</Text>
          <Text style={styles.text}>
            Distance Travelled :{' '}
            {calculatePercentage(_drivingDistance, _destinationDistanceP)} %
          </Text>
          <Text style={styles.text}>
            cognitive workload : {_cognitiveWorkload}
          </Text>
        </>
      );
    }
    return null;
  }, [
    isLoading,
    dista,
    timeNormalTxt,
    _drivingDistance,
    _destinationDistanceP,
    _cognitiveWorkload,
  ]);

  // audio music player

  const onDoneFetching = status => {
    console.log('onDoneFetching(): status=', status);
    setIsFetchPlaylist(false);
  };

  // volume control

  function generateRandomRoadConditionSequence(length) {
    let sequence = [];
    for (let i = 0; i < length; i++) {
      const randomNumber = Math.floor(Math.random() * 3); // Generate a random number between 0 and 2
      sequence.push(
        randomNumber === 0
          ? CognitiveWorkloadType.LCW
          : randomNumber === 1
          ? CognitiveWorkloadType.NCW
          : CognitiveWorkloadType.HCW,
      );
    }
    return sequence;
  }

  function MovingAverage(windowSize) {
    this.window = [];
    this.windowSize = windowSize;
    this.sum = 0;
    this.print();

    this.add = function (value) {
      console.log('getAverage(): window empty');
      this.window.push(value);
      this.sum += value;
      if (this.window.length > this.windowSize) {
        const removedValue = this.window.shift();
        this.sum -= removedValue;
      }
    };

    this.getAverage = function () {
      if (!this.window.length) {
        console.log('getAverage(): window empty');
        return 0;
      }
      console.log('getAverage(): ret=', ret);
      const ret = this.sum / this.window.length;
      return ret;
    };
  }

  const doVolumeChange = async (
    v,
    increase = true,
    amount = VolumeChangeAmount,
  ) => {
    prevVolume = volume;

    if (increase) {
      await increaseVolume(amount);
    } else await decreaseVolume(amount);

    const diff = volume - prevVolume;
    if (!diff) {
      return;
    }

    if (_cognitiveWorkload === CognitiveWorkloadType.NCW) {
      setSlowVolumeDiffArr(p => {
        const f = [...p];
        f.push(diff);
        return f;
      });
    } else if (_cognitiveWorkload === CognitiveWorkloadType.LCW) {
      setNormalVolumeDiffArr(p => {
        const f = [...p];
        f.push(diff);
        return f;
      });
    } else {
      setJamVolumeDiffArr(p => {
        const f = [...p];
        f.push(diff);
        return f;
      });
    }
  };

  const onVolumeChange = useCallback(async (increase = true) => {
    console.log('onVolumeChange()');
    await doVolumeChange(volume, increase, VolumeChangeAmount);
  }, []);

  const renderVolume = () => {
    return (
      <>
        <View style={styles.volumeContainer}>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={{color: 'black'}}>
                Volume: {Math.round(volume * 100)} %
              </Text>
            </View>
            <View style={styles.column}>
              <View style={styles.buttonContainer}>
                <Button
                  title="Volume up"
                  onPress={() => onVolumeChange(true)}
                />
              </View>
              <View style={styles.buttonContainer}>
                <Button
                  title="Volume down"
                  onPress={() => onVolumeChange(false)}
                />
              </View>
            </View>
          </View>
        </View>
      </>
    );
  };

  // Fuel calculation

  function calculateFuelStatus(
    estimatedTime,
    distance,
    drivingScore,
    mileagePerGallon,
    fuelLeft,
  ) {
    const fuelRequired =
      ((0.01 * drivingScore + 0.005 * estimatedTime) * distance) /
      mileagePerGallon;
    const extraFuelRequired = Math.abs((fuelRequired - fuelLeft) / 1700 - 1);

    if (fuelLeft >= fuelRequired) {
      return 'Fuel left is sufficient.';
    } else {
      return `Fuel left is insufficient. Additional ${extraFuelRequired.toFixed(
        2,
      )} gallons required.`;
    }
  }

  const renderFuelStatus = () => {
    const estimatedTime = _timeToDestination;
    const distance = _distanceToDestination;
    const drivingScore = _drivingScore;
    const mileagePerGallon = 30;
    const fuelLeft = 10;
    console.log(
      'renderFuelStatus() estimatedTime=',
      estimatedTime,
      'distance=',
      distance,
      'drivingScore=',
      drivingScore,
      'mileagePerGallon=',
      mileagePerGallon,
      'fuelLeft=',
      fuelLeft,
    );

    const fuelStatus = calculateFuelStatus(
      estimatedTime,
      distance,
      drivingScore,
      mileagePerGallon,
      fuelLeft,
    );
    return (
      <View>
        <Text style={styles.text}>{fuelStatus}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView>
        <View style={styles.view}>
          <Text style={styles.label}>Source Co-ordinates:</Text>
          <TextInput
            onFocus={() => setIsKeyboardOpen(true)}
            onBlur={() => setIsKeyboardOpen(false)}
            style={styles.input}
            value={sourceAddress}
            onChangeText={onSourceAddressChange}></TextInput>
          <Text style={styles.label}>Destination Co-ordinates:</Text>
          <TextInput
            onFocus={() => setIsKeyboardOpen(true)}
            onBlur={() => setIsKeyboardOpen(false)}
            style={styles.input}
            value={destinationAddress}
            onChangeText={onDestinationAddressChange}></TextInput>
          <Button
            disabled={isKeyboardOpen}
            onPress={onGetRouteTrafficInfoPress}
            title="Get route traffic info "
          />
          <View style={styles.resultsContainer}>
            {isLoading === 1 && <Text style={styles.text}>Loading..</Text>}
            {renderDrivingInformation()}
            <View style={styles.startDriving}>
              <Button
                disabled={isLoading !== 2}
                title="start driving"
                onPress={startDriving}
              />
            </View>
            <Button
              disabled={isLoading !== 2}
              title="stop driving"
              onPress={stopDriving}
            />
          </View>
          <AudioPlayer
            fetchPlaylist={isFetchPlaylist}
            onDoneFetching={onDoneFetching}
          />
          {renderVolume()}
          {renderFuelStatus()}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: '100%',
  },
  mapsContainer: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
  },
  input: {
    width: '100%',
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    color: 'black',
  },
  homeButtonsContainer: {
    flex: 1,
    marginTop: 15,
  },
  container: {
    flex: 1,
    padding: 24,
  },
  startDriving: {
    paddingVertical: 20,
  },
  resultsContainer: {
    paddingTop: 20,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  text: {
    fontSize: 20,
    color: 'black',
  },

  volumeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  column: {
    flex: 1,
  },
  buttonContainer: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  headline: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
});
