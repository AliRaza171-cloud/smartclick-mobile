import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useAuth } from "../lib/auth-context";
import { fetchQuestions, askQuestion, ProductQuestion } from "../lib/questions";
import { colors, fonts } from "../lib/theme";

export default function ProductQA({ productId, navigation }: { productId: string; navigation: any }) {
  const { user } = useAuth();
  const [items, setItems] = useState<ProductQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    fetchQuestions(productId).then((data) => {
      setItems(data);
      setLoading(false);
    });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  async function handleAsk() {
    if (!newQuestion.trim()) return;
    if (!user) {
      navigation.getParent()?.navigate("Account", { screen: "Login" });
      return;
    }

    setError(null);
    setSubmitting(true);
    const res = await askQuestion(productId, newQuestion);
    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body?.detail || "Couldn't submit your question.");
      return;
    }
    setNewQuestion("");
    load();
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Questions &amp; Answers</Text>

      <View style={styles.askRow}>
        <TextInput
          style={styles.input}
          placeholder="Ask a question about this product…"
          placeholderTextColor={colors.faint}
          value={newQuestion}
          onChangeText={setNewQuestion}
        />
        <TouchableOpacity
          style={[styles.askButton, (!newQuestion.trim() || submitting) && { opacity: 0.5 }]}
          onPress={handleAsk}
          disabled={!newQuestion.trim() || submitting}
        >
          {submitting ? <ActivityIndicator color={colors.white} size="small" /> : <Text style={styles.askButtonText}>Ask</Text>}
        </TouchableOpacity>
      </View>
      {error && <Text style={styles.error}>{error}</Text>}

      {loading ? (
        <ActivityIndicator color={colors.accent} />
      ) : items.length === 0 ? (
        <Text style={styles.empty}>No questions yet — be the first to ask.</Text>
      ) : (
        items.map((q) => (
          <View key={q.id} style={styles.qaRow}>
            <Text style={styles.question}>Q: {q.question}</Text>
            <Text style={styles.meta}>{q.asker_name} · {new Date(q.created_at).toLocaleDateString()}</Text>
            {q.answer ? (
              <Text style={styles.answer}>
                <Text style={{ color: colors.accent, fontFamily: fonts.bodySemibold }}>A: </Text>
                {q.answer}
              </Text>
            ) : (
              <Text style={styles.awaiting}>Awaiting an answer from the seller.</Text>
            )}
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 24, paddingTop: 16, paddingBottom: 8, borderTopWidth: 1, borderTopColor: colors.border },
  sectionTitle: { fontFamily: fonts.display, fontSize: 17, color: colors.ink, marginBottom: 12 },
  askRow: { flexDirection: "row", gap: 8, marginBottom: 6 },
  input: {
    flex: 1,
    fontFamily: fonts.body,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: colors.ink,
    backgroundColor: colors.white,
  },
  askButton: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  askButtonText: { fontFamily: fonts.bodySemibold, color: colors.white, fontSize: 13 },
  error: { fontFamily: fonts.body, color: colors.danger, fontSize: 12, marginBottom: 10 },
  empty: { fontFamily: fonts.body, color: colors.muted, fontSize: 13, marginTop: 4 },
  qaRow: { marginTop: 14, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  question: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.ink, marginBottom: 3 },
  meta: { fontFamily: fonts.body, fontSize: 10, color: colors.faint, marginBottom: 6 },
  answer: { fontFamily: fonts.body, fontSize: 13, color: colors.muted },
  awaiting: { fontFamily: fonts.body, fontSize: 11, color: colors.faint, fontStyle: "italic" },
});