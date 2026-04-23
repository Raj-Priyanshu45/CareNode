import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, Card } from 'react-native-paper';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider';
import { createEncounter, transcribeEncounterAudio, uploadDiagnostic, createPatient } from '../api';

function EncounterScreen({ route, navigation, database }) {
  const { patientId: paramPatientId } = route.params || {};
  const patientId = paramPatientId ?? null;
  const token = useSelector((state) => state.auth.token);
  const [recording, setRecording] = useState(null);
  const [soapNote, setSoapNote] = useState('');
  const [triageScore, setTriageScore] = useState('');
  const [spO2, setSpO2] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [systolic, setSystolic] = useState('');
  const [age, setAge] = useState('');
  const [pregnant, setPregnant] = useState(false);
  const [message, setMessage] = useState('');

  // Patient creation states
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('male');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAddress, setPatientAddress] = useState('');

  const startRecording = async () => {
    if (!patientId && !patientName) {
      setMessage('Please enter patient name first');
      return;
    }
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      setMessage('Audio permission denied');
      return;
    }

    const newRecording = new Audio.Recording();
    await newRecording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
    await newRecording.startAsync();
    setRecording(newRecording);
  };

  const stopRecording = async () => {
    if (!patientId && !patientName) {
      setMessage('Please enter patient name first');
      return;
    }
    if (!recording) return;
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);

    try {
      let currentPatientId = patientId;
      if (!currentPatientId) {
        // Create patient first
        const newPatient = await createPatient(token, {
          localId: `P${Date.now()}`,
          name: patientName,
          birthDate: new Date(Date.now() - parseInt(patientAge) * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          gender: patientGender,
          phone: patientPhone,
          address: patientAddress
        });
        currentPatientId = newPatient.id;
        setMessage('Patient created successfully');
      }

      const created = await createEncounter(token, {
        patient: { id: currentPatientId },
        spo2: parseInt(spO2, 10) || null,
        heartRate: parseInt(heartRate, 10) || null,
        systolic: parseInt(systolic, 10) || null,
        age: parseInt(age, 10) || null,
        pregnant,
      });
      const result = await transcribeEncounterAudio(token, created.id, uri);
      setSoapNote(JSON.stringify(result.soap, null, 2));
      setTriageScore(created.triageScore || 'Pending');
      setMessage('Audio transcribed and encounter saved');
      navigation.navigate('Patients');
    } catch (err) {
      setMessage(err.message);
    }
  };

  const captureImage = async () => {
    if (!patientId && !patientName) {
      setMessage('Please enter patient name first');
      return;
    }
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      setMessage('Camera permission denied');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ quality: 0.7, base64: false });
    if (!result.canceled && result.assets?.length > 0) {
      const uri = result.assets[0].uri;
      try {
        let currentPatientId = patientId;
        if (!currentPatientId) {
          // Create patient first
          const newPatient = await createPatient(token, {
            localId: `P${Date.now()}`,
            name: patientName,
            birthDate: new Date(Date.now() - parseInt(patientAge) * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            gender: patientGender,
            phone: patientPhone,
            address: patientAddress
          });
          currentPatientId = newPatient.id;
          setMessage('Patient created successfully');
        }

        const created = await createEncounter(token, {
          patient: { id: currentPatientId },
          spo2: parseInt(spO2, 10) || null,
          heartRate: parseInt(heartRate, 10) || null,
          systolic: parseInt(systolic, 10) || null,
          age: parseInt(age, 10) || null,
          pregnant,
        });
        const diagnostic = await uploadDiagnostic(token, created.id, uri, 'retina');
        setMessage(`Diagnostic saved: ${diagnostic.prediction} (${diagnostic.confidence})`);
      } catch (err) {
        setMessage(err.message);
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>New Encounter</Text>
      {patientId ? (
        <Text>Patient ID: {patientId}</Text>
      ) : (
        <Card style={styles.card}>
          <Card.Title title="Create New Patient" />
          <Card.Content>
            <TextInput
              label="Patient Name"
              value={patientName}
              onChangeText={setPatientName}
              style={styles.input}
            />
            <TextInput
              label="Age"
              value={patientAge}
              onChangeText={setPatientAge}
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              label="Gender"
              value={patientGender}
              onChangeText={setPatientGender}
              style={styles.input}
            />
            <TextInput
              label="Phone"
              value={patientPhone}
              onChangeText={setPatientPhone}
              keyboardType="phone-pad"
              style={styles.input}
            />
            <TextInput
              label="Address"
              value={patientAddress}
              onChangeText={setPatientAddress}
              style={styles.input}
            />
          </Card.Content>
        </Card>
      )}
      <Card style={styles.card}>
        <Card.Title title="Vitals" />
        <Card.Content>
          <TextInput
            label="SpO2"
            value={spO2}
            onChangeText={setSpO2}
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            label="Heart Rate"
            value={heartRate}
            onChangeText={setHeartRate}
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            label="Systolic"
            value={systolic}
            onChangeText={setSystolic}
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            label="Age"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            style={styles.input}
          />
          <Button mode="outlined" onPress={() => setPregnant(!pregnant)}>
            {pregnant ? 'Pregnant: Yes' : 'Pregnant: No'}
          </Button>
        </Card.Content>
      </Card>
      <Card style={styles.card}>
        <Card.Title title="Voice Recording" />
        <Card.Content>
          <Button
            mode="contained"
            onPress={recording ? stopRecording : startRecording}
          >
            {recording ? 'Stop Recording' : 'Start Recording'}
          </Button>
        </Card.Content>
      </Card>
      <Card style={styles.card}>
        <Card.Title title="SOAP Note" />
        <Card.Content>
          <TextInput
            value={soapNote}
            onChangeText={setSoapNote}
            multiline
            numberOfLines={4}
            placeholder="Generated SOAP note will appear here"
          />
        </Card.Content>
      </Card>
      <Card style={styles.card}>
        <Card.Title title="Image Diagnostic" />
        <Card.Content>
          <Button mode="contained" onPress={captureImage}>
            Capture Image
          </Button>
        </Card.Content>
      </Card>
      <Card style={styles.card}>
        <Card.Title title="Triage Score" />
        <Card.Content>
          <Text>{triageScore}</Text>
        </Card.Content>
      </Card>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <Button mode="contained" style={styles.saveButton} onPress={() => navigation.navigate('Patients')}>
        Back to Patients
      </Button>
    </ScrollView>
  );
}

export default withDatabase(EncounterScreen);

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 22, marginBottom: 12, fontWeight: 'bold' },
  card: { marginBottom: 12 },
  input: { marginBottom: 8 },
  message: { color: 'green', marginTop: 8, textAlign: 'center' },
  saveButton: { marginTop: 16 },
});