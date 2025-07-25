import "@/app/globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-hidden">
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js" async />
      </head>
      <body className="m-0 overflow-hidden">
        {children}
      </body>
    </html>
  );
}
