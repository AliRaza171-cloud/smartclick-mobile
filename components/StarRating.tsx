import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../lib/theme";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
}

export default function StarRating({ value, onChange, size = 16 }: StarRatingProps) {
  const interactive = !!onChange;

  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} disabled={!interactive} onPress={() => onChange?.(star)}>
          <Ionicons
            name={star <= value ? "star" : "star-outline"}
            size={size}
            color={star <= value ? "#F5B400" : colors.border}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}