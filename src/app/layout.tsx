import { LoadingServisex } from "@/components";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";

import favicon from "./favicon.ico";
import "./globals.css";

const inter = Inter({ subsets: ["cyrillic"] });
export const metadata: Metadata = {
  title: "SERVISEX™",
  description: "All products crafted by hand in Belarus. We take no responsibility for the quality",
  icons: {
    icon: favicon.src,
  },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={cn("antialiased", inter.className)}>
        {/* <Providers>{children}</Providers> */}
        <StayTunedPlaceholder />
      </body>
    </html>
  );
}

const StayTunedPlaceholder: React.FC = () => {
  return (
    <html lang="en" className="w-full h-full">
      <body className={cn("antialiased", inter.className)}>
        <div className="w-screen h-screen  flex flex-col justify-center items-center">
          <h1 className="text-3xl font-bold text-center mb-6">
            SERVISEX<sup>tm</sup> website is suspended.
          </h1>

          <p className="text-center mb-6">
            Contact{` `}
            <Link
              href="https://www.instagram.com/servisex.eu/"
              target="_blank"
              className=" hover:cursor-pointer hover:underline hover:text-primary"
            >
              servisex Inst.
            </Link>
            {` `}
            to order
          </p>
          <LoadingServisex />
        </div>
      </body>
    </html>
  );
};
