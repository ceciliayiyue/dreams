import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { DreamStorageProvider } from '@/lib/dreamStorage';
import {AuthProvider} from "@/lib/authProvider";
// import {AuthProvider} from "@/lib/auth";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Dream Journal',
    description: 'Track and interpret your dreams',
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body className={inter.className}>
        <AuthProvider>
            <DreamStorageProvider>
                {children}
            </DreamStorageProvider>
        </AuthProvider>
        </body>
        </html>
    );
}