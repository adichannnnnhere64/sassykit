import { useState, forwardRef } from 'react';
import {
  PillsInput,
  Pill,
  Combobox,
  CheckIcon,
  Group,
  useCombobox,
  ComboboxProps,
  Box
} from '@mantine/core';

interface MultiSelectOption {
  value: string;
  label: string;
  color?: string;
}

interface MultiSelectComboboxProps extends Omit<ComboboxProps, 'children'> {
  data: MultiSelectOption[] | string[];
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  searchable?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  error?: string;
  limit?: number;
  nothingFoundMessage?: string;
  onSearchChange?: (search: string) => void;
  searchValue?: string;
  // Form integration props
  name?: string;
  form?: any; // For react-hook-form or other form libraries
  label?: string;
}

const MultiSelectCombobox = forwardRef<HTMLInputElement, MultiSelectComboboxProps>(
  (
    {
      data = [],
      value = [],
      onChange,
      placeholder = "Search values",
      searchable = true,
      clearable = true,
      disabled = false,
      error,
      limit,
      nothingFoundMessage = "Nothing found...",
      onSearchChange,
      searchValue,
      name,
      form,
      label,
      ...comboboxProps
    },
    ref
  ) => {
    const combobox = useCombobox({
      onDropdownClose: () => combobox.resetSelectedOption(),
      onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
    });

    const [internalSearch, setInternalSearch] = useState('');
    const [internalValue, setInternalValue] = useState<string[]>(value);

    // Use controlled or uncontrolled state
    const currentValue = value || internalValue;
    const currentSearch = searchValue !== undefined ? searchValue : internalSearch;

    // Normalize data to consistent format
    const normalizedData: MultiSelectOption[] = data.map((item) =>
      typeof item === 'string'
        ? { value: item, label: item }
        : item
    );

    const handleValueSelect = (val: string) => {
      const newValue = currentValue.includes(val)
        ? currentValue.filter((v) => v !== val)
        : [...currentValue, val];

      // Respect limit if provided
      if (limit && newValue.length > limit && !currentValue.includes(val)) {
        return;
      }

      if (onChange) {
        onChange(newValue);
      } else {
        setInternalValue(newValue);
      }

      // Integrate with form libraries
      if (form && name) {
        form.setValue(name, newValue);
      }
    };

    const handleValueRemove = (val: string) => {
      const newValue = currentValue.filter((v) => v !== val);

      if (onChange) {
        onChange(newValue);
      } else {
        setInternalValue(newValue);
      }

      if (form && name) {
        form.setValue(name, newValue);
      }
    };

    const handleSearchChange = (newSearch: string) => {
      if (onSearchChange) {
        onSearchChange(newSearch);
      } else {
        setInternalSearch(newSearch);
      }
      combobox.updateSelectedOptionIndex();
    };

    const handleClearAll = () => {
      const newValue: string[] = [];
      if (onChange) {
        onChange(newValue);
      } else {
        setInternalValue(newValue);
      }

      if (form && name) {
        form.setValue(name, newValue);
      }
    };

    // Color indicator component
    const ColorIndicator = ({ color }: { color?: string }) => {
      if (!color) return null;

      return (
        <Box
          component="span"
          style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: color,
            flexShrink: 0,
            border: '1px solid rgba(0, 0, 0, 0.2)',
          }}
        />
      );
    };

    // Create pills for selected values
    const values = currentValue.map((item) => {
      const option = normalizedData.find(opt => opt.value === item);
      return (
        <Box
          key={item}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            borderRadius: 'var(--mantine-radius-sm)',
            fontSize: '14px',
            border: '1px solid var(--mantine-color-gray-3)',
            maxHeight: '28px',
          }}
        >
          <ColorIndicator color={option?.color} />
          <span style={{ lineHeight: 1 }}>{option?.label || item}</span>
          <button
            type="button"
            onClick={() => handleValueRemove(item)}
            disabled={disabled}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '2px',
              marginLeft: '4px',
              opacity: 0.6,
              fontSize: '12px',
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseOut={(e) => (e.currentTarget.style.opacity = '0.6')}
          >
            ×
          </button>
        </Box>
      );
    });

    // Filter and create options
    const filteredData = searchable
      ? normalizedData.filter((item) =>
          item.label.toLowerCase().includes(currentSearch.trim().toLowerCase())
        )
      : normalizedData;

    const options = filteredData.map((item) => (
      <Combobox.Option
        value={item.value}
        key={item.value}
        active={currentValue.includes(item.value)}
        disabled={disabled}
      >
        <Group gap="sm" align="center">
          {currentValue.includes(item.value) ? <CheckIcon size={12} /> : null}
          <Box
            component="span"
            style={{
              display: 'inline-block',
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: item.color || '#gray',
              flexShrink: 0,
              border: '1px solid rgba(0, 0, 0, 0.15)',
            }}
          />
          <span>{item.label}</span>
        </Group>
      </Combobox.Option>
    ));

    return (
      <div>
        {label && (
          <label
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              marginBottom: '4px',
              color: 'var(--mantine-color-text)'
            }}
          >
            {label}
          </label>
        )}
        <Combobox
          store={combobox}
          onOptionSubmit={handleValueSelect}
          disabled={disabled}
          {...comboboxProps}
        >
          <Combobox.DropdownTarget>
            <PillsInput
              onClick={() => !disabled && combobox.openDropdown()}
              error={error}
              disabled={disabled}
            >
              <Pill.Group>
                {values}
                {clearable && currentValue.length > 0 && (
                  <Box
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',

                    }}
                    onClick={handleClearAll}
                  >
                    <span style={{ lineHeight: 1 }}>Clear all</span>
                    <span style={{ marginLeft: '4px', opacity: 0.6 }}>×</span>
                  </Box>
                )}
                <Combobox.EventsTarget>
                  <PillsInput.Field
                    ref={ref}
                    name={name}
                    onFocus={() => !disabled && combobox.openDropdown()}
                    onBlur={() => combobox.closeDropdown()}
                    value={searchable ? currentSearch : ''}
                    placeholder={placeholder}
                    onChange={(event) => {
                      if (searchable) {
                        handleSearchChange(event.currentTarget.value);
                      }
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Backspace' && currentSearch.length === 0 && currentValue.length > 0) {
                        event.preventDefault();
                        handleValueRemove(currentValue[currentValue.length - 1]);
                      }
                    }}
                    disabled={disabled}
                    readOnly={!searchable}
                  />
                </Combobox.EventsTarget>
              </Pill.Group>
            </PillsInput>
          </Combobox.DropdownTarget>

          <Combobox.Dropdown>
            <Combobox.Options>
              {options.length > 0 ? (
                options
              ) : (
                <Combobox.Empty>{nothingFoundMessage}</Combobox.Empty>
              )}
            </Combobox.Options>
          </Combobox.Dropdown>
        </Combobox>
      </div>
    );
  }
);

MultiSelectCombobox.displayName = 'MultiSelectCombobox';

export default MultiSelectCombobox;
