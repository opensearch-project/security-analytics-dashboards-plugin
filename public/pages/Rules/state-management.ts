/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const ruleTypes: any = [
  'application',
  'apt',
  'cloud',
  'compliance',
  'linux',
  'macos',
  'network',
  'proxy',
  'web',
  'windows',
];

let rulesArray: any = [];
let customRulesArray: any = [];

export const allRequest: any = {
  url: 'http://18.237.38.16:80/_plugins/_security_analytics/rules/_search?pre_packaged=true',
  method: 'POST',
  //get all rules
  data: {
    from: 0,
    size: 5000,
    query: {
      match_all: {},
    },
  },
};

export const customRequest: any = {
  url: 'http://18.237.38.16:80/_plugins/_security_analytics/rules/_search?pre_packaged=false',
  method: 'POST',
  //get all rules
  data: {
    from: 0,
    size: 5000,
    query: {
      match_all: {},
    },
  },
};

export const deleteRule: any = {
  url: 'http://localhost:9200/.opensearch-custom-rules-config',
  method: 'DELETE',
  data: {
    query: {
      match_all: {},
    },
  },
};

export const createRule: any = {
  url: 'http://localhost:9200/_plugins/_security_analytics/rules?category=windows',
  method: 'POST',
  data: {},
};

export const sigmaRulesArray = rulesArray;
export const custom = customRulesArray;
