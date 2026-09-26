import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts } from "../lib/theme";
import { useCart } from "../lib/cart-context";
import { useAuth } from "../lib/auth-context";
import { fetchUnreadCount } from "../lib/notifications";

const POLL_MS = 30_000;

export default function Header({ navigation }: any) {
  const { count } = useCart();
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    fetchUnreadCount().then(setUnread);
    const interval = setInterval(() => fetchUnreadCount().then(setUnread), POLL_MS);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.bar}>
        <Text style={styles.logo}>
          Smart<Text style={{ color: colors.navAccent }}>Click</Text>
        </Text>

        <View style={styles.icons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation?.navigate("Search")}>
            <Ionicons name="search" size={17} color={colors.navText} />
          </TouchableOpacity>
          {user && (
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation?.navigate("Notifications")}>
              <Ionicons name="notifications-outline" size={18} color={colors.navText} />
              {unread > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unread > 9 ? "9+" : unread}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation?.navigate("Wishlist")}>
            <Ionicons name="heart-outline" size={18} color={colors.navText} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, styles.cartButton]}
            onPress={() => navigation?.getParent()?.navigate("Cart")}
          >
            <Ionicons name="bag-outline" size={17} color={colors.navBg} />
            {count > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{count}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.navBg },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  logo: { fontFamily: fonts.display, fontSize: 19, color: colors.navText },
  icons: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.navMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  cartButton: { backgroundColor: colors.navAccent, borderWidth: 0 },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: colors.navAccent,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: { fontFamily: fonts.bodyBold, fontSize: 9, color: colors.navBg },
  cartBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: colors.white,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  cartBadgeText: { fontFamily: fonts.bodyBold, fontSize: 9, color: colors.navBg },
});