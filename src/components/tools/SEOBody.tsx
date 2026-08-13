interface SEOBodyProps {
  content: string;
}

export default function SEOBody({ content }: SEOBodyProps) {
  return (
    <div className="prose prose-invert prose-sm sm:prose-base max-w-none">
      <div
        className="text-[var(--text-secondary)] leading-relaxed space-y-4 [&>p]:mb-4 [&>h2]:text-[var(--text-primary)] [&>h2]:text-lg [&>h2]:font-semibold [&>h2]:mt-8 [&>h2]:mb-3 [&>h3]:text-[var(--text-primary)] [&>h3]:font-medium [&>h3]:mt-6 [&>h3]:mb-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:space-y-1"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
