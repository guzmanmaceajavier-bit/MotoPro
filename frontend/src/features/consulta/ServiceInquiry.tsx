import { motion } from "framer-motion";
import { useServiceInquiry } from "./hooks/useServiceInquiry";
import { SearchForm } from "./components/SearchForm";
import { ResultCard } from "./components/ResultCard";
import { LoadingState } from "./components/LoadingState";
import { EmptyState } from "./components/EmptyState";
import type { ServiceRequest } from "./hooks/useServiceInquiry";

interface ServiceInquiryProps {
  initialResults?: ServiceRequest[];
  onSearch?: (results: ServiceRequest[]) => void;
}

export function ServiceInquiry({ initialResults, onSearch }: ServiceInquiryProps) {
  const { searchType, setSearchType, query, setQuery, results, searched, loading, error, handleSearch } = useServiceInquiry();

  const displayResults = searched ? results : (initialResults ?? null);

  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-3xl px-4">
        <SearchForm
          searchType={searchType}
          onTypeChange={setSearchType}
          query={query}
          onQueryChange={setQuery}
          loading={loading}
          error={error}
          onSubmit={handleSearch}
        />

        {searched && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {loading ? (
              <LoadingState />
            ) : displayResults && displayResults.length > 0 ? (
              displayResults.map((r, i) => <ResultCard key={r.id} request={r} index={i} />)
            ) : (
              <EmptyState query={query} />
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}
