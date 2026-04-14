'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { createCx } from '@/utils';
import {
  COUNTRY_OPTIONS,
  COUNTRY_PLACEHOLDER,
} from '@/constants/countries';
import styles from './styles.module.scss';

const cx = createCx(styles);

type DropdownRect = {
  top: number;
  left: number;
  width: number;
};

type CountryAutocompleteProps = {
  disabled?: boolean;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
};

const CountryAutocomplete = (props: CountryAutocompleteProps) => {
  const { disabled = false, required = false, value, onChange } = props;
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [dropdownRect, setDropdownRect] = useState<DropdownRect | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filtered = query.trim()
    ? COUNTRY_OPTIONS.filter((c) =>
        c.toLowerCase().includes(query.toLowerCase()),
      )
    : COUNTRY_OPTIONS;

  const measureRect = () => {
    if (!wrapperRef.current) {
      return null;
    }

    const rect = wrapperRef.current.getBoundingClientRect();

    return {
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    };
  };

  const openDropdown = () => {
    setQuery('');
    setActiveIndex(-1);
    setDropdownRect(measureRect());
    setIsOpen(true);
  };

  const closeDropdown = () => {
    setIsOpen(false);
    setQuery('');
    setActiveIndex(-1);
    setDropdownRect(null);
  };

  const selectOption = (option: string) => {
    onChange(option);
    closeDropdown();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    setActiveIndex(-1);

    if (!isOpen) {
      setDropdownRect(measureRect());
      setIsOpen(true);
    }
  };

  const handleBlur = () => {
    setTimeout(closeDropdown, 100);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isOpen) {
      if (event.key === 'ArrowDown' || event.key === 'Enter') {
        event.preventDefault();
        openDropdown();
      }

      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();

      if (activeIndex >= 0 && filtered[activeIndex]) {
        selectOption(filtered[activeIndex]);
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closeDropdown();
    }
  };

  useEffect(() => {
    if (!listRef.current || activeIndex < 0) {
      return;
    }

    const item = listRef.current.children[activeIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  return (
    <div className={cx('wrapper')} ref={wrapperRef}>
      <input
        autoComplete="off"
        disabled={disabled}
        placeholder={value || COUNTRY_PLACEHOLDER}
        required={required && !value}
        value={isOpen ? query : value}
        aria-autocomplete="list"
        aria-expanded={isOpen}
        role="combobox"
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={openDropdown}
        onKeyDown={handleKeyDown}
      />
      {isOpen && filtered.length > 0 && dropdownRect &&
        createPortal(
          <ul
            className={cx('dropdown')}
            ref={listRef}
            role="listbox"
            style={{
              top: dropdownRect.top,
              left: dropdownRect.left,
              width: dropdownRect.width,
            }}
          >
            {filtered.map((option, index) => (
              <li
                className={cx('option', {
                  optionActive: index === activeIndex,
                  optionSelected: option === value,
                })}
                key={option}
                role="option"
                aria-selected={option === value}
                onMouseDown={(event) => {
                  event.preventDefault();
                  selectOption(option);
                }}
              >
                {option}
              </li>
            ))}
          </ul>,
          document.body,
        )}
    </div>
  );
};

export default CountryAutocomplete;
