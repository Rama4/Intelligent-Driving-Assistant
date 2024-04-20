import React from 'react';
import {Text, StyleSheet, Pressable} from 'react-native';

export default function Button(props) {
  return (
    <Pressable
      style={[styles.button, props.disabled ? styles.disabledButton : null]}
      onPress={props?.onPress}
      {...props}>
      <Text style={[styles.text, props.disabled ? styles.disabledText : null]}>
        {props?.title ?? 'click me'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  disabledButton: {
    backgroundColor: 'gray',
    color: '#777',
  },
  disabledText: {
    color: 'lightgray',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: 'black',
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
  },
});
