/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  EuiBottomBar,
  EuiButton,
  EuiCheckboxGroup,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiPanel,
  EuiSpacer,
  EuiSwitch,
  EuiTitle,
} from '@elastic/eui';
import { Interval } from '../../../CreateDetector/components/DefineDetector/components/DetectorSchedule/Interval';

export interface ThreatIntelSourceDetailsProps {}

export const ThreatIntelSourceDetails: React.FC<ThreatIntelSourceDetailsProps> = (props) => {
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [onDemandChecked, setOnDemandChecked] = useState(false);
  const checkboxes = [
    {
      id: `ip`,
      label: 'IP - addresses',
    },
    {
      id: `domain`,
      label: 'Domains',
    },
    {
      id: `file_hash`,
      label: 'File hash',
    },
  ];
  const [checkboxIdToSelectedMap, setCheckboxIdToSelectedMap] = useState<Record<string, boolean>>(
    {}
  );

  const onChange = (optionId: string) => {
    const newCheckboxIdToSelectedMap = {
      ...checkboxIdToSelectedMap,
      ...{
        [optionId]: !checkboxIdToSelectedMap[optionId],
      },
    };
    setCheckboxIdToSelectedMap(newCheckboxIdToSelectedMap);
  };

  return (
    <>
      <EuiPanel>
        <EuiFlexGroup>
          <EuiFlexItem grow={1}>
            <EuiTitle size="s">
              <h4>Threat intel source details</h4>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem grow={2}>
            <EuiFormRow label="Description">
              <EuiFieldText readOnly={isReadOnly} />
            </EuiFormRow>
            <EuiSpacer />
            <EuiFormRow label="Download schedule">
              <>
                <EuiSpacer />
                <EuiSwitch
                  label="Download on demand only"
                  checked={onDemandChecked}
                  onChange={(event) => setOnDemandChecked(event.target.checked)}
                  disabled={isReadOnly}
                />
                <EuiSpacer />
                {!onDemandChecked && (
                  <>
                    <Interval
                      label=""
                      detector={{ schedule: { period: { interval: 1, unit: 'DAYS' } } }}
                      onDetectorScheduleChange={(sch) => {}}
                      readonly={isReadOnly}
                    />
                    <EuiSpacer />
                  </>
                )}
              </>
            </EuiFormRow>
            <EuiFormRow label="Types of malicious indicators">
              <EuiCheckboxGroup
                options={checkboxes}
                idToSelectedMap={checkboxIdToSelectedMap}
                onChange={onChange}
                disabled={isReadOnly}
              />
            </EuiFormRow>
            <EuiSpacer />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              style={{ visibility: isReadOnly ? 'visible' : 'hidden' }}
              onClick={() => setIsReadOnly(false)}
            >
              Edit
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
      {!isReadOnly && (
        <EuiBottomBar>
          <EuiFlexGroup justifyContent="flexEnd">
            <EuiFlexItem grow={false}>
              <EuiButton onClick={() => setIsReadOnly(true)}>Discard</EuiButton>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton fill>Save</EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiBottomBar>
      )}
    </>
  );
};
