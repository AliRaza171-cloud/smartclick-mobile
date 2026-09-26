import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../lib/auth-context";
import { colors, fonts } from "../lib/theme";

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>{user?.full_name || "Your account"}</Text>
      <Text style={styles.email}>{user?.email}</Text>

      <TouchableOpacity style={styles.row} onPress={() => navigation.navigate("Orders")}>
        <Ionicons name="receipt-outline" size={18} color={colors.ink} />
        <Text style={styles.rowText}>My Orders</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.faint} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Sign out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 24 },
  title: { fontFamily: fonts.display, fontSize: 22, color: colors.ink, marginTop: 12 },
  email: { fontFamily: fonts.body, fontSize: 14, color: colors.muted, marginTop: 4, marginBottom: 24 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
    marginBottom: 24,
  },
  rowText: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.ink, flex: 1 },
  button: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: colors.white,
  },
  buttonText: { fontFamily: fonts.bodySemibold, color: colors.ink, fontSize: 15 },
});