/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, { useState } from "react";
import {
  EuiButtonGroup,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLink,
  EuiPopover,
  EuiSpacer,
  EuiText,
} from "@elastic/eui";
import {
  PLUGIN_VERSION_SHORT,
  SPACE_SELECTOR_LABEL,
  SpaceTypes,
} from "../../../common/constants";

interface SpaceSelectorProps {
  selectedSpace: string;
  onSpaceChange: (spaceId: string) => void;
  isDisabled?: boolean;
  documentationUrl?: string;
  allowedSpaces?: string[];
}

export const SpaceSelector: React.FC<SpaceSelectorProps> = ({
  selectedSpace,
  onSpaceChange,
  isDisabled = false,
  documentationUrl = `https://documentation.wazuh.com/${PLUGIN_VERSION_SHORT}/user-manual/kvdbs/spaces.html`,
  allowedSpaces,
}) => {
  const visibleSpaceTypes = allowedSpaces
    ? Object.values(SpaceTypes).filter((st) => allowedSpaces.includes(st.value))
    : Object.values(SpaceTypes);
  const [infoPopoverOpen, setInfoPopoverOpen] = useState<boolean>(false);

  return (
    <EuiFlexGroup gutterSize="s" alignItems="center">
      <EuiFlexItem grow={false}>
        <EuiText size="s" style={{ whiteSpace: "nowrap", fontWeight: 500 }}>
          {SPACE_SELECTOR_LABEL}
        </EuiText>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiButtonGroup
          data-test-subj="space-selector"
          legend="Space selector"
          color="primary"
          options={visibleSpaceTypes.map((spaceType) => ({
            id: spaceType.value,
            label: spaceType.label,
          }))}
          idSelected={selectedSpace}
          onChange={onSpaceChange}
          isDisabled={isDisabled}
        />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiPopover
          button={
            <EuiButtonIcon
              iconType="iInCircle"
              aria-label="Spaces information"
              onClick={() => setInfoPopoverOpen(!infoPopoverOpen)}
              color="primary"
            />
          }
          isOpen={infoPopoverOpen}
          closePopover={() => setInfoPopoverOpen(false)}
          anchorPosition="downRight"
        >
          <div style={{ width: "300px" }}>
            <EuiText size="s">
              <strong>Spaces</strong>
            </EuiText>
            <EuiSpacer size="s" />
            {visibleSpaceTypes.map((spaceType) => (
              <div key={spaceType.value} style={{ paddingLeft: "16px" }}>
                <EuiText size="xs">
                  <p>
                    <strong>{spaceType.label}:</strong> {spaceType.description}
                  </p>
                </EuiText>
                <EuiSpacer size="s" />
              </div>
            ))}
            <p>
              <EuiLink href={documentationUrl} target="_blank" external>
                <EuiText size="s" className="eui-displayInline">
                  Learn more in the documentation
                </EuiText>
              </EuiLink>
            </p>
          </div>
        </EuiPopover>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
