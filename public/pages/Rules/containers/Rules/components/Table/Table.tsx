/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import RulesService from '../../../../../../services/RuleService';
import axios from 'axios';

export const Table = () => {
  const [sigmaRules, setRules] = useState<any | object>([]);

  //to do: Http coming back undefined
  // useEffect(() => {
  //   const rulesService = new RulesService();
  //   rulesService.getRules('pre-packaged').then((res) => {
  //     let allRules: any = [];
  //     res.data.hits.hits.forEach((rule: any) => {
  //       allRules.push(rule._source);
  //     });
  //     setRules(allRules);
  //   });
  // }, []);

  useEffect(() => {
    const allRequest: any = {
      url: 'http://35.92.187.49:9200/_plugins/_security_analytics/rules/_search?pre_packaged=true',
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
    axios(allRequest).then((res) => {
      let allRules: any = [];
      res.data.hits.hits.forEach((rule: any) => {
        allRules.push(rule._source);
      });
      setRules(allRules);
    });
  }, []);
  console.log('RULES', sigmaRules);

  return <div>Table</div>;
};
