import { generateMetadata } from "@/lib/seo";

export const metadata = generateMetadata({
  title: "Blog",
  description:
    "Minesweeper tips, strategies, updates and puzzle game insights. Stay tuned for the latest news.",
  path: "/blog",
  noIndex: true, // remove when pages are ready for public access
});

export default function BlogPage() {
  return <div>Blog</div>;
}
