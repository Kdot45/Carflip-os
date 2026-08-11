export function AiDisclaimer({ text }: { text: string }) {
  return (
    <p className="mt-2 border-t border-ink-600 pt-2 text-xs leading-relaxed text-ink-300">
      ⚠️ {text}
    </p>
  );
}
