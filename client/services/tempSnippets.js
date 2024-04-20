// const samplemp3upload = async () => {
//   try {
//     const url = endpoints.voicemail.uploadfile;
//     const fileName = 'taal.mp3';

//     const filePath = RNFS.DownloadDirectoryPath + '/' + fileName;
//     console.log('upload(): filePath=', filePath);
//     const audioFile = await RNFS.readFile(filePath, 'base64');

//     const formData = new FormData();
//     // formData.append('csrftoken', csrfToken());
//     formData.append('mp3_file', audioFile);

//     const res = await axios.post(url, formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });

//     console.log(res);
//   } catch (error) {
//     console.error('Error sending audio file:', error);
//   }
// };

// // create an array of objects of the files you want to upload

// // var upload
// // = (response) => {
// //   var jobId = response.jobId;
// //   console.log('UPLOAD HAS BEGUN! JobId: ' + jobId);
// // };

// // const uploadBegin = response => {
// //   const jobId = response.jobId;
// //   console.log('UPLOAD HAS BEGUN! JobId: ' + jobId);
// // };

// // const uploadProgress = response => {
// //   const percentage = Math.floor(
// //     (response.totalBytesSent / response.totalBytesExpectedToSend) * 100,
// //   );
// //   console.log('UPLOAD IS ' + percentage + '% DONE!');
// // };

// // const upload = async (files, fileDirectory) => {
// //   console.log('ffsfasfaef');
// //   const url = endpoints.voicemail.uploadfile;

// //   // upload files
// //   RNFS.uploadFiles({
// //     toUrl: url,
// //     files: files,
// //     method: 'POST',
// //     headers: {
// //       Accept: 'application/json',
// //     },
// //     begin: uploadBegin,
// //     progress: uploadProgress,
// //   })
// //     .promise.then(response => {
// //       if (response.statusCode == 200) {
// //         console.log('FILES UPLOADED!'); // response.statusCode, response.headers, response.body
// //       } else {
// //         console.log('SERVER ERROR');
// //       }
// //     })
// //     .catch(err => {
// //       if (err.description === 'cancelled') {
// //         // cancelled by user
// //       }
// //       console.error('upload', jsonDisp(err));
// //     });

// // };

// const readInChunks = async filePath => {
//   try {
//     const chunkSize = 1024 * 1024; // 1MB chunk size
//     const fileSize = await RNFS.stat(filePath).then(res => res.size);
//     let offset = 0;

//     while (offset < fileSize) {
//       const chunk = await RNFS.read(filePath, chunkSize, offset, 'base64');
//       // Process the chunk as needed, for example, send it to a server or perform operations
//       console.log('Read chunk:', chunk);
//       offset += chunkSize;
//     }
//   } catch (error) {
//     console.error('Error reading file:', error);
//   }
// };

// // const downloadFile = async (fileName, fileDirectory) => {
// //   const url = endpoints.voicemail.downloadFile;
// //   const response = await fetch(url);
// //   const fileData = await response.blob();

// //   const filePath = fileDirectory + '/' + fileName;
// //   await RNFS.writeFile(filePath, fileData, 'base64');

// //   console.log('File downloaded successfully');
// // };

// const downloadFile2 = async (fileName, fileDirectory) => {
//   try {
//     const url = endpoints.voicemail.downloadFile;
//     const localfilepath = fileDirectory + '/' + fileName;
//     console.log('downloadFile(): localfilepath:', localfilepath);
//     const downloadResult = await axios.get(url, {
//       responseType: 'arraybuffer',
//     });
//     console.log('downloadFile(): response:', downloadResult);
//     // Convert the ArrayBuffer to a Buffer (Node.js Buffer, not the Web API Buffer)

//     await RNFS.writeFile(localfilepath, downloadResult.data);

//     if (downloadResult.status === 200) {
//       console.log('File downloaded to:', localfilepath);
//     } else {
//       console.error('Failed to download file');
//     }
//   } catch (error) {
//     console.error('Error downloading file:', error);
//   }
// };

// const _saveFile = (data, cb) => {
//     try {
//       const audioData = data;
//       console.log('saveFile() typeof audioData=', typeof audioData);
//       // console.log('audioData=', audioData);
//       const fileName = `${uuidv4()}.mp3`;
//       const filePath = `${SentVmsFolderPath}/${fileName}`;
//       RNFS.writeFile(filePath, audioData, 'base64')
//         .then(() => {
//           console.log('Speech saved to', filePath);
//           // Play the speech or perform other actions
//           cb(fileName);
//         })
//         .catch(error => {
//           console.error('Error saving speech:', error);
//           cb('');
//         });
//     } catch (e) {
//       console.error('saveFile():', e);
//       cb('');
//     }
//   };

const samplemp3upload = async () => {
  try {
    const url = endpoints.voicemail.uploadfile;
    const fileName = 'taal.mp3';

    const filePath = RNFS.DownloadDirectoryPath + '/' + fileName;
    console.log('upload(): filePath=', filePath);
    const audioFile = await RNFS.readFile(filePath, 'base64');

    const formData = new FormData();
    // formData.append('csrftoken', csrfToken());
    formData.append('mp3_file', audioFile);

    const res = await axios.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log(res);
  } catch (error) {
    console.error('Error sending audio file:', error);
  }
};

// create an array of objects of the files you want to upload

// var upload
// = (response) => {
//   var jobId = response.jobId;
//   console.log('UPLOAD HAS BEGUN! JobId: ' + jobId);
// };

// const uploadBegin = response => {
//   const jobId = response.jobId;
//   console.log('UPLOAD HAS BEGUN! JobId: ' + jobId);
// };

// const uploadProgress = response => {
//   const percentage = Math.floor(
//     (response.totalBytesSent / response.totalBytesExpectedToSend) * 100,
//   );
//   console.log('UPLOAD IS ' + percentage + '% DONE!');
// };

