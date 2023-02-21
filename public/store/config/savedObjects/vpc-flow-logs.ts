/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  DashboardSavedObjectCreationConfig,
  IndexPatternSavedObjectCreationConfig,
  VisualizationSavedObjectCreationConfig,
} from '../../../../types/SavedObjectConfig';

export const vpcFlowLogsDashboardConfig: DashboardSavedObjectCreationConfig = {
  attributes: {
    description: '',
    hits: 0,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"query":{"language":"kuery","query":""},"filter":[]}',
    },
    optionsJSON: '{"hidePanelTitles":false,"useMargins":true}',
    panelsJSON:
      '[{"version":"7.7.0","gridData":{"x":0,"y":0,"w":24,"h":7,"i":"9ef783f5-af53-464f-8bf7-8fe79e574163"},"panelIndex":"9ef783f5-af53-464f-8bf7-8fe79e574163","embeddableConfig":{},"panelRefName":"panel_0"},{"version":"7.7.0","gridData":{"x":24,"y":0,"w":24,"h":7,"i":"96bddd36-2236-463b-b159-db84432d32de"},"panelIndex":"96bddd36-2236-463b-b159-db84432d32de","embeddableConfig":{},"panelRefName":"panel_1"},{"version":"7.7.0","gridData":{"x":0,"y":7,"w":24,"h":8,"i":"79257b0d-673f-4623-86ab-bf3e2cb151f8"},"panelIndex":"79257b0d-673f-4623-86ab-bf3e2cb151f8","embeddableConfig":{},"panelRefName":"panel_2"},{"version":"7.7.0","gridData":{"x":24,"y":7,"w":23,"h":8,"i":"9ac58252-693d-4d1b-a9d0-5fd413fa6814"},"panelIndex":"9ac58252-693d-4d1b-a9d0-5fd413fa6814","embeddableConfig":{},"panelRefName":"panel_3"},{"version":"7.7.0","gridData":{"x":0,"y":15,"w":12,"h":13,"i":"bca8500a-2fc1-413e-baea-bc3f412302e6"},"panelIndex":"bca8500a-2fc1-413e-baea-bc3f412302e6","embeddableConfig":{},"panelRefName":"panel_4"},{"version":"7.7.0","gridData":{"x":12,"y":15,"w":12,"h":13,"i":"915b89ba-5042-47ba-b109-c166aef741f6"},"panelIndex":"915b89ba-5042-47ba-b109-c166aef741f6","embeddableConfig":{},"panelRefName":"panel_5"},{"version":"7.7.0","gridData":{"x":24,"y":15,"w":12,"h":13,"i":"9fbd1232-494c-4b0f-a78b-c5ef50504ce9"},"panelIndex":"9fbd1232-494c-4b0f-a78b-c5ef50504ce9","embeddableConfig":{},"panelRefName":"panel_6"},{"version":"7.7.0","gridData":{"x":36,"y":15,"w":11,"h":13,"i":"bc745ad9-6dbb-436e-8a4a-b01519a8a5b5"},"panelIndex":"bc745ad9-6dbb-436e-8a4a-b01519a8a5b5","embeddableConfig":{},"panelRefName":"panel_7"},{"version":"7.7.0","gridData":{"x":0,"y":28,"w":24,"h":15,"i":"d1c3f6d6-bac5-4d31-af4e-0dbc85eec494"},"panelIndex":"d1c3f6d6-bac5-4d31-af4e-0dbc85eec494","embeddableConfig":{},"panelRefName":"panel_8"},{"version":"7.7.0","gridData":{"x":24,"y":28,"w":24,"h":15,"i":"3167fad5-70cc-44ab-bce1-53d0f30782af"},"panelIndex":"3167fad5-70cc-44ab-bce1-53d0f30782af","embeddableConfig":{},"panelRefName":"panel_9"},{"version":"7.7.0","gridData":{"x":0,"y":43,"w":48,"h":16,"i":"512dc9bf-f031-474f-9afb-36c59e7f4743"},"panelIndex":"512dc9bf-f031-474f-9afb-36c59e7f4743","embeddableConfig":{},"panelRefName":"panel_10"}]',
    timeRestore: false,
    title: 'VPCFlowLogs Summary',
    version: 1,
  },
  references: [
    {
      id: 'e64d06f0-8225-11ea-9ba8-7fa25bc74a6f',
      name: 'panel_0',
      type: 'visualization',
    },
    {
      id: '8079b750-8226-11ea-945d-8d0868f4a377',
      name: 'panel_1',
      type: 'visualization',
    },
    {
      id: '93a6db30-8228-11ea-9ba8-7fa25bc74a6f',
      name: 'panel_2',
      type: 'visualization',
    },
    {
      id: 'c3100a20-8234-11ea-8450-d1d13849d130',
      name: 'panel_3',
      type: 'visualization',
    },
    {
      id: 'e3231530-823b-11ea-8450-d1d13849d130',
      name: 'panel_4',
      type: 'visualization',
    },
    {
      id: '41ffb5a0-823b-11ea-8dd2-6fda3f2e19c6',
      name: 'panel_5',
      type: 'visualization',
    },
    {
      id: '82c6bd20-823d-11ea-a1e6-856110366757',
      name: 'panel_6',
      type: 'visualization',
    },
    {
      id: '435e9770-823d-11ea-8dd2-6fda3f2e19c6',
      name: 'panel_7',
      type: 'visualization',
    },
    {
      id: '77dae980-823e-11ea-a1e6-856110366757',
      name: 'panel_8',
      type: 'visualization',
    },
    {
      id: 'b7f8a390-823e-11ea-8450-d1d13849d130',
      name: 'panel_9',
      type: 'visualization',
    },
    {
      id: 'e530dac0-8073-11ea-9ba8-7fa25bc74a6f',
      name: 'panel_10',
      type: 'visualization',
    },
  ],
  type: 'dashboard',
};

