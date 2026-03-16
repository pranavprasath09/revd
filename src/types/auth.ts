export type UserTier = "free" | "premium";

export interface User {
  id: string;
  email: string;
  displayName: string;
  tier: UserTier;
  avatar?: string;
}
