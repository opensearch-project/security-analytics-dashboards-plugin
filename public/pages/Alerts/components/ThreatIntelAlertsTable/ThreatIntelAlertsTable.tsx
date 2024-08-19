/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiBasicTableColumn,
  EuiSmallButtonIcon,
  EuiInMemoryTable,
  EuiTableSelectionType,
  EuiToolTip,
} from '@elastic/eui';
import { ThreatIntelAlert } from '../../../../../types';
import React, { useState } from 'react';
import { renderIoCType, renderTime } from '../../../../utils/helpers';
import { ALERT_STATE, DEFAULT_EMPTY_DATA } from '../../../../utils/constants';
import { parseAlertSeverityToOption } from '../../../CreateDetector/components/ConfigureAlerts/utils/helpers';
import { DISABLE_ACKNOWLEDGED_ALERT_HELP_TEXT } from '../../utils/constants';
import { ThreatIntelIocType } from '../../../../../common/constants';
import {
  ThreatIntelAlertFlyout,
  ThreatIntelAlertFlyoutProps,
} from '../ThreatIntelAlertFlyout/ThreatIntelAlertFlyout';

export interface ThreatIntelAlertsTableProps {
  alerts: ThreatIntelAlert[];
  onSelectionChange: (alerts: ThreatIntelAlert[]) => void;
  onAlertStateChange: (
    selectedItems: ThreatIntelAlert[],
    nextState: 'ACKNOWLEDGED' | 'COMPLETED'
  ) => Promise<boolean>;
}

export const ThreatIntelAlertsTable: React.FC<ThreatIntelAlertsTableProps> = ({
  alerts,
  onAlertStateChange,
  onSelectionChange,
}) => {
  const [flyoutProps, setFlyoutProps] = useState<ThreatIntelAlertFlyoutProps | undefined>(
    undefined
  );
  const itemSelection: EuiTableSelectionType<ThreatIntelAlert> = {
    onSelectionChange: (items) => {
      onSelectionChange(items);
    },
    selectable: (item: ThreatIntelAlert) =>
      [ALERT_STATE.ACTIVE, ALERT_STATE.ACKNOWLEDGED].includes(item.state as any),
    selectableMessage: (selectable) => (selectable ? '' : DISABLE_ACKNOWLEDGED_ALERT_HELP_TEXT),
  };

  const columns: EuiBasicTableColumn<ThreatIntelAlert>[] = [
    {
      field: 'start_time',
      name: 'Start time',
      render: (startTime: number) => renderTime(startTime),
    },
    {
      field: 'ioc_value',
      name: 'Indicator of compromise',
    },
    {
      field: 'ioc_type',
      name: 'Indicator type',
      render: (iocType: ThreatIntelIocType) => renderIoCType(iocType),
    },
    { field: 'state', name: 'Status', render: (state: string) => state || DEFAULT_EMPTY_DATA },
    {
      field: 'severity',
      name: 'Severity',
      render: (severity: string) =>
        parseAlertSeverityToOption(severity)?.label || DEFAULT_EMPTY_DATA,
    },
    {
      name: 'Actions',
      actions: [
        {
          render: (alertItem: ThreatIntelAlert) => {
            let tooltipContent;
            switch (alertItem.state as keyof typeof ALERT_STATE) {
              case 'ACTIVE':
                tooltipContent = 'Acknowledge';
                break;
              case 'ACKNOWLEDGED':
                tooltipContent = 'Complete';
                break;
              default:
                tooltipContent = DISABLE_ACKNOWLEDGED_ALERT_HELP_TEXT;
            }

            return alertItem.state === 'ACTIVE' || alertItem.state === 'ACKNOWLEDGED' ? (
              <EuiToolTip content={tooltipContent}>
                <EuiSmallButtonIcon
                  aria-label={'Acknowledge'}
                  iconType={alertItem.state === 'ACTIVE' ? 'thumbsUp' : 'check'}
                  onClick={() =>
                    onAlertStateChange(
                      [alertItem],
                      alertItem.state === 'ACTIVE' ? 'ACKNOWLEDGED' : 'COMPLETED'
                    )
                  }
                />
              </EuiToolTip>
            ) : (
              <></>
            );
          },
        },
        {
          render: (alertItem: ThreatIntelAlert) => (
            <EuiToolTip content={'View details'}>
              <EuiSmallButtonIcon
                aria-label={'View details'}
                iconType={'expand'}
                onClick={() => {
                  setFlyoutProps({
                    alertItem,
                    onAlertStateChange: onAlertStateChange,
                    onClose: () => setFlyoutProps(undefined),
                  });
                }}
              />
            </EuiToolTip>
          ),
        },
      ],
    },
  ];

  return (
    <>
      <EuiInMemoryTable
        columns={columns}
        items={alerts}
        itemId={(item) => `${item.id}`}
        pagination
        search
        selection={itemSelection}
        isSelectable={true}
      />
      {flyoutProps && <ThreatIntelAlertFlyout {...flyoutProps} />}
    </>
  );
};
