"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

interface Country {
  code: string
  name: string
  colors: string[]
}

const countries: Country[] = [
  { code: "+1", name: "US/CA", colors: ["#B22234", "#FFFFFF", "#3C3B6E"] },
  { code: "+44", name: "UK", colors: ["#012169", "#FFFFFF", "#C8102E"] },
  { code: "+57", name: "CO", colors: ["#FCD116", "#003893", "#CE1126"] },
  { code: "+52", name: "MX", colors: ["#006847", "#FFFFFF", "#CE1126"] },
  { code: "+34", name: "ES", colors: ["#AA151B", "#F1BF00", "#AA151B"] },
  { code: "+54", name: "AR", colors: ["#74ACDF", "#FFFFFF", "#74ACDF"] },
  { code: "+56", name: "CL", colors: ["#0039A6", "#FFFFFF", "#D52B1E"] },
  { code: "+51", name: "PE", colors: ["#D91023", "#FFFFFF", "#D91023"] },
]

const CircularFlag = ({ colors }: { colors: string[] }) => {
  return (
    <div className="relative w-6 h-6 rounded-full overflow-hidden border border-neutral-200">
      {colors.length === 3 ? (
        <>
          <div className="absolute inset-0 w-full h-1/3" style={{ backgroundColor: colors[0] }} />
          <div className="absolute inset-0 top-1/3 w-full h-1/3" style={{ backgroundColor: colors[1] }} />
          <div className="absolute inset-0 top-2/3 w-full h-1/3" style={{ backgroundColor: colors[2] }} />
        </>
      ) : (
        <>
          <div className="absolute inset-0 w-1/2 h-full" style={{ backgroundColor: colors[0] }} />
          <div className="absolute inset-0 left-1/2 w-1/2 h-full" style={{ backgroundColor: colors[1] }} />
        </>
      )}
    </div>
  )
}

interface PhoneNumberInputProps {
  countryCode: string
  phoneNumber: string
  onCountryCodeChange: (code: string) => void
  onPhoneNumberChange: (number: string) => void
  placeholder?: string
  className?: string
}

export function PhoneNumberInput({
  countryCode,
  phoneNumber,
  onCountryCodeChange,
  onPhoneNumberChange,
  placeholder = "3216371230",
  className = "",
}: PhoneNumberInputProps) {
  const selectedCountry = countries.find((c) => c.code === countryCode) || countries[2]

  return (
    <div className={`flex gap-2 ${className}`}>
      <Select value={countryCode} onValueChange={onCountryCodeChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue>
            <div className="flex items-center gap-2">
              <CircularFlag colors={selectedCountry.colors} />
              <span className="text-sm">{countryCode}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {countries.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              <div className="flex items-center gap-2">
                <CircularFlag colors={country.colors} />
                <span className="text-sm font-medium">{country.code}</span>
                <span className="text-xs text-muted-foreground">{country.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="tel"
        placeholder={placeholder}
        value={phoneNumber}
        onChange={(e) => onPhoneNumberChange(e.target.value.replace(/\D/g, ""))}
        className="flex-1 transition-all duration-300 focus:ring-2 focus:ring-neutral-900"
      />
    </div>
  )
}
