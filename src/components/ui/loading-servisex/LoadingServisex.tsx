import React from "react";

import loading from "public/images/servisex-loading.gif";

export const LoadingServisex: React.FC = () => {
  return (
    <div className="flex items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={loading.src} alt="Loading..." width={128} height={128} />
    </div>
  );
};
