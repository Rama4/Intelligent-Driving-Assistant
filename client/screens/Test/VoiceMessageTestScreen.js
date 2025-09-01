import {useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  NativeModules,
  Platform,
} from 'react-native';
import {jsonDisp} from '../../utils/commonUtils';
import AudioPlayer from '../../components/AudioPlayer';
import VolumeControl from '../../components/VolumeControl';
import FuelInformation from '../../components/FuelInformation';
import Button from '../../components/shared/Button';
import voicemessageService from '../../services/voicemessageService';
import ApiService from '../../services/apiService';
import RNFS from 'react-native-fs';

export default function VoiceMessageTestScreen({navigation}) {
  const {Module1, Module2} = NativeModules;
  const {
    getAllVoicemails,
    addNewVoicemessage,
    deleteAllVoicemessages,
    markVmRead,
    syncVoicemails,
    generateVoiceMessage,
  } = voicemessageService();
  const {
    sampleApiCall,
    upload,
    downloadFile,
    listAllVoicemails,
    getTopVideoIdsFromArtist,
  } = ApiService();

  useEffect(() => {
    Module2?.foo();
    Module1?.foo();
    Module1.doAsynchronousTask(123, (status, r) => {
      console.log('doAsynchronousTask(): status=', status);
      console.log('doAsynchronousTask(): r=', r);
    });
    // startListenerTapped();
    // return () => {
    //   stopListenerTapped();
    // };
  }, []);

  const onTestPress = async () => {
    console.log('HomeScreen:: test button pressed');
    await syncVoicemails();
    console.log('HomeScreen:: sync complete');
    // sampleApiCall();
  };

  const onTest2Press = () => {
    console.log('HomeScreen:: test2 button pressed');
    addNewVoicemessage();
    // sampleApiCall();
  };

  const onTest3Press = () => {
    console.log('HomeScreen:: test3 button pressed');
    const vms = deleteAllVoicemessages();
    console.log('HomeScreen::', vms);
    // sampleApiCall();
  };

  const onTest4Press = () => {
    const vm = getAllVoicemails()?.[0] || 'unknown';
    console.log('HomeScreen:: test4 button pressed, vmid=', vm?.id);
    markVmRead({
      id: vm.id,
      read: true,
    });
    // sampleApiCall();
  };

  const getpath = (fileDirectory, filename) => fileDirectory + filename;

  const onTestUploadPress = async () => {
    console.log('onTestUploadPress()');
    const fileName = 'vm1.mp3';
    const fileDirectory = RNFS.DownloadDirectoryPath;

    const f = await upload(fileName, fileDirectory);
    console.log('onTestUploadPress():', jsonDisp(f));
  };

  const onTestDownloadPress = async () => {
    console.log('onTestDownloadPress()');
    const fileName = 'taal_western.mp3';
    const fileDirectory = RNFS.DownloadDirectoryPath;
    const f = await downloadFile(fileName, fileDirectory);
    console.log('onTestUploadPress():', jsonDisp(f));
  };
  const onTTSPress = async () => {
    console.log('onTTSPress()');
    await generateVoiceMessage();
  };
  const onTopArtistsPress = async () => {
    console.log('onTopArtistsPress()');
    const l = await getTopVideoIdsFromArtist('shakira');
    console.log('onTopArtistsPress() l=', l);
  };

  return (
    <ScrollView>
      <View style={styles.view}>
        <Text style={styles.text}>Car Dashboard</Text>
        <AudioPlayer />
        <VolumeControl />
        <FuelInformation />
        <Button title="list all vms" onPress={onTestPress} />
        {/* <Button title="add a new vm" onPress={onTest2Press} /> */}
        {/* <Button title="mark first vm as read" onPress={onTest4Press} /> */}
        {/* <Button title="delete all vms" onPress={onTest3Press} />  */}
        <View
          style={{
            display: 'flex',
            flex: 1,
            width: '100%',
            justifyContent: 'space-around',
            flexDirection: 'row',
            paddingTop: 30,
          }}>
          {/* <Button title="test upload" onPress={onTestUploadPress} />
          <Button title="test download" onPress={onTestDownloadPress} />
          <Button title="test tts" onPress={onTTSPress} /> */}
          <Button
            title="test youtube top artists"
            onPress={onTopArtistsPress}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    // backgroundColor: 'yellow',
    // height: '100%',
    // minHeight: '100%',
  },
  homeButtonsContainer: {
    flex: 1,
    // backgroundColor: 'red',
    marginTop: 15,
  },
  container: {
    flex: 1,
    padding: 24,
    // backgroundColor: '#fff',
  },
  rowContainer: {
    // flex: 1,
    // width
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  text: {
    fontSize: 20,
    // color: 'white',
  },
});
