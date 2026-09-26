import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { fetchProducts, Product } from "../lib/products";
import { fetchProductBadges } from "../lib/badges";
import { colors, fonts } from "../lib/theme";
import ProductCard from "../components/ProductCard";

export default function SearchScreen({ navigation }: any) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [badges, setBadges] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch() {
    const trimmed = query.trim();
    if (!trimmed) return;
    setLoading(true);
    setSearched(true);
    const [data, badgeMap] = await Promise.all([fetchProducts(undefined, trimmed), fetchProductBadges()]);
    setResults(data);
    setBadges(badgeMap);
    setLoading(false);
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </TouchableOpacity>
        <View style={styles.inputWrap}>
          <Ionicons name="search" size={16} color={colors.faint} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.input}
            placeholder="Search products..."
            placeholderTextColor={colors.faint}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoFocus
          />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.accent} />
      ) : searched && results.length === 0 ? (
        <Text style={styles.empty}>Nothing matched "{query}" — try a different search.</Text>
      ) : (
        <FlatList
          data={results}
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
  header: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingVertical: 14 },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  inputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  input: { flex: 1, fontFamily: fonts.body, fontSize: 14, color: colors.ink, paddingVertical: 10 },
  empty: { fontFamily: fonts.body, textAlign: "center", color: colors.muted, marginTop: 40, paddingHorizontal: 20 },
  grid: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
});