import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, Card } from 'react-native-paper';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { createEncounter, transcribeEncounterAudio, uploadDiagnostic } from '../api';

export default function EncounterScreen({ route, navigation }) {
  const { patientId, token } = route.params;
  const [recording, setRecording] = useState(null);
  const [soapNote, setSoapNote] = useState('');
  const [triageScore, setTriageScore] = useState('');
  const [spO2, setSpO2] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [systolic, setSystolic] = useState('');
  const [age, setAge] = useState('');
  const [pregnant, setPregnant] = useState(false);
  const [message, setMessage] = useState('');

  const startRecording = async () => {
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
    if (!recording) return;
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);

    try {
      const created = await createEncounter(token, {
        patient: { id: patientId },
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
      navigation.navigate('Patients', { token });
    } catch (err) {
      setMessage(err.message);
    }
  };

  const captureImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      setMessage('Camera permission denied');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7, base64: false });
    if (!result.cancelled) {
      try {
        const created = await createEncounter(token, {
          patient: { id: patientId },
          spo2: parseInt(spO2, 10) || null,
          heartRate: parseInt(heartRate, 10) || null,
          systolic: parseInt(systolic, 10) || null,
          age: parseInt(age, 10) || null,
          pregnant,
        });
        const diagnostic = await uploadDiagnostic(token, created.id, result.uri, 'retina');
        setMessage(`Diagnostic saved: ${diagnostic.prediction} (${diagnostic.confidence})`);
      } catch (err) {
        setMessage(err.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>New Encounter</Text>
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
      <Button mode="contained" style={styles.saveButton} onPress={() => navigation.navigate('Patients', { token })}>
        Back to Patients
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  card: {
    marginBottom: 10,
  },
  saveButton: {
    marginTop: 20,
  },
  input: {
    marginBottom: 10,
  },
  message: {
    color: 'green',
    marginVertical: 10,
    paddingHorizontal: 10,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  card: {
    marginBottom: 10,
  },
  saveButton: {
    marginTop: 20,
  },
});