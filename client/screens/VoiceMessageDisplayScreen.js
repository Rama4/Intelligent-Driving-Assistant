import React, {useEffect, useState, useCallback} from 'react';
import {FlatList, View, Text, StyleSheet, Pressable} from 'react-native';
import Button from '../components/shared/Button';
import {useSelector} from 'react-redux';
import {selectVms} from '../redux/slices/voicemessageSlice';
import voicemessageService from '../services/voicemessageService';
import SoundPlayer from '../components/SoundPlayer';

import Sound from 'react-native-sound';
import {FileDirectory} from '../utils/constants';

export default function VoiceMessageDisplayScreen() {
  const [selectedSymptom, setSelectedSymptom] = useState(-1);
  const vms = useSelector(selectVms);
  const {syncVoicemails, loadInitialVoiceMessages} = voicemessageService();

  const [soundObj, setSoundObj] = useState(null);

  useEffect(() => {
    const init = async () => {
      await loadInitialVoiceMessages();
    };
    init();
  }, []);

  useEffect(() => {
    console.log('VoiceMessageDisplayScreen vms=', vms);
    if (vms?.length) {
      loadSound();
    }
  }, [vms]);

  const syncAllVms = async () => {
    console.log('syncAllVms()');
    await syncVoicemails();
    console.log('syncAllVms() sync complete');
  };

  const onSymptomPress = index => {
    console.log('selected:', index);
    setSelectedSymptom(index);
  };

  const loadSound = useCallback(() => {
    console.log('loadSound()');
    const audioFileName =
      vms[selectedSymptom || 0]?.fileName || 'sample_accident_voicemail.mp3';

    const sound = new Sound(audioFileName, FileDirectory, error => {
      if (error) {
        console.log('loadSound(): failed to load the sound', error);
        return;
      }
      // when loaded successfully
      console.log('loadSound() sound loaded:', sound.isLoaded());
      setSoundObj(sound);
    });
  }, [vms, selectedSymptom]);

  const getFormattedDateTime = time => {
    return `${formattedTime(time)}, ${formattedDate(time)}`;
  };

  const formattedTime = currentTime =>
    new Date(currentTime).toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });

  const formattedDate = currentTime =>
    new Date(currentTime).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const renderVmDetails = useCallback(
    (vm, index) => {
      // console.log('vm details=', vm);
      return (
        <Pressable
          style={
            index !== selectedSymptom
              ? styles.symptomListButton
              : styles.symptomListButtonSelected
          }
          key={index}
          onPress={() => onSymptomPress(index)}>
          <View style={styles.contactCon}>
            <View style={styles.imgCon}>
              <View style={styles.placeholder} />
            </View>
            <View style={styles.contactDat}>
              <Text style={styles.name}>{vm?.from || ' '}</Text>
              <Text style={styles.phoneNumber}>
                {getFormattedDateTime(vm?.dateCreated) || ' '}
              </Text>
              <View style={styles.soundPlayerContainer}>
                <SoundPlayer sound={soundObj} />
              </View>
            </View>
          </View>
        </Pressable>
      );
    },
    [selectedSymptom, soundObj],
  );

  const keyExtractor = (item, idx) => {
    return idx.toString();
  };
  const renderItem = ({item, index}) => {
    return renderVmDetails(item, index);
  };

  const separator = () => {
    //add a seperator component for each item with green color:
    return <View style={styles.separator} />;
  };

  return (
    <View style={styles.view}>
      <Text style={styles.txt}>Voice messages from driver</Text>
      <View style={styles.button}>
        <Button
          // style={styles.button}
          title="Sync Voicemails"
          onPress={syncAllVms}
        />
      </View>
      {separator()}
      <FlatList
        data={vms}
        renderItem={renderItem}
        style={styles.list}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={separator}
        persistentScrollbar={true}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  view: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
    paddingHorizontal: 10,
    // backgroundColor: 'yellow',
    // height: '100%',
    // minHeight: '100%',
  },
  button: {
    paddingBottom: 5,
  },
  separator: {
    borderBottomColor: 'gray',
    borderBottomWidth: 2,
  },
  symptomListButton: {
    backgroundColor: '#eee',
    // height: 50,
  },
  symptomListButtonSelected: {
    backgroundColor: '#777',
    color: 'white',
    // height: 50,
  },
  list: {
    flex: 1,
  },
  contactCon: {
    flex: 1,
    flexDirection: 'row',
    padding: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: '#d9d9d9',
  },
  imgCon: {},
  placeholder: {
    width: 55,
    height: 55,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#d9d9d9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactDat: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 5,
  },
  soundPlayerContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingLeft: 5,
  },
  txt: {
    fontSize: 18,
    color: 'black',
  },
  name: {
    fontSize: 16,
    color: 'black',
  },
  phoneNumber: {
    color: 'black',
  },
});
