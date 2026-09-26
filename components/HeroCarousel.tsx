import { useEffect, useRef, useState } from "react";
import {
  View,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  LayoutChangeEvent,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { HeroImage } from "../lib/hero-images";
import { API_BASE } from "../lib/api";
import { colors } from "../lib/theme";

const HEIGHT = 170;
const ADVANCE_MS = 4000;

export default function HeroCarousel({ images }: { images: HeroImage[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (images.length < 2 || !containerWidth) return;
    const interval = setInterval(() => goTo((activeIndex + 1) % images.length), ADVANCE_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, images.length, containerWidth]);

  function goTo(index: number) {
    listRef.current?.scrollToOffset({ offset: index * containerWidth, animated: true });
    setActiveIndex(index);
  }

  function handlePrev() {
    goTo((activeIndex - 1 + images.length) % images.length);
  }

  function handleNext() {
    goTo((activeIndex + 1) % images.length);
  }

  function handleScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    if (!containerWidth) return;
    const index = Math.round(e.nativeEvent.contentOffset.x / containerWidth);
    setActiveIndex(index);
  }

  function handleLayout(e: LayoutChangeEvent) {
    setContainerWidth(e.nativeEvent.layout.width);
  }

  if (images.length === 0) return null;

  return (
    <View style={styles.cardClip} onLayout={handleLayout}>
      {containerWidth > 0 && (
        <>
          <FlatList
            ref={listRef}
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            onMomentumScrollEnd={handleScrollEnd}
            renderItem={({ item }) => (
              <Image
                source={{ uri: `${API_BASE}${item.image_url}` }}
                style={{ width: containerWidth, height: HEIGHT }}
              />
            )}
          />

          {images.length > 1 && (
            <>
              <TouchableOpacity style={[styles.arrow, styles.arrowLeft]} onPress={handlePrev}>
                <Ionicons name="chevron-back" size={18} color={colors.white} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.arrow, styles.arrowRight]} onPress={handleNext}>
                <Ionicons name="chevron-forward" size={18} color={colors.white} />
              </TouchableOpacity>

              <View style={styles.dots}>
                {images.map((_, i) => (
                  <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
                ))}
              </View>
            </>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardClip: {
    width: "100%",
    height: HEIGHT,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: colors.bg,
  },
  arrow: {
    position: "absolute",
    top: "50%",
    marginTop: -15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#00000055",
    alignItems: "center",
    justifyContent: "center",
  },
  arrowLeft: { left: 8 },
  arrowRight: { right: 8 },
  dots: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#ffffff88" },
  dotActive: { backgroundColor: colors.white, width: 16 },
});