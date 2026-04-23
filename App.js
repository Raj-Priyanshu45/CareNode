import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { DatabaseProvider } from '@nozbe/watermelondb/DatabaseProvider';
import { store } from './store/store';
import { database } from './app/model';
import LoginScreen from './screens/LoginScreen';
import PatientListScreen from './screens/PatientListScreen';
import EncounterScreen from './screens/EncounterScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <ReduxProvider store={store}>
      <DatabaseProvider database={database}>
        <PaperProvider>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Patients" component={PatientListScreen} />
              <Stack.Screen name="Encounter" component={EncounterScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </PaperProvider>
      </DatabaseProvider>
    </ReduxProvider>
  );
}