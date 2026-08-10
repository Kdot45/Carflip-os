export function AiDisclaimer({ text }: { text: string }) {
  return (
    <p className="mt-2 border-t border-slate-100 pt-2 text-xs leading-relaxed text-slate-500">
      ⚠️ {text}
    </p>
  );
}
