// Root layout: bare pass-through. Each route group provides its own <html>.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
