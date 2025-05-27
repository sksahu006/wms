'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface SearchableComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  searchPlaceholder?: string;
  fetchData: (search: string) => Promise<{ id: string; label: string }[]>;
  name?: string
}

type DebouncedFunction<T extends (...args: any[]) => void> = {
  (...args: Parameters<T>): void;
  cancel: () => void;
};

function debounce<T extends (...args: any[]) => void>(func: T, wait: number): DebouncedFunction<T> {
  let timeout: NodeJS.Timeout | null = null;
  
  const debounced = (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
  
  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  
  return debounced;
}

export function SearchableCombobox({
  value,
  onValueChange,
  placeholder,
  searchPlaceholder = 'Search...',
  fetchData,
  name
}: SearchableComboboxProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<{ id: string; label: string }[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const debouncedFetchRef = useRef<DebouncedFunction<typeof fetchItems> | null>(null);

  const fetchItems = useCallback(async (searchQuery: string) => {
    setLoading(true);
    try {
      const results = await fetchData(searchQuery);
      setItems(results);
      console.log("Combobox items:", results);
    } catch (error) {
      console.error("Error fetching combobox data:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  useEffect(() => {
    // Initialize debounce function
    debouncedFetchRef.current = debounce(fetchItems, 500);

    return () => {
      // Cleanup on unmount
      if (debouncedFetchRef.current) {
        debouncedFetchRef.current.cancel();
      }
    };
  }, [fetchItems]);

  useEffect(() => {
    if (open) {
      // Fetch initial data when dropdown opens
      fetchItems('');
    }
  }, [open, fetchItems]);

  useEffect(() => {
    if (open && search !== '') {
      // Call debounced fetch
      debouncedFetchRef.current?.(search);
    }
  }, [search, open]);

  return (
    <Popover open={open} onOpenChange={setOpen} >
      <PopoverTrigger asChild className='shadow-sm'>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          name={name} 
        >
          {value
            ? items.find((item) => item.id === value)?.label || placeholder
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-black/10 text-white" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={setSearch}
          />
          <CommandEmpty>
            {loading ? 'Loading...' : items.length === 0 ? 'No results found' : 'Type to search...'}
          </CommandEmpty>
          <CommandGroup className="max-h-60 overflow-auto ">
            {items.map((item) => (
              <CommandItem
                key={item.id}
                value={item.id}
                onSelect={() => {
                  onValueChange(item.id);
                  setOpen(false);
                }}
                className='text-white'
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    value === item.id ? 'opacity-100' : 'opacity-0'
                  )}
                />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}