/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useContext, useEffect, useState } from 'react';
import {
  EuiButton,
  EuiCheckboxGroup,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiPanel,
  EuiSpacer,
  EuiSwitch,
  EuiText,
  EuiTitle,
  htmlIdGenerator,
} from '@elastic/eui';
import { CoreServicesContext } from '../../../../components/core_services';
import { BREADCRUMBS, ROUTES } from '../../../../utils/constants';
import { Interval } from '../../../CreateDetector/components/DefineDetector/components/DetectorSchedule/Interval';
import { RouteComponentProps } from 'react-router-dom';

const idPrefix = htmlIdGenerator()();

export interface AddThreatIntelSourceProps extends RouteComponentProps {}

export const AddThreatIntelSource: React.FC<AddThreatIntelSourceProps> = ({ history }) => {
  const context = useContext(CoreServicesContext);
  const [onDemandChecked, setOnDemandChecked] = useState(false);
  const checkboxes = [
    {
      id: `${idPrefix}0`,
      label: 'IP - addresses',
    },
    {
      id: `${idPrefix}1`,
      label: 'Domains',
    },
    {
      id: `${idPrefix}2`,
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

  useEffect(() => {
    context?.chrome.setBreadcrumbs([
      BREADCRUMBS.SECURITY_ANALYTICS,
      BREADCRUMBS.THREAT_INTEL_OVERVIEW,
      BREADCRUMBS.THREAT_INTEL_ADD_CUSTOM_SOURCE,
    ]);
  }, []);

  return (
    <>
      <EuiPanel>
        <EuiTitle>
          <h4>Add custom threat intelligence source</h4>
        </EuiTitle>
        <EuiSpacer />
        <EuiText>
          <h4>Details</h4>
        </EuiText>
        <EuiSpacer />
        <EuiFormRow label="Name">
          <EuiFieldText placeholder="Title" />
        </EuiFormRow>
        <EuiSpacer />
        <EuiFormRow
          label={
            <>
              {'Description - '}
              <em>optional</em>
            </>
          }
        >
          <EuiFieldText placeholder="Description" />
        </EuiFormRow>
        <EuiSpacer />
        <EuiText>
          <h4>Connection details</h4>
        </EuiText>
        <EuiSpacer />
        <EuiFormRow label="IAM Role ARN">
          <EuiFieldText placeholder="IAM role" />
        </EuiFormRow>
        <EuiSpacer />
        <EuiFormRow label="S3 bucket directory">
          <EuiFieldText placeholder="S3://" />
        </EuiFormRow>
        <EuiSpacer />
        <EuiFormRow label="S3 object key">
          <EuiFieldText placeholder="object" />
        </EuiFormRow>
        <EuiSpacer />
        <EuiButton>Test connection</EuiButton>
        <EuiSpacer />
        <EuiText>
          <h4>Download schedule</h4>
        </EuiText>
        <EuiSpacer />
        <EuiSwitch
          label="Download on demand only"
          checked={onDemandChecked}
          onChange={(event) => setOnDemandChecked(event.target.checked)}
        />
        <EuiSpacer />
        {!onDemandChecked && (
          <>
            <Interval
              label="Download new data every"
              detector={{ schedule: { period: { interval: 1, unit: 'DAYS' } } }}
              onDetectorScheduleChange={(sch) => {}}
            />
            <EuiSpacer />
          </>
        )}
        <EuiText>
          <h4>Types of malicious indicators</h4>
        </EuiText>
        <EuiSpacer />
        <EuiCheckboxGroup
          options={checkboxes}
          idToSelectedMap={checkboxIdToSelectedMap}
          onChange={onChange}
        />
        <EuiSpacer />
      </EuiPanel>
      <EuiSpacer />
      <EuiFlexGroup justifyContent="flexEnd">
        <EuiFlexItem grow={false}>
          <EuiButton onClick={() => history.push(ROUTES.THREAT_INTEL_OVERVIEW)}>Cancel</EuiButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton fill>Add threat intel source</EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
};
