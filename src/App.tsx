import React, { useEffect, useRef } from 'react';
import { observer } from 'mobx-react';
import type { PropsWithChildren } from 'react';
import {
  Animated,
  Platform,
  AppState,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UpdateProvider, Pushy } from "react-native-update";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { RootSiblingParent } from 'react-native-root-siblings';
import SplashScreen from 'react-native-splash-screen'
import { useStores } from '@/store';
import MyWebView from '@/components/WebView';
import MiniPlayer from '@/components/MiniPlayer';
import Home from '@/pages/home';
import Login from '@/pages/login';
import MusicPlayer from '@/pages/musicPlayer';
import DevConfig from '@/pages/devConfig';
import _updateConfig from "../update.json";

const Stack = createNativeStackNavigator();
const { appKey } = _updateConfig[Platform.OS === 'android' ? 'android' : (Platform.OS === 'ios' ? 'ios' : "harmony")];

// 唯一必填参数是appKey，其他选项请参阅 api 文档
const pushyClient = new Pushy({
  appKey,
  updateStrategy: null,
  debug: true
});

const App = observer(() => {
  const {
    deviceStore: { connectDevice, disConnectDevice },
  } = useStores();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 页面切换动画
    Animated.timing(fadeAnim, {
      useNativeDriver: true,
      toValue: 1,
      duration: 1000,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    // 隐藏启动屏
    SplashScreen.hide()
    const subscription = AppState.addEventListener('change', async (nextAppState: string) => {
      if (nextAppState === 'background') {
        console.log('进入后台');
        // 断开连接
        disConnectDevice();
      }
      if (nextAppState === 'active') {
        console.log('进入前台');
        // 连接蓝牙
        // connectDevice();
      }
    });
    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <UpdateProvider client={pushyClient}>
      <RootSiblingParent>
        <SafeAreaProvider>
          <NavigationContainer>
            <Stack.Navigator
              // initialRouteName="HomeTabs"
              screenOptions={{
                title: '心启元',
                // headerTitleAlign: 'left',
                headerBackImageSource: require('@images/icons/icon-back.png'),
                headerShadowVisible: false,
              }}>
              <Stack.Screen name="Home" component={Home} initialParams={{ url: 'home' }} options={{ title: '检测', headerShown: false }} />
              <Stack.Screen name="Login" component={Login} options={{ title: '', headerTransparent: true }} />
              <Stack.Screen name="MusicPlayer" component={MusicPlayer} options={{ title: '' }} />
              <Stack.Screen name="DevConfig" component={DevConfig} />
              <Stack.Screen name="NewWebView" component={MyWebView} />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaProvider>
        <MiniPlayer />
        <Toast />
      </RootSiblingParent>
    </UpdateProvider>
  );
});

export default App;
