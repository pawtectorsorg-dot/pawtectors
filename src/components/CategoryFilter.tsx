import { useState, useEffect, useRef } from 'react';
import { Grid3X3, ShoppingBag, Stethoscope, Scissors, Home, GraduationCap, Filter, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap = {
  Grid3X3,
  ShoppingBag,
  Stethoscope,
  Scissors,
  Home,
  GraduationCap,
};

interface Category {
  id: string;
  label: string;
  icon: keyof typeof iconMap;
}

interface CategoryFilterProps {
  categories: readonly Category[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter = ({ categories, activeCategory, onCategoryChange }: CategoryFilterProps) => {
  const [showMobileDropdown, setShowMobileDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowMobileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const activeLabel = categories.find(cat => cat.id === activeCategory)?.label || 'All Services';
  return (
    <section className="py-8 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4">
        
        {/* Desktop View - Keep Same Design */}
        <div className="hidden md:flex flex-wrap justify-center gap-3">
          {categories.map((category, index) => {
            const Icon = iconMap[category.icon];
            const isActive = activeCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={cn(
                  "flex items-center gap-2 px-5 py-3 rounded-xl font-display font-semibold text-sm transition-all duration-300",
                  "animate-fade-in",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                )}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <Icon className="w-4 h-4" />
                {category.label}
              </button>
            );
          })}
        </div>

        {/* Mobile View - Filter Dropdown */}
        <div className="md:hidden relative" ref={dropdownRef}>
          <button
            onClick={() => setShowMobileDropdown(!showMobileDropdown)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-muted text-muted-foreground font-medium w-full justify-between hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span>{activeLabel}</span>
            </div>
            <ChevronDown className={cn(
              "w-4 h-4 transition-transform duration-200",
              showMobileDropdown ? "rotate-180" : ""
            )} />
          </button>

          {/* Mobile Dropdown with Checkboxes */}
          {showMobileDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
              <div className="p-3 space-y-2">
                {categories.map((category) => {
                  const Icon = iconMap[category.icon];
                  const isActive = activeCategory === category.id;
                  
                  return (
                    <label
                      key={category.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name="category"
                        checked={isActive}
                        onChange={() => {
                          onCategoryChange(category.id);
                          setShowMobileDropdown(false);
                        }}
                        className="w-4 h-4 text-primary accent-primary"
                      />
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{category.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CategoryFilter;
