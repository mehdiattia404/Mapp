import { registerRootComponent } from 'expo';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Explore from './explore';

const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Explore" component={Explore} />
        {/* You can add more screens here */}
      </Tab.Navigator>
    </NavigationContainer>
  );
};

registerRootComponent(App);

