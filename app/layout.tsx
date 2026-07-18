import type {Metadata, Viewport} from 'next';
import localFont from 'next/font/local';
import {Toaster} from 'sonner';
import './globals.css';
import type {ReactNode} from "react";


const aeonik = localFont({
    variable: '--font-aeonik',
    display: 'swap',
    src: [
        {
            path: '../public/fonts/Aeonik/Aeonik Thin Font.ttf',
            weight: '100',
            style: 'normal',
        },
        {
            path: '../public/fonts/Aeonik/Aeonik Thin Italic.ttf',
            weight: '100',
            style: 'italic',
        },
        {
            path: '../public/fonts/Aeonik/Aeonik Light Font.ttf',
            weight: '300',
            style: 'normal',
        },
        {
            path: '../public/fonts/Aeonik/Aeonik Light Italic.ttf',
            weight: '300',
            style: 'italic',
        },
        {
            path: '../public/fonts/Aeonik/Aeonik Regular Font.ttf',
            weight: '400',
            style: 'normal',
        },
        {
            path: '../public/fonts/Aeonik/Aeonik Regular Italic.ttf',
            weight: '400',
            style: 'italic',
        },
        {
            path: '../public/fonts/Aeonik/Aeonik Medium Font.ttf',
            weight: '500',
            style: 'normal',
        },
        {
            path: '../public/fonts/Aeonik/Aeonik Medium Italic.ttf',
            weight: '500',
            style: 'italic',
        },
        {
            path: '../public/fonts/Aeonik/Aeonik Bold Font.ttf',
            weight: '700',
            style: 'normal',
        },
        {
            path: '../public/fonts/Aeonik/Aeonik Bold Italic.ttf',
            weight: '700',
            style: 'italic',
        },
        {
            path: '../public/fonts/Aeonik/Aeonik Black Font.ttf',
            weight: '900',
            style: 'normal',
        },
        {
            path: '../public/fonts/Aeonik/Aeonik Black Italic.ttf',
            weight: '900',
            style: 'italic',
        },
    ],
});


export const metadata: Metadata = {
    title: 'Paash Cash Admin',
    description: 'Administration portal for Paash Cash',
    manifest: '/site.webmanifest',
    icons: {
        icon: [
            {url: '/favicon.ico'},
            {url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png'},
            {url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png'},
        ],
        apple: [{url: '/apple-touch-icon.png'}],
    }
};


export const viewport: Viewport = {
    themeColor: '#fff1ff',
};


export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={`${aeonik.variable} ${aeonik.className} h-full antialiased`}
        >
        <body className="flex min-h-full flex-col">{children}
        <Toaster position="top-center" richColors/>
        </body>
        </html>
    );
}