export const vpcFlowLogsVisualizationConfigs: VisualizationSavedObjectCreationConfig[] = [
  {
    attributes: {
      description: '',
      kibanaSavedObjectMeta: {
        searchSourceJSON:
          '{"query":{"query":"","language":"kuery"},"indexRefName":"kibanaSavedObjectMeta.searchSourceJSON.index","filter":[]}',
      },
      title: 'VPCFlowLogs - AWS Account(Bar)',
      uiStateJSON: '{"vis":{"legendOpen":true}}',
      version: 1,
      visState:
        '{"title":"VPCFlowLogs - AWS Account(Bar)","type":"histogram","params":{"type":"histogram","grid":{"categoryLines":false},"categoryAxes":[{"id":"CategoryAxis-1","type":"category","position":"bottom","show":false,"style":{},"scale":{"type":"linear"},"labels":{"show":true,"filter":true,"truncate":100},"title":{}}],"valueAxes":[{"id":"ValueAxis-1","name":"LeftAxis-1","type":"value","position":"left","show":true,"style":{},"scale":{"type":"linear","mode":"normal"},"labels":{"show":true,"rotate":0,"filter":false,"truncate":100},"title":{"text":"Count"}}],"seriesParams":[{"show":"true","type":"histogram","mode":"stacked","data":{"label":"Count","id":"1"},"valueAxis":"ValueAxis-1","drawLinesBetweenPoints":true,"showCircles":true}],"addTooltip":true,"addLegend":true,"legendPosition":"right","times":[],"addTimeMarker":false,"labels":{"show":false},"thresholdLine":{"show":false,"value":10,"width":1,"style":"full","color":"#34130C"},"dimensions":{"x":{"accessor":0,"format":{"id":"terms","params":{"id":"string","otherBucketLabel":"Other","missingBucketLabel":"Missing"}},"params":{},"aggType":"terms"},"y":[{"accessor":2,"format":{"id":"number"},"params":{},"aggType":"count"}],"series":[{"accessor":1,"format":{"id":"terms","params":{"id":"string","otherBucketLabel":"Other","missingBucketLabel":"Missing"}},"params":{},"aggType":"terms"}]}},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"cloud.account.id","orderBy":"1","order":"desc","size":5,"otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"}},{"id":"3","enabled":true,"type":"terms","schema":"group","params":{"field":"cloud.account.id","orderBy":"1","order":"desc","size":10,"otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","customLabel":"Account"}}]}',
    },
    references: [
      {
        id: '99f81900-806f-11ea-945d-8d0868f4a377',
        name: 'kibanaSavedObjectMeta.searchSourceJSON.index',
        type: 'index-pattern',
      },
    ],
    type: 'visualization',
  },
  {
    attributes: {
      description: '',
      kibanaSavedObjectMeta: {
        searchSourceJSON:
          '{"query":{"query":"","language":"kuery"},"indexRefName":"kibanaSavedObjectMeta.searchSourceJSON.index","filter":[]}',
      },
      title: 'VPCFlowLogs - Region(Bar)',
      uiStateJSON: '{}',
      version: 1,
      visState:
        '{"title":"VPCFlowLogs - Region(Bar)","type":"histogram","params":{"type":"histogram","grid":{"categoryLines":false},"categoryAxes":[{"id":"CategoryAxis-1","type":"category","position":"bottom","show":false,"style":{},"scale":{"type":"linear"},"labels":{"show":true,"filter":true,"truncate":100},"title":{}}],"valueAxes":[{"id":"ValueAxis-1","name":"LeftAxis-1","type":"value","position":"left","show":true,"style":{},"scale":{"type":"linear","mode":"normal"},"labels":{"show":true,"rotate":0,"filter":false,"truncate":100},"title":{"text":"Count"}}],"seriesParams":[{"show":"true","type":"histogram","mode":"stacked","data":{"label":"Count","id":"1"},"valueAxis":"ValueAxis-1","drawLinesBetweenPoints":true,"showCircles":true}],"addTooltip":true,"addLegend":true,"legendPosition":"right","times":[],"addTimeMarker":false,"labels":{"show":false},"thresholdLine":{"show":false,"value":10,"width":1,"style":"full","color":"#34130C"},"dimensions":{"x":{"accessor":0,"format":{"id":"terms","params":{"id":"string","otherBucketLabel":"Other","missingBucketLabel":"Missing"}},"params":{},"aggType":"terms"},"y":[{"accessor":2,"format":{"id":"number"},"params":{},"aggType":"count"}],"series":[{"accessor":1,"format":{"id":"terms","params":{"id":"string","otherBucketLabel":"Other","missingBucketLabel":"Missing"}},"params":{},"aggType":"terms"}]}},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"cloud.region","orderBy":"1","order":"desc","size":5,"otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"}},{"id":"3","enabled":true,"type":"terms","schema":"group","params":{"field":"cloud.region","orderBy":"1","order":"desc","size":5,"otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"}}]}',
    },
    references: [
      {
        id: '99f81900-806f-11ea-945d-8d0868f4a377',
        name: 'kibanaSavedObjectMeta.searchSourceJSON.index',
        type: 'index-pattern',
      },
    ],
    type: 'visualization',
  },
  {
    attributes: {
      description: '',
      kibanaSavedObjectMeta: {
        searchSourceJSON:
          '{"query":{"language":"kuery","query":""},"filter":[],"indexRefName":"kibanaSavedObjectMeta.searchSourceJSON.index"}',
      },
      title: 'VPCFlowLogs - Accept Packets(Line Chart)',
      uiStateJSON: '{"vis":{"legendOpen":false}}',
      version: 1,
      visState:
        '{"type":"line","aggs":[{"id":"1","enabled":true,"type":"sum_bucket","schema":"metric","params":{"customBucket":{"id":"1-bucket","enabled":true,"type":"filters","params":{"filters":[{"input":{"language":"kuery","query":"\\"action\\": \\"ACCEPT\\""},"label":""}]}},"customMetric":{"id":"1-metric","enabled":true,"type":"sum","params":{"field":"network.packets"}}}},{"id":"2","enabled":true,"type":"date_histogram","schema":"segment","params":{"field":"timestamp","timeRange":{"from":"now-72h","to":"now"},"useNormalizedEsInterval":true,"scaleMetricValues":false,"interval":"auto","drop_partials":false,"min_doc_count":1,"extended_bounds":{}}}],"params":{"addLegend":true,"addTimeMarker":false,"addTooltip":true,"categoryAxes":[{"id":"CategoryAxis-1","labels":{"filter":true,"show":true,"truncate":100},"position":"bottom","scale":{"type":"linear"},"show":true,"style":{},"title":{},"type":"category"}],"grid":{"categoryLines":false},"labels":{},"legendPosition":"right","seriesParams":[{"data":{"id":"1","label":"Overall Sum of Sum of network.packets"},"drawLinesBetweenPoints":true,"interpolate":"linear","lineWidth":2,"mode":"normal","show":true,"showCircles":true,"type":"line","valueAxis":"ValueAxis-3"}],"thresholdLine":{"color":"#E7664C","show":false,"style":"full","value":10,"width":1},"times":[],"type":"line","valueAxes":[{"id":"ValueAxis-3","labels":{"filter":false,"rotate":0,"show":true,"truncate":100},"name":"LeftAxis-1","position":"left","scale":{"mode":"normal","type":"linear"},"show":true,"style":{},"title":{"text":""},"type":"value"}]},"title":"VPCFlowLogs - Accept Packets(Line Chart)"}',
    },
    references: [
      {
        id: '99f81900-806f-11ea-945d-8d0868f4a377',
        name: 'kibanaSavedObjectMeta.searchSourceJSON.index',
        type: 'index-pattern',
      },
    ],
    type: 'visualization',
  },
  {
    attributes: {
      description: '',
      kibanaSavedObjectMeta: {
        searchSourceJSON:
          '{"query":{"language":"kuery","query":""},"filter":[],"indexRefName":"kibanaSavedObjectMeta.searchSourceJSON.index"}',
      },
      title: 'VPCFlowLogs - Reject Packets(Line Chart)',
      uiStateJSON: '{"vis":{"legendOpen":false}}',
      version: 1,
      visState:
        '{"type":"line","aggs":[{"id":"1","enabled":true,"type":"sum_bucket","schema":"metric","params":{"customBucket":{"id":"1-bucket","enabled":true,"type":"filters","params":{"filters":[{"input":{"language":"kuery","query":"\\"action\\": \\"REJECT\\""},"label":""}]}},"customMetric":{"id":"1-metric","enabled":true,"type":"sum","params":{"field":"network.packets"}}}},{"id":"2","enabled":true,"type":"date_histogram","schema":"segment","params":{"field":"timestamp","timeRange":{"from":"now-72h","to":"now"},"useNormalizedEsInterval":true,"scaleMetricValues":false,"interval":"auto","drop_partials":true,"min_doc_count":1,"extended_bounds":{},"customLabel":""}}],"params":{"addLegend":true,"addTimeMarker":false,"addTooltip":true,"categoryAxes":[{"id":"CategoryAxis-1","labels":{"filter":true,"show":true,"truncate":100},"position":"bottom","scale":{"type":"linear"},"show":true,"style":{},"title":{},"type":"category"}],"grid":{"categoryLines":false,"valueAxis":""},"labels":{},"legendPosition":"bottom","seriesParams":[{"data":{"id":"1","label":"Overall Sum of Sum of network.packets"},"drawLinesBetweenPoints":true,"interpolate":"linear","lineWidth":2,"mode":"normal","show":true,"showCircles":true,"type":"line","valueAxis":"ValueAxis-2"}],"thresholdLine":{"color":"#E7664C","show":false,"style":"full","value":10,"width":1},"times":[],"type":"line","valueAxes":[{"id":"ValueAxis-2","labels":{"filter":false,"rotate":0,"show":true,"truncate":100},"name":"LeftAxis-1","position":"left","scale":{"mode":"normal","type":"linear"},"show":true,"style":{},"title":{"text":""},"type":"value"}]},"title":"VPCFlowLogs - Reject Packets(Line Chart)"}',
    },
    references: [
      {
        id: '99f81900-806f-11ea-945d-8d0868f4a377',
        name: 'kibanaSavedObjectMeta.searchSourceJSON.index',
        type: 'index-pattern',
      },
    ],
    type: 'visualization',
  },
  {
    attributes: {
      description: '',
      kibanaSavedObjectMeta: {
        searchSourceJSON:
          '{"query":{"query":"action:ACCEPT","language":"kuery"},"filter":[{"$state":{"store":"appState"},"meta":{"alias":null,"disabled":false,"key":"action","negate":false,"params":{"query":"ACCEPT"},"type":"phrase","indexRefName":"kibanaSavedObjectMeta.searchSourceJSON.filter[0].meta.index"},"query":{"match_phrase":{"action":"ACCEPT"}}}],"indexRefName":"kibanaSavedObjectMeta.searchSourceJSON.index"}',
      },
      title: 'VPCFlowLogs - Accept Src Packets(Pie)',
      uiStateJSON: '{"vis":{"legendOpen":false}}',
      version: 1,
      visState:
        '{"type":"pie","aggs":[{"id":"1","enabled":true,"type":"sum","schema":"metric","params":{"field":"source.packets","json":""}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"source.ip","orderBy":"1","order":"desc","size":10,"otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","json":""}}],"params":{"type":"pie","addTooltip":true,"addLegend":true,"legendPosition":"right","isDonut":true,"labels":{"show":false,"values":true,"last_level":true,"truncate":100},"row":true},"title":"VPCFlowLogs - Accept Src Packets(Pie)"}',
    },
    references: [
      {
        id: '99f81900-806f-11ea-945d-8d0868f4a377',
        name: 'kibanaSavedObjectMeta.searchSourceJSON.index',
        type: 'index-pattern',
      },
      {
        id: '99f81900-806f-11ea-945d-8d0868f4a377',
        name: 'kibanaSavedObjectMeta.searchSourceJSON.filter[0].meta.index',
        type: 'index-pattern',
      },
    ],
    type: 'visualization',
  },
  {
    attributes: {
      description: '',
      kibanaSavedObjectMeta: {
        searchSourceJSON:
          '{"query":{"query":"","language":"kuery"},"filter":[{"$state":{"store":"appState"},"meta":{"alias":null,"disabled":false,"key":"action","negate":false,"params":{"query":"ACCEPT"},"type":"phrase","indexRefName":"kibanaSavedObjectMeta.searchSourceJSON.filter[0].meta.index"},"query":{"match_phrase":{"action":"ACCEPT"}}}],"indexRefName":"kibanaSavedObjectMeta.searchSourceJSON.index"}',
      },
      title: 'VPCFlowLogs - Accept Src Packets(Table)',
      uiStateJSON: '{"vis":{"params":{"sort":{"columnIndex":null,"direction":null}}}}',
      version: 1,
      visState:
        '{"type":"table","aggs":[{"id":"1","enabled":true,"type":"sum","schema":"metric","params":{"field":"source.packets","customLabel":"Packets"}},{"id":"2","enabled":true,"type":"terms","schema":"bucket","params":{"field":"source.ip","orderBy":"1","order":"desc","size":10,"otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","customLabel":"Src IP"}}],"params":{"perPage":10,"showPartialRows":false,"showMetricsAtAllLevels":false,"sort":{"columnIndex":null,"direction":null},"showTotal":false,"totalFunc":"sum","percentageCol":""},"title":"VPCFlowLogs - Accept Src Packets(Table)"}',
    },
    references: [
      {
        id: '99f81900-806f-11ea-945d-8d0868f4a377',
        name: 'kibanaSavedObjectMeta.searchSourceJSON.index',
        type: 'index-pattern',
      },
      {
        id: '99f81900-806f-11ea-945d-8d0868f4a377',
        name: 'kibanaSavedObjectMeta.searchSourceJSON.filter[0].meta.index',
        type: 'index-pattern',
      },
    ],
    type: 'visualization',
  },
  {
    attributes: {
      description: '',
      kibanaSavedObjectMeta: {
        searchSourceJSON:
          '{"query":{"query":"action:REJECT","language":"kuery"},"filter":[{"$state":{"store":"appState"},"meta":{"alias":null,"disabled":false,"key":"action","negate":false,"params":{"query":"REJECT"},"type":"phrase","indexRefName":"kibanaSavedObjectMeta.searchSourceJSON.filter[0].meta.index"},"query":{"match_phrase":{"action":"REJECT"}}}],"indexRefName":"kibanaSavedObjectMeta.searchSourceJSON.index"}',
      },
      title: 'VPCFlowLogs - Reject Src Packets(Pie)',
      uiStateJSON: '{"vis":{"legendOpen":false}}',
      version: 1,
      visState:
        '{"type":"pie","aggs":[{"id":"1","enabled":true,"type":"sum","schema":"metric","params":{"field":"source.packets","json":""}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"source.ip","orderBy":"1","order":"desc","size":10,"otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","json":""}}],"params":{"type":"pie","addTooltip":true,"addLegend":true,"legendPosition":"right","isDonut":true,"labels":{"show":false,"values":true,"last_level":true,"truncate":100},"row":true},"title":"VPCFlowLogs - Reject Src Packets(Pie)"}',
    },
    references: [
      {
        id: '99f81900-806f-11ea-945d-8d0868f4a377',
        name: 'kibanaSavedObjectMeta.searchSourceJSON.index',
        type: 'index-pattern',
      },
      {
        id: '99f81900-806f-11ea-945d-8d0868f4a377',
        name: 'kibanaSavedObjectMeta.searchSourceJSON.filter[0].meta.index',
        type: 'index-pattern',
      },
    ],
    type: 'visualization',
  },
  {
    attributes: {
      description: '',
      kibanaSavedObjectMeta: {
        searchSourceJSON:
          '{"query":{"language":"kuery","query":""},"filter":[{"$state":{"store":"appState"},"meta":{"alias":null,"disabled":false,"key":"action","negate":false,"params":{"query":"REJECT"},"type":"phrase","indexRefName":"kibanaSavedObjectMeta.searchSourceJSON.filter[0].meta.index"},"query":{"match_phrase":{"action":"REJECT"}}}],"indexRefName":"kibanaSavedObjectMeta.searchSourceJSON.index"}',
      },
      title: 'VPCFlowLogs - Reject Src Packets(Table)',
      uiStateJSON: '{"vis":{"params":{"sort":{"columnIndex":null,"direction":null}}}}',
      version: 1,
      visState:
        '{"type":"table","aggs":[{"id":"1","enabled":true,"type":"sum","schema":"metric","params":{"field":"source.packets","customLabel":"Packets"}},{"id":"2","enabled":true,"type":"terms","schema":"bucket","params":{"field":"source.ip","orderBy":"1","order":"desc","size":10,"otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","customLabel":"Src IP"}}],"params":{"perPage":10,"percentageCol":"","showMetricsAtAllLevels":false,"showPartialRows":false,"showTotal":false,"sort":{"columnIndex":null,"direction":null},"totalFunc":"sum"},"title":"VPCFlowLogs - Reject Src Packets(Table)"}',
    },
    references: [
      {
        id: '99f81900-806f-11ea-945d-8d0868f4a377',
        name: 'kibanaSavedObjectMeta.searchSourceJSON.index',
        type: 'index-pattern',
      },
      {
        id: '99f81900-806f-11ea-945d-8d0868f4a377',
        name: 'kibanaSavedObjectMeta.searchSourceJSON.filter[0].meta.index',
        type: 'index-pattern',
      },
    ],
    type: 'visualization',
  },
  {
    attributes: {
      description: '',
      kibanaSavedObjectMeta: {
        searchSourceJSON:
          '{"query":{"query":"","language":"kuery"},"filter":[{"$state":{"store":"appState"},"meta":{"alias":null,"disabled":false,"key":"action","negate":false,"params":{"query":"ACCEPT"},"type":"phrase","indexRefName":"kibanaSavedObjectMeta.searchSourceJSON.filter[0].meta.index"},"query":{"match_phrase":{"action":"ACCEPT"}}}],"indexRefName":"kibanaSavedObjectMeta.searchSourceJSON.index"}',
      },
      title: 'VPCFlowLogs - Accept Src Packets(Geo)',
      uiStateJSON: '{"mapZoom":2,"mapCenter":[25.777633878392646,41.93485907317978]}',
      version: 1,
      visState:
        '{"type":"region_map","aggs":[{"id":"1","enabled":true,"type":"sum","schema":"metric","params":{"field":"source.packets"}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"source.geo.country_iso_code","orderBy":"1","order":"desc","size":100,"otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"}}],"params":{"addTooltip":true,"colorSchema":"Yellow to Red","emsHotLink":"https://maps.elastic.co/v7.7?locale=en#file/world_countries","isDisplayWarning":true,"legendPosition":"bottomright","mapCenter":[0,0],"mapZoom":2,"outlineWeight":1,"selectedJoinField":{"description":"ISO 3166-1 alpha-2 Code","name":"iso2","type":"id"},"selectedLayer":{"attribution":"<a href=\\"http://www.naturalearthdata.com/about/terms-of-use\\">Made with NaturalEarth</a>","created_at":"2017-04-26T17:12:15.978370","fields":[{"description":"ISO 3166-1 alpha-2 Code","name":"iso2","type":"id"},{"description":"ISO 3166-1 alpha-3 Code","name":"iso3","type":"id"},{"description":"Name","name":"name","type":"name"}],"format":{"type":"geojson"},"id":"world_countries","isEMS":true,"layerId":"elastic_maps_service.World Countries","name":"World Countries","origin":"elastic_maps_service"},"showAllShapes":true,"wms":{"enabled":false,"options":{"format":"image/png","transparent":true},"selectedTmsLayer":{"attribution":"<a rel=\\"noreferrer noopener\\" href=\\"https://www.openstreetmap.org/copyright\\">Map data &#169; OpenStreetMap contributors</a>","id":"road_map","maxZoom":10,"minZoom":0,"origin":"elastic_maps_service"}}},"title":"VPCFlowLogs - Accept Src Packets(Geo)"}',
    },
    references: [
      {
        id: '99f81900-806f-11ea-945d-8d0868f4a377',
        name: 'kibanaSavedObjectMeta.searchSourceJSON.index',
        type: 'index-pattern',
      },
      {
        id: '99f81900-806f-11ea-945d-8d0868f4a377',
        name: 'kibanaSavedObjectMeta.searchSourceJSON.filter[0].meta.index',
        type: 'index-pattern',
      },
    ],
    type: 'visualization',
  },
  {
    attributes: {
      description: '',
      kibanaSavedObjectMeta: {
        searchSourceJSON:
          '{"query":{"language":"kuery","query":""},"filter":[{"$state":{"store":"appState"},"meta":{"alias":null,"disabled":false,"key":"action","negate":false,"params":{"query":"REJECT"},"type":"phrase","indexRefName":"kibanaSavedObjectMeta.searchSourceJSON.filter[0].meta.index"},"query":{"match_phrase":{"action":"REJECT"}}}],"indexRefName":"kibanaSavedObjectMeta.searchSourceJSON.index"}',
      },
      title: 'VPCFlowLogs - Reject Src Packets(Geo)',
      uiStateJSON: '{"mapCenter":[25.777633878392646,41.93485907317978],"mapZoom":2}',
      version: 1,
      visState:
        '{"type":"region_map","aggs":[{"id":"1","enabled":true,"type":"sum","schema":"metric","params":{"field":"source.packets"}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"source.geo.country_iso_code","orderBy":"1","order":"desc","size":100,"otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"}}],"params":{"addTooltip":true,"colorSchema":"Yellow to Red","emsHotLink":"https://maps.elastic.co/v7.7?locale=en#file/world_countries","isDisplayWarning":true,"legendPosition":"bottomright","mapCenter":[0,0],"mapZoom":2,"outlineWeight":1,"selectedJoinField":{"description":"ISO 3166-1 alpha-2 Code","name":"iso2","type":"id"},"selectedLayer":{"attribution":"<a href=\\"http://www.naturalearthdata.com/about/terms-of-use\\">Made with NaturalEarth</a>","created_at":"2017-04-26T17:12:15.978370","fields":[{"description":"ISO 3166-1 alpha-2 Code","name":"iso2","type":"id"},{"description":"ISO 3166-1 alpha-3 Code","name":"iso3","type":"id"},{"description":"Name","name":"name","type":"name"}],"format":{"type":"geojson"},"id":"world_countries","isEMS":true,"layerId":"elastic_maps_service.World Countries","name":"World Countries","origin":"elastic_maps_service"},"showAllShapes":true,"wms":{"enabled":false,"options":{"format":"image/png","transparent":true},"selectedTmsLayer":{"attribution":"<a rel=\\"noreferrer noopener\\" href=\\"https://www.openstreetmap.org/copyright\\">Map data &#169; OpenStreetMap contributors</a>","id":"road_map","maxZoom":10,"minZoom":0,"origin":"elastic_maps_service"}}},"title":"VPCFlowLogs - Reject Src Packets(Geo)"}',
    },
    references: [
      {
        id: '99f81900-806f-11ea-945d-8d0868f4a377',
        name: 'kibanaSavedObjectMeta.searchSourceJSON.index',
        type: 'index-pattern',
      },
      {
        id: '99f81900-806f-11ea-945d-8d0868f4a377',
        name: 'kibanaSavedObjectMeta.searchSourceJSON.filter[0].meta.index',
        type: 'index-pattern',
      },
    ],
    type: 'visualization',
  },
  {
    attributes: {
      description: '',
      kibanaSavedObjectMeta: {
        searchSourceJSON:
          '{"query":{"query":"","language":"kuery"},"indexRefName":"kibanaSavedObjectMeta.searchSourceJSON.index","filter":[]}',
      },
      title: 'VPCFlowLogs - Top 10 Chart Source IP',
      uiStateJSON: '{}',
      version: 1,
      visState:
        '{"title":"VPCFlowLogs - Top 10 Chart Source IP","type":"line","params":{"type":"line","grid":{"categoryLines":false},"categoryAxes":[{"id":"CategoryAxis-1","type":"category","position":"bottom","show":true,"style":{},"scale":{"type":"linear"},"labels":{"show":true,"filter":true,"truncate":100},"title":{}}],"valueAxes":[{"id":"ValueAxis-1","name":"LeftAxis-1","type":"value","position":"left","show":true,"style":{},"scale":{"type":"linear","mode":"normal"},"labels":{"show":true,"rotate":0,"filter":false,"truncate":100},"title":{"text":"Count"}}],"seriesParams":[{"show":"true","type":"line","mode":"normal","data":{"label":"Count","id":"1"},"valueAxis":"ValueAxis-1","drawLinesBetweenPoints":true,"showCircles":true}],"addTooltip":true,"addLegend":true,"legendPosition":"right","times":[],"addTimeMarker":false,"labels":{},"thresholdLine":{"show":false,"value":10,"width":1,"style":"full","color":"#34130C"},"dimensions":{"x":{"accessor":0,"format":{"id":"string"},"params":{},"aggType":"date_range"},"y":[{"accessor":2,"format":{"id":"number"},"params":{},"aggType":"count"}],"series":[{"accessor":1,"format":{"id":"terms","params":{"id":"ip","otherBucketLabel":"Other","missingBucketLabel":"Missing"}},"params":{},"aggType":"terms"}]}},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"date_histogram","schema":"segment","params":{"field":"timestamp","useNormalizedEsInterval":true,"interval":"auto","drop_partials":false,"min_doc_count":1,"extended_bounds":{}}},{"id":"3","enabled":true,"type":"terms","schema":"group","params":{"field":"source.ip","orderBy":"1","order":"desc","size":5,"otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"}}]}',
    },
    references: [
      {
        id: '99f81900-806f-11ea-945d-8d0868f4a377',
        name: 'kibanaSavedObjectMeta.searchSourceJSON.index',
        type: 'index-pattern',
      },
    ],
    type: 'visualization',
  },
];

