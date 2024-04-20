import {useEffect} from 'react';
import RNFS from 'react-native-fs';
import axios from 'axios';
import {jsonDisp} from '../utils/commonUtils';
import {IP} from '@env';
import {useDispatch, useSelector} from 'react-redux';
import {
  selectCollisionDetectedAcceleromter,
  selectPeaks,
} from '../redux/slices/emergencySlice';
import {selectCognitiveWorkload} from '../redux/slices/trafficContextSlice';
import {CognitiveWorkloadType} from '../utils/constants';

// const HOST_URL = `http://10.159.148.108:8000/myapp`;
const HOST_URL = `http://${IP}:8000/myapp`;
console.log('IP=', IP);
console.log('HOST_URL=', HOST_URL);

export default function ApiService() {
  const _collisionAccelerometer = useSelector(
    selectCollisionDetectedAcceleromter,
  );
  const _cw = useSelector(selectCognitiveWorkload);
  const _peaks = useSelector(selectPeaks);
  const endpoints = {
    voicemail: {
      getAllVoicemails: HOST_URL + '/list_pending_files',
      uploadfile: HOST_URL + '/upload',
      downloadFile: HOST_URL + '/download',
    },
    maps: {
      default: HOST_URL + '/maps',
    },
    song: {
      getArtists: HOST_URL + '/home',
    },
    collision: {
      collisioncheck: HOST_URL + '/collisioncheck',
    },
    fuel: {
      drivingscore: HOST_URL + '/drivingscore',
    },
  };

  useEffect(() => {
    console.log(
      'Apiservice() _collisionAccelerometer=',
      _collisionAccelerometer,
    );
  }, [_collisionAccelerometer]);

  const doCollisionCheck = async () => {
    try {
      console.log('doCollisionCheck()');

      const roadCondition =
        _cw === (CognitiveWorkloadType.NCW || _cw === CognitiveWorkloadType.HCW)
          ? 1
          : 0;

      const url = endpoints.collision.collisioncheck;
      const currentSpeed = 25;
      const response = await axios.get(url, {
        params: {
          acc: _collisionAccelerometer,
          peak: _peaks,
          roadCondition: roadCondition,
          speed: currentSpeed,
        },
      });
      console.log('doCollisionCheck() response=', response);
      const data = response?.data;
      console.log(jsonDisp(data));
      return data;
    } catch (error) {
      console.error('doCollisionCheck() Error:', error);
      return null;
    }
  };

  const tts = async text => {
    const url =
      'https://texttospeech.googleapis.com/v1/text:synthesize?key=AIzaSyAJI80z3GDxkcPIxUW1ggUWuhJlsbP_kX8';

    const data = {
      input: {
        text: text,
      },
      voice: {
        languageCode: 'en-gb',
        name: 'en-GB-Standard-B',
        ssmlGender: 'MALE',
      },
      audioConfig: {
        audioEncoding: 'MP3',
      },
    };
    const otherparam = {
      headers: {
        'content-type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify(data),
      method: 'POST',
    };
    console.log('tts()');
    try {
      const response = await fetch(url, otherparam);
      const res = await response.json();
      console.log('tts() res=', res.audioContent);
      return res.audioContent;
    } catch (error) {
      console.error('tts()', error);
      return null;
    }
  };

  const sampleApiCall = async () => {
    try {
      const url = 'https://www.google.com';
      const response = await axios.get(url);
      const data = response?.status;
      console.log(JSON.stringify(data, null, 4));
    } catch (e) {
      console.log('sampleApiCall:', JSON.stringify(e, null, 4));
    }
  };

  const upload = async (fileName, fileDirectory) => {
    const chunkSize = 1024 * 1024; // Chunk size in bytes
    const url = endpoints.voicemail.uploadfile;
    const filePath = fileDirectory + '/' + fileName;

    try {
      const fileExists = await RNFS.stat(filePath);
      if (fileExists) {
        console.log('file exists');
        console.log('upload(): filePath=', filePath);
        const fileSize = fileExists.size;
        console.log('file size=', fileSize);
        const totalChunks = Math.ceil(fileSize / chunkSize);
        console.log('totalChunks=', totalChunks);

        let offset = 0;
        let chunkIndex = 0;

        while (offset < fileSize) {
          const chunkData = await RNFS.read(
            filePath,
            chunkSize,
            offset,
            'base64',
          );
          // Process the chunk as needed, for example, send it to a server or perform operations

          const formData = new FormData();
          formData.append('fileName', fileName);
          formData.append('chunkData', chunkData);
          formData.append('chunkIndex', chunkIndex);
          formData.append('totalChunks', totalChunks);

          console.log('sending chunk:', chunkIndex);
          const res = await axios.post(url, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          if (res.status === 200) {
            console.log('chunk sent successfully');
          }
          offset += chunkSize;
          chunkIndex++;
        }
      }
    } catch (error) {
      console.error('Error sending audio file:', jsonDisp(error));
    }
  };

  const getDownloadFileUrl = fileName =>
    `${endpoints.voicemail.downloadFile}?fileName=${fileName}`;

  const _downloadFile = (fromUrl, toFile) => {
    return RNFS.downloadFile({
      fromUrl,
      toFile,
      progress: res => {
        // Handle download progress updates if needed
        const progress = (res.bytesWritten / res.contentLength) * 100;
        console.log(`downloadFile(): Progress: ${progress.toFixed(2)}%`);
      },
    }).promise;
  };

  const downloadFiles = async (filePaths, fileDirectory) => {
    console.log('downloadFiles() filePaths=', filePaths);
    const downloadPromises = filePaths.map(filePath => {
      const url = getDownloadFileUrl(filePath);
      const localfilepath = fileDirectory + '/' + filePath;
      return _downloadFile(url, localfilepath).catch(error => {
        console.error('Download error for file ' + filePath + ':', error);
        return null; // or handle the error as needed
      });
    });

    try {
      const results = await Promise.all(downloadPromises);
      console.log('downloadFiles() All files downloaded', results);
      // Handle the downloaded files
    } catch (error) {
      console.error('downloadFiles() Download error:', error);
    }
  };

  const downloadFile = async (fileName, fileDirectory, cb) => {
    try {
      const url = getDownloadFileUrl(fileName);
      const localfilepath = fileDirectory + '/_' + fileName;
      console.log('downloadFile(): localfilepath:', localfilepath);

      await RNFS.downloadFile({
        fromUrl: url,
        toFile: localfilepath,
        progress: res => {
          // Handle download progress updates if needed
          const progress = (res.bytesWritten / res.contentLength) * 100;
          console.log(`downloadFile(): Progress: ${progress.toFixed(2)}%`);
        },
      })
        .promise.then(r => {
          console.log('downloadFile() r=', r);
          cb(true);
        })

        .catch(e => {
          console.error('Error downloading file:', e);
          cb(false);
        });
    } catch (error) {
      console.error('Error downloading file:', error);
      cb(false);
    }
  };

  const listAllVoicemails = async () => {
    try {
      console.log('listAllVoicemails()');
      const url = endpoints.voicemail.getAllVoicemails;
      const response = await axios.get(url);
      console.log('listAllVoicemails() response=', response);
      const data = response?.data;
      console.log(jsonDisp(data));
      return data;
    } catch (error) {
      console.error('listAllVoicemails() Error:', error);
      return null;
    }
  };

  const getTopVideoIdsFromArtist = async artistName => {
    try {
      console.log('getTopVideoIdsFromArtist()');
      const YOUTUBE_KEY = 'AIzaSyDRopxcwMb3OG_380CmBAI7Ak4RUnr2YFs';
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${artistName}&type=video&key=${YOUTUBE_KEY}`;
      const response = await axios.get(url);
      console.log('getTopVideoIdsFromArtist() response=', response);
      const data = response?.data?.items || [];
      const videoIds = data.map(d => d?.id?.videoId) || [];
      const topVideoIds = videoIds.slice(0, 5);
      console.log('getTopVideoIdsFromArtist() data=', jsonDisp(data));
      console.log('getTopVideoIdsFromArtist() topVideoIds=', topVideoIds);
      return topVideoIds;
    } catch (error) {
      console.error('getTopVideoIdsFromArtist() Error:', error);
      return null;
    }
  };

  const getArtistBasedOnLocation = async (
    location = 'California',
    country = 'United States',
  ) => {
    try {
      console.log('getArtistBasedOnLocation()');
      const url = endpoints.song.getArtists;
      console.log('getArtistBasedOnLocation() url=', url);
      const response = await axios.get(url, {
        params: {
          q: location,
          fl: country,
        },
      });
      console.log('getArtistBasedOnLocation() response=', jsonDisp(response));
      const data = response?.data?.artists;
      const artistsArr = data.split('###');
      console.log(jsonDisp(artistsArr));
      return artistsArr;
    } catch (error) {
      console.error('getArtistBasedOnLocation() Error:', jsonDisp(error));
      return [];
    }
  };

  const getDrivingScore = async (peaks = 5, currentSpeed = 25) => {
    try {
      console.log('getDrivingScore()');
      const roadCondition =
        _cw === (CognitiveWorkloadType.NCW || _cw === CognitiveWorkloadType.HCW)
          ? 1
          : 0;
      const url = endpoints.fuel.drivingscore;
      console.log('getDrivingScore() url=', url);
      const response = await axios.get(url, {
        params: {
          peak: peaks,
          roadCondition: roadCondition,
          speed: currentSpeed,
        },
      });
      console.log('getDrivingScore() response=', jsonDisp(response));
      const data = response?.data;
      console.log(jsonDisp(data));
      return data.driving_score;
    } catch (error) {
      console.error('getDrivingScore() Error:', jsonDisp(error));
      return [];
    }
  };

  return {
    upload,
    sampleApiCall,
    downloadFile,
    listAllVoicemails,
    downloadFiles,
    tts,
    getTopVideoIdsFromArtist,
    getArtistBasedOnLocation,
    doCollisionCheck,
    getDrivingScore,
  };
}
