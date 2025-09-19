"use client";

import { BaseSyntheticEvent, useEffect, useState } from "react";

import { Button } from "@/components";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import type SwiperType from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

interface ImageSliderProps {
  urls: string[];
  className?: string;
}

const ImageSlider = ({ urls, className }: ImageSliderProps) => {
  const [swiper, setSwiper] = useState<null | SwiperType>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const showButtons = urls?.length > 1;

  const handleNextImage = (e: BaseSyntheticEvent) => {
    e.preventDefault();
    swiper?.slideNext();
  };

  const handlePreviousImage = (e: BaseSyntheticEvent) => {
    e.preventDefault();
    swiper?.slidePrev();
  };

  const [slideConfig, setSlideConfig] = useState({
    isBeginning: true,
    isEnd: activeIndex === (urls.length ?? 0) - 1,
  });

  useEffect(() => {
    swiper?.on("slideChange", ({ activeIndex }) => {
      setActiveIndex(activeIndex);
      setSlideConfig({
        isBeginning: activeIndex === 0,
        isEnd: activeIndex === (urls.length ?? 0) - 1,
      });
    });
  }, [swiper, urls]);

  return (
    <div
      className={cn("group relative bg-zinc-100 aspect-square overflow-hidden", className)}
      aria-label="Image Slider"
    >
      {showButtons && (
        <div className="absolute z-10 inset-0 opacity-0 group-hover:opacity-100 transition">
          <SliderPreviousButton onClick={handlePreviousImage} hidden={slideConfig.isBeginning} />
          <SliderNextButton onClick={handleNextImage} hidden={slideConfig.isEnd} />
        </div>
      )}

      <Swiper
        pagination={{
          renderBullet: (_, className) => {
            return `<span class="rounded-full transition ${className}"></span>`;
          },
        }}
        onSwiper={(swiper) => setSwiper(swiper)}
        spaceBetween={50}
        modules={[Pagination]}
        slidesPerView={1}
        className="h-full w-full"
      >
        {urls.map((url, i) => (
          <SwiperSlide key={i} className="-z-10 relative h-full w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt="Product image"
              loading="eager"
              className="-z-10 h-full w-full object-cover object-center absolute inset-0"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

type SliderButtonProps = {
  hidden?: boolean;
  onClick: (e: BaseSyntheticEvent) => void;
};

const SliderNextButton: React.FC<SliderButtonProps> = ({ hidden, onClick }) => {
  if (hidden) {
    return;
  }

  return (
    <Button
      className={cn("absolute h-8 w-8 rounded-full right-4 top-1/2 -translate-y-1/2")}
      onClick={onClick}
      variant="outline"
      size="icon"
      aria-label="next image"
    >
      <ArrowRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  );
};

const SliderPreviousButton: React.FC<SliderButtonProps> = ({ hidden, onClick }) => {
  if (hidden) {
    return;
  }

  return (
    <Button
      onClick={onClick}
      className={cn("absolute h-8 w-8 rounded-full left-4 top-1/2 -translate-y-1/2")}
      variant="outline"
      size="icon"
      aria-label="previous image"
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  );
};

export { ImageSlider };
