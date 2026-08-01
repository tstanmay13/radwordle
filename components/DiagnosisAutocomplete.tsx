'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Send } from 'lucide-react';
import { Condition } from '@/lib/supabase';

interface DiagnosisAutocompleteProps {
  conditions: Condition[];
  onSubmit: (diagnosis: string) => void;
  onDropdownStateChange: (isOpen: boolean) => void;
  previousGuesses?: string[];
  isMobile?: boolean;
  disabled?: boolean;
  /** When provided, shows the "Guess N / total" label inside the input pill. */
  current?: number;
  total?: number;
}

// Amber Submit gradient — shares the AccentButton token wiring.
const ACCENT_STYLE = {
  background: 'linear-gradient(to bottom, var(--color-accent-light), var(--color-accent))',
  boxShadow: '0 4px 14px rgba(245, 158, 11, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
};

// Input pill — a themed off-white field (cool white that sits in the navy
// theme). Kept near-opaque with no backdrop-filter: it reads as a clean light
// bar either way, and dropping the live blur makes the fixed mobile bar much
// cheaper to scroll past. The border color is driven by the error state.
const PILL_STYLE = {
  background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.97), rgba(231, 237, 248, 0.95))',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.42), inset 0 1px 0 rgba(255, 255, 255, 0.7)',
};

// Dark glass dropdown panel.
const DROPDOWN_STYLE = {
  background: 'rgba(17, 27, 52, 0.92)',
  backdropFilter: 'var(--glass-blur)',
  WebkitBackdropFilter: 'var(--glass-blur)',
  border: '1px solid rgba(255, 255, 255, 0.14)',
};

