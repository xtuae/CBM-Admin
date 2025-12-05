
interface TabFilterProps {
  tabs: { label: string; value: string }[];
  activeTab: string;
  onTabChange: (value: string) => void;
  className?: string;
}

const TabFilter = ({ tabs, activeTab, onTabChange, className = '' }: TabFilterProps) => {
  return (
    <div className={`flex space-x-1 ${className}`.trim()}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onTabChange(tab.value)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === tab.value
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabFilter;