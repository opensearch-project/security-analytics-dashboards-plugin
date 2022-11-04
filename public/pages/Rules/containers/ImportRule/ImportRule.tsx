/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserServices } from '../../../../models/interfaces';
import { RuleEditor } from '../../components/RuleEditor/RuleEditor';
import React, { useState } from 'react';
import { EuiButton, EuiFilePicker, EuiFlexGroup, EuiFlexItem, EuiSpacer } from '@elastic/eui';
import { ROUTES } from '../../../../utils/constants';
import { Rule } from '../../../../../models/interfaces';
import { RouteComponentProps } from 'react-router-dom';
import { load, safeDump } from 'js-yaml';
import { ContentPanel } from '../../../../components/ContentPanel';

export interface ImportRuleProps {
  services: BrowserServices;
  history: RouteComponentProps['history'];
}

export const ImportRule: React.FC<ImportRuleProps> = ({ history, services }) => {
  const [fileError, setFileError] = useState('');
  const onChange = (files: any) => {
    setFileError('');
    if (files[0].type === 'application/x-yaml') {
      let reader = new FileReader();
      reader.readAsText(files[0]);
      reader.onload = function () {
        const yamlContent: any = reader.result;
        const jsonContent = load(yamlContent);
        let detectionYaml = '';
        if (jsonContent.detection) {
          try {
            detectionYaml = safeDump(jsonContent.detection);
          } catch (error: any) {}
        }

        const rule: Rule = {
          id: '25b9c01c-350d-4b95-bed1-836d04a4f324',
          category: '',
          title: jsonContent.title || '',
          description: jsonContent.description || '',
          status: jsonContent.status || '',
          author: jsonContent.author || '',
          references:
            jsonContent.references?.map((reference: string) => ({ value: reference })) || [],
          tags: jsonContent.tags?.map((tag: string) => ({ value: tag })) || [],
          log_source: jsonContent.logsource || '',
          detection: detectionYaml,
          level: jsonContent.level || '',
          false_positives:
            jsonContent.falsepositives?.map((falsePositive: string) => ({
              value: falsePositive,
            })) || [],
        };
        setContent(
          <RuleEditor
            title="Import a rule"
            services={services}
            FooterActions={footerActions}
            rule={rule}
          />
        );
      };
    } else {
      setFileError('Only yaml files are accepted');
    }
  };

  const [content, setContent] = useState(
    <>
      <ContentPanel title="Import rule">
        <EuiFilePicker
          id={'filePickerId'}
          fullWidth
          initialPromptText="Select or drag yml file containing Sigma rules"
          onChange={onChange}
          display={'large'}
          multiple={false}
          aria-label="file picker"
        />
        {fileError && <div>Error: {fileError}</div>}
      </ContentPanel>
      <EuiSpacer size="xl" />
      <EuiFlexGroup justifyContent="flexEnd">
        <EuiFlexItem grow={false}>
          <EuiButton onClick={() => history.replace(ROUTES.RULES)}>Cancel</EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );

  const footerActions: React.FC<{ rule: Rule }> = ({ rule }) => {
    const onCreate = async () => {
      const updateRuleRes = await services.ruleService.createRule(rule);

      if (!updateRuleRes.ok) {
        // TODO: show toast notification
        alert('Failed rule creation');
      }

      history.replace(ROUTES.RULES);
    };

    return (
      <EuiFlexGroup justifyContent="flexEnd">
        <EuiFlexItem grow={false}>
          <EuiButton onClick={() => history.replace(ROUTES.RULES)}>Cancel</EuiButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton fill onClick={onCreate}>
            Create
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  };

  return content;
};
