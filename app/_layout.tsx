// app/_layout.tsx
import { Stack } from 'expo-router';

const Layout = () => {
    return (
        <Stack>
            <Stack.Screen name="login" options={{ headerShown: false }} /> {/* Set login as the first screen */}
            <Stack.Screen name="home" options={{ headerShown: true }} />
        </Stack>
    );
};

export default Layout;
