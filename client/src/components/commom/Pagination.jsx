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
      {/* ปุ่มก่อนหน้า (Prev) */}
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="w-10 h-10 rounded-xl flex items-center justify-center
          bg-white border border-orange-100 text-orange-600 shadow-sm
          hover:bg-orange-50 hover:border-orange-200 transition-all
          disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={20} />
      </button>

      {/* รายการหน้า (Pages) */}
      <div className="flex items-center gap-2">
        {getPages().map((p, i) =>
          p === "..." ? (
            <span
              key={`dots-${i}`}
              className="px-2 text-orange-300 select-none font-bold"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={`w-10 h-10 rounded-xl font-bold transition-all duration-300 shadow-sm
                ${
                  page === p
                    ? "bg-linear-to-br from-orange-500 to-amber-500 text-white shadow-orange-200 ring-2 ring-orange-100"
                    : "bg-white border border-orange-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200"
                }`}
            >
              {p}
            </button>
          )
        )}
      </div>

      {/* ปุ่มถัดไป (Next) */}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="w-10 h-10 rounded-xl flex items-center justify-center
          bg-white border border-orange-100 text-orange-600 shadow-sm
          hover:bg-orange-50 hover:border-orange-200 transition-all
          disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default Pagination;