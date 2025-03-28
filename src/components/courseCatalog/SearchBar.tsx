
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, setSearchQuery, handleSearch }) => {
  return (
    <div className="relative mb-6">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
      <Input 
        type="text" 
        placeholder="Search educational videos..." 
        className="w-full bg-edu-card-bg border-none pl-10 pr-24" 
        value={searchQuery} 
        onChange={e => setSearchQuery(e.target.value)} 
        onKeyDown={e => e.key === 'Enter' && handleSearch()} 
      />
      <Button 
        className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-edu-purple px-3 py-1 h-8 text-sm" 
        onClick={handleSearch}
      >
        Search
      </Button>
    </div>
  );
};

export default SearchBar;