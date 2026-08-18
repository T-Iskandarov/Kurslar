import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { User, Lock, Bell, Globe, HelpCircle, LogOut, ChevronRight } from 'lucide-react-native';
import { COLORS, SIZES } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/authStore';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      "Tizimdan chiqish",
      "Haqiqatan ham tizimdan chiqmoqchimisiz?",
      [
        { text: "Yo'q", style: "cancel" },
        { 
          text: "Ha", 
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace('/(auth)');
          }
        }
      ]
    );
  };

  const menuItems = [
    { icon: User, title: "Shaxsiy ma'lumotlar", onPress: () => router.push('/settings' as any) },
    { icon: Lock, title: "Parolni o'zgartirish", onPress: () => router.push('/settings/password' as any) },
    { icon: Bell, title: "Bildirishnomalar", onPress: () => {} },
    { icon: Globe, title: "Til", value: "O'zbekcha", onPress: () => {} },
    { icon: HelpCircle, title: "Yordam va qo'llab-quvvatlash", onPress: () => router.push('/support') },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{user?.full_name?.charAt(0) || 'U'}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.full_name}</Text>
            <Text style={styles.userPhone}>{user?.phone}</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity 
                key={index} 
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <View style={styles.menuItemLeft}>
                  <Icon color={COLORS.textLight} size={22} style={styles.menuIcon} />
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                </View>
                <View style={styles.menuItemRight}>
                  {item.value && <Text style={styles.menuItemValue}>{item.value}</Text>}
                  <ChevronRight color={COLORS.textLight} size={20} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut color={COLORS.error} size={22} style={styles.menuIcon} />
          <Text style={styles.logoutText}>Chiqish</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.paddingLg,
    backgroundColor: COLORS.white,
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  menuContainer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 12,
  },
  menuItemTitle: {
    fontSize: 16,
    color: COLORS.text,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemValue: {
    fontSize: 14,
    color: COLORS.textLight,
    marginRight: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: SIZES.padding,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    marginTop: 24,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.error,
  }
});