export default function DiagnosisAutocomplete({
  conditions,
  onSubmit,
  onDropdownStateChange,
  previousGuesses = [],
  isMobile = false,
  disabled = false,
  current,
  total,
}: DiagnosisAutocompleteProps) {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Create a Map of normalized condition names to original names for O(1) lookup
  const conditionNameMap = useMemo(() => {
    const map = new Map<string, string>();
    conditions.forEach(c => map.set(c.name.toLowerCase().trim(), c.name));
    return map;
  }, [conditions]);

  // Get the exact condition name with proper casing (returns null if not found)
  const getExactConditionName = useCallback((value: string): string | null => {
    return conditionNameMap.get(value.toLowerCase().trim()) ?? null;
  }, [conditionNameMap]);

  // Efficient search with memoization
  const filteredConditions = useMemo(() => {
    if (!inputValue.trim()) {
      return [];
    }

    const searchTerm = inputValue.toLowerCase().trim();

    // Filter conditions that match name only
    const matches = conditions.filter((condition) => {
      return condition.name.toLowerCase().includes(searchTerm);
    });

    // Limit to 40 results for performance
    return matches.slice(0, 40);
  }, [inputValue, conditions]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setIsOpen(value.trim().length > 0);
    setSelectedIndex(-1);
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError(null);
    }
  };

  // Check if a condition was previously guessed (case-insensitive)
  const isPreviouslyGuessed = (conditionName: string) => {
    const normalizedName = conditionName.toLowerCase().trim();
    return previousGuesses.some(
      guess => guess.toLowerCase().trim() === normalizedName
    );
  };

  // Handle option selection
  const handleSelectOption = (conditionName: string) => {
    // Prevent selection of previously guessed conditions
    if (isPreviouslyGuessed(conditionName)) {
      return;
    }

    setInputValue(conditionName);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || filteredConditions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        // Skip previously guessed items
        let nextIndex = selectedIndex + 1;
        while (
          nextIndex < filteredConditions.length &&
          isPreviouslyGuessed(filteredConditions[nextIndex].name)
        ) {
          nextIndex++;
        }
        if (nextIndex < filteredConditions.length) {
          setSelectedIndex(nextIndex);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        // Skip previously guessed items
        let prevIndex = selectedIndex - 1;
        while (prevIndex >= 0 && isPreviouslyGuessed(filteredConditions[prevIndex].name)) {
          prevIndex--;
        }
        setSelectedIndex(prevIndex);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredConditions.length) {
          const selectedCondition = filteredConditions[selectedIndex].name;
          if (!isPreviouslyGuessed(selectedCondition)) {
            handleSelectOption(selectedCondition);
          }
        } else {
          handleSubmit();
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && dropdownRef.current) {
      const selectedElement = dropdownRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  // Notify parent component when dropdown state changes and scroll into view
  useEffect(() => {
    const isDropdownVisible = isOpen && filteredConditions.length > 0;
    onDropdownStateChange(isDropdownVisible);

    // When dropdown opens, scroll to ensure dropdown options are visible (desktop only)
    if (isDropdownVisible && dropdownRef.current && !isMobile) {
      // Small delay to allow the dropdown to render and parent padding to be applied
      setTimeout(() => {
        dropdownRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }, [isOpen, filteredConditions.length, onDropdownStateChange, isMobile]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = () => {
    const trimmedValue = inputValue.trim();

    if (!trimmedValue) {
      return;
    }

    // Check if the input matches a valid condition from the list
    const exactConditionName = getExactConditionName(trimmedValue);

    if (!exactConditionName) {
      // Input doesn't match any valid condition
      setValidationError('Please select a diagnosis from the list');
      return;
    }

    // Check if already guessed
    if (isPreviouslyGuessed(exactConditionName)) {
      setValidationError('You have already guessed this diagnosis');
      return;
    }

    // Valid submission - use the exact condition name for consistency
    onSubmit(exactConditionName);
    setInputValue('');
    setIsOpen(false);
    setValidationError(null);
  };

  const showLabel = current != null && total != null;

  return (
    <div ref={containerRef} className="w-full max-w-2xl mx-auto relative z-50">
      {/* Positioning context: dropdown anchors to the pill only, not the error row */}
      <div className="relative">
        {/* Dropdown menu — appears above on mobile, below on desktop */}
        {isOpen && filteredConditions.length > 0 && (
          <div
            className={`absolute left-0 right-0 z-50 overflow-hidden rounded-2xl shadow-2xl ${
              isMobile ? 'bottom-full mb-2.5' : 'top-full mt-2.5'
            }`}
            style={DROPDOWN_STYLE}
          >
            <div
              ref={dropdownRef}
              className="overflow-y-auto"
              style={{ maxHeight: isMobile ? 220 : 256 }}
            >
              {filteredConditions.map((condition, index) => {
                const isDisabled = isPreviouslyGuessed(condition.name);

                return (
                  <button
                    key={condition.id}
                    onClick={() => handleSelectOption(condition.name)}
                    disabled={isDisabled}
                    className={`w-full text-left font-baloo-2 transition-colors border-b border-white/[0.06] last:border-b-0 ${
                      isMobile ? 'px-[18px] py-[11px] text-[15px]' : 'px-5 py-3 text-base'
                    } ${
                      isDisabled ? 'cursor-not-allowed' : 'hover:bg-white/5'
                    } ${index === selectedIndex && !isDisabled ? 'bg-white/10' : ''}`}
                  >
                    <div className={`font-medium ${isDisabled ? 'text-white/30' : 'text-white/90'}`}>
                      {condition.name}
                      {isDisabled && (
                        <span className="ml-2 text-xs opacity-70">(Previously selected)</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Result count indicator */}
            {filteredConditions.length === 40 && (
              <div className="px-4 py-2 text-center text-xs text-white/45 font-baloo-2 border-t border-white/10 bg-black/20">
                Showing first 40 results. Type more to narrow down.
              </div>
            )}
          </div>
        )}

        {/* Glass input pill: label · divider · input · Submit */}
        <div
          className={`flex items-center w-full rounded-2xl border ${
            validationError ? 'border-[rgba(196,115,107,0.85)]' : 'border-[rgba(148,163,190,0.45)]'
          } ${isMobile ? 'gap-2.5 pl-3.5 pr-[7px] py-[7px]' : 'gap-3.5 pl-[18px] pr-2 py-2'}`}
          style={PILL_STYLE}
        >
          {showLabel && (
            <>
              <p className="font-mono uppercase select-none flex-shrink-0 font-semibold tracking-[0.12em] text-slate-500 text-[11px] sm:text-xs">
                Guess {current} / {total}
              </p>
              <span
                className="flex-shrink-0 w-px bg-slate-400/40"
                style={{ height: isMobile ? 22 : 26 }}
                aria-hidden="true"
              />
            </>
          )}

          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={disabled ? 'Accept notice to play' : 'Diagnosis...'}
            aria-invalid={!!validationError}
            aria-describedby={validationError ? 'diagnosis-error' : undefined}
            className={`flex-1 min-w-0 bg-transparent outline-none font-baloo-2 font-medium text-slate-800 placeholder-slate-400 ${
              isMobile ? 'text-base' : 'text-lg'
            }`}
            autoComplete="off"
          />

          <button
            onClick={handleSubmit}
            disabled={disabled}
            className={`flex items-center gap-2 font-baloo-2 font-bold flex-shrink-0 rounded-xl transition-transform active:scale-95 ${
              isMobile ? 'px-4 py-[9px] text-[15px]' : 'px-[22px] py-[11px] text-[17px]'
            } ${disabled ? 'bg-gray-500 text-gray-300 cursor-not-allowed' : 'text-black'}`}
            style={disabled ? undefined : ACCENT_STYLE}
          >
            Submit
            <Send size={isMobile ? 16 : 18} />
          </button>
        </div>
      </div>

      {/* Validation error message */}
      {validationError && (
        <div
          id="diagnosis-error"
          role="alert"
          className="mt-2 px-3 py-2 rounded-lg text-[13px] font-baloo-2 flex items-center gap-2 text-[#ffd9d4] border border-[rgba(196,115,107,0.45)] bg-[rgba(196,115,107,0.18)]"
        >
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {validationError}
        </div>
      )}
    </div>
  );
}
