/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ContentPanel } from '../../../../components/ContentPanel';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { EuiBasicTableColumn, EuiSmallButton, EuiInMemoryTable } from '@elastic/eui';
import { FieldMappingsTableItem } from '../../../CreateDetector/models/interfaces';
import { SecurityAnalyticsContext } from '../../../../services';
import { FieldMapping } from '../../../../../models/interfaces';
import { errorNotificationToast } from '../../../../utils/helpers';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { Detector } from '../../../../../types';
import { getMappingFields } from '../../utils/helpers';

export interface FieldMappingsViewProps {
  detector: Detector;
  existingMappings?: FieldMapping[];
  editFieldMappings: () => void;
  notifications: NotificationsStart;
  isEditable?: boolean;
}

const columns: EuiBasicTableColumn<FieldMappingsTableItem>[] = [
  {
    field: 'ruleFieldName',
    name: 'Rule field name',
    sortable: true,
  },
  {
    field: 'logFieldName',
    name: 'Mapped log field name',
  },
];

export const FieldMappingsView: React.FC<FieldMappingsViewProps> = ({
  detector,
  existingMappings,
  editFieldMappings,
  notifications,
  isEditable = true,
}) => {
  const actions = useMemo(
    () =>
      isEditable
        ? [
            <EuiSmallButton onClick={editFieldMappings} data-test-subj={'edit-detector-field-mappings'}>
              Edit
            </EuiSmallButton>,
          ]
        : null,
    []
  );
  const [fieldMappingItems, setFieldMappingItems] = useState<FieldMappingsTableItem[]>([]);
  const saContext = useContext(SecurityAnalyticsContext);

  const fetchFieldMappings = useCallback(
    async (indexName: string) => {
      const getMappingRes = await saContext?.services.fieldMappingService.getMappings(indexName);
      if (getMappingRes?.ok) {
        const mappingsData = getMappingRes.response[indexName];
        if (mappingsData) {
          const items: FieldMappingsTableItem[] = getMappingFields(
            mappingsData.mappings.properties,
            [],
            ''
          );

          setFieldMappingItems(items);
        }
      } else {
        errorNotificationToast(notifications, 'retrieve', 'field mappings', getMappingRes?.error);
      }
    },
    [saContext?.services, detector]
  );

  useEffect(() => {
    if (existingMappings) {
      const items: FieldMappingsTableItem[] = [];
      existingMappings.forEach((mapping) => {
        items.push({
          ruleFieldName: mapping.ruleFieldName,
          logFieldName: mapping.indexFieldName,
        });
      });

      setFieldMappingItems(items);
    } else {
      fetchFieldMappings(detector.inputs[0].detector_input.indices[0]).catch((e) => {
        errorNotificationToast(notifications, 'retrieve', 'field mappings', e);
      });
    }
  }, [detector]);

  return (
    <ContentPanel title={'Field mapping'} actions={actions}>
      <EuiInMemoryTable columns={columns} items={fieldMappingItems} />
    </ContentPanel>
  );
};
