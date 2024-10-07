import { Stack } from "expo-router";
import { View, Text, StyleSheet } from "react-native";

export default function RootLayout() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>NWU</Text>
      </View>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 60, // Adjust the height of the bar as needed
    backgroundColor: '#000', // Black background
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    color: '#fff', // White text color
    fontSize: 20, // Adjust font size as needed
    fontWeight: 'bold',
  },
});