import { useMemo } from "react";
import { styled } from "@webstudio-is/design-system";
import { Image as WebstudioImage, loaders } from "@webstudio-is/image";
import { env } from "@webstudio-is/remix";
import type { AssetContainer } from "../assets";
import brokenImage from "~/shared/images/broken-image-placeholder.svg";

type ImageProps = {
  assetContainer: AssetContainer;
  alt: string;
  width: number;
};

const StyledWebstudioImage = styled(WebstudioImage, {
  position: "absolute",
  width: "100%",
  height: "100%",
  objectFit: "contain",

  // This is shown only if an image was not loaded and broken
  // From the spec:
  // - The pseudo-elements generated by ::before and ::after are contained by the element's formatting box,
  //   and thus don't apply to "replaced" elements such as <img>, or to <br> elements
  // Not in spec but supported by all browsers:
  // - broken image is not a "replaced" element so this style is applied
  "&::after": {
    content: "' '",
    position: "absolute",
    width: "100%",
    height: "100%",
    left: 0,
    top: 0,
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundImage: `url(${brokenImage})`,
  },
});

export const Image = ({ assetContainer, alt, width }: ImageProps) => {
  const { asset } = assetContainer;
  const optimize = assetContainer.status === "uploaded";
  const remoteLocation =
    assetContainer.status === "uploaded" &&
    assetContainer.asset.location === "REMOTE";

  // Avoid image flickering on switching from preview to asset (during upload)
  // Possible optimisation, we can set it to "sync" only if asset.path has changed or add isNew prop to UploadedAssetContainer
  const decoding = "sync";

  const loader = useMemo(() => {
    if (remoteLocation) {
      return loaders.cloudflareImageLoader({
        resizeOrigin: env.RESIZE_ORIGIN,
      });
    }

    return loaders.localImageLoader();
  }, [remoteLocation]);

  return (
    <StyledWebstudioImage
      key={asset.id}
      loader={loader}
      decoding={decoding}
      src={asset.path}
      width={width}
      optimize={optimize}
      alt={alt}
    />
  );
};
