import axios from 'axios';

axios
  .get('http://localhost:9999/')
  .then((res) => {
    initialState.rules = res.data[0];
    initialState.applicationRules = res.data[1];
    initialState.aptRules = res.data[2];
    initialState.cloudRules = res.data[3];
    initialState.complianceRules = res.data[4];
    initialState.linuxRules = res.data[5];
    initialState.macosRules = res.data[6];
    initialState.networkRules = res.data[7];
    initialState.proxyRules = res.data[8];
    initialState.webRules = res.data[9];
    initialState.windowsRules = res.data[10];
    initialState.customRules = res.data[11];
  })
  .catch((err) => {
    initialState.rules = [];
  });

interface RulesState {
  rules: object[];
  currentView: string;
  currentStatus: boolean;
  statusValue: string;
  ruleTypes: any;
  error: string;
  flyout: boolean;
  applicationRules: any;
  aptRules: any;
  cloudRules: any;
  complianceRules: any;
  linuxRules: any;
  macosRules: any;
  networkRules: any;
  proxyRules: any;
  webRules: any;
  windowsRules: any;
  customRules: any;
}
export const initialState: RulesState = {
  rules: [],
  currentStatus: false,
  currentView: 'Rules',
  statusValue: '',
  ruleTypes: [
    'application',
    'apt',
    'cloud',
    'compliance',
    'linux',
    'macos',
    'proxy',
    'network',
    'web',
    'windows',
    'custom',
  ],
  error: '',
  flyout: false,
  applicationRules: [],
  aptRules: [],
  cloudRules: [],
  complianceRules: [],
  linuxRules: [],
  macosRules: [],
  networkRules: [],
  proxyRules: [],
  webRules: [],
  windowsRules: [],
  customRules: [],
};

export function reducer(state: RulesState, action: any) {
  switch (action.type) {
    // case 'flyout': {
    //   return {
    //     ...newState,
    //     flyout: action.payload,
    //   };
    // }
    case 'currentView': {
      return { ...state, currentView: action.payload };
    }
    default:
      throw new Error('Action not found');
  }
}