export const vpcFlowLogsIndexPatternConfig: IndexPatternSavedObjectCreationConfig = {
  attributes: {
    fields:
      '[{"name":"@id","type":"string","esTypes":["keyword"],"count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"@log_group","type":"string","esTypes":["keyword"],"count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"@log_s3bucket","type":"string","esTypes":["keyword"],"count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"@log_s3key","type":"string","esTypes":["keyword"],"count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"@log_stream","type":"string","esTypes":["keyword"],"count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"@log_type","type":"string","esTypes":["keyword"],"count":10,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"@message","type":"string","esTypes":["text"],"count":0,"scripted":false,"searchable":true,"aggregatable":false,"readFromDocValues":false},{"name":"timestamp","type":"date","esTypes":["date"],"count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"@timestamp_received","type":"date","esTypes":["date"],"count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"SchemaVersion","type":"string","esTypes":["keyword"],"count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"_id","type":"string","esTypes":["_id"],"count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":false},{"name":"_index","type":"string","esTypes":["_index"],"count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":false},{"name":"_score","type":"number","count":0,"scripted":false,"searchable":false,"aggregatable":false,"readFromDocValues":false},{"name":"_source","type":"_source","esTypes":["_source"],"count":0,"scripted":false,"searchable":false,"aggregatable":false,"readFromDocValues":false},{"name":"_type","type":"string","esTypes":["_type"],"count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":false},{"name":"account_id","type":"string","esTypes":["keyword"],"count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"action","type":"string","esTypes":["keyword"],"count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"apiVersion","type":"string","esTypes":["keyword"],"count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"bytes","type":"number","esTypes":["integer"],"count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"cloud.account.id","type":"string","esTypes":["keyword"],"count":10,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"cloud.provider","type":"string","esTypes":["keyword"],"count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"cloud.region","type":"string","esTypes":["keyword"],"count":10,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"destination.address","type":"string","esTypes":["keyword"],"count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"destination.as.number","type":"number","esTypes":["integer"],"count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"destination.as.organization.name","type":"string","esTypes":["keyword"],"count":10,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"destination.bytes","type":"number","esTypes":["long"],"count":10,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"destination.geo.city_name","type":"string","esTypes":["keyword"],"count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"destination.geo.country_iso_code","type":"string","esTypes":["keyword"],"count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"destination.geo.country_name","type":"string","esTypes":["keyword"],"count":10,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"destination.geo.location","type":"geo_point","esTypes":["geo_point"],"count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"destination.ip","type":"ip","esTypes":["ip"],"count":10,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"destination.packets","type":"number","esTypes":["long"],"count":10,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"destination.port","type":"number","esTypes":["integer"],"count":10,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"dstaddr","type":"ip","esTypes":["ip"],"count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"dstport","type":"number","esTypes":["integer"],"count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"ecs.version","type":"string","esTypes":["keyword"],"count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"end","type":"date","esTypes":["date"],"count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"event.action","type":"string","esTypes":["keyword"],"count":10,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"event.category","type":"string","esTypes":["keyword"],"count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"event.ingested","type":"date","esTypes":["date"],"count":10,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"event.kind","type":"string","esTypes":["keyword"],"count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"event.module","type":"string","esTypes":["keyword"],"count":10,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"event.outcome","type":"string","esTypes":["keyword"],"count":10,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"http.request.bytes","type":"number","esTypes":["long"],"count":10,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"http.response.bytes","type":"number","esTypes":["long"],"count":10,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"http.response.status_code","type":"number","esTypes":["short"],"count":10,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"http.version","type":"string","esTypes":["keyword"],"count":10,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"instance_id","type":"string","esTypes":["keyword"],"count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"interface_id","type":"string","esTypes":["keyword"],"count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"log_status","type":"string","esTypes":["keyword"],"count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"network.bytes","type":"number","esTypes":["integer"],"count":10,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"network.iana_number","type":"number","esTypes":["short"],"count":10,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"network.packets","type":"number","esTypes":["integer"],"count":10,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"packets","type":"number","esTypes":["integer"],"count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"process.pid","type":"number","esTypes":["integer"],"count":10,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"protocol","type":"number","esTypes":["short"],"count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"source.address","type":"string","esTypes":["keyword"],"count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"source.as.number","type":"number","esTypes":["integer"],"count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"source.as.organization.name","type":"string","esTypes":["keyword"],"count":10,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"source.bytes","type":"number","esTypes":["long"],"count":10,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"source.geo.city_name","type":"string","esTypes":["keyword"],"count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"source.geo.country_iso_code","type":"string","esTypes":["keyword"],"count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"source.geo.country_name","type":"string","esTypes":["keyword"],"count":10,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"source.geo.location","type":"geo_point","esTypes":["geo_point"],"count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"source.ip","type":"ip","esTypes":["ip"],"count":10,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"source.packets","type":"number","esTypes":["long"],"count":10,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"source.port","type":"number","esTypes":["integer"],"count":10,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"srcaddr","type":"ip","esTypes":["ip"],"count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"srcport","type":"number","esTypes":["integer"],"count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"start","type":"date","esTypes":["date"],"count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"subnet_id","type":"string","esTypes":["keyword"],"count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"tcp_flags","type":"number","esTypes":["byte"],"count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"url.full","type":"string","esTypes":["keyword"],"count":10,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"url.full.text","type":"string","esTypes":["text"],"count":10,"scripted":false,"searchable":true,"aggregatable":false,"readFromDocValues":false,"subType":{"multi":{"parent":"url.full"}}},{"name":"url.original","type":"string","esTypes":["keyword"],"count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"url.original.text","type":"string","esTypes":["text"],"count":0,"scripted":false,"searchable":true,"aggregatable":false,"readFromDocValues":false,"subType":{"multi":{"parent":"url.original"}}},{"name":"user_agent.original","type":"string","esTypes":["keyword"],"count":10,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"user_agent.original.text","type":"string","esTypes":["text"],"count":10,"scripted":false,"searchable":true,"aggregatable":false,"readFromDocValues":false,"subType":{"multi":{"parent":"user_agent.original"}}},{"name":"version","type":"string","esTypes":["keyword"],"count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"vpc_id","type":"string","esTypes":["keyword"],"count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true}]',
    timeFieldName: 'timestamp',
    title: 'log-aws-vpcflowlogs-*',
  },
  id: undefined,
  migrationVersion: undefined,
  references: [],
  type: 'index-pattern',
};
