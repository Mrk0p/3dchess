import "./globals.css";

export const metadata = {
  title: "3D Chess — Play in Three Dimensions",
  description: "Play chess on an interactive 3D board with legal moves, move history, undo, and orbit controls.",
  applicationName: "3D Chess",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#101319",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
