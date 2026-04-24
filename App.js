// App.js
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider, useDispatch, useSelector } from 'react-redux';
import { DatabaseProvider } from '@nozbe/watermelondb/DatabaseProvider';
import { store } from './store/store';
import { loadPersistedToken } from './store/authSlice';
import LoginScreen from './screens/LoginScreen';
import PatientListScreen from './screens/PatientListScreen';
import EncounterScreen from './screens/EncounterScreen';

let database;
let databaseError = null;

try {
  const { database: db } = require('./app/model');
  database = db;
} catch (error) {
  databaseError = error;
  console.error('Database initialization error:', error);
}

const Stack = createStackNavigator();

function AppNavigator() {
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    // Rehydrate auth token from AsyncStorage on first render
    dispatch(loadPersistedToken());
  }, [dispatch]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isAuthenticated ? 'Patients' : 'Login'}>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Patients" component={PatientListScreen} options={{ title: 'CareNode' }} />
        <Stack.Screen name="Encounter" component={EncounterScreen} options={{ title: 'New Encounter' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  if (databaseError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' }}>
            Database Error
          </Text>
          <Text style={{ fontSize: 14, color: 'red', textAlign: 'center' }}>
            {databaseError.message}
          </Text>
          <Text style={{ fontSize: 12, marginTop: 20, textAlign: 'center', color: '#666' }}>
            {databaseError.stack}
          </Text>
        </ScrollView>
      </View>
    );
  }

  if (!database) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Initializing Database...</Text>
      </View>
    );
  }

  return (
    <ReduxProvider store={store}>
      <DatabaseProvider database={database}>
        <PaperProvider>
          <AppNavigator />
        </PaperProvider>
      </DatabaseProvider>
    </ReduxProvider>
  );
}