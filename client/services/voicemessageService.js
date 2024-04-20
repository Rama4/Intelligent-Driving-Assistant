import {useEffect, useCallback} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';
import RNFS from 'react-native-fs';

import {
  selectVms,
  addVoicemessage,
  resetVoicemessages,
  markVoicemessageReadOrUnread,
} from '../redux/slices/voicemessageSlice';
import ApiService from './apiService';
import {
  vmsFolderName,
  SentFolderName,
  FileDirectory,
  SentVmsFolderPath,
} from '../utils/constants';
import {
  selectDrivingDistance,
  selectTimeToDestination,
  selectDestinationDistanceP,
} from '../redux/slices/trafficContextSlice';
import {
  createNewFolder,
  getFileCreationDate,
  getFilePath,
  getFilesInFolder,
} from '../utils/fsUtils';

const SampleVoicemailText =
  "Hey there! I'm currently on the road and focused on driving, so I can't take your call right now. Feel free to shoot me a text, and I'll get back to you as soon as it's safe. Thanks for understanding!";

function calculatePercentage(a, b) {
  if (b !== 0) {
    return Math.round((a / b) * 100);
  } else {
    // Handle division by zero
    return 0;
  }
}

export default function voicemessageService() {
  const dispatch = useDispatch();
  const vms = useSelector(selectVms);
  const _drivingDistance = useSelector(selectDrivingDistance);
  const _destinationDistanceP = useSelector(selectDestinationDistanceP);
  const _timeToDestination = useSelector(selectTimeToDestination);

  const {listAllVoicemails, downloadFiles, tts} = ApiService();

  useEffect(() => {
    // loadInitialVoiceMessages();
  }, [vms]);

  const loadInitialVoiceMessages = async () => {
    try {
      // populate voice message list from vms folder locally
      console.log('loadInitialVoiceMessages() vms=', vms);
      // create required folders for sending and receiving vms
      await createNewFolder(RNFS.DownloadDirectoryPath, vmsFolderName);
      await createNewFolder(RNFS.DownloadDirectoryPath, SentFolderName);
      const fileNames = await getFilesInFolder(FileDirectory);
      console.log(
        'loadInitialVoiceMessages() files in incoming folder =',
        fileNames,
      );
      for (const fileName of fileNames) {
        const exists = vms?.some(obj => obj?.fileName === fileName);
        let fileCreatedTime = null;
        if (!exists) {
          addNewVoicemessage(fileName);
          fileCreatedTime = new Date().getTime();
          console.log(
            `loadInitialVoiceMessages() file ${fileName} created now at ${fileCreatedTime}`,
          );
        } else {
          const fileCreatedDate = await getFileCreationDate(
            getFilePath(fileName),
          );
          fileCreatedTime = new Date(fileCreatedDate).getTime();
          console.log(
            `loadInitialVoiceMessages() file ${fileName} created at ${fileCreatedTime}`,
          );
        }
      }
    } catch (error) {
      console.error('loadInitialVoiceMessages() ', error);
    }
  };

  useEffect(() => {
    console.log('voicemessageService: vms=', vms);
  }, [vms]);

  const getAllVoicemails = useCallback(() => {
    return vms;
  }, [vms]);

  const syncVoicemails = async () => {
    try {
      console.log('syncVoicemails() ');
      // get list of voicemessages from server
      const newVms = await listAllVoicemails();
      if (!newVms) {
        console.warn('syncVoicemails() No new Voicemails found');
        return;
      }
      const sortedVms = newVms?.sort((a, b) => b.dateCreated - a.dateCreated);
      // download vms
      console.log(
        'syncVoicemails() newVms = ',
        newVms,
        'sortedVms=',
        sortedVms,
      );
      const folderExists = await RNFS.exists(FileDirectory);
      if (!folderExists) {
        console.log('folder doesnt exist, creating one');
        await createNewFolder(RNFS.DownloadDirectoryPath, vmsFolderName);
      }
      const filesToDownload = [];
      for (const fileName of sortedVms?.file_names) {
        const fileExists = await RNFS.exists(getFilePath(fileName));
        console.log('syncVoicemails() fileExists=', fileExists);
        if (fileExists) {
          console.log('syncVoicemails()', fileName, 'file already exists');
        } else {
          filesToDownload.push(fileName);
          // add metadata to redux
          addNewVoicemessage(fileName);
        }
      }
      console.log('syncVoicemails() filesToDownload=', filesToDownload);
      await downloadFiles(filesToDownload, FileDirectory);
    } catch (error) {
      console.error('syncVoicemails() Error:', error);
      return null;
    }
  };

  const saveFile = async data => {
    try {
      const audioData = data;
      console.log('saveFile() typeof audioData=', typeof audioData);
      const fileName = `${uuidv4()}.mp3`;
      const filePath = `${SentVmsFolderPath}/${fileName}`;
      await RNFS.writeFile(filePath, audioData, 'base64');
      console.log('Speech saved to', filePath);
      return fileName;
    } catch (error) {
      console.error('Error saving speech:', error);
      return '';
    }
  };

  const getVoicemailText = () => {
    const location = 'Phoenix';
    const remDist = _destinationDistanceP - _drivingDistance;
    const remainingTime = Math.round(
      (remDist * _timeToDestination) / (_destinationDistanceP * 60),
    );
    const time = `${remainingTime} minutes`;
    console.log('getVoicemailText(), remainingTime=', remainingTime);
    return `Hi, I am currently driving in ${location} and unable to take your call. I will call you back after I reach my destination in ${time}. Thank you for your understanding.`;
  };

  const getEmergencyVoicemailText = () => {
    const location = 'ASU Life Sciences Building E Wing';

    return `Hi, I've been in an accident. Emergency services have been contacted. My current location is near ${location}. Please come to the location or contact emergency services for further assistance. Thank you.`;
  };

  const generateVoiceMessage = async (emergency = false) => {
    const VoiceMessageText = emergency
      ? getEmergencyVoicemailText()
      : getVoicemailText();
    const data = await tts(VoiceMessageText);
    console.log('generateVoiceMessage() data=', data);
    const fileName = await saveFile(data);
    console.log('generateVoiceMessage() file saved, name=', fileName);
    return fileName;
  };
  const generateSampleVoiceMessage = async (emergency = false) => {
    const fileName = emergency
      ? 'sample_accident_voicemail.mp3'
      : 'sample_driving_voicemail.mp3';
    console.log('generateVoiceMessage() file saved, name=', fileName);
    return fileName;
  };

  const addNewVoicemessage = useCallback(filename => {
    const newVm = {
      id: uuidv4(),
      dateCreated: new Date().getTime(),
      read: false,
      from: 'Rama Narasimhan',
      duration: 25,
      text: SampleVoicemailText,
      fileName: filename,
    };
    dispatch(addVoicemessage(newVm));
  }, []);

  const deleteAllVoicemessages = useCallback(() => {
    dispatch(resetVoicemessages());
  }, []);

  const markVmRead = data => {
    dispatch(markVoicemessageReadOrUnread(data));
  };

  return {
    getAllVoicemails,
    addNewVoicemessage,
    deleteAllVoicemessages,
    markVmRead,
    syncVoicemails,
    generateVoiceMessage,
    generateSampleVoiceMessage,
    loadInitialVoiceMessages,
  };
}
