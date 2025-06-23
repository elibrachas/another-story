const nextJest = require("next/jest")

const createJestConfig = nextJest({
  // Proporciona la ruta a tu aplicación Next.js para cargar next.config.js y .env files
  dir: "./",
})

// Configuración personalizada de Jest
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    // Maneja los alias de importación
    "^@/(.*)$": "<rootDir>/$1",
    // Mocks para dependencias problemáticas
    "^class-variance-authority$": "<rootDir>/__mocks__/cva-mock.js",
    "^clsx$": "<rootDir>/__mocks__/clsx-mock.js",
    "^@radix-ui/(.*)$": "<rootDir>/__mocks__/radix-mock.js",
    "^tailwindcss-animate$": "<rootDir>/__mocks__/tailwindcss-animate-mock.js",
    "^next/navigation$": "<rootDir>/__mocks__/next-navigation-mock.js",
    "^lucide-react$": "<rootDir>/__mocks__/lucide-react-mock.js",
  },
  // Solo ejecutar pruebas en el directorio __tests__
  testMatch: ["**/__tests__/**/*.test.[jt]s?(x)"],
  // Ignorar ciertos directorios
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.next/"],
  // Transformaciones
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }],
  },
  // Entorno
  moduleDirectories: ["node_modules", "<rootDir>/"],
}

// createJestConfig se exporta de esta manera para asegurar que next/jest pueda cargar la configuración de Next.js
module.exports = createJestConfig(customJestConfig)
