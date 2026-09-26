// Mirrors the CSS variables in smartclick-frontend/app/globals.css exactly,
// plus the dark nav palette from components/Nav.tsx, so the mobile app
// reads as the same product as the website.
export const colors = {
  bg: "#F3F2EE",
  border: "#E1DFD8",
  muted: "#5A574E",
  faint: "#8A8678",
  accent: "#0F8A6E",
  accentSoft: "#E6F5EF",
  ink: "#141413",

  // Dark nav palette (from the web Nav component)
  navBg: "#0E1712",
  navMuted: "#9DB3A6",
  navText: "#F3F2EE",
  navAccent: "#22C08C",

  white: "#FFFFFF",
  danger: "#DC2626",
};

// font.display = Space Grotesk (headings), font.body = Manrope (everything
// else) — loaded via useFonts() in App.tsx under these exact family names.
export const fonts = {
  display: "SpaceGrotesk_700Bold",
  displaySemibold: "SpaceGrotesk_600SemiBold",
  body: "Manrope_400Regular",
  bodyMedium: "Manrope_500Medium",
  bodySemibold: "Manrope_600SemiBold",
  bodyBold: "Manrope_700Bold",
};