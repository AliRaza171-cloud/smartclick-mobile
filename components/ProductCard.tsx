import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Product } from "../lib/products";
import { colors, fonts } from "../lib/theme";

const BADGE_STYLES: Record<string, { bg: string; text: string }> = {
  "Best Seller": { bg: "#0F8A6E", text: "#FFFFFF" },
  Trending: { bg: "#E85D3A", text: "#FFFFFF" },
  "Hot Deal": { bg: "#DC2626", text: "#FFFFFF" },
  New: { bg: "#0E1712", text: "#22C08C" },
};

export default function ProductCard({
  product,
  badge,
  onPress,
}: {
  product: Product;
  badge?: string;
  onPress: () => void;
}) {
  const badgeStyle = badge ? BADGE_STYLES[badge] : null;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.imageWrap}>
        {badgeStyle && (
          <View style={[styles.badge, { backgroundColor: badgeStyle.bg }]}>
            <Text style={[styles.badgeText, { color: badgeStyle.text }]}>{badge}</Text>
          </View>
        )}
        <Image
          source={product.imageUrls?.[0] ? { uri: product.imageUrls[0] } : undefined}
          style={styles.image}
        />
        {product.discountPct && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{product.discountPct}%</Text>
          </View>
        )}
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.title} numberOfLines={1}>{product.name}</Text>
        {!!product.reviewCount && (
          <View style={styles.ratingRow}>
            <Text style={styles.ratingStar}>★</Text>
            <Text style={styles.ratingText}>
              {product.averageRating} ({product.reviewCount})
            </Text>
          </View>
        )}
        <View style={styles.priceRow}>
          <Text style={styles.price}>Rs. {product.price.toLocaleString()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  imageWrap: { position: "relative" },
  image: { width: "100%", height: 140, backgroundColor: colors.bg },
  badge: {
    position: "absolute",
    top: 8,
    left: 8,
    zIndex: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: { fontFamily: fonts.bodyBold, fontSize: 9 },
  discountBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: colors.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  discountText: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.white },
  cardBody: { padding: 10 },
  title: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.ink },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 3 },
  ratingStar: { fontSize: 10, color: "#F5B400" },
  ratingText: { fontFamily: fonts.body, fontSize: 10, color: colors.muted },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  price: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink },
});