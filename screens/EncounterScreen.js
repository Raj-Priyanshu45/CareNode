import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, Card } from 'react-native-paper';
import { Audio } from 'expo-av';
import { Camera } from 'expo-camera';

export default function EncounterScreen({ route }) {
  const { patientId } = route.params;
  const [recording, setRecording] = useState(null);
  const [soapNote, setSoapNote] = useState('');
  const [triageScore, setTriageScore] = useState('');

  const startRecording = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') return;

    const newRecording = new Audio.Recording();
    await newRecording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
    await newRecording.startAsync();
    setRecording(newRecording);
  };

  const stopRecording = async () => {
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    // Upload to AI service and get SOAP
    // setSoapNote(generatedSoap);
    setRecording(null);
  };

  const captureImage = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== 'granted') return;
    // Open camera and capture
    // Upload to AI service and get diagnostic
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>New Encounter</Text>
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
      <Button mode="contained" style={styles.saveButton}>
        Save Encounter
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
});