import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

const BASE_URL = "https://careerlingo.vercel.app";

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "CareerLingo – Master Hotel English in 30 Days",
    template: "%s | CareerLingo",
  },
  description:
    "Learn professional hotel reception English with AI roleplay, 600+ vocabulary words with IPA pronunciation, flashcards, and daily lessons. Perfect for hospitality staff.",
  keywords: [
    "hotel English",
    "hospitality English",
    "hotel reception vocabulary",
    "learn English hotel",
    "hotel staff English training",
    "IPA pronunciation",
    "English for hotel workers",
    "AI English roleplay",
    "hotel English course",
    "tiếng Anh khách sạn",
  ],
  authors: [{ name: "CareerLingo" }],
  creator: "CareerLingo",
  publisher: "CareerLingo",
  category: "Education",

  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["vi_VN"],
    url: BASE_URL,
    siteName: "CareerLingo",
    title: "CareerLingo – Master Hotel English in 30 Days",
    description:
      "AI-powered hotel English learning app. 30-day program, 600 words with IPA, daily roleplay scenarios with real hotel situations.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CareerLingo – Master Hotel English in 30 Days",
        type: "image/png",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "CareerLingo – Master Hotel English in 30 Days",
    description:
      "AI-powered hotel English learning app. 30-day program, 600 words with IPA, daily roleplay with real hotel situations.",
    images: ["/og-image.png"],
    creator: "@careerlingo",
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
    shortcut: "/icon.png",
  },

  manifest: "/manifest.json",

  alternates: {
    canonical: BASE_URL,
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                if (location.hostname === 'localhost') {
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    for(let registration of registrations) {
                      registration.unregister();
                    }
                  });
                } else {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js');
                  });
                }
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
