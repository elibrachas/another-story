"use client"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Mapa de códigos de país a nombres
const countryNames: Record<string, string> = {
  XX: "Desconocido",
  ES: "España",
  MX: "México",
  AR: "Argentina",
  CO: "Colombia",
  PE: "Perú",
  CL: "Chile",
  US: "Estados Unidos",
  VE: "Venezuela",
  EC: "Ecuador",
  GT: "Guatemala",
  CU: "Cuba",
  BO: "Bolivia",
  DO: "República Dominicana",
  HN: "Honduras",
  PY: "Paraguay",
  SV: "El Salvador",
  NI: "Nicaragua",
  CR: "Costa Rica",
  PA: "Panamá",
  UY: "Uruguay",
  PR: "Puerto Rico",
  // Añadir más países según sea necesario
}

// Mapa directo de códigos de país a emojis de banderas
const countryFlags: Record<string, string> = {
  XX: "🌎",
  ES: "🇪🇸",
  MX: "🇲🇽",
  AR: "🇦🇷",
  CO: "🇨🇴",
  PE: "🇵🇪",
  CL: "🇨🇱",
  US: "🇺🇸",
  VE: "🇻🇪",
  EC: "🇪🇨",
  GT: "🇬🇹",
  CU: "🇨🇺",
  BO: "🇧🇴",
  DO: "🇩🇴",
  HN: "🇭🇳",
  PY: "🇵🇾",
  SV: "🇸🇻",
  NI: "🇳🇮",
  CR: "🇨🇷",
  PA: "🇵🇦",
  UY: "🇺🇾",
  PR: "🇵🇷",
}

export function CountryFlag({
  countryCode,
  showName = false,
  className = "",
}: {
  countryCode: string
  showName?: boolean
  className?: string
}) {
  // Normalizar el código de país y manejar casos nulos/indefinidos
  const normalizedCode = countryCode?.toUpperCase() || "XX"

  // Obtener el emoji de la bandera y el nombre del país
  const flagEmoji = countryFlags[normalizedCode] || "🌎"
  const countryName = countryNames[normalizedCode] || "Desconocido"

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`inline-flex items-center ${className}`} data-country={normalizedCode}>
            <span
              className="text-lg"
              style={{
                display: "inline-block",
                lineHeight: 1,
                verticalAlign: "middle",
              }}
            >
              {flagEmoji}
            </span>
            {showName && <span className="ml-1 text-sm">{countryName}</span>}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{countryName}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
