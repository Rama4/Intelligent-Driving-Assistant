import RNFS from 'react-native-fs';

export const vmsFolderName = 'vms';
export const SentFolderName = 'VmsSent';
export const fileDirectory = `${RNFS.DownloadDirectoryPath}/${vmsFolderName}`;
export const SentVmsFolderPath = `${RNFS.DownloadDirectoryPath}/${SentFolderName}`;

export const stringWithoutSpaces = str => {
  return str.replace(/\s/g, '');
};

export const TrafficConditionType = {
  SPEED_UNSPECIFIED: 'SPEED_UNSPECIFIED',
  NORMAL: 'NORMAL',
  SLOW: 'SLOW',
  TRAFFIC_JAM: 'TRAFFIC_JAM',
};
export const CognitiveWorkloadType = {
  LCW: 'LCW',
  HCW: 'HCW',
  NCW: 'NCW',
};
