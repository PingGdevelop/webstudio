import {
  Grid,
  Separator,
  Label,
  Flex,
  InputField,
  Button,
  Text,
  theme,
  List,
  ListItem,
  SmallIconButton,
  ScrollArea,
} from "@webstudio-is/design-system";
import { ArrowRightIcon, TrashIcon } from "@webstudio-is/icons";
import { useState, type ChangeEvent } from "react";
import type { ProjectSettings } from "./project-settings";
import {
  ProjectNewRedirectPathSchema,
  ProjectOldRedirectPathSchema,
} from "@webstudio-is/sdk";

export const ProjectRedirectionSettings = (props: {
  settings: ProjectSettings;
  onSettingsChange: (settings: ProjectSettings) => void;
}) => {
  const [oldPath, setOldPath] = useState<string>("");
  const [newPath, setNewPath] = useState<string>("");
  const [isValidOldPath, setIsValidOldPath] = useState<boolean>(true);
  const [isValidNewPath, setIsValidNewPath] = useState<boolean>(true);

  const redirects = props.settings?.redirects ?? {};
  const redirectKeys = Object.keys(redirects);
  const isValidRedirects = isValidOldPath && isValidNewPath;

  const handleOldPathChange = (event: ChangeEvent<HTMLInputElement>) => {
    setOldPath(event.target.value);
    const oldPathValidationResult = ProjectOldRedirectPathSchema.safeParse(
      event.target.value
    );
    oldPathValidationResult.success
      ? setIsValidOldPath(true)
      : setIsValidOldPath(false);
  };

  const handleNewPathChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNewPath(event.target.value);
    const newPathValidationResult = ProjectNewRedirectPathSchema.safeParse(
      event.target.value
    );
    newPathValidationResult.success
      ? setIsValidNewPath(true)
      : setIsValidNewPath(false);
  };

  const handleAddRedirect = () => {
    if (isValidOldPath === false || isValidNewPath === false) {
      return;
    }

    props.onSettingsChange({
      ...props.settings,
      redirects: {
        ...redirects,
        [oldPath]: newPath,
      },
    });
    setOldPath("");
    setNewPath("");
  };

  const handleDeleteRedirect = (redirect: string) => {
    const newRedirects = { ...redirects };
    delete newRedirects[redirect];
    props.onSettingsChange({
      ...props.settings,
      redirects: newRedirects,
    });
  };

  return (
    <>
      <Separator />
      <Grid gap={2} css={{ mx: theme.spacing[5], px: theme.spacing[5] }}>
        <Label sectionTitle>301 Redirects</Label>
        <Text color="subtle">
          Redirects old URLs to new ones so that you don’t lose any traffic or
          search engine rankings.
        </Text>

        <Flex gap="2" align="center">
          <InputField
            type="text"
            placeholder="/old-path"
            value={oldPath}
            color={
              isValidOldPath === true || oldPath === "" ? undefined : "error"
            }
            onChange={handleOldPathChange}
            css={{ flexGrow: 1 }}
          />
          <ArrowRightIcon />
          <InputField
            type="text"
            placeholder="/new-path or URL"
            value={newPath}
            color={
              isValidNewPath === true || newPath === "" ? undefined : "error"
            }
            onChange={handleNewPathChange}
          />
          <Button
            disabled={isValidRedirects === false || oldPath === newPath}
            onClick={handleAddRedirect}
            css={{ flexShrink: 0 }}
          >
            Add
          </Button>
        </Flex>
      </Grid>

      {redirectKeys.length > 0 ? (
        <Grid css={{ px: theme.spacing[5] }}>
          <ScrollArea css={{ maxHeight: theme.spacing[22] }}>
            <List asChild>
              <Flex
                direction="column"
                gap="1"
                css={{
                  mx: theme.spacing[5],
                  py: theme.spacing[5],
                }}
              >
                {Object.keys(redirects).map((redirect, index) => {
                  return (
                    <ListItem asChild key={redirect} index={index}>
                      <Flex
                        justify="between"
                        align="center"
                        gap="2"
                        css={{
                          overflow: "hidden",
                          p: theme.spacing[3],
                        }}
                      >
                        <Flex gap="2">
                          <Text>{redirect}</Text>
                          <ArrowRightIcon />
                          <Text truncate>{redirects[redirect]}</Text>
                        </Flex>
                        <SmallIconButton
                          variant="destructive"
                          icon={<TrashIcon />}
                          onClick={() => handleDeleteRedirect(redirect)}
                        />
                      </Flex>
                    </ListItem>
                  );
                })}
              </Flex>
            </List>
          </ScrollArea>
        </Grid>
      ) : null}
    </>
  );
};
