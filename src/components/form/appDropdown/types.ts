import { Dispatch, SetStateAction } from 'react';

export interface DropdownItem {
  label: string;
  value: string;
}

export interface AppDropdownProps {
  title?: string;
  error?: string;
  canClear?: boolean;
  placeholder?: string;
  itemList: DropdownItem[];
  multiSelection?: boolean;
  isSearching?: boolean;
  selectedValues?: DropdownItem[];
  selectedValue?: DropdownItem | null;
  setError?: Dispatch<SetStateAction<string>>;
  onSelectItems?: (items: DropdownItem[]) => void;
  onSelectItem?: (item: DropdownItem | null) => void;
  onSearchChange?: (query: string) => void;
}