// const upload = async (files, fileDirectory) => {
//   console.log('ffsfasfaef');
//   const url = endpoints.voicemail.uploadfile;

//   // upload files
//   RNFS.uploadFiles({
//     toUrl: url,
//     files: files,
//     method: 'POST',
//     headers: {
//       Accept: 'application/json',
//     },
//     begin: uploadBegin,
//     progress: uploadProgress,
//   })
//     .promise.then(response => {
//       if (response.statusCode == 200) {
//         console.log('FILES UPLOADED!'); // response.statusCode, response.headers, response.body
//       } else {
//         console.log('SERVER ERROR');
//       }
//     })
//     .catch(err => {
//       if (err.description === 'cancelled') {
//         // cancelled by user
//       }
//       console.error('upload', jsonDisp(err));
//     });
// };

const readInChunks = async filePath => {
  try {
    const chunkSize = 1024 * 1024; // 1MB chunk size
    const fileSize = await RNFS.stat(filePath).then(res => res.size);
    let offset = 0;

    while (offset < fileSize) {
      const chunk = await RNFS.read(filePath, chunkSize, offset, 'base64');
      // Process the chunk as needed, for example, send it to a server or perform operations
      console.log('Read chunk:', chunk);
      offset += chunkSize;
    }
  } catch (error) {
    console.error('Error reading file:', error);
  }
};

// const downloadFile = async (fileName, fileDirectory) => {
//   const url = endpoints.voicemail.downloadFile;
//   const response = await fetch(url);
//   const fileData = await response.blob();

//   const filePath = fileDirectory + '/' + fileName;
//   await RNFS.writeFile(filePath, fileData, 'base64');

//   console.log('File downloaded successfully');
// };

const downloadFile2 = async (fileName, fileDirectory) => {
  try {
    const url = endpoints.voicemail.downloadFile;
    const localfilepath = fileDirectory + '/' + fileName;
    console.log('downloadFile(): localfilepath:', localfilepath);
    const downloadResult = await axios.get(url, {
      responseType: 'arraybuffer',
    });
    console.log('downloadFile(): response:', downloadResult);
    // Convert the ArrayBuffer to a Buffer (Node.js Buffer, not the Web API Buffer)

    await RNFS.writeFile(localfilepath, downloadResult.data);

    if (downloadResult.status === 200) {
      console.log('File downloaded to:', localfilepath);
    } else {
      console.error('Failed to download file');
    }
  } catch (error) {
    console.error('Error downloading file:', error);
  }
};

const ___tts = () => {
  return new Promise((resolve, reject) => {
    const url =
      'https://texttospeech.googleapis.com/v1/text:synthesize?key=AIzaSyAJI80z3GDxkcPIxUW1ggUWuhJlsbP_kX8';
    const location = 'Phoenix';
    const time = '30 minutes';
    const text = `Hi, I am currently driving in ${location} and unable to take your call. I will call you back after I reach my destination in ${time}. Thank you for your understanding.`;

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
    fetch(url, otherparam)
      .then(data => {
        return data.json();
      })
      .then(res => {
        console.log('tts() res=', res.audioContent);
        resolve(res.audioContent);
      })
      .catch(error => {
        console.error('tts()', error);
        resolve(null);
      });
  });
};

const __tts = cb => {
  const url = 'url';

  const location = 'Phoenix';
  const time = '30 minutes';
  const text = `Hi, I am currently driving in ${location} and unable to take your call. I will call you back after I reach my destination in ${time}. Thank you for your understanding.`;

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
  fetch(url, otherparam)
    .then(data => {
      return data.json();
    })
    .then(res => {
      console.log('tts() res=', res.audioContent);
      cb(res.audioContent);
    })
    .catch(error => {
      console.error('tts()', error);
      cb(null);
    });
};

// const getText = (name, location, time) => {
//   text1 = ;
//   return text1;
// };

const _tts = async () => {
  try {
    console.log('tts()');
    const name = 'Rama';
    const location = 'Phoenix';
    const time = '30 minutes';
    const text = 'This is Rama';
    // const text = `Hi, this is ${name}. I am currently driving in ${location} and unable to take your call. I will call you back after I reach my destination in ${time}. Thank you for your understanding.`;
    // const text = getText('Rama', 'Phoenix', '30 minutes');
    console.log('text=', text);
    const apiKey = 'AIzaSyAJI80z3GDxkcPIxUW1ggUWuhJlsbP_kX8'; // Replace with your API key
    const url =
      'https://texttospeech.googleapis.com/v1/text:synthesize?key=' + apiKey;

    const data = {
      input: {text: text},
      voice: {
        languageCode: 'en-US',
        name: 'en-US-Standard-B',
        ssmlGender: 'MALE',
      },
      audioConfig: {audioEncoding: 'MP3'},
    };
    const res = await axios.post(url, data, {responseType: 'arraybuffer'});
    // const res = null;
    console.log('tts() res=', res?.request?._response);
    return res?.request?._response || '';
  } catch (e) {
    console.error('tts():', e);
    return null;
  }
};

const __saveFile = data => {
  return new Promise((resolve, reject) => {
    try {
      const audioData = data;
      console.log('saveFile() typeof audioData=', typeof audioData);
      const fileName = `${uuidv4()}.mp3`;
      const filePath = `${SentVmsFolderPath}/${fileName}`;
      RNFS.writeFile(filePath, audioData, 'base64')
        .then(() => {
          console.log('Speech saved to', filePath);
          resolve(fileName);
        })
        .catch(error => {
          console.error('Error saving speech:', error);
          resolve('');
        });
    } catch (e) {
      console.error('saveFile():', e);
      resolve('');
    }
  });
};
