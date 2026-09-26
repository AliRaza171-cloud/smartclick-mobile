import { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import { fetchProduct, Product } from "../lib/products";
import { colors, fonts } from "../lib/theme";
import { useCart } from "../lib/cart-context";
import { useAuth } from "../lib/auth-context";
import { checkWishlisted, addToWishlist, removeFromWishlist } from "../lib/wishlist";
import ProductReviews, { ReviewSummaryBadge } from "../components/ProductReviews";
import ProductQA from "../components/ProductQA";

export default function ProductDetailScreen({ route, navigation }: any) {
  const { id } = route.params;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const { addItem } = useCart();
  const { user } = useAuth();
  const videoPlayer = useVideoPlayer(product?.videoUrl ?? null, (player) => {
    player.loop = false;
  });

  useEffect(() => {
    if (user) checkWishlisted(id).then(setWishlisted);
  }, [user, id]);

  async function handleToggleWishlist() {
    if (!user) {
      navigation.getParent()?.navigate("Account", { screen: "Login" });
      return;
    }
    if (wishlisted) {
      await removeFromWishlist(id);
      setWishlisted(false);
    } else {
      await addToWishlist(id);
      setWishlisted(true);
    }
  }

  function handleAddToCart() {
    if (!product) return;
    addItem({
      productId: product.id,
      title: product.name,
      price: product.price,
      imageUrl: product.imageUrls[0],
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  function handleBuyNow() {
    if (!product) return;
    addItem({
      productId: product.id,
      title: product.name,
      price: product.price,
      imageUrl: product.imageUrls[0],
    });
    // Cart/Checkout live under the Cart tab, a sibling of this Home-tab
    // screen, so this has to go up to the tab navigator rather than
    // navigating within this stack.
    navigation.getParent()?.navigate("Cart", { screen: "Checkout" });
  }

  useEffect(() => {
    fetchProduct(id).then((p) => {
      setProduct(p);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.centered} edges={["top"]}>
        <ActivityIndicator color={colors.accent} />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.centered} edges={["top"]}>
        <Text style={{ fontFamily: fonts.body }}>Product not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={22} color={colors.ink} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.wishlistButton} onPress={handleToggleWishlist}>
        <Ionicons
          name={wishlisted ? "heart" : "heart-outline"}
          size={20}
          color={wishlisted ? colors.accent : colors.ink}
        />
      </TouchableOpacity>

      <ScrollView>
        <View style={styles.mediaWrap}>
          {showVideo && product.videoUrl ? (
            <VideoView player={videoPlayer} style={styles.image} nativeControls contentFit="cover" />
          ) : (
            <Image
              source={product.imageUrls[0] ? { uri: product.imageUrls[0] } : undefined}
              style={styles.image}
            />
          )}
          {product.videoUrl && (
            <TouchableOpacity
              style={styles.videoToggle}
              onPress={() => {
                if (!showVideo) videoPlayer.play();
                else videoPlayer.pause();
                setShowVideo((v) => !v);
              }}
            >
              <Ionicons name={showVideo ? "image-outline" : "play-circle"} size={showVideo ? 22 : 44} color={colors.white} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.body}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>AI-VERIFIED LISTING</Text>
          </View>
          <Text style={styles.title}>{product.name}</Text>
          <ReviewSummaryBadge productId={product.id} />

          <View style={styles.priceRow}>
            <Text style={styles.price}>Rs. {product.price.toLocaleString()}</Text>
            {product.originalPrice && (
              <Text style={styles.originalPrice}>Rs. {product.originalPrice.toLocaleString()}</Text>
            )}
            {product.discountPct && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-{product.discountPct}%</Text>
              </View>
            )}
          </View>

          <Text style={styles.description}>{product.description}</Text>

          {product.freeShipping && (
            <View style={styles.shippingRow}>
              <Ionicons name="cube-outline" size={16} color={colors.accent} />
              <Text style={styles.shippingText}>Free shipping</Text>
            </View>
          )}

          <View style={styles.categoryRow}>
            <Text style={styles.categoryLabel}>Category</Text>
            <Text style={styles.categoryValue}>{product.category}</Text>
          </View>

          <ProductReviews productId={product.id} />
          <ProductQA productId={product.id} navigation={navigation} />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.buyNowButton} onPress={handleBuyNow}>
          <Text style={styles.buyNowButtonText}>Buy Now</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
          <Text style={styles.addButtonText}>{added ? "Added ✓" : "Add to Cart"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  backButton: {
    position: "absolute",
    top: 12,
    left: 12,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ffffffcc",
    alignItems: "center",
    justifyContent: "center",
  },
  wishlistButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ffffffcc",
    alignItems: "center",
    justifyContent: "center",
  },
  mediaWrap: { position: "relative" },
  image: { width: "100%", height: 320, backgroundColor: colors.bg },
  videoToggle: {
    position: "absolute",
    bottom: 12,
    right: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#00000066",
    alignItems: "center",
    justifyContent: "center",
  },
  body: { padding: 20 },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: colors.accentSoft,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
  },
  badgeText: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.accent },
  title: { fontFamily: fonts.display, fontSize: 22, color: colors.ink, marginBottom: 8 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  price: { fontFamily: fonts.bodyBold, fontSize: 20, color: colors.ink },
  originalPrice: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.faint,
    textDecorationLine: "line-through",
  },
  discountBadge: { backgroundColor: colors.accent, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  discountText: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.white },
  description: { fontFamily: fonts.body, fontSize: 14, color: colors.muted, lineHeight: 20, marginBottom: 16 },
  shippingRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 16 },
  shippingText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.accent },
  categoryRow: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 14 },
  categoryLabel: { fontFamily: fonts.body, fontSize: 11, color: colors.faint },
  categoryValue: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.ink, marginTop: 2 },
  footer: { flexDirection: "row", gap: 10, padding: 16, borderTopWidth: 1, borderTopColor: colors.border },
  addButton: { flex: 1, backgroundColor: colors.accent, borderRadius: 12, paddingVertical: 15, alignItems: "center" },
  addButtonText: { fontFamily: fonts.bodyBold, color: colors.white, fontSize: 15 },
  buyNowButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },
  buyNowButtonText: { fontFamily: fonts.bodyBold, color: colors.ink, fontSize: 15 },
});