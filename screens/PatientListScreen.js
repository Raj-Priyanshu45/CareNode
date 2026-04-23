import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { List, FAB, Text } from 'react-native-paper';

export default function PatientListScreen({ navigation }) {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    // Fetch patients from API or local DB
    // setPatients(fetchedPatients);
  }, []);

  const renderPatient = ({ item }) => (
    <List.Item
      title={item.name}
      description={`ID: ${item.localId}`}
      onPress={() => navigation.navigate('Encounter', { patientId: item.id })}
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Patients</Text>
      <FlatList
        data={patients}
        renderItem={renderPatient}
        keyExtractor={(item) => item.id}
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {/* Add new patient */}}
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
});