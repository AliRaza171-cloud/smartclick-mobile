import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { fetchOrderMessages, sendOrderMessage, OrderMessage } from "../lib/order-messages";
import { colors, fonts } from "../lib/theme";

const POLL_MS = 4000;

export default function OrderChatScreen({ route, navigation }: any) {
  const { orderId } = route.params;
  const [messages, setMessages] = useState<OrderMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const data = await fetchOrderMessages(orderId);
    setMessages(data);
    setLoading(false);
  }, [orderId]);

  useFocusEffect(
    useCallback(() => {
      load();
      const interval = setInterval(() => load(true), POLL_MS);
      return () => clearInterval(interval);
    }, [load])
  );

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setText("");
    await sendOrderMessage(orderId, trimmed);
    setSending(false);
    load(true);
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Support</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color={colors.accent} />
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={styles.list}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              <Text style={styles.empty}>
                No messages yet — ask a question about this order and support will reply here.
              </Text>
            }
            renderItem={({ item }) => {
              if (item.sender_role === "system") {
                return <Text style={styles.systemMessage}>{item.message}</Text>;
              }
              const isBuyer = item.sender_role === "buyer";
              return (
                <View style={[styles.bubbleRow, isBuyer ? styles.bubbleRowRight : styles.bubbleRowLeft]}>
                  <View style={[styles.bubble, isBuyer ? styles.bubbleBuyer : styles.bubbleAdmin]}>
                    <Text style={[styles.bubbleText, isBuyer && { color: colors.white }]}>{item.message}</Text>
                  </View>
                </View>
              );
            }}
          />
        )}

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={colors.faint}
            value={text}
            onChangeText={setText}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={sending || !text.trim()}>
            <Ionicons name="send" size={16} color={colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  headerTitle: { fontFamily: fonts.display, fontSize: 18, color: colors.ink },
  list: { padding: 16, gap: 10, flexGrow: 1 },
  empty: { fontFamily: fonts.body, textAlign: "center", color: colors.muted, marginTop: 40, paddingHorizontal: 20 },
  systemMessage: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.faint,
    textAlign: "center",
    fontStyle: "italic",
    marginVertical: 6,
  },
  bubbleRow: { flexDirection: "row" },
  bubbleRowLeft: { justifyContent: "flex-start" },
  bubbleRowRight: { justifyContent: "flex-end" },
  bubble: { maxWidth: "78%", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleAdmin: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  bubbleBuyer: { backgroundColor: colors.accent },
  bubbleText: { fontFamily: fonts.body, fontSize: 14, color: colors.ink },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    backgroundColor: colors.bg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
});