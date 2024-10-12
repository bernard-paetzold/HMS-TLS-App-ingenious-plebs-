import { Text, View, StyleSheet, Alert, TextInput, Button } from "react-native";

export default function notFound(){
    return (
        <View style={styles.title}>
            <Text style={styles.title}>Page not found</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    title: {
        fontSize: 24,
        marginBottom: 24,
        textAlign: 'center',
        fontWeight: 'bold',
        color: 'white',
    }
});
