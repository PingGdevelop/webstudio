import { useCallback } from "react";
import { useStore } from "@nanostores/react";
import {
  Tree,
  TreeItemLabel,
  TreeItemBody,
  type TreeProps,
  type TreeItemRenderProps,
  styled,
  theme,
} from "@webstudio-is/design-system";
import type { Instance } from "@webstudio-is/project-build";
import store from "immerhin";
import { type WsComponentMeta } from "@webstudio-is/react-sdk";
import {
  editInstanceNameSelectorStore,
  instancesStore,
  registeredComponentMetasStore,
} from "~/shared/nano-states";
import { MetaIcon } from "../meta-icon";
import { useEditable } from "./use-editable";
import { useHotkeys } from "react-hotkeys-hook";

export const InstanceTree = (
  props: Omit<
    TreeProps<Instance>,
    "renderItem" | "canLeaveParent" | "getItemChildren"
  >
) => {
  const metas = useStore(registeredComponentMetasStore);
  const instances = useStore(instancesStore);
  const editInstanceName = useStore(editInstanceNameSelectorStore);

  useHotkeys(`ctrl+r, meta+r`, () => {
    if (
      props.selectedItemSelector === undefined ||
      editInstanceName ||
      props.selectedItemSelector?.length === 0
    ) {
      return;
    }
    editInstanceNameSelectorStore.set(props.selectedItemSelector[0]);
  });

  const canLeaveParent = useCallback(
    (instanceId: Instance["id"]) => {
      const instance = instances.get(instanceId);
      if (instance === undefined) {
        return false;
      }
      const meta = metas.get(instance.component);
      return meta?.type !== "rich-text-child";
    },
    [instances, metas]
  );

  const getItemChildren = useCallback(
    (instanceId: Instance["id"]) => {
      const instance = instances.get(instanceId);
      const children: Instance[] = [];
      if (instance === undefined) {
        return children;
      }

      for (const child of instance.children) {
        if (child.type !== "id") {
          continue;
        }
        const childInstance = instances.get(child.value);
        if (childInstance === undefined) {
          continue;
        }
        children.push(childInstance);
      }
      return children;
    },
    [instances]
  );

  const updateInstanceLabel = useCallback((instanceId: string, val: string) => {
    store.createTransaction([instancesStore], (instances) => {
      const instance = instances.get(instanceId);
      if (instance === undefined) {
        return;
      }
      instance.label = val;
    });
  }, []);

  const renderItem = useCallback(
    (props: TreeItemRenderProps<Instance>) => {
      const meta = metas.get(props.itemData.component);
      if (meta === undefined) {
        return <></>;
      }
      const label = getInstanceLabel(props.itemData, meta);
      return (
        <TreeItemBody {...props} selectionEvent="focus">
          <TreeItem
            isEditing={props.itemData.id === editInstanceName}
            onChangeValue={(val) => {
              updateInstanceLabel(props.itemData.id, val);
              editInstanceNameSelectorStore.set(undefined);
            }}
            prefix={<MetaIcon icon={meta.icon} />}
          >
            {label}
          </TreeItem>
        </TreeItemBody>
      );
    },
    [metas, updateInstanceLabel, editInstanceName]
  );

  return (
    <Tree
      {...props}
      canLeaveParent={canLeaveParent}
      getItemChildren={getItemChildren}
      renderItem={renderItem}
      isEditingItemName={editInstanceName}
      onEditItemName={(instanceId) => {
        editInstanceNameSelectorStore.set(instanceId);
      }}
    />
  );
};

export const getInstanceLabel = (
  instance: { label?: string },
  meta: WsComponentMeta
) => {
  return instance.label || meta.label;
};

const TreeItem = ({
  onChangeValue,
  isEditing,
  prefix,
  children,
}: {
  isEditing: boolean;
  prefix?: React.ReactNode;
  children: React.ReactNode;
  onChangeValue: (val: string) => void;
}) => {
  const { ref, handlers } = useEditable({
    isEditing,
    onChangeValue,
  });

  return (
    <EditableTreeItemLabel
      ref={ref}
      {...handlers}
      isEditing={isEditing}
      prefix={prefix}
    >
      {children}
    </EditableTreeItemLabel>
  );
};

const EditableTreeItemLabel = styled(TreeItemLabel, {
  variants: {
    isEditing: {
      true: {
        background: "white",
        padding: theme.spacing[3],
        borderRadius: theme.spacing[3],
        color: theme.colors.hiContrast,
        outline: "none",
        cursor: "auto",
        textOverflow: "clip",
        userSelect: "auto",
      },
    },
  },
});
