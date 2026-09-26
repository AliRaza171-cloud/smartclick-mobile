import { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { fetchOrders, Order } from "../lib/orders";
import { colors, fonts } from "../lib/theme";

const STATUS_LABELS: Record<string, string> = {
  pending: "Processing",
  ready_to_ship: "Ready to ship",
  shipped: "Shipped",
  delivered: "Delivered",
};

export default function OrdersScreen({ navigation }: any) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    fetchOrders().then((data) => {
      setOrders(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", load);
    return unsubscribe;
  }, [navigation, load]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.accent} />
      ) : orders.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="receipt-outline" size={40} color={colors.faint} />
          <Text style={styles.emptyText}>No orders yet.</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate("OrderDetail", { id: item.id })}
            >
              <View style={styles.cardTop}>
                <Text style={styles.orderId}>Order #{item.id.slice(0, 8).toUpperCase()}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{STATUS_LABELS[item.fulfillment_status] || item.fulfillment_status}</Text>
                </View>
              </View>
              <Text style={styles.itemsSummary} numberOfLines={1}>
                {item.items.map((i) => i.title).join(", ")}
              </Text>
              <View style={styles.cardBottom}>
                <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
                <Text style={styles.total}>Rs. {parseFloat(item.total).toLocaleString()}</Text>
              </View>
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
  headerTitle: { fontFamily: fonts.display, fontSize: 18, color: colors.ink },
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
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  orderId: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.ink },
  statusBadge: { backgroundColor: colors.accentSoft, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontFamily: fonts.bodySemibold, fontSize: 10, color: colors.accent },
  itemsSummary: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginBottom: 8 },
  cardBottom: { flexDirection: "row", justifyContent: "space-between" },
  date: { fontFamily: fonts.body, fontSize: 12, color: colors.faint },
  total: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink },
});