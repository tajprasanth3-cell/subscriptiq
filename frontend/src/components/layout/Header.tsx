import { useState, useRef, useEffect, type ReactNode } from 'react';
import { Search, ChevronDown, LogOut, Menu, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  actions?: ReactNode;
}

export const Header = ({
  title,
  subtitle,
  showSearch = false,
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  actions,
}: HeaderProps) => {
  const { role, currentUserEmail, organizationName, logout, toggleMobileMenu } = useApp();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const effectiveOrgName =
    role === 'Customer'
      ? organizationName && !organizationName.includes('Acme')
        ? organizationName
        : 'TechCorp'
      : role === 'Super Admin'
      ? 'SubscriptIQ Platform'
      : organizationName || 'Acme Corp';

  const initials = effectiveOrgName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 select-none w-full max-w-full">
      {/* Top Navbar Row */}
      <div className="min-h-16 lg:h-20 py-2.5 sm:py-3 px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2">
        {/* Left: Mobile Hamburger Toggle + Page Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={toggleMobileMenu}
            className="p-1.5 sm:p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl lg:hidden cursor-pointer shrink-0"
            title="Open navigation menu"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h1 className="text-base sm:text-xl lg:text-2xl font-bold tracking-tight text-slate-900 leading-tight truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 hidden sm:block truncate max-w-xs md:max-w-md">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right Controls: Desktop Search + Action Buttons + Profile */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 shrink-0">
          {/* Tablet & Desktop Inline Search */}
          {showSearch && (
            <div className="hidden sm:block relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-40 md:w-56 lg:w-72 pl-9 pr-3 py-1.5 sm:py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs sm:text-sm placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all shadow-2xs"
              />
              {searchValue && (
                <button
                  onClick={() => onSearchChange?.('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {actions && <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">{actions}</div>}

          {/* User Avatar & Dropdown */}
          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 sm:pl-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-indigo-600 text-white font-extrabold text-[11px] sm:text-xs flex items-center justify-center shadow-xs shrink-0">
                {initials}
              </div>
              <div className="hidden md:block text-left text-xs mr-1">
                <p className="font-bold text-slate-900 leading-tight truncate max-w-[110px]">
                  {effectiveOrgName}
                </p>
                <p className="text-[10px] text-slate-400 font-medium truncate max-w-[110px]">{currentUserEmail}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform hidden sm:block shrink-0" />
            </button>

            {/* Profile Menu Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl border border-slate-200 shadow-xl p-3 space-y-2 animate-in fade-in zoom-in-95 duration-100 z-50">
                <div className="p-2 border-b border-slate-100">
                  <p className="font-bold text-xs text-slate-900 truncate">{effectiveOrgName}</p>
                  <p className="text-[11px] text-slate-500 truncate">{currentUserEmail}</p>
                </div>

                <button
                  onClick={() => {
                    logout();
                    setDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile-Only Dedicated Search Row (Zero Overflow, Full Width) */}
      {showSearch && (
        <div className="sm:hidden px-3 pb-2.5 pt-0.5 w-full border-t border-slate-100 bg-white">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-8 py-2 bg-slate-50/90 border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all shadow-2xs"
            />
            {searchValue && (
              <button
                onClick={() => onSearchChange?.('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
