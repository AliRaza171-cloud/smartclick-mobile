import { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { fetchOrder, Order } from "../lib/orders";
import { cancelOrder, requestCancellation } from "../lib/order-messages";
import { colors, fonts } from "../lib/theme";
import { API_BASE, resolveImageUrl } from "../lib/api";

const STEPS: { key: string; label: string }[] = [
  { key: "pending", label: "Processing" },
  { key: "ready_to_ship", label: "Ready to ship" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

const PAYMENT_LABELS: Record<string, string> = {
  cod: "Cash on Delivery",
  card: "Card",
  safepay: "JazzCash / EasyPaisa / Card",
};

export default function OrderDetailScreen({ route, navigation }: any) {
  const { id } = route.params;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  function load() {
    fetchOrder(id).then((data) => {
      setOrder(data);
      setLoading(false);
    });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleCancel() {
    Alert.alert("Cancel this order?", "This can't be undone.", [
      { text: "Never mind", style: "cancel" },
      {
        text: "Cancel Order",
        style: "destructive",
        onPress: async () => {
          setActing(true);
          const res = await cancelOrder(id);
          setActing(false);
          if (res.ok) load();
          else Alert.alert("Couldn't cancel", "Please try again in a moment.");
        },
      },
    ]);
  }

  async function handleRequestCancellation() {
    Alert.alert(
      "Request cancellation?",
      "Your order is already being prepared — support will review your request.",
      [
        { text: "Never mind", style: "cancel" },
        {
          text: "Request Cancellation",
          onPress: async () => {
            setActing(true);
            const res = await requestCancellation(id);
            setActing(false);
            if (res.ok) load();
            else Alert.alert("Couldn't request cancellation", "Please try again in a moment.");
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.centered} edges={["top"]}>
        <ActivityIndicator color={colors.accent} />
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.centered} edges={["top"]}>
        <Text style={{ fontFamily: fonts.body }}>Order not found.</Text>
      </SafeAreaView>
    );
  }

  const currentStepIndex = STEPS.findIndex((s) => s.key === order.fulfillment_status);
  const isCancelled = order.status === "cancelled";
  const canCancelDirectly = !isCancelled && order.fulfillment_status === "pending";
  const canRequestCancellation =
    !isCancelled &&
    !order.cancellation_requested &&
    order.fulfillment_status !== "pending" &&
    order.fulfillment_status !== "delivered";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order #{order.id.slice(0, 8).toUpperCase()}</Text>
        <TouchableOpacity
          style={styles.chatButton}
          onPress={() => navigation.navigate("OrderChat", { orderId: order.id })}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {isCancelled ? (
          <View style={styles.cancelledBanner}>
            <Ionicons name="close-circle" size={16} color="#DC2626" />
            <Text style={styles.cancelledText}>This order was cancelled.</Text>
          </View>
        ) : (
          <View style={styles.timeline}>
            {STEPS.map((step, i) => (
              <View key={step.key} style={styles.timelineStep}>
                <View style={styles.timelineDotRow}>
                  <View style={[styles.dot, i <= currentStepIndex && styles.dotActive]} />
                  {i < STEPS.length - 1 && (
                    <View style={[styles.line, i < currentStepIndex && styles.lineActive]} />
                  )}
                </View>
                <Text style={[styles.stepLabel, i <= currentStepIndex && styles.stepLabelActive]}>
                  {step.label}
                </Text>
              </View>
            ))}
          </View>
        )}

        {order.cancellation_requested && (
          <View style={styles.pendingBanner}>
            <Ionicons name="time-outline" size={16} color="#8A6D00" />
            <Text style={styles.pendingText}>Cancellation requested — awaiting a decision from support.</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Items</Text>
        {order.items.map((item, i) => (
          <View key={i} style={styles.itemRow}>
            <Image
              source={item.image_url ? { uri: `${resolveImageUrl(item.image_url)}` } : undefined}
              style={styles.itemImage}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.itemMeta}>Qty {item.quantity} · Rs. {parseFloat(item.unit_price).toLocaleString()}</Text>
            </View>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Shipping to</Text>
        <View style={styles.box}>
          <Text style={styles.boxText}>{order.shipping_name}</Text>
          <Text style={styles.boxText}>{order.shipping_phone}</Text>
          <Text style={styles.boxText}>{order.shipping_address}, {order.shipping_city}</Text>
        </View>

        <Text style={styles.sectionTitle}>Payment</Text>
        <View style={styles.box}>
          <Text style={styles.boxText}>{PAYMENT_LABELS[order.payment_method] || order.payment_method}</Text>
        </View>

        <Text style={styles.sectionTitle}>Summary</Text>
        <View style={styles.box}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>Rs. {parseFloat(order.subtotal).toLocaleString()}</Text>
          </View>
          {parseFloat(order.discount_amount) > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount{order.voucher_code ? ` (${order.voucher_code})` : ""}</Text>
              <Text style={styles.summaryValue}>-Rs. {parseFloat(order.discount_amount).toLocaleString()}</Text>
            </View>
          )}
          {parseFloat(order.cod_fee) > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>COD fee</Text>
              <Text style={styles.summaryValue}>Rs. {parseFloat(order.cod_fee).toLocaleString()}</Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.summaryTotalRow]}>
            <Text style={styles.summaryTotalLabel}>Total</Text>
            <Text style={styles.summaryTotalValue}>Rs. {parseFloat(order.total).toLocaleString()}</Text>
          </View>
        </View>

        {(canCancelDirectly || canRequestCancellation) && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={canCancelDirectly ? handleCancel : handleRequestCancellation}
            disabled={acting}
          >
            {acting ? (
              <ActivityIndicator color="#DC2626" />
            ) : (
              <Text style={styles.cancelButtonText}>
                {canCancelDirectly ? "Cancel Order" : "Request Cancellation"}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
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
  headerTitle: { fontFamily: fonts.display, fontSize: 16, color: colors.ink, flex: 1 },
  chatButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { padding: 16, paddingTop: 4 },
  cancelledBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FDEAEA",
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  cancelledText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: "#DC2626" },
  pendingBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFF6DE",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  pendingText: { fontFamily: fonts.bodyMedium, fontSize: 12, color: "#8A6D00", flex: 1 },
  timeline: { flexDirection: "row", marginBottom: 24, paddingHorizontal: 4 },
  timelineStep: { flex: 1, alignItems: "center" },
  timelineDotRow: { flexDirection: "row", alignItems: "center", width: "100%" },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.border, marginLeft: "50%" },
  dotActive: { backgroundColor: colors.accent },
  line: { flex: 1, height: 2, backgroundColor: colors.border },
  lineActive: { backgroundColor: colors.accent },
  stepLabel: { fontFamily: fonts.body, fontSize: 10, color: colors.faint, marginTop: 6, textAlign: "center" },
  stepLabelActive: { fontFamily: fonts.bodySemibold, color: colors.accent },
  sectionTitle: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.ink, marginBottom: 8, marginTop: 4 },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  itemImage: { width: 44, height: 44, borderRadius: 8, backgroundColor: colors.white },
  itemTitle: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.ink },
  itemMeta: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: 2 },
  box: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  boxText: { fontFamily: fonts.body, fontSize: 13, color: colors.ink, marginBottom: 2 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  summaryLabel: { fontFamily: fonts.body, fontSize: 13, color: colors.muted },
  summaryValue: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.ink },
  summaryTotalRow: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8, marginTop: 4 },
  summaryTotalLabel: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.ink },
  summaryTotalValue: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink },
  cancelButton: {
    borderWidth: 1,
    borderColor: "#DC2626",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  cancelButtonText: { fontFamily: fonts.bodySemibold, color: "#DC2626", fontSize: 14 },
});