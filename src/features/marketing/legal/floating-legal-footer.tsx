import Link from "next/link";

export function FloatingLegalFooter() {
  return (
    <div className="fixed bottom-0 inset-x-0 z-50 flex justify-center gap-4 bg-background/80 p-2 text-sm text-muted-foreground backdrop-blur-sm">
      <Link href="/legal/terms" className="hover:underline">
        Terms
      </Link>
      <Link href="/legal/privacy" className="hover:underline">
        Privacy
      </Link>
    </div>
  );
}
