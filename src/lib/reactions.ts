// The reactions a member can leave on a post. `type` values mirror the
// backend's ReactionType enum exactly; the mobile app has the same list.
export type ReactionType = "HEART" | "THUMBS_UP" | "RAISED_HANDS" | "PRAYING" | "FIRE" | "CELEBRATE" | "SAD";

export const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: "HEART", emoji: "❤️", label: "Love" },
  { type: "THUMBS_UP", emoji: "👍", label: "Like" },
  { type: "RAISED_HANDS", emoji: "🙌", label: "Praise" },
  { type: "PRAYING", emoji: "🙏", label: "Praying" },
  { type: "FIRE", emoji: "🔥", label: "Fire" },
  { type: "CELEBRATE", emoji: "🎉", label: "Celebrate" },
  { type: "SAD", emoji: "😢", label: "Sad" },
];

export type ReactionCounts = Partial<Record<ReactionType, number>>;

export function reactionEmoji(type: ReactionType | null | undefined) {
  return REACTIONS.find((r) => r.type === type)?.emoji ?? null;
}
