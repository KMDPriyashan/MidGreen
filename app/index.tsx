import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const App = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello React Native!</Text>
      <Text style={styles.text}>This is my first app</Text>
      <Text style={styles.text}>📱 Mobile App</Text>
      <Text style={styles.text}>✅ Working properly</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2ecc71',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
});

export default App;