import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import howtoContent from "../../docs/HOWTO.md?raw";

export const HelpView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-2xl p-8 md:p-12 shadow-xl border border-gray-200 dark:border-gray-800">
      <article className="prose dark:prose-invert prose-blue max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-blue-600 dark:prose-a:text-blue-400">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {howtoContent}
        </ReactMarkdown>
      </article>
    </div>
  );
};
