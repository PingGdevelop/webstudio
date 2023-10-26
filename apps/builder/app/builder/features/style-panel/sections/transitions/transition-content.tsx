import type {
  InvalidValue,
  LayersValue,
  TupleValue,
  TupleValueItem,
} from "@webstudio-is/css-engine";
import {
  Flex,
  Label,
  TextArea,
  theme,
  textVariants,
  Separator,
  Tooltip,
  Text,
  Grid,
} from "@webstudio-is/design-system";
import { useMemo, useState } from "react";
import {
  extractTransitionProperties,
  parseTransition,
} from "@webstudio-is/css-data";
import { InformationIcon } from "@webstudio-is/icons";
import type { CreateBatchUpdate } from "../../shared/use-style-data";
import {
  CssValueInput,
  type IntermediateStyleValue,
} from "../../shared/css-value-input";
import { TransitionProperty } from "./transition-property";
import { convertTupleToStringValue } from "./transition-utils";
import { TransitionTiming } from "./transition-timing";

type TransitionContentProps = {
  index: number;
  layer: TupleValue;
  transition: string;
  onEditLayer: (index: number, layer: LayersValue) => void;
  createBatchUpdate: CreateBatchUpdate;
};

export const TransitionContent = ({
  layer,
  transition,
  onEditLayer,
  index,
}: TransitionContentProps) => {
  const [intermediateValue, setIntermediateValue] = useState<
    IntermediateStyleValue | InvalidValue | undefined
  >({ type: "intermediate", value: transition });

  const { property, timing, delay, duration } = useMemo(() => {
    return extractTransitionProperties(layer);
  }, [layer]);

  const handleChange = (value: string) => {
    setIntermediateValue({
      type: "intermediate",
      value,
    });
  };

  const handleComplete = () => {
    if (intermediateValue === undefined) {
      return;
    }

    const layers = parseTransition(intermediateValue.value);
    if (layers.type === "invalid") {
      setIntermediateValue({
        type: "invalid",
        value: intermediateValue.value,
      });
      return;
    }

    onEditLayer(index, layers);
  };

  const handleOnPropertySelection = (newProperty: TupleValueItem) => {
    const value: TupleValueItem[] = [
      newProperty,
      duration,
      timing,
      delay,
    ].filter<TupleValueItem>((item): item is TupleValueItem => item !== null);

    const newLayer: TupleValue = { type: "tuple", value };

    setIntermediateValue({
      type: "intermediate",
      value: convertTupleToStringValue(newLayer),
    });

    onEditLayer(index, { type: "layers", value: [newLayer] });
  };

  return (
    <Flex direction="column">
      <Grid
        gap="2"
        css={{
          px: theme.spacing[8],
          py: theme.spacing[8],
          gridTemplateColumns: `1fr ${theme.spacing[22]}`,
        }}
      >
        <TransitionProperty
          /* Browser defaults for property */
          property={property ?? { type: "keyword", value: "all" }}
          onPropertySelection={handleOnPropertySelection}
        />

        <Label> Duration </Label>
        <CssValueInput
          property="transitionDuration"
          /* Browser defaults for duration */
          value={duration ?? { type: "unit", value: 0, unit: "s" }}
          styleSource="local"
        />

        <Label>Delay</Label>
        <CssValueInput
          property="transitionDelay"
          /* Browser defaults for delay */
          value={delay ?? { type: "unit", value: 0, unit: "s" }}
          styleSource="local"
        />

        <TransitionTiming
          /* Browser default for timing */
          timing={timing ?? { type: "keyword", value: "ease" }}
        />
      </Grid>
      <Separator css={{ gridColumn: "span 2" }} />
      <Flex
        direction="column"
        css={{
          px: theme.spacing[8],
          py: theme.spacing[8],
          gap: theme.spacing[3],
          minWidth: theme.spacing[30],
        }}
      >
        <Label>
          <Flex align="center" gap="1">
            Code
            <Tooltip
              variant="wrapped"
              content={
                <Text>
                  Paste CSS code for a transition or part of a transition, for
                  example:
                  <br />
                  <br />
                  opacity 200ms ease;
                </Text>
              }
            >
              <InformationIcon />
            </Tooltip>
          </Flex>
        </Label>
        <TextArea
          rows={3}
          name="description"
          css={{ minHeight: theme.spacing[14], ...textVariants.mono }}
          value={intermediateValue?.value ?? ""}
          onChange={(event) => handleChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleComplete();
              event.preventDefault();
            }
          }}
        />
      </Flex>
    </Flex>
  );
};
