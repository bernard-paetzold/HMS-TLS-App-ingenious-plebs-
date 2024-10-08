import { Stack } from 'expo-router';

export default function App() {
    return (
        <Stack>
            <Stack.Screen name="(loginscreen)" options={{ headerShown: false }} />
            <Stack.Screen name="(homescreem)" options={{ headerShown: true }} />
        </Stack>
    );
}

