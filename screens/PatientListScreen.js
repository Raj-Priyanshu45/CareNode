import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { List, FAB, Text } from 'react-native-paper';
import { fetchPatients } from '../api';

export default function PatientListScreen({ navigation, route }) {
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState('');
  const token = route.params?.token;

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const data = await fetchPatients(token);
        setPatients(data);
      } catch (err) {
        setError(err.message);
      }
    };
    loadPatients();
  }, [token]);

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
      onPress={() => navigation.navigate('Encounter', { patientId: item.id, token })}
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Patients</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={patients}
        renderItem={renderPatient}
        keyExtractor={(item) => item.id}
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('Encounter', { token })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
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