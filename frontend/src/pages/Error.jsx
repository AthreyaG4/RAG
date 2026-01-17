export default function NotFound() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="text-muted-foreground mb-4 text-xl">
          Oops! Page not found
        </p>
        <a href="/" className="text-primary hover:text-primary/90 underline">
          Return to Home
        </a>
      </div>
    </div>
  );
}
