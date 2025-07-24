import "@/app/globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js?58"></script>
      </head>
      <body className="m-0">
        {children}
      </body>
    </html>
  );
}
