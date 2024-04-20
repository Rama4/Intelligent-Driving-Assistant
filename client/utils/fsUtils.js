import RNFS from 'react-native-fs';
import {FileDirectory} from './constants';

export const createNewFolder = async (path, folderName) => {
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

export const getFilesInFolder = async folderPath => {
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

export const getFileCreationDate = async filePath => {
  try {
    const stats = await RNFS.stat(filePath);
    return stats.ctime; // This is the creation date of the file
  } catch (error) {
    console.error(error);
    return new Date().getTime();
  }
};

export function getFilePath(filename) {
  FileDirectory + '/' + filename;
}
