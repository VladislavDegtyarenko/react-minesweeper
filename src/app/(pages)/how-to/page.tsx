import { generateMetadata } from "../../../utils/seo";

export const metadata = generateMetadata({
  title: "How to Play",
  description:
    "Learn Minesweeper rules, strategies, and tips. Master the classic puzzle game with our comprehensive guide.",
  path: "/how-to",
  noIndex: true, // remove when pages are ready for public access
});

export default function HowToPage() {
  return <div>How To</div>;
}
