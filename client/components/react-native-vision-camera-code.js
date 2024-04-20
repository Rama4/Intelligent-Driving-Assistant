// const capturePhoto = async () => {
//   if (camera.current !== null) {
//     const photo = await camera.current.takePhoto({});
//     setImageSource(photo.path);
//     setShowCamera(false);
//     console.log(photo.path);
//   }
// };

// const pauseVideo = async () => {
//   if (camera.current !== null) {
//     if (cameraState === CameraState.recording) {
//       await camera.current.pauseRecording();
//       setCameraState(CameraState.paused);
//     } else if (cameraState === CameraState.paused) {
//       await camera.current.resumeRecording();
//       setCameraState(CameraState.recording);
//     }
//   }
// };

// const captureVideo = async () => {
//   if (camera.current !== null) {
//     // setShowCamera(false);
//     camera.current.startRecording({
//       flash: 'off',
//       onRecordingFinished: video => console.log(video),
//       onRecordingError: error => console.error(error),
//     });
//     setCameraState(CameraState.recording);
//   }
// };

// const renderRecordingVideo = () => {
//   return (
//     <View>
//       <Camera
//         ref={camera}
//         style={[styles.camera, styles.photoAndVideoCamera]}
//         device={camera}
//         isActive
//         video
//       />
//       <View style={styles.btnGroup}>
//         <TouchableOpacity style={styles.btn} onPress={captureVideo}>
//           <Text style={styles.btnText}>Record Video</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={{...styles.btn}} onPress={stopVideo}>
//           <Text style={styles.btnText}>Stop Video</Text>
//         </TouchableOpacity>
//       </View>
//
//     </View>
//   );
// };

// const onInitialized = useCallback(() => {
//   console.log('Camera initialized!');
//   setIsCameraInitialized(true);
// }, []);

// const onError = useCallback(error => {
//   console.error(error);
// }, []);
