import { Chip } from '../ui';

interface FiltersBarProps {
  categories: Array<{ id: string; name: string }>;
  selectedCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onClearFilters: () => void;
}

const FiltersBar = ({
  categories,
  selectedCategory,
  onCategoryChange,
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  onClearFilters
}: FiltersBarProps) => {
  return (
    <div className="card p-6 mb-8">
      {/* Category Chips */}
      <div className="mb-6">
        <div className="text-sm text-gray-300 mb-3">Categories</div>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Chip
              key={category.id}
              active={selectedCategory === category.id || (!selectedCategory && category.id === 'all')}
              onClick={() => onCategoryChange(category.id === 'all' ? null : category.id)}
            >
              {category.name}
            </Chip>
          ))}
        </div>
      </div>

      {/* Search and Sort Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search credit packs..."
              className="input pl-10 w-full"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="flex-1 max-w-xs">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="select w-full"
          >
            <option value="recommended">Recommended</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="newest">Newest</option>
          </select>
        </div>

        {/* Clear Filters */}
        {(searchTerm || selectedCategory) && (
          <button
            onClick={onClearFilters}
            className="btn-secondary whitespace-nowrap"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default FiltersBar;