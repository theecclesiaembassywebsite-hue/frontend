"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getPageContent, normalizePath } from "@/lib/site-content";

interface EditableContentProps {
  pagePath?: string;
}

export default function EditableContent({ pagePath }: EditableContentProps) {
  const pathname = usePathname();
  const [content, setContent] = useState<{ writeUp: string; images: string[] }>({ writeUp: "", images: [] });

  useEffect(() => {
    const targetPath = normalizePath(pagePath || pathname || "/");
    setContent(getPageContent(targetPath));
  }, [pagePath, pathname]);

  if (!content.writeUp.trim() && content.images.length === 0) {
    return null;
  }

  const paragraphs = content.writeUp
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <section className="bg-white rounded-[20px] border border-[#E4E0EF] shadow-sm p-8 my-10">
      {paragraphs.length > 0 && (
        <div className="space-y-5 font-body text-[#4E4B6C] leading-relaxed text-base">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      )}

      {content.images.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {content.images.map((imageUrl, index) => (
            <div key={index} className="overflow-hidden rounded-3xl bg-[#F7F5FF] shadow-sm">
              <img src={imageUrl} alt={`Page media ${index + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
