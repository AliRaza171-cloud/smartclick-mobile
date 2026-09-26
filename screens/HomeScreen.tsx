import { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, RefreshControl, ActivityIndicator } from "react-native";
import { fetchProducts, Product } from "../lib/products";
import { fetchProductBadges } from "../lib/badges";
import { fetchHeroImages, HeroImage } from "../lib/hero-images";
import { colors, fonts } from "../lib/theme";
import Header from "../components/Header";
import HeroCarousel from "../components/HeroCarousel";
import PromoBannerStrip from "../components/PromoBannerStrip";
import CategoryStrip from "../components/CategoryStrip";
import PromoScroller from "../components/PromoScroller";
import ProductCard from "../components/ProductCard";

export default function HomeScreen({ navigation }: any) {
  const [products, setProducts] = useState<Product[]>([]);
  const [badges, setBadges] = useState<Record<string, string>>({});
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [data, badgeMap, hero] = await Promise.all([
      fetchProducts(),
      fetchProductBadges(),
      fetchHeroImages(),
    ]);
    setProducts(data);
    setBadges(badgeMap);
    setHeroImages(hero);
    setLoading(false);
    setRefreshing(false);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  function handleRefresh() {
    setRefreshing(true);
    load();
  }

  return (
    <View style={styles.container}>
      <Header navigation={navigation} />
      <PromoScroller />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.accent} />
      ) : (
        <FlatList
          data={products}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={{ gap: 12 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.accent} />
          }
          ListHeaderComponent={
            <>
            <View style={{ height: 16 }} />
              <HeroCarousel images={heroImages.filter((h) => h.placement === "carousel")} />
              {heroImages.find((h) => h.placement === "strip") && (
                <View style={{ marginTop: 10 }}>
                  <PromoBannerStrip
                    imageUrl={heroImages.find((h) => h.placement === "strip")!.image_url}
                  />
                </View>
              )}
              <CategoryStrip navigation={navigation} />
              <Text style={styles.sectionTitle}>Trending now</Text>
            </>
          }
          ListEmptyComponent={<Text style={styles.empty}>No products yet.</Text>}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              badge={badges[item.id]}
              onPress={() => navigation.navigate("ProductDetail", { id: item.id })}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.ink,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 10,
  },
  grid: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  empty: { fontFamily: fonts.body, textAlign: "center", color: colors.muted, marginTop: 40 },
});