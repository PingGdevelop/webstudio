import { Toast, Toaster, toast } from "./toast";
import { StorySection, StoryGrid } from "./storybook";
import { Button } from "./button";
import { Image } from "@webstudio-is/image";
import { Box } from "./box";
import { css, theme } from "../stitches.config";
import { AlertCircleIcon } from "@webstudio-is/icons";

export default {
  title: "Library/Toast",
};

const svgString = `
<svg version="1.0" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
	 width="800px" height="800px" viewBox="0 0 64 64" enable-background="new 0 0 64 64" xml:space="preserve">
<g>
	<path fill="#231F20" d="M60,0H4C1.789,0,0,1.789,0,4v56c0,2.211,1.789,4,4,4h56c2.211,0,4-1.789,4-4V4C64,1.789,62.211,0,60,0z
		 M62,60c0,1.104-0.896,2-2,2H4c-1.104,0-2-0.896-2-2v-2.801l14.603-14.603c0.781-0.781,2.047-0.781,2.828,0
		c0,0,6.197,6.198,7.15,7.15c0.953,0.953,1.88,0.95,2.829,0s17.171-17.171,17.171-17.171c0.781-0.781,2.047-0.781,2.828,0L62,45.167
		V60z M62,42.338L50.823,31.161c-1.563-1.563-4.093-1.563-5.656,0L27.996,48.332l-7.151-7.15c-1.563-1.563-4.093-1.563-5.656,0
		L2,54.37V4c0-1.104,0.896-2,2-2h56c1.104,0,2,0.896,2,2V42.338z"/>
	<path fill="#231F20" d="M28.999,17h-2.998c-0.024,0-0.044,0.012-0.068,0.014c-0.181-1.469-0.76-2.812-1.626-3.924
		c0.018-0.016,0.041-0.021,0.059-0.039l2.121-2.121c0.392-0.391,0.391-1.023,0-1.414c-0.392-0.391-1.023-0.391-1.416,0l-2.12,2.12
		c-0.018,0.018-0.023,0.04-0.039,0.059c-1.111-0.867-2.454-1.446-3.924-1.627c0.002-0.022,0.014-0.044,0.014-0.067l0.001-3
		c0-0.553-0.449-1-1-1C17.448,6.001,17.001,6.447,17,7.002V10c0,0.023,0.012,0.045,0.014,0.067c-1.47,0.181-2.813,0.76-3.925,1.626
		c-0.016-0.018-0.021-0.041-0.038-0.058L10.93,9.515c-0.391-0.392-1.023-0.391-1.414,0c-0.391,0.392-0.392,1.023,0,1.415
		l2.121,2.121c0.017,0.017,0.04,0.022,0.058,0.038c-0.867,1.111-1.446,2.456-1.627,3.925C10.044,17.012,10.023,17,10,17H7
		c-0.553,0-1,0.447-1,1s0.447,1,1,1h3c0.023,0,0.044-0.012,0.067-0.014c0.181,1.47,0.76,2.813,1.627,3.925
		c-0.019,0.016-0.041,0.021-0.059,0.039l-2.121,2.12c-0.392,0.392-0.392,1.025,0,1.414c0.392,0.393,1.022,0.391,1.416,0.002
		l2.12-2.121c0.018-0.018,0.023-0.041,0.039-0.059c1.111,0.866,2.454,1.445,3.924,1.626C17.012,25.957,17,25.977,17,26.002
		L16.999,29c0,0.554,0.448,1.002,1,1c0.554,0,1-0.447,1.003-1l-0.001-2.998c0-0.025-0.012-0.045-0.014-0.069
		c1.469-0.181,2.812-0.76,3.924-1.627c0.016,0.019,0.021,0.042,0.039,0.06l2.12,2.121c0.392,0.393,1.025,0.391,1.414,0
		c0.392-0.392,0.391-1.023,0.001-1.416l-2.12-2.12c-0.018-0.018-0.041-0.023-0.06-0.039c0.867-1.111,1.446-2.455,1.627-3.924
		c0.024,0.002,0.044,0.014,0.068,0.014L29,19.002c0.554,0,1.001-0.448,1-1C30,17.448,29.553,17.002,28.999,17z M18,24
		c-3.313,0-6-2.687-6-6s2.687-6,6-6s6,2.687,6,6S21.313,24,18,24z"/>
</g>
</svg>`;

