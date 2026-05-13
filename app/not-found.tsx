import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
      <h2 className="text-6xl font-serif mb-4">404</h2>
      <h3 className="text-2xl font-medium mb-4">Page Not Found</h3>
      <p className="text-muted-foreground mb-8 max-w-md">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Button asChild variant="default">
        <Link href="/">Return to Homepage</Link>
      </Button>
    </div>
  );
}
