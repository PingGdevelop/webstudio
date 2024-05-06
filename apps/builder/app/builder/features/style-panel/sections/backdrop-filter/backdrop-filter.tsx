import { CollapsibleSectionRoot } from "~/builder/shared/collapsible-section";
import type { SectionProps } from "../shared/section";
import type {
  FunctionValue,
  StyleProperty,
  TupleValue,
} from "@webstudio-is/css-engine";
import { useState } from "react";
import {
  SectionTitle,
  SectionTitleButton,
  SectionTitleLabel,
  Tooltip,
} from "@webstudio-is/design-system";
import { PropertyName } from "../../shared/property-name";
import { getStyleSource } from "../../shared/style-info";
import { getDots } from "../../shared/collapsible-section";
import { PlusIcon } from "@webstudio-is/icons";
import { addLayer } from "../../style-layer-utils";
import { parseFilter } from "@webstudio-is/css-data";
import { LayersList } from "../../style-layers-list";
import { FilterLayer } from "../filter/filter-layer";

export const properties = ["backdropFilter"] satisfies Array<StyleProperty>;

const property: StyleProperty = properties[0];
const label = "Backdrop Filters";
const INITIAL_BACKDROP_FILTER = "blur(0px)";

export const Section = (props: SectionProps) => {
  const { currentStyle, deleteProperty } = props;
  const [isOpen, setIsOpen] = useState(false);
  const layerStyleSource = getStyleSource(currentStyle[property]);
  const value = currentStyle[property]?.value;

  return (
    <CollapsibleSectionRoot
      fullWidth
      label={label}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <SectionTitle
          dots={getDots(currentStyle, properties)}
          suffix={
            <Tooltip content={"Add a backdrop-filter"}>
              <SectionTitleButton
                prefix={<PlusIcon />}
                onClick={() => {
                  addLayer(
                    property,
                    parseFilter(INITIAL_BACKDROP_FILTER),
                    currentStyle,
                    props.createBatchUpdate
                  );
                  setIsOpen(true);
                }}
              />
            </Tooltip>
          }
        >
          <PropertyName
            title={label}
            style={currentStyle}
            properties={properties}
            description="Backdrop filters are similar to filters, but are applied to the area behind an element. This can be useful for creating frosted glass effects."
            label={
              <SectionTitleLabel color={layerStyleSource}>
                {label}
              </SectionTitleLabel>
            }
            onReset={() => deleteProperty(property)}
          />
        </SectionTitle>
      }
    >
      {value?.type === "tuple" && value.value.length > 0 && (
        <LayersList<FunctionValue, TupleValue>
          {...props}
          property={property}
          layers={value}
          renderLayer={(layerProps) => (
            <FilterLayer {...layerProps} key={layerProps.index} label={label} />
          )}
        />
      )}
    </CollapsibleSectionRoot>
  );
};
