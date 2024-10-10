import { StackNavigationProp } from '@react-navigation/stack';

declare global {
    namespace ReactNavigation {
        interface RootParamList {
            HomeScreen: { first_name: string, last_name: string};
            LoginScreen: undefined;
            DemoScreen: undefined;
        }
    }
}