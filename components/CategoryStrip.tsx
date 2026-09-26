import { useEffect, useState } from "react";
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { fetchCategories, CategoryMeta } from "../lib/categories";
import { API_BASE } from "../lib/api";
import { colors, fonts } from "../lib/theme";

export default function CategoryStrip({ navigation }: any) {
  const [categories, setCategories] = useState<CategoryMeta[]>([]);

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  if (categories.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      <FlatList
        data={categories}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("CategoryProducts", { slug: item.slug, name: item.name })}
          >
            <Image
              source={item.image_url ? { uri: `${API_BASE}${item.image_url}` } : undefined}
              style={styles.image}
            />
            <View style={styles.tint} />
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingTop: 18, paddingBottom: 6 },
  list: { paddingHorizontal: 16, gap: 12 },
  card: {
    width: 130,
    height: 90,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "flex-end",
    padding: 10,
  },
  image: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  tint: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000",
    opacity: 0.28,
  },
  name: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.white },
});