import "./globals.css";

export const metadata = {
  title: "InstaSave - Media Helper",
  description: "Parser media dari kode sumber halaman yang dapat Anda akses."
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}