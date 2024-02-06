import {
  Grid,
  Label,
  theme,
  Text,
  CheckboxAndLabel,
  Checkbox,
} from "@webstudio-is/design-system";
import { useIds } from "~/shared/form-utils";
import type { ProjectSettings } from "./project-settings";

export const ClonableSection = (props: {
  settings: ProjectSettings;
  onSettingsChange: (settings: ProjectSettings) => void;
}) => {
  const ids = useIds(["clonable", "directory"]);

  const handleChange =
    <Name extends keyof ProjectSettings>(name: Name) =>
    (value: ProjectSettings[Name]) => {
      props.onSettingsChange({
        ...props.settings,
        [name]: value,
      });
    };

  return (
    <Grid gap={2} css={{ mx: theme.spacing[5], px: theme.spacing[5] }}>
      <Text variant="titles">Clonable</Text>
      <CheckboxAndLabel>
        <Checkbox
          checked={props.settings.clonable ?? false}
          id={ids.clonable}
          onCheckedChange={(checked) => {
            if (typeof checked === "boolean") {
              handleChange("clonable")(checked);
            }
          }}
        />
        <Label htmlFor={ids.clonable}>
          Allow cloning the project with View permission
        </Label>
      </CheckboxAndLabel>
      <CheckboxAndLabel>
        <Checkbox
          checked={props.settings.directory ?? false}
          id={ids.directory}
          onCheckedChange={(checked) => {
            if (typeof checked === "boolean") {
              handleChange("directory")(checked);
            }
          }}
        />
        <Label htmlFor={ids.directory}>
          Allow listing in the public directory
        </Label>
      </CheckboxAndLabel>
    </Grid>
  );
};
