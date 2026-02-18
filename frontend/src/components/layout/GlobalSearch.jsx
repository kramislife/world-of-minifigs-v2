import {
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import SearchInput from "@/components/search/SearchInput";
import SearchResults from "@/components/search/SearchResults";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";

const GlobalSearch = ({ isOpen, onClose }) => {
  const {
    searchTerm,
    setSearchTerm,
    isLoading,
    categorizedResults,
    hasResults,
    hasSearched,
    handleSelect,
    handleKeyDown,
    inputRef,
  } = useGlobalSearch({ isOpen, onClose });

  return (
    <SheetContent side="top" className="px-5 py-10">
      <SheetTitle className="sr-only">Search</SheetTitle>
      <SheetDescription className="sr-only">
        Search for products, categories, collections, and more.
      </SheetDescription>

      <SearchInput
        inputRef={inputRef}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleKeyDown={handleKeyDown}
        isLoading={isLoading}
      />

      {hasSearched && !isLoading && !hasResults && (
        <p className="text-center pt-10 border-t border-dashed">
          Uh-oh! We couldn't find anything matches for{" "}
          <span className="font-bold tracking-wider">"{searchTerm}"</span>. Try
          a different keyword!
        </p>
      )}

      {hasResults && (
        <SearchResults
          categorizedResults={categorizedResults}
          handleSelect={handleSelect}
        />
      )}
    </SheetContent>
  );
};

export default GlobalSearch;
