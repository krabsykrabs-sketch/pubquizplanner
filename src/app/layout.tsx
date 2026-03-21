import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PubQuizPlanner',
  description: 'Erstelle professionelle Pub Quizze',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
