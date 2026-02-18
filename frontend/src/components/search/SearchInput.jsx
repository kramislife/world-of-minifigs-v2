import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

const SearchInput = ({
  inputRef,
  searchTerm,
  setSearchTerm,
  handleKeyDown,
  isLoading,
}) => (
  <div className="relative flex items-center gap-2 w-full">
    <Search className="absolute left-3 size-5 md:size-6 text-muted-foreground dark:text-foreground z-10 pointer-events-none" />
    <div className="flex-1">
      <Input
        ref={inputRef}
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search products, collections, categories..."
        className="w-full pl-12 h-10 border-none text-md md:text-xl focus-visible:ring-0 dark:bg-background dark:placeholder:text-foreground"
      />
    </div>
    {isLoading && <LoadingSpinner minHeight="10px" size="h-5 w-5" />}
  </div>
);

export default SearchInput;
