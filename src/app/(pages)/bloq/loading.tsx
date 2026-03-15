export default function BloqPageLoading() {
  return (
    <div className="container flex flex-col pb-10 px-2 sm:px-0">
      <div className="h-64 bg-muted rounded-lg animate-pulse mt-10 mb-4" />
      
      <div className="h-10 w-full bg-muted rounded-md animate-pulse mb-4" />
      
      <div className="grid grid-cols-1 gap-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div 
            key={i} 
            className="h-32 bg-muted rounded-md animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
