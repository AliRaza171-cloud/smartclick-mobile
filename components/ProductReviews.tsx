import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useAuth } from "../lib/auth-context";
import {
  fetchReviews,
  fetchReviewSummary,
  fetchReviewEligibility,
  submitReview,
  Review,
  ReviewSummary,
  ReviewEligibility,
} from "../lib/reviews";
import { colors, fonts } from "../lib/theme";
import StarRating from "./StarRating";

export function ReviewSummaryBadge({ productId }: { productId: string }) {
  const [summary, setSummary] = useState<ReviewSummary | null>(null);

  useEffect(() => {
    fetchReviewSummary(productId).then(setSummary);
  }, [productId]);

  if (!summary || summary.review_count === 0) return null;

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 }}>
      <StarRating value={Math.round(summary.average_rating || 0)} size={13} />
      <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.muted }}>
        {summary.average_rating} ({summary.review_count} review{summary.review_count === 1 ? "" : "s"})
      </Text>
    </View>
  );
}

export default function ProductReviews({ productId }: { productId: string }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [eligibility, setEligibility] = useState<ReviewEligibility | null>(null);
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    fetchReviews(productId).then((data) => {
      setReviews(data);
      setLoading(false);
    });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  useEffect(() => {
    if (!user) return;
    fetchReviewEligibility(productId).then(setEligibility);
  }, [user, productId]);

  async function handleSubmit() {
    if (!eligibility?.order_id || rating === 0) return;
    setError(null);
    setSubmitting(true);
    const res = await submitReview(productId, eligibility.order_id, rating, comment || null);
    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body?.detail || "Couldn't submit your review.");
      return;
    }
    setEligibility({ can_review: false, reason: "already_reviewed", order_id: null });
    setRating(0);
    setComment("");
    load();
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Reviews</Text>

      {eligibility?.can_review && (
        <View style={styles.form}>
          <Text style={styles.formLabel}>Leave a review</Text>
          <View style={{ marginBottom: 10 }}>
            <StarRating value={rating} onChange={setRating} size={24} />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Optional — share your experience"
            placeholderTextColor={colors.faint}
            value={comment}
            onChangeText={setComment}
            multiline
          />
          {error && <Text style={styles.error}>{error}</Text>}
          <TouchableOpacity
            style={[styles.submitButton, (rating === 0 || submitting) && { opacity: 0.5 }]}
            onPress={handleSubmit}
            disabled={rating === 0 || submitting}
          >
            {submitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>Submit Review</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <ActivityIndicator color={colors.accent} />
      ) : reviews.length === 0 ? (
        <Text style={styles.empty}>No reviews yet.</Text>
      ) : (
        reviews.map((r) => (
          <View key={r.id} style={styles.reviewRow}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <StarRating value={r.rating} size={13} />
              <Text style={styles.reviewerName}>{r.reviewer_name}</Text>
            </View>
            {r.comment && <Text style={styles.reviewComment}>{r.comment}</Text>}
            <Text style={styles.reviewDate}>{new Date(r.created_at).toLocaleDateString()}</Text>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border },
  sectionTitle: { fontFamily: fonts.display, fontSize: 17, color: colors.ink, marginBottom: 12 },
  form: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  formLabel: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.ink, marginBottom: 8 },
  input: {
    fontFamily: fonts.body,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    color: colors.ink,
    minHeight: 60,
    textAlignVertical: "top",
    marginBottom: 10,
  },
  error: { fontFamily: fonts.body, color: colors.danger, fontSize: 12, marginBottom: 8 },
  submitButton: { backgroundColor: colors.accent, borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  submitButtonText: { fontFamily: fonts.bodySemibold, color: colors.white, fontSize: 13 },
  empty: { fontFamily: fonts.body, color: colors.muted, fontSize: 13 },
  reviewRow: { marginBottom: 14, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  reviewerName: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.ink },
  reviewComment: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, marginBottom: 4 },
  reviewDate: { fontFamily: fonts.body, fontSize: 10, color: colors.faint },
});