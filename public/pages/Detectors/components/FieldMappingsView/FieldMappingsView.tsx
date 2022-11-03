/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ContentPanel } from '../../../../components/ContentPanel';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { EuiBasicTableColumn, EuiButton, EuiInMemoryTable } from '@elastic/eui';
import { FieldMappingsTableItem } from '../../../CreateDetector/models/interfaces';
import { ServicesContext } from '../../../../services';
import { Detector, FieldMapping } from '../../../../../models/interfaces';

export interface FieldMappingsViewProps {
  detector: Detector;
  existingMappings?: FieldMapping[];
  editFieldMappings: () => void;
}

const columns: EuiBasicTableColumn<FieldMappingsTableItem>[] = [
  {
    field: 'ruleFieldName',
    name: 'Rule field name',
    sortable: true,
  },
  {
    field: 'logFieldName',
    name: 'Mapped index field name',
  },
];

export const FieldMappingsView: React.FC<FieldMappingsViewProps> = ({
  detector,
  existingMappings,
  editFieldMappings,
}) => {
  const actions = useMemo(() => [<EuiButton onClick={editFieldMappings}>Edit</EuiButton>], []);
  const [fieldMappingItems, setFieldMappingItems] = useState<FieldMappingsTableItem[]>([]);
  const services = useContext(ServicesContext);

  const fetchFieldMappings = useCallback(
    async (indexName: string) => {
      const getMappingRes = await services?.fieldMappingService.getMappings(indexName);
      if (getMappingRes?.ok) {
        const mappings = getMappingRes.response[detector.detector_type.toLowerCase()];
        if (mappings) {
          let items: FieldMappingsTableItem[] = [];
          Object.entries(mappings.mappings.properties).forEach((entry) => {
            items.push({
              ruleFieldName: entry[0],
              logFieldName: entry[1].path,
            });
          });

          setFieldMappingItems(items);
        }
      } else {
        // TODO: show error notification
      }
    },
    [services, detector]
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
      fetchFieldMappings(detector.inputs[0].detector_input.indices[0]);
    }
  }, [detector]);

  return (
    <ContentPanel title={'Field mapping'} actions={actions}>
      <EuiInMemoryTable columns={columns} items={fieldMappingItems} />
    </ContentPanel>
  );
};
