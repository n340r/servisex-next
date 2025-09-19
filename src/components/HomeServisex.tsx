import { CopyrightServisex } from "@/components";
import Image from "next/image";
import Link from "next/link";
import { IconInstagram, IconYoutube } from "public/icons";
import logo from "public/icons/servisex-logo-icon.png";
import verified from "public/images/verified-opacity-13.png";

import { HomeNavigation } from "./HomeNavigation";

const HomeServisex = () => {
  return (
    <div
      style={{
        backgroundImage: `url(${verified.src})`,
        backgroundSize: "95px",
        backgroundPosition: "center",
        backgroundRepeat: "repeat",
        backgroundBlendMode: "darken",
      }}
      className="welcome grow relative overflow-hidden w-[calc(100%-32px)] h-[calc(100%-32px)] m-4 sm:w-[calc(100%-64px)] sm:h-[calc(100%-64px)] sm:m-8"
    >
      {/* Previous background */}
      <div className="content flex flex-col">
        <Image
          src={logo}
          alt="Servisex logo"
          className="aspect-[1.65] w-fit h-[128px] mt-[220px] mb-0 ml-auto mr-auto text-white sm:mt-[10%]"
          priority
        />

        <HomeNavigation className="w-full flex justify-center items-center" />

        <div className="flex gap-4 justify-between absolute bottom-4 w-full px-6">
          <div className="flex justify-end gap-4">
            <Link
              href="https://www.instagram.com/goat__corp/?hl=en"
              target="_blank"
              className="uppercase hover:cursor-pointer hover:underline hover:text-primary"
            >
              <IconInstagram className="opacity-45 h-10 hover:opacity-30" />
            </Link>

            <Link
              href="https://www.youtube.com/watch?v=e3KmM2JxRrg"
              target="_blank"
              className="uppercase hover:cursor-pointer hover:underline hover:text-primary"
            >
              <IconYoutube className="opacity-45 h-10  hover:opacity-30" />
            </Link>
          </div>

          <div className="flex justify-end gap-4 opacity-55 items-center">
            <CopyrightServisex />
          </div>
        </div>
      </div>
    </div>
  );
};

export { HomeServisex };
