// import React, {useState, useRef} from 'react';
// import {View, StyleSheet} from 'react-native';
// import Button from './Button';
// import Video from 'react-native-video';

// export default function VideoPlay() {
//   const video = useRef(null);
//   const [isVideoPaused, setIsVideoPaused] = useState(false);

//   const renderCapturedVideo = () => {
//     {
//       <>
//         {record && (
//           <Video
//             ref={video}
//             style={styles.video}
//             source={{
//               uri: record,
//             }}
//             useNativeControls
//             resizeMode="contain"
//             paused={isVideoPaused}
//             onPlaybackStatusUpdate={status =>
//               console.log('onPlaybackStatusUpdate:', status)
//             }
//           />
//         )}
//         <View style={styles.buttonHalfContainer}>
//           <Button
//             title={!isVideoPaused ? 'Pause' : 'Play'}
//             onPress={() => setIsVideoPaused(_isVideoPaused => !_isVideoPaused)}
//           />
//         </View>
//       </>;
//     }
//   };
// }

// const styles = StyleSheet.create({
//   video: {
//     flex: 1,
//   },

//   buttonHalfContainer: {
//     flex: 1,
//   },
// });
