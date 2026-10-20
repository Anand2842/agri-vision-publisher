import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { articlePdf } from "@/lib/data";

/** Opens the article's PDF in a new tab; falls back to the article page when no PDF exists. */
export function ArticleLink({
  slug,
  pdfPath,
  className,
  children,
}: {
  slug: string;
  pdfPath?: string | null;
  className?: string;
  children: ReactNode;
}) {
  const href = articlePdf(pdfPath);
  if (href)
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  return (
    <Link to="/articles/$slug" params={{ slug }} className={className}>
      {children}
    </Link>
  );
}
