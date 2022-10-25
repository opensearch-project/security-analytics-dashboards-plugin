/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ContentPanel } from '../../../../components/ContentPanel';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { EuiBasicTableColumn, EuiButton, EuiInMemoryTable } from '@elastic/eui';
import { RouteComponentProps } from 'react-router-dom';
import { FieldMappingsTableItem } from '../../../CreateDetector/models/interfaces';
import { ServicesContext } from '../../../../services';
import { ROUTES } from '../../../../utils/constants';
import { Detector } from '../../../../../models/interfaces';

export interface FieldMappingsViewProps extends RouteComponentProps {
  detector: Detector;
}

const columns: EuiBasicTableColumn<FieldMappingsTableItem>[] = [
  {
    field: 'siemFieldName',
    name: 'SIEM field name',
    sortable: true,
  },
  {
    field: 'logFieldName',
    name: 'Mapped index field name',
  },
];

export const FieldMappingsView: React.FC<FieldMappingsViewProps> = ({ detector, history }) => {
  const actions = useMemo(
    () => [
      <EuiButton
        onClick={() => {
          history.push({
            pathname: ROUTES.EDIT_FIELD_MAPPINGS,
            state: { detector, fieldMappingItems },
          });
        }}
      >
        Edit
      </EuiButton>,
    ],
    []
  );
  const [fieldMappingItems, setFieldMappingItems] = useState<FieldMappingsTableItem[]>([]);
  const services = useContext(ServicesContext);

  useEffect(() => {
    const getFieldMappings = async (indexName: string) => {
      const getMappingRes = await services?.fieldMappingService.getMappings(indexName);
      if (getMappingRes?.ok) {
        const mappings = getMappingRes.response[detector.detector_type.toLowerCase()];
        if (mappings) {
          let items: FieldMappingsTableItem[] = [];
          Object.entries(mappings.mappings.properties).forEach((entry) => {
            items.push({
              logFieldName: entry[0],
              siemFieldName: entry[1].path,
            });
          });

          setFieldMappingItems(items);
        }
      } else {
        // TODO: show error notification
      }
    };

    getFieldMappings(detector.inputs[0].detector_input.indices[0]);
  }, [detector]);

  return (
    <ContentPanel title={'Field mapping'} actions={actions}>
      <EuiInMemoryTable columns={columns} items={fieldMappingItems} />
    </ContentPanel>
  );
};
