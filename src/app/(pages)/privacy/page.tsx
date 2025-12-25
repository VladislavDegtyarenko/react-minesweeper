import { generateMetadata } from "../../../utils/seo";

export const metadata = generateMetadata({
  title: "Privacy Policy",
  description:
    "Privacy Policy for Minesweeper. Learn how we handle your data and protect your privacy.",
  path: "/privacy",
  noIndex: true, // remove when pages are ready for public access
});

export default function PrivacyPage() {
  return <div>Privacy</div>;
}
