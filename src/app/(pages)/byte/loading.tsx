export default function BytePageLoading() {
  return (
    <div className="container flex flex-col py-10 px-2 sm:px-0 font-roboto-mono lowercase">
      <div className="h-48 bg-muted rounded-lg animate-pulse mb-4" />
      
      <div className="h-10 w-full bg-muted rounded-md animate-pulse mb-4" />
      
      <div className="grid grid-cols-1 gap-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div 
            key={i} 
            className="h-20 bg-muted rounded-md animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
