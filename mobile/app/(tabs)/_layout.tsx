import { Tabs } from 'expo-router';
import { Home, BookOpen, Award, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../src/constants/theme';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          minHeight: 60 + insets.bottom,
          paddingBottom: Math.max(8, insets.bottom),
          paddingTop: 8,
          backgroundColor: COLORS.white,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Bosh sahifa',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="my-courses"
        options={{
          title: 'Mening kurslarim',
          tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="certificates"
        options={{
          title: 'Sertifikatlar',
          tabBarIcon: ({ color, size }) => <Award color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
