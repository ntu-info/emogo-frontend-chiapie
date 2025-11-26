import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="survey" options={{ title: 'Survey' }} />
      <Tabs.Screen name="vlog" options={{ title: 'Vlog', headerShown: false }} />
      <Tabs.Screen name="export" options={{ title: 'Export' }} />
    </Tabs>
  );
}