// Step 2: Convert the SVG string to a Blob
const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });

// Step 3: Generate the Object URL
const objectURL = URL.createObjectURL(svgBlob);

const imageWidth = css({
  maxWidth: "100%",
});

const ImageIcon = () => (
  <Box css={{ width: theme.spacing[18] }}>
    <Image
      className={imageWidth()}
      src={objectURL}
      optimize={false}
      width={64}
      loader={() => ""}
    />
  </Box>
);

const texts = [
  `We are what repeatedly do. Excellence is not an act but a habit.`,
  `We are what repeatedly do. Excellence is not an act but a habit.`,
  `We are what repeatedly do. Excellence is not an act but a habit. We are what repeatedly do. Excellence is not an act but a habit. We are what repeatedly do. Excellence is not an act but a habit.`,
  `Asset already exists`,
];

export const Design = () => {
  return (
    <>
      <StorySection title="Toast Design">
        <StoryGrid>
          <Toast>1. We are what repeatedly do.</Toast>

          <Toast>
            2. We are what repeatedly do. Excellence is not an act but a habit.
          </Toast>

          <Toast>
            3. We are what repeatedly do. We are what repeatedly do. Excellence
            is not an act but a habit.
          </Toast>

          <Toast>
            3. We are what repeatedly do. We are what repeatedly do. Excellence
            is not an act but a habit. We are what
          </Toast>

          <Toast>
            4. We are what repeatedly do. We are what repeatedly do. We are what
            repeatedly do. Excellence is not an act but a habit.
          </Toast>

          <Toast>
            5. We are what repeatedly do. We are what repeatedly do. We are what
            repeatedly do. We are what repeatedly do. Excellence is not an act
            but a habit.
          </Toast>

          <Toast>
            6. We are what repeatedly do. We are what repeatedly do. We are what
            repeatedly do. We are what repeatedly do. We are what repeatedly do.
            Excellence is not an act but a habit.
          </Toast>

          <Toast variant="warning">
            We are what repeatedly do. Excellence is not an act but a habit.
          </Toast>

          <Toast variant="error">
            We are what repeatedly do. Excellence is not an act but a habit. We
            are what repeatedly do. Excellence is not an act but a habit. We are
            what repeatedly do. Excellence is not an act but a habit.
          </Toast>
        </StoryGrid>
      </StorySection>

      <StorySection title="Toast With Icon Design">
        <StoryGrid>
          <Toast icon={<AlertCircleIcon size={24} />}>
            We are what repeatedly do. Excellence is not an act but a habit.
          </Toast>

          <Toast icon={<AlertCircleIcon size={24} />} variant="warning">
            We are what repeatedly do. Excellence is not an act but a habit.
          </Toast>

          <Toast icon={<AlertCircleIcon size={24} />} variant="error">
            We are what repeatedly do. Excellence is not an act but a habit. We
            are what repeatedly do. Excellence is not an act but a habit. We are
            what repeatedly do. Excellence is not an act but a habit.
          </Toast>

          <Toast icon={<ImageIcon />}>Asset already exists</Toast>
        </StoryGrid>
      </StorySection>
    </>
  );
};
Design.storyName = "Toast Design";

let i = 0;
export const InAction = () => {
  return (
    <StorySection title="Toast In Action">
      <StoryGrid css={{ width: 300 }}>
        <Toaster />
        <Button
          onClick={() => {
            toast.error(texts[++i % texts.length], { duration: 5000 });
          }}
        >
          Show Error Toast
        </Button>
        <Button
          onClick={() => {
            toast.warn(texts[++i % texts.length], { duration: 5000 });
          }}
        >
          Show Warn Toast
        </Button>
        <Button
          onClick={() => {
            toast.info(texts[++i % texts.length], { duration: 5000 });
          }}
        >
          Show Info Toast
        </Button>

        <Button
          onClick={() => {
            toast.error(texts[++i % texts.length], {
              duration: 5000,
              icon: <ImageIcon />,
            });
          }}
        >
          Show Error Image Toast
        </Button>
        <Button
          onClick={() => {
            toast.info(texts[++i % texts.length], {
              duration: 5000,
              icon: <ImageIcon />,
            });
          }}
        >
          Show Info Image Toast
        </Button>
      </StoryGrid>
    </StorySection>
  );
};
