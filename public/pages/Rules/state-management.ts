import axios from 'axios';

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

export const sigmaRulesArray = rulesArray;
export const custom = customRulesArray;

console.log('RULES ARRAY', rulesArray);

// axios
//   .get('http://localhost:9999/')
//   .then((res) => {
//     initialState.rules = res.data[0];
//     initialState.applicationRules = res.data[1];
//     initialState.aptRules = res.data[2];
//     initialState.cloudRules = res.data[3];
//     initialState.complianceRules = res.data[4];
//     initialState.linuxRules = res.data[5];
//     initialState.macosRules = res.data[6];
//     initialState.networkRules = res.data[7];
//     initialState.proxyRules = res.data[8];
//     initialState.webRules = res.data[9];
//     initialState.windowsRules = res.data[10];
//     initialState.customRules = res.data[11];
//     initialState.detectors = res.data[12]
//   })
//   .catch((err) => {
//     initialState.rules = [];
//   });

// interface RulesState {
//   rules: any;
//   currentView: string;
//   currentStatus: boolean;
//   statusValue: string;
//   ruleTypes: any;
//   error: string;
//   flyout: boolean;
//   applicationRules: any;
//   aptRules: any;
//   cloudRules: any;
//   complianceRules: any;
//   linuxRules: any;
//   macosRules: any;
//   networkRules: any;
//   proxyRules: any;
//   webRules: any;
//   windowsRules: any;
//   customRules: any;
//   detectors: any;
// }

// export const initialState: RulesState = {
//   rules: [],
//   currentStatus: false,
//   currentView: 'Rules',
//   statusValue: '',
//   ruleTypes: [
//     'application',
//     'apt',
//     'cloud',
//     'compliance',
//     'linux',
//     'macos',
//     'proxy',
//     'network',
//     'web',
//     'windows',
//     'custom',
//   ],
//   error: '',
//   flyout: false,
//   applicationRules: [],
//   aptRules: [],
//   cloudRules: [],
//   complianceRules: [],
//   linuxRules: [],
//   macosRules: [],
//   networkRules: [],
//   proxyRules: [],
//   webRules: [],
//   windowsRules: [],
//   customRules: [],
// };
