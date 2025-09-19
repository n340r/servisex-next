"use client";

import { useEffect, useState } from "react";

import { HeaderCartCounter, Sidebar } from "@/components";
import { Menu, X } from "lucide-react";
import Link from "next/link";

// import logo from "public/icons/servisex-logo-header.png";
// import checkmark from "public/images/checkmark_slow.gif";

const BaseHeader = () => {
  const environment = process.env.NEXT_PUBLIC_ENVIRONMENT;
  const isDevEnvironment = environment === "dev";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
    document.body.classList.remove("overflow-hidden");
  };

  const removeScrollFromAppContent = (sidebarOpen: boolean) => {
    if (sidebarOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => {
      const newState = !prev;

      removeScrollFromAppContent(newState);

      return newState;
    });
  };

  useEffect(() => {
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, []);

  return (
    <>
      <header className="sticky z-50 top-0 flex h-16 items-center justify-between px-4 bg-background">
        <div className="header-left flex items-center">
          <BurgerButton className="block sm:hidden p-2" onClick={toggleSidebar} isOpen={isSidebarOpen} />
          <DesktopHeaderNavigation className="hidden sm:flex gap-4" />
        </div>

        {isDevEnvironment && environment}

        <div className="header-right flex items-center">
          <HeaderCartCounter />
        </div>
      </header>

      <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />
    </>
  );
};

export { BaseHeader };

type BurgerButtonProps = {
  onClick: () => void;
  className?: string;
  isOpen: boolean;
};

const BurgerButton: React.FC<BurgerButtonProps> = ({ onClick, isOpen, className }) => {
  return (
    <button onClick={onClick} aria-label={isOpen ? "Close menu" : "Open menu"} className={className}>
      <Menu size={32} />
    </button>
  );
};

type DesktopHeaderNavigationProps = {
  className: string;
};

const DesktopHeaderNavigation: React.FC<DesktopHeaderNavigationProps> = ({ className }) => {
  return (
    <div className="flex items-center justify-between h-16">
      <Link href="/" className="h-full flex items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/servisex-logo-header.png"
          alt="Servisex small logo"
          className="hidden h-1/2 w-auto object-contain sm:flex"
        />

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/checkmark_slow.gif" alt="spinning blue checkmark" className="h-full w-auto object-contain" />
      </Link>
      <nav className={className}>
        <Link href="/" className="hover:cursor-pointer uppercase hover:underline hover:text-primary">
          МАГАЗИН
        </Link>
        <Link href="/about" className="uppercase hover:cursor-pointer hover:underline hover:text-primary">
          КОНТАКТЫ
        </Link>
      </nav>
    </div>
  );
};
