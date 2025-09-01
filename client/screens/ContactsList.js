import React, {useEffect, useState, useCallback} from 'react';
import {FlatList, View, Text, StyleSheet, Pressable} from 'react-native';
import Contacts from 'react-native-contacts';
import {PermissionsAndroid} from 'react-native';
import Button from '../components/shared/Button';
import {useSelector, useDispatch} from 'react-redux';
import {
  selectEmergencyContacts,
  updateContacts,
} from '../redux/slices/emergencyContactsSlice';

const ContactsList = ({navigation}) => {
  const dispatch = useDispatch();
  const [contacts, setContacts] = useState([]);
  const [selectedSymptom, setSelectedSymptom] = useState(-1);
  const emergencyContacts = useSelector(selectEmergencyContacts);

  useEffect(() => {
    getAllContacts();
  }, []);

  useEffect(() => {
    console.log('emergencyContacts=', emergencyContacts);
  }, [emergencyContacts]);

  const onSymptomPress = (contact, index) => {
    console.log('selected contact contact', contact);
    setSelectedSymptom(index);
    if (contact?.phoneNumbers?.length) {
      for (const phoneNumber of contact?.phoneNumbers) {
        if (phoneNumber?.number?.length >= 10) {
          dispatch(updateContacts(phoneNumber?.number));
          return;
        }
      }
    } else {
      console.error('contact doesnt have phone number');
    }
  };

  const renderContact = useCallback(
    (contact, index) => {
      // console.log('contact details=', contact);
      return (
        <Pressable
          style={
            index !== selectedSymptom
              ? styles.symptomListButton
              : styles.symptomListButtonSelected
          }
          key={index}
          onPress={() => onSymptomPress(contact, index)}>
          <View style={styles.contactCon}>
            <View style={styles.imgCon}>
              <View style={styles.placeholder}>
                <Text style={styles.txt}>
                  {contact?.givenName[0] || 'unknown'}
                </Text>
              </View>
            </View>
            <View style={styles.contactDat}>
              <Text style={styles.name}>
                {contact?.givenName || ' '}
                {contact?.middleName && contact?.middleName + ' '}
                {contact?.familyName || ' '}
              </Text>
              <Text style={styles.phoneNumber}>
                {contact?.phoneNumbers[0]?.number || ''}
              </Text>
            </View>
          </View>
        </Pressable>
      );
    },
    [selectedSymptom],
  );

  const getAllContacts = async () => {
    try {
      console.log('contacts init');
      let status = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
      );
      if (status === 'denied' || status === 'never_ask_again') {
        console.error('Permissions not granted to access Contacts');
      } else {
        console.log('getting all contacts');
        Contacts.getAll().then(c => {
          setContacts(c);
          console.log('received contacts list');
          // for (let contact of contacts) {
          //   console.log(JSON.stringify(contact, null, 4));
          // }
          // console.error(err);
        });
      }
    } catch (e) {
      console.error('getAllContacts', e);
    }
  };

  const keyExtractor = (item, idx) => {
    return item?.recordID?.toString() || idx.toString();
  };
  const renderItem = ({item, index}) => {
    return renderContact(item, index);
  };

  const separator = () => {
    //add a seperator component for each item with green color:
    return <View style={styles.separator} />;
  };

  const onDone = () => {
    console.log('contact selection done');
    navigation.goBack();
  };
  return (
    <View style={styles.view}>
      <View style={styles.button}>
        <Text style={styles.txt}>Choose one emergency contact</Text>
        {/* <Button
          // style={styles.button}
          title="sync contacts"
          onPress={getAllContacts}
        /> */}
      </View>
      <FlatList
        data={contacts}
        renderItem={renderItem}
        style={styles.list}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={separator}
        persistentScrollbar={true}
        extraData={contacts}
      />
      <View style={styles.button}>
        <Button title="done" onPress={onDone} />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  view: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
    paddingHorizontal: 10,
    // backgroundColor: 'yellow',
    // height: '100%',
    // minHeight: '100%',
  },
  button: {
    borderTopWidth: 2,
    paddingTop: 10,
    paddingBottom: 5,
  },
  separator: {
    borderBottomColor: 'gray',
    borderBottomWidth: 2,
  },
  symptomListButton: {
    backgroundColor: '#eee',
    // height: 50,
  },
  symptomListButtonSelected: {
    backgroundColor: '#777',
    color: 'white',
    // height: 50,
  },
  list: {
    flex: 1,
  },
  contactCon: {
    flex: 1,
    flexDirection: 'row',
    padding: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: '#d9d9d9',
  },
  imgCon: {},
  placeholder: {
    width: 55,
    height: 55,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#d9d9d9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactDat: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 5,
  },
  txt: {
    fontSize: 18,
    color: 'black',
  },
  name: {
    fontSize: 16,
    color: 'black',
  },
  phoneNumber: {
    color: 'black',
  },
});
export default ContactsList;
