import { Stack, Tabs } from "expo-router"
import { Text, TouchableOpacity, View, Alert } from "react-native";

export default function TabLayout() {
    return (
        <Tabs>
            <Tabs.Screen
                name="index"
                options={{
                    headerLeft: () => <></>,
                    headerShown: false,
                    title: "Logout",
                }}
            />
            <Tabs.Screen
                name="home"
                options={{
                    headerLeft: () => <></>,
                    headerShown: false,
                    title: "Home"
                }}
            />
            <Tabs.Screen
                name="assignments"
                options={{
                    headerLeft: () => <></>,
                    headerShown: false,
                    title: "Assignments"
                }}
            />
            <Tabs.Screen
                name="assignment_detail"
                options={{
                    headerLeft: () => <></>,
                    headerShown: false,
                    title: "Assignment Detail",
                    href: null,
                }}
            />
            <Tabs.Screen
                name="recordvideo"
                options={{
                    headerLeft: () => <></>,
                    headerShown: false,
                    title: "Videos"
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    headerLeft: () => <></>,
                    headerShown: false,
                    title: "Profile"
                }}
            />
        </Tabs>
    )
}