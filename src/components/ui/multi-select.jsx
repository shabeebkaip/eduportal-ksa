import React, { useState, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronsUpDown, X } from 'lucide-react';

const MultiSelect = forwardRef(({ options, selected, onChange, className, placeholder = "Select...", ...props }, ref) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (value) => {
    onChange([...selected, value]);
  };

  const handleDeselect = (value) => {
    onChange(selected.filter((s) => s !== value));
  };
  
  const selectedValues = selected.map(value => options.find(option => option.value === value)).filter(Boolean);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between bg-white/5 border-white/10 text-white h-auto min-h-10", className)}
          onClick={() => setOpen(!open)}
          {...props}
        >
          <div className="flex gap-1 flex-wrap">
            {selectedValues.length > 0 ? (
              selectedValues.map((item) => (
                <Badge
                  variant="secondary"
                  key={item.value}
                  className="mr-1 mb-1 bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeselect(item.value);
                  }}
                >
                  {item.label}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))
            ) : (
              <span className="text-gray-400">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 glass-effect border-white/10">
        <Command className="bg-transparent">
          <CommandInput placeholder="Search..." className="text-white" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup className="text-white">
              {options.map((option) => {
                const isSelected = selected.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      if (isSelected) {
                        handleDeselect(option.value);
                      } else {
                        handleSelect(option.value);
                      }
                      setOpen(true);
                    }}
                    className="hover:bg-white/10"
                  >
                    <Check className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                    {option.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
});

MultiSelect.displayName = 'MultiSelect';
export { MultiSelect };