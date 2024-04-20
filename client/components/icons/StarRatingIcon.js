import React from 'react';
import {StyleSheet} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';

export const StarRatingIcon = () => {
  return (
    <MaterialIcons name="star-border" size={32} style={styles.starUnselected} />
    // <svg
    //   // className={className}
    //   width="22"
    //   height="22"
    //   viewBox="0 0 22 22"
    //   fill="none"
    //   xmlns="http://www.w3.org/2000/svg">
    //   <path
    //     d="M11 0C8.08273 0 5.28462 1.15898 3.2219 3.2219C1.15898 5.28462 0 8.08249 0 11C0 13.9175 1.15898 16.7154 3.2219 18.7781C5.28462 20.841 8.08249 22 11 22C13.9175 22 16.7154 20.841 18.7781 18.7781C20.841 16.7154 22 13.9175 22 11C22 8.08249 20.841 5.28462 18.7781 3.2219C16.7154 1.15898 13.9175 0 11 0ZM15.6549 17.53L11 14.7883L6.3451 17.53L7.48328 12.0573L3.46598 8.67233L8.90124 8.04002L11 3.19672L13.4216 8.04002L18.5339 8.68041L14.5194 12.0545L15.6549 17.53Z"
    //     fill={color ?? '#FBB038'}
    //   />
    // </svg>
  );
};

const styles = StyleSheet.create({
  stars: {
    display: 'flex',
    flexDirection: 'row',
  },
  starUnselected: {
    color: '#aaa',
  },
});
