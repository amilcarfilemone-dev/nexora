import "./globals.css";

export const metadata = {
  title: "NEXORA — Transforme intenção em evolução",
  description:
    "A NEXORA transforma objetivos em ações diárias para você vencer a procrastinação, construir disciplina e evoluir de verdade.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body>{children}</body>
    </html>
  );
        }
