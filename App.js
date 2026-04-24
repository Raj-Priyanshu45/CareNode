// App.js
import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider, useDispatch, useSelector } from 'react-redux';
import { DatabaseProvider } from '@nozbe/watermelondb/DatabaseProvider';
import { store } from './store/store';
import { database } from './app/model';
import { loadPersistedToken } from './store/authSlice';
import LoginScreen from './screens/LoginScreen';
import PatientListScreen from './screens/PatientListScreen';
import EncounterScreen from './screens/EncounterScreen';

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