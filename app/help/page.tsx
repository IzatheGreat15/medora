
import { notFound } from "next/navigation";
import HelpArticle from "@/components/help/HelpArticle";
import { helpArticles } from "@/lib/help/articles";
export default function HelpHomePage() {
  const article = helpArticles.find(
    (item) => item.slug === "dashboard"
  );

  if (!article) notFound();

  return <HelpArticle article={article} />;
}
