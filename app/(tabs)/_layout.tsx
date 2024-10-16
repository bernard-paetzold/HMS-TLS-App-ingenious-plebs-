import { Stack, Tabs } from "expo-router"
import { Text, TouchableOpacity, View, Alert } from "react-native";
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
    return (
        <Tabs>
            <Tabs.Screen
                name="index"
                options={{
                    headerLeft: () => <></>,
                    headerShown: false,
                    title: "Logout",
                    href: null,
                }}
            />
            <Tabs.Screen
                name="home"
                options={{
                    headerLeft: () => <></>,
                    headerShown: false,
                    title: "Home",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" color={color} size={size} />
                    )
                }}
            />
            <Tabs.Screen
                name="assignments"
                options={{
                    headerLeft: () => <></>,
                    headerShown: false,
                    title: "Assignments",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="document-text-outline" color={color} size={size} />
                    ),
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
                    title: "Videos",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="videocam-outline" color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    headerLeft: () => <></>,
                    headerShown: false,
                    title: "Profile",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" color={color} size={size} />
                    )
                }}
            />
        </Tabs>
    )
}