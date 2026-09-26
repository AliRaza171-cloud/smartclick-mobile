import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { fetchProducts, Product } from "../lib/products";
import { fetchProductBadges } from "../lib/badges";
import { colors, fonts } from "../lib/theme";
import ProductCard from "../components/ProductCard";

export default function CategoryProductsScreen({ route, navigation }: any) {
  const { name } = route.params;
  const [products, setProducts] = useState<Product[]>([]);
  const [badges, setBadges] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchProducts(name), fetchProductBadges()]).then(([data, badgeMap]) => {
      setProducts(data);
      setBadges(badgeMap);
      setLoading(false);
    });
  }, [name]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{name}</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.accent} />
      ) : (
        <FlatList
          data={products}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={{ gap: 12 }}
          ListEmptyComponent={<Text style={styles.empty}>No products in this category yet.</Text>}
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
  headerTitle: { fontFamily: fonts.display, fontSize: 18, color: colors.ink, flex: 1 },
  grid: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  empty: { fontFamily: fonts.body, textAlign: "center", color: colors.muted, marginTop: 40 },
});