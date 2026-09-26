import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import { useAuth } from "../lib/auth-context";
import { useCart } from "../lib/cart-context";
import { apiFetch, extractErrorMessage } from "../lib/api";
import { colors, fonts } from "../lib/theme";

const COD_FEE = 30;

export default function CheckoutScreen({ navigation }: any) {
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();

  const [name, setName] = useState(user?.full_name || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "card">("cod");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <SafeAreaView style={styles.centered} edges={["top"]}>
        <Text style={styles.notice}>Sign in to check out.</Text>
        <TouchableOpacity
          style={styles.signInButton}
          onPress={() => navigation.getParent()?.navigate("Account", { screen: "Login" })}
        >
          <Text style={styles.signInButtonText}>Sign in</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  async function handlePlaceOrder() {
    if (!name.trim() || !phone.trim() || !address.trim() || !city.trim()) {
      setError("Please fill in every field.");
      return;
    }

    setError(null);
    setSubmitting(true);

    const orderRes = await apiFetch("/orders", {
      method: "POST",
      body: JSON.stringify({
        items: items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
        shipping_name: name,
        shipping_phone: phone,
        shipping_address: address,
        shipping_city: city,
        payment_method: paymentMethod,
      }),
    });

    if (!orderRes.ok) {
      setSubmitting(false);
      const body = await orderRes.json().catch(() => ({}));
      setError(extractErrorMessage(body, "Couldn't place your order."));
      return;
    }

    const order = await orderRes.json();

    if (paymentMethod === "cod") {
      setSubmitting(false);
      clearCart();
      navigation.getParent()?.navigate("Home");
      return;
    }

    const sessionRes = await apiFetch(`/orders/${order.id}/checkout-session`, { method: "POST" });
    setSubmitting(false);

    if (!sessionRes.ok) {
      setError("Couldn't start the card payment. Try Cash on Delivery instead.");
      return;
    }
    const { checkout_url } = await sessionRes.json();
    clearCart();
    await WebBrowser.openBrowserAsync(checkout_url);
    navigation.getParent()?.navigate("Account", { screen: "Orders" });
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.header}>Checkout</Text>

        <TextInput
          style={styles.input}
          placeholder="Full name"
          placeholderTextColor={colors.faint}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone number"
          placeholderTextColor={colors.faint}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
        <TextInput
          style={styles.input}
          placeholder="Street address"
          placeholderTextColor={colors.faint}
          value={address}
          onChangeText={setAddress}
        />
        <TextInput
          style={styles.input}
          placeholder="City"
          placeholderTextColor={colors.faint}
          value={city}
          onChangeText={setCity}
        />

        <Text style={styles.label}>Payment method</Text>
        <View style={styles.paymentOptions}>
          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === "cod" && styles.paymentOptionActive]}
            onPress={() => setPaymentMethod("cod")}
          >
            <Text style={[styles.paymentOptionText, paymentMethod === "cod" && styles.paymentOptionTextActive]}>
              Cash on Delivery
            </Text>
            <Text style={styles.paymentOptionSub}>+Rs. {COD_FEE} fee</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === "card" && styles.paymentOptionActive]}
            onPress={() => setPaymentMethod("card")}
          >
            <Text style={[styles.paymentOptionText, paymentMethod === "card" && styles.paymentOptionTextActive]}>
              Card
            </Text>
            <Text style={styles.paymentOptionSub}>International cards</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>Rs. {total.toLocaleString()}</Text>
        </View>
        {paymentMethod === "cod" && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>COD fee</Text>
            <Text style={styles.summaryValue}>Rs. {COD_FEE}</Text>
          </View>
        )}
        <View style={[styles.summaryRow, styles.summaryTotalRow]}>
          <Text style={styles.summaryTotalLabel}>Total</Text>
          <Text style={styles.summaryTotalValue}>
            Rs. {(paymentMethod === "cod" ? total + COD_FEE : total).toLocaleString()}
          </Text>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity style={styles.placeButton} onPress={handlePlaceOrder} disabled={submitting}>
          {submitting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.placeButtonText}>
              {paymentMethod === "cod" ? "Place Order" : "Continue to Payment"}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 16 },
  header: { fontFamily: fonts.display, fontSize: 22, color: colors.ink, marginBottom: 16 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg, gap: 14 },
  notice: { fontFamily: fonts.body, fontSize: 14, color: colors.muted },
  signInButton: { backgroundColor: colors.accent, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 },
  signInButtonText: { fontFamily: fonts.bodySemibold, color: colors.white, fontSize: 14 },
  input: {
    fontFamily: fonts.body,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.ink,
    marginBottom: 12,
  },
  label: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.ink, marginBottom: 8, marginTop: 4 },
  paymentOptions: { flexDirection: "row", gap: 10, marginBottom: 16 },
  paymentOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    backgroundColor: colors.white,
  },
  paymentOptionActive: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  paymentOptionText: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.ink },
  paymentOptionTextActive: { color: colors.accent },
  paymentOptionSub: { fontFamily: fonts.body, fontSize: 11, color: colors.faint, marginTop: 2 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  summaryLabel: { fontFamily: fonts.body, fontSize: 13, color: colors.muted },
  summaryValue: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.ink },
  summaryTotalRow: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8, marginTop: 4 },
  summaryTotalLabel: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.ink },
  summaryTotalValue: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.ink },
  error: { fontFamily: fonts.body, color: colors.danger, fontSize: 13, marginTop: 8 },
  placeButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 20,
  },
  placeButtonText: { fontFamily: fonts.bodyBold, color: colors.white, fontSize: 15 },
});