import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { View, FlatList, StyleSheet } from 'react-native';
import { List, FAB, Text, Button } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider';
import { fetchPatients, logout as apiLogout } from '../api';
import { logout } from '../store/authSlice';
import { registerBackgroundSync } from '../app/backgroundSync';

function PatientListScreen({ navigation, database }) {
  const dispatch = useDispatch();
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState('');
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    registerBackgroundSync();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const patientsCollection = database.collections.get('patients');
      const observePatients = patientsCollection.query().observe();

      const subscription = observePatients.subscribe(data => {
        setPatients(data);
      });

      const loadAndSyncPatients = async () => {
        try {
          await fetchPatients(token);
        } catch (err) {
          setError(err.message);
        }
      };
      loadAndSyncPatients();

      return () => subscription.unsubscribe();
    }, [token, database])
  );

  const handleLogout = async () => {
    try {
      await apiLogout(token);
    } catch (err) {
      console.warn('Logout failed', err);
    } finally {
      dispatch(logout());
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    }
  };

  const getPatientTitle = (item) => {
    try {
      const parsed = typeof item.fhirResource === 'string' ? JSON.parse(item.fhirResource) : item.fhirResource;
      if (parsed?.name?.length) {
        return parsed.name[0].text || parsed.name[0].family || item.localId;
      }
    } catch (error) {
      // ignore parse error
    }
    return item.localId;
  };

  const renderPatient = ({ item }) => (
    <List.Item
      title={getPatientTitle(item)}
      description={`ID: ${item.localId}`}
      onPress={() => navigation.navigate('Encounter', { patientId: item.id })}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Patients</Text>
        <Button mode="outlined" compact onPress={handleLogout}>
          Logout
        </Button>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={patients}
        renderItem={renderPatient}
        keyExtractor={(item) => item.id}
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('Encounter')}
      />
    </View>
  );
}

export default withDatabase(PatientListScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 10,
  },
  title: {
    fontSize: 20,
    textAlign: 'left',
    marginVertical: 10,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  error: {
    color: 'red',
    paddingHorizontal: 16,
  },
});