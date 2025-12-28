import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ page, totalPages, onChange }) => {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    if (page <= 3) {
      return [1, 2, 3, "...", totalPages];
    }

    if (page >= totalPages - 2) {
      return [1, "...", totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, "...", page - 1, page, page + 1, "...", totalPages];
  };

  return (
    <div className="flex items-center justify-center gap-3 mt-12">
      {/* Prev */}
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="w-10 h-10 rounded-xl flex items-center justify-center
          bg-[#0f172a] text-gray-300 hover:text-white
          disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={20} />
      </button>

      {/* Pages */}
      <div className="flex items-center gap-2">
        {getPages().map((p, i) =>
          p === "..." ? (
            <span
              key={`dots-${i}`}
              className="px-2 text-gray-400 select-none"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={`w-10 h-10 rounded-xl font-semibold transition
                ${
                  page === p
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-[#0f172a] text-gray-300 hover:bg-[#1e293b] hover:text-white"
                }`}
            >
              {p}
            </button>
          )
        )}
      </div>

      {/* Next */}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="w-10 h-10 rounded-xl flex items-center justify-center
          bg-[#0f172a] text-gray-300 hover:text-white
          disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default Pagination;
