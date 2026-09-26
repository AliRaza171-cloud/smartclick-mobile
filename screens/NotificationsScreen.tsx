import { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { fetchNotifications, markRead, markAllRead, Notification } from "../lib/notifications";
import { colors, fonts } from "../lib/theme";

export default function NotificationsScreen({ navigation }: any) {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    fetchNotifications().then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", load);
    return unsubscribe;
  }, [navigation, load]);

  async function handlePress(n: Notification) {
    if (!n.is_read) {
      await markRead(n.id);
      setItems((prev) => prev.map((i) => (i.id === n.id ? { ...i, is_read: true } : i)));
    }
    if (n.link?.startsWith("/product/")) {
      const id = n.link.split("/product/")[1];
      navigation.navigate("ProductDetail", { id });
    } else if (n.link?.startsWith("/orders/")) {
      const orderId = n.link.split("/orders/")[1];
      if (n.type === "order_message" || n.type === "cancellation_requested" || n.type === "cancellation_decision") {
        navigation.getParent()?.navigate("Account", { screen: "OrderChat", params: { orderId } });
      } else {
        navigation.getParent()?.navigate("Account", { screen: "OrderDetail", params: { id: orderId } });
      }
    }
  }

  async function handleMarkAll() {
    await markAllRead();
    setItems((prev) => prev.map((i) => ({ ...i, is_read: true })));
  }

  const hasUnread = items.some((i) => !i.is_read);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {hasUnread && (
          <TouchableOpacity onPress={handleMarkAll}>
            <Text style={styles.markAll}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.accent} />
      ) : items.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="notifications-outline" size={40} color={colors.faint} />
          <Text style={styles.emptyText}>No notifications yet.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, !item.is_read && styles.cardUnread]}
              onPress={() => handlePress(item)}
            >
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.message}>{item.message}</Text>
              <Text style={styles.date}>{new Date(item.created_at).toLocaleString()}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontFamily: fonts.display, fontSize: 18, color: colors.ink, flex: 1 },
  markAll: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.accent },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  emptyText: { fontFamily: fonts.body, color: colors.muted, fontSize: 14 },
  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 10 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  cardUnread: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  title: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.ink, marginBottom: 3 },
  message: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginBottom: 6 },
  date: { fontFamily: fonts.body, fontSize: 10, color: colors.faint },
});