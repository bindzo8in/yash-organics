import * as React from "react";
import * as RPNInput from "react-phone-number-input";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

// Custom Input Component
const InputComponent = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, ...props }, ref) => (
    <Input 
      className={cn("rounded-e-lg rounded-s-none border-l-0 focus-visible:ring-0 focus-visible:ring-offset-0", className)} 
      {...props} 
      ref={ref} 
    />
  )
);
InputComponent.displayName = "InputComponent";

// Custom Country Select using HTML select styled like Shadcn UI
const CountrySelect = ({ value, onChange, options, disabled }: any) => {
  return (
    <div className="relative inline-flex items-center">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          "flex h-10 rounded-s-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 appearance-none pr-8 cursor-pointer font-medium text-foreground min-w-[75px]"
        )}
      >
        {options.map((option: any) => (
          <option key={option.value || "ZZ"} value={option.value}>
            {option.value ? option.value : "ZZ"}
          </option>
        ))}
      </select>
      <div className="absolute right-2 pointer-events-none text-muted-foreground">
        <ChevronDown className="h-4 w-4 opacity-50" />
      </div>
    </div>
  );
};

// Main PhoneInput Component
const PhoneInput = React.forwardRef<React.ElementRef<typeof RPNInput.default>, any>(
  ({ className, onChange, ...props }, ref) => {
    return (
      <RPNInput.default
        ref={ref}
        className={cn("flex rounded-lg shadow-sm focus-within:ring-1 focus-within:ring-primary focus-within:border-primary", className)}
        countrySelectComponent={CountrySelect}
        inputComponent={InputComponent}
        defaultCountry="IN"
        onChange={(value) => onChange?.(value || "")}
        {...props}
      />
    );
  }
);
PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
