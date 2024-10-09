import { StackNavigationProp } from '@react-navigation/stack';

declare global {
    namespace ReactNavigation {
        interface RootParamList {
            HomeScreen: undefined;
            LoginScreen: undefined;
            DemoScreen: undefined;
        }
    }
}