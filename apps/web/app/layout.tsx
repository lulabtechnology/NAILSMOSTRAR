import "./globals.css"; // <<--- IMPORTANTE: carga Tailwind

export const metadata = {
  title: "Nail Booking Demo",
  description: "Reservas y cotización para salón de uñas",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gray-50 text-gray-900">
        <header className="border-b bg-white">
          <div className="container py-3 flex items-center gap-3">
            <img src="/logo.svg" alt="logo" className="w-7 h-7" />
            <a href="/" className="font-semibold">Nail Booking Demo</a>
            <nav className="ml-auto flex gap-4 text-sm">
              <a href="/book" className="hover:underline">Reservar</a>
              <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-gray-500">Vercel</a>
              <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-gray-500">Supabase</a>
            </nav>
          </div>
        </header>
        <main className="container py-6">{children}</main>
        <footer className="container py-10 text-xs text-gray-500">
          Demo estimativo ±15%. No es una orden de trabajo final.
        </footer>
      </body>
    </html>
  );
}
