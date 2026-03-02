import React, { useMemo } from "react";
import config from "../../../../config";

type ImageElementProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  source: string;
  alt?: string;
  previewSource?: string;
};

function ImageElement({
  source,
  alt = "image",
  previewSource = "",
  // type = "",
  ...rest
}: ImageElementProps) {
  const userUrl = useMemo(() => {
    // return location?.pathname.includes("admin") ||
    //   userData?.userType === "admin"
    //   ? config.ADMIN_IMAGE_BASE_URL
    //   : config.USER_IMAGE_URL;
    return config.USER_IMAGE_URL;
  }, []);

  return (
    <>
      <img
        src={`${previewSource ? previewSource : `${userUrl}${source}`}`}
        alt={alt}
        draggable={false}
        // onError={(e) => {
        //   e.target.src = `${config.USER_IMAGE_URL}fleetDefault.svg`;
        // }}
        {...rest}
      />
    </>
  );
}

export default React.memo(ImageElement);
