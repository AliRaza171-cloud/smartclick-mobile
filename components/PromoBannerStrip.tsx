import { Image, StyleSheet } from "react-native";
import { API_BASE, resolveImageUrl } from "../lib/api";
import { colors } from "../lib/theme";

export default function PromoBannerStrip({ imageUrl }: { imageUrl: string }) {
  return <Image source={{ uri: `${resolveImageUrl(imageUrl)}` }} style={styles.image} />;
}

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: 80,
    borderRadius: 12,
    backgroundColor: colors.bg,
  },
});