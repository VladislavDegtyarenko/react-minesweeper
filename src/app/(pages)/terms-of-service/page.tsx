import { generateMetadata } from "../../../utils/seo";

export const metadata = generateMetadata({
  title: "Terms of Service",
  description:
    "Terms of Service for Minesweeper. Read our terms and conditions for using the game.",
  path: "/terms-of-service",
  noIndex: true, // remove when pages are ready for public access
});

export default function TermsOfServicePage() {
  return <div>Terms of Service</div>;
}
