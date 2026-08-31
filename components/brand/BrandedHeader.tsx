// components/brand/BrandedHeader.tsx
//
// 2026-08-30: THIS IS NOW A RE-EXPORT. The component lives in @craudioviz/platform-sdk.
//
// There were FIFTY-NINE local copies of this file across the org in ELEVEN DISTINCT
// VERSIONS. That is not a shared header; it is 59 headers that happen to look alike,
// and a brand change lands in one of eleven places while nobody knows which.
//
// The forks were not merely stale — they were WRONG. Three fixes existed only in the
// SDK copy:
//
//   The plan union was missing 'creator' and 'enterprise'. User.subscription_tier
//   carries both, so a creator or enterprise customer fell through to 'free' and the
//   header displayed the WRONG PLAN to a paying customer. That was live in 34 repos.
//
//   The import used a `@/` path alias, which resolves against the CONSUMER's
//   tsconfig rather than the package — so from node_modules it resolved to nothing.
//
//   exactOptionalPropertyTypes: `name?: string` rejects an explicit undefined, and
//   User.name legitimately can be undefined.
//
// Re-exporting rather than deleting the file: every existing import of
// '@/components/brand/BrandedHeader' keeps working, so this is a one-line change per
// repo instead of a find-and-replace across every page that renders a header.
export { BrandedHeader } from '@craudioviz/platform-sdk';
export { BrandedHeader as default } from '@craudioviz/platform-sdk';
