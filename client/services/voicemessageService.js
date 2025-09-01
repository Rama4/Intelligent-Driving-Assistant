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
  fileDirectory,
  SentVmsFolderPath,
} from '../utils/constants';
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
  const _distanceToDestination = useSelector(selectDistanceToDestination);
  const _timeToDestination = useSelector(selectTimeToDestination);

  const {listAllVoicemails, downloadFiles, tts} = ApiService();

  useEffect(() => {
    loadInitialVoiceMessages();
  }, []);

  const loadInitialVoiceMessages = async () => {
    // populate voice message list from vms folder locally
    console.log('loadInitialVoiceMessages()');
    // create required folders for sending and receiving vms
    await createNewFolder(RNFS.DownloadDirectoryPath, vmsFolderName);
    await createNewFolder(RNFS.DownloadDirectoryPath, SentFolderName);
    const fileNames = await getFilesInFolder(fileDirectory);
    console.log(
      'loadInitialVoiceMessages() loadInitialVoiceMessages=',
      fileNames,
    );
    for (const fileName of fileNames) {
      const exists = vms.some(obj => obj?.from === fileName);
      if (!exists) addNewVoicemessage(fileName);
    }
  };

  useEffect(() => {
    console.log('vms=', vms);
  }, [vms]);

  const getAllVoicemails = useCallback(() => {
    return vms;
  }, [vms]);

  const createNewFolder = async (path, folderName) => {
    const folderPath = `${path}/${folderName}`;
    try {
      const folderExists = await RNFS.exists(folderPath);
      if (folderExists) {
        console.log(`path already exists: ${folderPath}`);
      } else {
        await RNFS.mkdir(folderPath);
        console.log(folderName, 'created');
      }
    } catch (error) {
      console.error('Error creating', folderName, error);
    }
  };

  const getFilesInFolder = async folderPath => {
    try {
      const result = await RNFS.readDir(folderPath);
      const fileNames = result
        .filter(item => item.isFile())
        .map(file => file.name);
      console.log('File names in the folder:', fileNames);
      return fileNames;
    } catch (error) {
      console.error('Error reading folder:', error);
      return [];
    }
  };

  const getpath = (fileDirectory, filename) => fileDirectory + '/' + filename;

  const syncVoicemails = async () => {
    console.log('syncVoicemails() ');
    // get list of voicemessages from server
    const newVms = await listAllVoicemails();
    // download vms
    console.log('syncVoicemails() newVms = ', newVms);
    const folderExists = await RNFS.exists(fileDirectory);
    if (!folderExists) {
      console.log('folder doesnt exist, creating one');
      await createNewFolder(RNFS.DownloadDirectoryPath, vmsFolderName);
    }
    const filesToDownload = [];
    for (const fileName of newVms?.file_names) {
      const fileExists = await RNFS.exists(getpath(fileDirectory, fileName));
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
    await downloadFiles(filesToDownload, fileDirectory);
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

  const addNewVoicemessage = useCallback(filename => {
    const newVm = {
      id: uuidv4(),
      dateCreated: new Date().getTime(),
      read: false,
      from: filename,
      to: '9000',
      duration: 25,
      text: SampleVoicemailText,
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
  };
}
