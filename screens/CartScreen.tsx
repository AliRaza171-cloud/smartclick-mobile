import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useCart } from "../lib/cart-context";
import { colors, fonts } from "../lib/theme";

export default function CartScreen({ navigation }: any) {
  const { items, total, updateQuantity, removeItem } = useCart();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.header}>Cart</Text>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="bag-outline" size={40} color={colors.faint} />
          <Text style={styles.emptyText}>Your cart is empty.</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.productId}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <Image source={item.imageUrl ? { uri: item.imageUrl } : undefined} style={styles.image} />
                <View style={styles.rowBody}>
                  <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.price}>Rs. {item.price.toLocaleString()}</Text>
                  <View style={styles.qtyRow}>
                    <TouchableOpacity
                      style={styles.qtyButton}
                      onPress={() => updateQuantity(item.productId, item.quantity - 1)}
                    >
                      <Ionicons name="remove" size={14} color={colors.ink} />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.qtyButton}
                      onPress={() => updateQuantity(item.productId, item.quantity + 1)}
                    >
                      <Ionicons name="add" size={14} color={colors.ink} />
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity onPress={() => removeItem(item.productId)}>
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </TouchableOpacity>
              </View>
            )}
          />

          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>Rs. {total.toLocaleString()}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutButton} onPress={() => navigation.navigate("Checkout")}>
              <Text style={styles.checkoutButtonText}>Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { fontFamily: fonts.display, fontSize: 22, color: colors.ink, padding: 16 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  emptyText: { fontFamily: fonts.body, color: colors.muted, fontSize: 14 },
  list: { paddingHorizontal: 16, gap: 12 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
  },
  image: { width: 56, height: 56, borderRadius: 8, backgroundColor: colors.bg },
  rowBody: { flex: 1 },
  title: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.ink },
  price: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.ink, marginTop: 2 },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 6 },
  qtyButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.ink },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.white },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  totalLabel: { fontFamily: fonts.body, fontSize: 14, color: colors.muted },
  totalValue: { fontFamily: fonts.bodyBold, fontSize: 18, color: colors.ink },
  checkoutButton: { backgroundColor: colors.accent, borderRadius: 12, paddingVertical: 15, alignItems: "center" },
  checkoutButtonText: { fontFamily: fonts.bodyBold, color: colors.white, fontSize: 15 },
});