import { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { fetchWishlist } from "../lib/wishlist";
import { fetchProductBadges } from "../lib/badges";
import { Product } from "../lib/products";
import { colors, fonts } from "../lib/theme";
import ProductCard from "../components/ProductCard";

export default function WishlistScreen({ navigation }: any) {
  const [items, setItems] = useState<Product[]>([]);
  const [badges, setBadges] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    Promise.all([fetchWishlist(), fetchProductBadges()]).then(([data, badgeMap]) => {
      setItems(data);
      setBadges(badgeMap);
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
        <Text style={styles.headerTitle}>Wishlist</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.accent} />
      ) : items.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={40} color={colors.faint} />
          <Text style={styles.emptyText}>Nothing saved yet.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={{ gap: 12 }}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              badge={badges[item.id]}
              onPress={() => navigation.navigate("ProductDetail", { id: item.id })}
            />
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
  grid: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
});