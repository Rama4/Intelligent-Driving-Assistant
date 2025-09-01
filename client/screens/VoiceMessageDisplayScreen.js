import React, {useEffect, useState, useCallback} from 'react';
import {FlatList, View, Text, StyleSheet, Pressable} from 'react-native';
import Contacts from 'react-native-contacts';
import {PermissionsAndroid} from 'react-native';
import Button from '../components/shared/Button';
import {useSelector, useDispatch} from 'react-redux';
import {selectVms} from '../redux/slices/voicemessageSlice';
import voicemessageService from '../services/voicemessageService';

export default function VoiceMessageDisplayScreen() {
  const dispatch = useDispatch();
  const [contacts, setContacts] = useState([]);
  const [selectedSymptom, setSelectedSymptom] = useState(-1);
  const vms = useSelector(selectVms);
  const {syncVoicemails} = voicemessageService();

  useEffect(() => {
    console.log('VoiceMessageDisplayScreen vms=', vms);
  }, [vms]);

  const syncAllVms = async () => {
    console.log('syncAllVms()');
    await syncVoicemails();
    console.log('syncAllVms() sync complete');
    // sampleApiCall();
  };

  const onSymptomPress = index => {
    console.log('selected:', contacts[index]);
    setSelectedSymptom(index);
  };

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
              <View style={styles.placeholder}></View>
            </View>
            <View style={styles.contactDat}>
              <Text style={styles.name}>{vm?.from || ' '}</Text>
              <Text style={styles.phoneNumber}>{vm?.duration || ''}</Text>
            </View>
          </View>
        </Pressable>
      );
    },
    [selectedSymptom],
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

  const onDone = () => {
    console.log('contact selection done');
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
