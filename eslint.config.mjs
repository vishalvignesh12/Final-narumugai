import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  { ignores: [".next/**", ".next-dev/**", "src/generated/prisma/**"] },
  ...nextVitals,
  {
    rules: {
      "react-hooks/error-boundaries": "off",
      "react-hooks/immutability": "off",
      "react-hooks/incompatible-library": "off",
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
      "react/no-unescaped-entities": "off",
    },
  },
];

export default eslintConfig;
