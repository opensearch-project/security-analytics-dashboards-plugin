/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  DashboardSavedObjectCreationConfig,
  IndexPatternSavedObjectCreationConfig,
  VisualizationSavedObjectCreationConfig,
} from '../../../../types';

export const s3DashboardConfig: DashboardSavedObjectCreationConfig = {
  attributes: {
    description: '',
    hits: 0,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"query":{"language":"kuery","query":""},"filter":[]}',
    },
    optionsJSON: '{"hidePanelTitles":false,"useMargins":true}',
    panelsJSON:
      '[{"version":"7.10.2","gridData":{"x":0,"y":0,"w":24,"h":9,"i":"ae6d8495-1571-4382-bce4-6202ee506560"},"panelIndex":"ae6d8495-1571-4382-bce4-6202ee506560","embeddableConfig":{},"panelRefName":"panel_0"},{"version":"7.10.2","gridData":{"x":24,"y":0,"w":24,"h":9,"i":"caa7531f-205d-4600-84cb-df20aa673895"},"panelIndex":"caa7531f-205d-4600-84cb-df20aa673895","embeddableConfig":{},"panelRefName":"panel_1"},{"version":"7.10.2","gridData":{"x":0,"y":9,"w":38,"h":15,"i":"d0e725c3-a050-4c44-b2ad-d65f3255d8b3"},"panelIndex":"d0e725c3-a050-4c44-b2ad-d65f3255d8b3","embeddableConfig":{"mapZoom":2,"mapCenter":null},"panelRefName":"panel_2"},{"version":"7.10.2","gridData":{"x":38,"y":9,"w":10,"h":6,"i":"d946ce42-057a-445c-8073-447c4b04b467"},"panelIndex":"d946ce42-057a-445c-8073-447c4b04b467","embeddableConfig":{},"panelRefName":"panel_3"},{"version":"7.10.2","gridData":{"x":38,"y":15,"w":10,"h":9,"i":"396871d4-cfa9-4309-be36-7db714c899d8"},"panelIndex":"396871d4-cfa9-4309-be36-7db714c899d8","embeddableConfig":{},"panelRefName":"panel_4"},{"version":"7.10.2","gridData":{"x":0,"y":24,"w":38,"h":18,"i":"d10b2fd3-0036-46e7-a9d9-3dc29f6ebda7"},"panelIndex":"d10b2fd3-0036-46e7-a9d9-3dc29f6ebda7","embeddableConfig":{},"panelRefName":"panel_5"},{"version":"7.10.2","gridData":{"x":38,"y":24,"w":10,"h":9,"i":"7e093c31-a0a6-4244-94ab-2f5b33876929"},"panelIndex":"7e093c31-a0a6-4244-94ab-2f5b33876929","embeddableConfig":{},"panelRefName":"panel_6"},{"version":"7.10.2","gridData":{"x":38,"y":33,"w":10,"h":9,"i":"324faff3-8267-4ba5-8c61-eea5856e5ae8"},"panelIndex":"324faff3-8267-4ba5-8c61-eea5856e5ae8","embeddableConfig":{},"panelRefName":"panel_7"},{"version":"7.10.2","gridData":{"x":0,"y":42,"w":16,"h":10,"i":"07e5f43d-b03f-408a-a016-514cea2fece3"},"panelIndex":"07e5f43d-b03f-408a-a016-514cea2fece3","embeddableConfig":{},"panelRefName":"panel_8"},{"version":"7.10.2","gridData":{"x":16,"y":42,"w":32,"h":10,"i":"0e6ec458-758c-418c-8be4-c117280593f7"},"panelIndex":"0e6ec458-758c-418c-8be4-c117280593f7","embeddableConfig":{},"panelRefName":"panel_9"},{"version":"7.10.2","gridData":{"x":0,"y":52,"w":16,"h":10,"i":"819cb43c-dc15-4949-b6d5-ec9e171afc2a"},"panelIndex":"819cb43c-dc15-4949-b6d5-ec9e171afc2a","embeddableConfig":{},"panelRefName":"panel_10"},{"version":"7.10.2","gridData":{"x":16,"y":52,"w":32,"h":10,"i":"952abf40-cbfc-4120-8fbf-e37ac5f7c546"},"panelIndex":"952abf40-cbfc-4120-8fbf-e37ac5f7c546","embeddableConfig":{},"panelRefName":"panel_11"},{"version":"7.10.2","gridData":{"x":0,"y":62,"w":24,"h":12,"i":"a577dda6-7089-49b7-8d38-f0183704859b"},"panelIndex":"a577dda6-7089-49b7-8d38-f0183704859b","embeddableConfig":{},"panelRefName":"panel_12"},{"version":"7.10.2","gridData":{"x":24,"y":62,"w":24,"h":12,"i":"01da42a0-f09f-47ce-9189-a3230c1300e2"},"panelIndex":"01da42a0-f09f-47ce-9189-a3230c1300e2","embeddableConfig":{},"panelRefName":"panel_13"},{"version":"7.10.2","gridData":{"x":0,"y":74,"w":24,"h":12,"i":"43aadcad-3992-4f35-878d-f6d5633d4603"},"panelIndex":"43aadcad-3992-4f35-878d-f6d5633d4603","embeddableConfig":{},"panelRefName":"panel_14"},{"version":"7.10.2","gridData":{"x":24,"y":74,"w":24,"h":12,"i":"36fcd27b-a306-4b71-96fa-6f91fcd70f59"},"panelIndex":"36fcd27b-a306-4b71-96fa-6f91fcd70f59","embeddableConfig":{},"panelRefName":"panel_15"}]',
    timeRestore: false,
    title: 'S3Accesslog Summary',
    version: 1,
  },
  references: [
    {
      id: '9c9fcf20-28ea-11ec-88c4-f70571f67193',
      name: 'panel_0',
      type: 'visualization',
    },
    {
      id: 'ebb898f0-28e8-11ec-88c4-f70571f67193',
      name: 'panel_1',
      type: 'visualization',
    },
    {
      id: '7546d1e0-774f-11ec-aa44-650c320a3c76',
      name: 'panel_2',
      type: 'visualization',
    },
    {
      id: '5b8d2660-28ed-11ec-88c4-f70571f67193',
      name: 'panel_3',
      type: 'visualization',
    },
    {
      id: 'eec8f4f0-28e2-11ec-88c4-f70571f67193',
      name: 'panel_4',
      type: 'visualization',
    },
    {
      id: '1db0d400-28f1-11ec-88c4-f70571f67193',
      name: 'panel_5',
      type: 'visualization',
    },
    {
      id: '9aa8c170-28e7-11ec-88c4-f70571f67193',
      name: 'panel_6',
      type: 'visualization',
    },
    {
      id: '66f989c0-28ee-11ec-88c4-f70571f67193',
      name: 'panel_7',
      type: 'visualization',
    },
    {
      id: '151368c0-28e8-11ec-88c4-f70571f67193',
      name: 'panel_8',
      type: 'visualization',
    },
    {
      id: '81bacac0-28ef-11ec-88c4-f70571f67193',
      name: 'panel_9',
      type: 'visualization',
    },
    {
      id: '9b59a570-28e8-11ec-88c4-f70571f67193',
      name: 'panel_10',
      type: 'visualization',
    },
    {
      id: '9e7f5a00-28e9-11ec-88c4-f70571f67193',
      name: 'panel_11',
      type: 'visualization',
    },
    {
      id: '609226d0-244f-11ec-88c4-f70571f67193',
      name: 'panel_12',
      type: 'visualization',
    },
    {
      id: '377ff760-28f3-11ec-88c4-f70571f67193',
      name: 'panel_13',
      type: 'visualization',
    },
    {
      id: '9802cf20-244f-11ec-88c4-f70571f67193',
      name: 'panel_14',
      type: 'visualization',
    },
    {
      id: 'f5512f80-1e9d-11ec-88c4-f70571f67193',
      name: 'panel_15',
      type: 'visualization',
    },
  ],
  type: 'dashboard',
};

export const s3VisualizationConfigs: VisualizationSavedObjectCreationConfig[] = [
  {
    attributes: {
      description: '',
      kibanaSavedObjectMeta: {
        searchSourceJSON:
          '{"query":{"query":"","language":"lucene"},"filter":[],"indexRefName":"kibanaSavedObjectMeta.searchSourceJSON.index"}',
      },
      title: 'S3Accesslog - AWS Account(Bar)',
      uiStateJSON: '{}',
      version: 1,
      visState:
        '{"title":"S3Accesslog - AWS Account(Bar)","type":"histogram","aggs":[{"id":"1","enabled":true,"type":"count","params":{},"schema":"metric"},{"id":"3","enabled":true,"type":"terms","params":{"field":"cloud.account.id","orderBy":"1","order":"desc","size":10,"otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"},"schema":"segment"},{"id":"4","enabled":true,"type":"terms","params":{"field":"cloud.account.id","orderBy":"1","order":"desc","size":5,"otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"},"schema":"group"}],"params":{"type":"histogram","grid":{"categoryLines":false},"categoryAxes":[{"id":"CategoryAxis-1","type":"category","position":"bottom","show":false,"style":{},"scale":{"type":"linear"},"labels":{"show":true,"filter":true,"truncate":100},"title":{}}],"valueAxes":[{"id":"ValueAxis-1","name":"LeftAxis-1","type":"value","position":"left","show":true,"style":{},"scale":{"type":"linear","mode":"normal"},"labels":{"show":true,"rotate":0,"filter":false,"truncate":100},"title":{"text":"Count"}}],"seriesParams":[{"show":true,"type":"histogram","mode":"stacked","data":{"label":"Count","id":"1"},"valueAxis":"ValueAxis-1","drawLinesBetweenPoints":true,"lineWidth":2,"showCircles":true}],"addTooltip":true,"addLegend":true,"legendPosition":"right","times":[],"addTimeMarker":false,"labels":{"show":false},"thresholdLine":{"show":false,"value":10,"width":1,"style":"full","color":"#E7664C"}}}',
    },
    references: [
      {
        id: '4f75abd0-b7ca-11ea-9044-07f9c61c294e',
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
          '{"query":{"query":"","language":"lucene"},"filter":[],"indexRefName":"kibanaSavedObjectMeta.searchSourceJSON.index"}',
      },
      title: 'S3Accesslog - Region(Bar)',
      uiStateJSON: '{}',
      version: 1,
      visState:
        '{"title":"S3Accesslog - Region(Bar)","type":"histogram","aggs":[{"id":"1","enabled":true,"type":"count","params":{},"schema":"metric"},{"id":"2","enabled":true,"type":"terms","params":{"field":"cloud.region","orderBy":"1","order":"desc","size":5,"otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","customLabel":""},"schema":"segment"},{"id":"3","enabled":true,"type":"terms","params":{"field":"cloud.region","orderBy":"1","order":"desc","size":5,"otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"},"schema":"group"}],"params":{"type":"histogram","grid":{"categoryLines":false},"categoryAxes":[{"id":"CategoryAxis-1","type":"category","position":"bottom","show":false,"style":{},"scale":{"type":"linear"},"labels":{"show":true,"filter":true,"truncate":100},"title":{}}],"valueAxes":[{"id":"ValueAxis-1","name":"LeftAxis-1","type":"value","position":"left","show":true,"style":{},"scale":{"type":"linear","mode":"normal"},"labels":{"show":true,"rotate":0,"filter":false,"truncate":100},"title":{"text":"Count"}}],"seriesParams":[{"show":true,"type":"histogram","mode":"stacked","data":{"label":"Count","id":"1"},"valueAxis":"ValueAxis-1","drawLinesBetweenPoints":true,"lineWidth":2,"showCircles":true}],"addTooltip":true,"addLegend":true,"legendPosition":"right","times":[],"addTimeMarker":false,"labels":{"show":false},"thresholdLine":{"show":false,"value":10,"width":1,"style":"full","color":"#E7664C"}}}',
    },
    references: [
      {
        id: '4f75abd0-b7ca-11ea-9044-07f9c61c294e',
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
          '{"query":{"query":"","language":"lucene"},"filter":[],"indexRefName":"kibanaSavedObjectMeta.searchSourceJSON.index"}',
      },
      title: 'S3Accesslog - Source Countries(Geo)',
      uiStateJSON: '{"mapZoom":2,"mapCenter":[7.536764322084078,4.921875000000001]}',
      version: 1,
      visState:
        '{"title":"S3Accesslog - Source Countries(Geo)","type":"region_map","aggs":[{"id":"1","enabled":true,"type":"count","params":{},"schema":"metric"},{"id":"2","enabled":true,"type":"terms","params":{"field":"source.geo.country_iso_code","orderBy":"1","order":"desc","size":5,"otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"},"schema":"segment"}],"params":{"addTooltip":true,"colorSchema":"Yellow to Red","emsHotLink":"?locale=en#file/world_countries","isDisplayWarning":true,"legendPosition":"bottomright","mapCenter":[0,0],"mapZoom":2,"outlineWeight":1,"selectedJoinField":{"description":"ISO 3166-1 alpha-2 Code","name":"iso2","type":"id"},"selectedLayer":{"attribution":"<a rel=\\"noreferrer noopener\\" href=\\"http://www.naturalearthdata.com/about/terms-of-use\\">Made with NaturalEarth</a>","created_at":"2017-04-26T17:12:15.978370","fields":[{"description":"ISO 3166-1 alpha-2 Code","name":"iso2","type":"id"},{"description":"ISO 3166-1 alpha-3 Code","name":"iso3","type":"id"},{"description":"Name","name":"name","type":"name"}],"format":{"type":"geojson"},"id":"world_countries","isEMS":true,"layerId":"elastic_maps_service.World Countries","name":"World Countries","origin":"elastic_maps_service"},"showAllShapes":true,"wms":{"enabled":false,"options":{"attribution":"","format":"image/png","layers":"","styles":"","transparent":true,"version":""},"selectedTmsLayer":{"attribution":"<a rel=\\"noreferrer noopener\\" href=\\"https://www.openstreetmap.org/copyright\\">Map data © OpenStreetMap contributors</a>","id":"road_map","maxZoom":10,"minZoom":0,"origin":"elastic_maps_service"},"url":""}}}',
    },
    references: [
      {
        id: '4f75abd0-b7ca-11ea-9044-07f9c61c294e',
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
          '{"query":{"query":"","language":"lucene"},"filter":[],"indexRefName":"kibanaSavedObjectMeta.searchSourceJSON.index"}',
      },
      title: 'S3Accesslog - Throttling Counts',
      uiStateJSON: '{}',
      version: 1,
      visState:
        '{"title":"S3Accesslog - Throttling Counts","type":"metric","aggs":[{"id":"1","enabled":true,"type":"count","params":{},"schema":"metric"},{"id":"2","enabled":true,"type":"filters","params":{"filters":[{"input":{"query":"HTTPstatus:503","language":"lucene"},"label":"Throttling"}]},"schema":"group"}],"params":{"addTooltip":true,"addLegend":false,"type":"metric","metric":{"percentageMode":false,"useRanges":false,"colorSchema":"Green to Red","metricColorMode":"None","colorsRange":[{"from":0,"to":10000}],"labels":{"show":true},"invertColors":false,"style":{"bgFill":"#000","bgColor":false,"labelColor":false,"subText":"","fontSize":60}}}}',
    },
    references: [
      {
        id: '4f75abd0-b7ca-11ea-9044-07f9c61c294e',
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
          '{"query":{"query":"","language":"kuery"},"filter":[],"indexRefName":"kibanaSavedObjectMeta.searchSourceJSON.index"}',
      },
      title: 'S3Accesslog - Source IP',
      uiStateJSON: '{"vis":{"params":{"sort":{"columnIndex":null,"direction":null}}}}',
      version: 1,
      visState:
        '{"title":"S3Accesslog - Source IP","type":"table","aggs":[{"id":"1","enabled":true,"type":"count","params":{},"schema":"metric"},{"id":"2","enabled":true,"type":"terms","params":{"field":"source.ip","orderBy":"1","order":"desc","size":5,"otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"},"schema":"bucket"}],"params":{"perPage":10,"showPartialRows":false,"showMetricsAtAllLevels":false,"sort":{"columnIndex":null,"direction":null},"showTotal":false,"totalFunc":"sum","percentageCol":""}}',
    },
    references: [
      {
        id: '4f75abd0-b7ca-11ea-9044-07f9c61c294e',
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
          '{"query":{"query":"","language":"lucene"},"filter":[],"indexRefName":"kibanaSavedObjectMeta.searchSourceJSON.index"}',
      },
      title: 'S3Accesslog - Error Code for each Buckets',
      uiStateJSON: '{}',
      version: 1,
      visState:
        '{"title":"S3Accesslog - Error Code for each Buckets","type":"histogram","aggs":[{"id":"1","enabled":true,"type":"count","params":{},"schema":"metric"},{"id":"2","enabled":true,"type":"terms","params":{"field":"Bucket","orderBy":"1","order":"desc","size":10,"otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","customLabel":" "},"schema":"segment"},{"id":"3","enabled":true,"type":"terms","params":{"field":"ErrorCode","orderBy":"1","order":"desc","size":5,"otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","json":""},"schema":"group"},{"id":"4","enabled":true,"type":"terms","params":{"field":"HTTPstatus","orderBy":"1","order":"desc","size":5,"otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"},"schema":"group"}],"params":{"type":"histogram","grid":{"categoryLines":false},"categoryAxes":[{"id":"CategoryAxis-1","type":"category","position":"bottom","show":true,"style":{},"scale":{"type":"linear"},"labels":{"show":true,"filter":true,"truncate":100},"title":{}}],"valueAxes":[{"id":"ValueAxis-1","name":"LeftAxis-1","type":"value","position":"left","show":true,"style":{},"scale":{"type":"linear","mode":"normal"},"labels":{"show":true,"rotate":0,"filter":false,"truncate":100},"title":{"text":"Count"}}],"seriesParams":[{"show":true,"type":"histogram","mode":"stacked","data":{"label":"Count","id":"1"},"valueAxis":"ValueAxis-1","drawLinesBetweenPoints":true,"lineWidth":2,"showCircles":true}],"addTooltip":true,"addLegend":true,"legendPosition":"right","times":[],"addTimeMarker":false,"labels":{"show":false},"thresholdLine":{"show":false,"value":10,"width":1,"style":"full","color":"#E7664C"}}}',
    },
    references: [
      {
        id: '4f75abd0-b7ca-11ea-9044-07f9c61c294e',
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
          '{"query":{"query":"","language":"lucene"},"filter":[],"indexRefName":"kibanaSavedObjectMeta.searchSourceJSON.index"}',
      },
      title: 'S3Accesslog - Client Error Counts',
      uiStateJSON: '{}',
      version: 1,
      visState:
        '{"title":"S3Accesslog - Client Error Counts","type":"metric","aggs":[{"id":"1","enabled":true,"type":"count","params":{},"schema":"metric"},{"id":"2","enabled":true,"type":"filters","params":{"filters":[{"input":{"query":"HTTPstatus:{400 TO 499}","language":"lucene"},"label":"Client Error"}]},"schema":"group"}],"params":{"addTooltip":true,"addLegend":false,"type":"metric","metric":{"percentageMode":false,"useRanges":false,"colorSchema":"Green to Red","metricColorMode":"None","colorsRange":[{"from":0,"to":10000}],"labels":{"show":true},"invertColors":false,"style":{"bgFill":"#000","bgColor":false,"labelColor":false,"subText":"","fontSize":60}}}}',
    },
    references: [
      {
        id: '4f75abd0-b7ca-11ea-9044-07f9c61c294e',
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
          '{"query":{"query":"","language":"lucene"},"filter":[],"indexRefName":"kibanaSavedObjectMeta.searchSourceJSON.index"}',
      },
      title: 'S3Accesslog - Server Error Counts',
      uiStateJSON: '{}',
      version: 1,
      visState:
        '{"title":"S3Accesslog - Server Error Counts","type":"metric","aggs":[{"id":"1","enabled":true,"type":"count","params":{},"schema":"metric"},{"id":"2","enabled":true,"type":"filters","params":{"filters":[{"input":{"query":"HTTPstatus:{500 TO 599}","language":"lucene"},"label":"Server Error"}]},"schema":"group"}],"params":{"addTooltip":true,"addLegend":false,"type":"metric","metric":{"percentageMode":false,"useRanges":false,"colorSchema":"Green to Red","metricColorMode":"None","colorsRange":[{"from":0,"to":10000}],"labels":{"show":true},"invertColors":false,"style":{"bgFill":"#000","bgColor":false,"labelColor":false,"subText":"","fontSize":60}}}}',
    },
    references: [
      {
        id: '4f75abd0-b7ca-11ea-9044-07f9c61c294e',
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
          '{"query":{"query":"","language":"lucene"},"filter":[],"indexRefName":"kibanaSavedObjectMeta.searchSourceJSON.index"}',
      },
      title: 'S3Accesslog - Error Code(Pie)',
      uiStateJSON: '{}',
      version: 1,
      visState:
        '{"title":"S3Accesslog - Error Code(Pie)","type":"pie","aggs":[{"id":"1","enabled":true,"type":"count","params":{},"schema":"metric"},{"id":"2","enabled":true,"type":"terms","params":{"field":"ErrorCode","orderBy":"1","order":"desc","size":5,"otherBucket":true,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"},"schema":"segment"}],"params":{"type":"pie","addTooltip":true,"addLegend":true,"legendPosition":"right","isDonut":true,"labels":{"show":false,"values":true,"last_level":true,"truncate":100}}}',
    },
    references: [
      {
        id: '4f75abd0-b7ca-11ea-9044-07f9c61c294e',
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
          '{"query":{"query":"","language":"lucene"},"filter":[],"indexRefName":"kibanaSavedObjectMeta.searchSourceJSON.index"}',
      },
      title: 'S3Accesslog - Error Code (Area)',
      uiStateJSON: '{}',
      version: 1,
      visState:
        '{"title":"S3Accesslog - Error Code (Area)","type":"area","aggs":[{"id":"1","enabled":true,"type":"count","params":{},"schema":"metric"},{"id":"2","enabled":true,"type":"date_histogram","params":{"field":"timestamp","timeRange":{"from":"now-30M","to":"now"},"useNormalizedEsInterval":true,"scaleMetricValues":false,"interval":"auto","drop_partials":false,"min_doc_count":1,"extended_bounds":{}},"schema":"segment"},{"id":"3","enabled":true,"type":"terms","params":{"field":"ErrorCode","orderBy":"1","order":"desc","size":5,"otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"},"schema":"group"},{"id":"4","enabled":true,"type":"terms","params":{"field":"HTTPstatus","orderBy":"1","order":"desc","size":5,"otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"},"schema":"group"}],"params":{"type":"area","grid":{"categoryLines":false},"categoryAxes":[{"id":"CategoryAxis-1","type":"category","position":"bottom","show":true,"style":{},"scale":{"type":"linear"},"labels":{"show":true,"filter":true,"truncate":100},"title":{}}],"valueAxes":[{"id":"ValueAxis-1","name":"LeftAxis-1","type":"value","position":"left","show":true,"style":{},"scale":{"type":"linear","mode":"normal"},"labels":{"show":true,"rotate":0,"filter":false,"truncate":100},"title":{"text":"Count"}}],"seriesParams":[{"show":true,"type":"area","mode":"stacked","data":{"label":"Count","id":"1"},"drawLinesBetweenPoints":true,"lineWidth":2,"showCircles":true,"interpolate":"linear","valueAxis":"ValueAxis-1"}],"addTooltip":true,"addLegend":true,"legendPosition":"right","times":[],"addTimeMarker":false,"thresholdLine":{"show":false,"value":10,"width":1,"style":"full","color":"#E7664C"},"labels":{}}}',
    },
    references: [
      {
        id: '4f75abd0-b7ca-11ea-9044-07f9c61c294e',
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
          '{"query":{"query":"","language":"lucene"},"filter":[],"indexRefName":"kibanaSavedObjectMeta.searchSourceJSON.index"}',
      },
      title: 'S3Accesslog - Operation',
      uiStateJSON: '{}',
      version: 1,
      visState:
        '{"title":"S3Accesslog - Operation","type":"pie","aggs":[{"id":"1","enabled":true,"type":"count","params":{},"schema":"metric"},{"id":"2","enabled":true,"type":"terms","params":{"field":"Operation","orderBy":"1","order":"desc","size":5,"otherBucket":true,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"},"schema":"segment"}],"params":{"type":"pie","addTooltip":true,"addLegend":true,"legendPosition":"right","isDonut":true,"labels":{"show":false,"values":true,"last_level":true,"truncate":100}}}',
    },
    references: [
      {
        id: '4f75abd0-b7ca-11ea-9044-07f9c61c294e',
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
          '{"query":{"query":"","language":"lucene"},"filter":[],"indexRefName":"kibanaSavedObjectMeta.searchSourceJSON.index"}',
      },
      title: 'S3Accesslog - Operation(Area)',
      uiStateJSON: '{}',
      version: 1,
      visState:
        '{"title":"S3Accesslog - Operation(Area)","type":"area","aggs":[{"id":"1","enabled":true,"type":"count","params":{},"schema":"metric"},{"id":"2","enabled":true,"type":"date_histogram","params":{"field":"timestamp","timeRange":{"from":"now-30m","to":"now"},"useNormalizedEsInterval":true,"scaleMetricValues":false,"interval":"auto","drop_partials":false,"min_doc_count":1,"extended_bounds":{}},"schema":"segment"},{"id":"3","enabled":true,"type":"terms","params":{"field":"Operation","orderBy":"1","order":"desc","size":5,"otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"},"schema":"group"}],"params":{"type":"area","grid":{"categoryLines":false},"categoryAxes":[{"id":"CategoryAxis-1","type":"category","position":"bottom","show":true,"style":{},"scale":{"type":"linear"},"labels":{"show":true,"filter":true,"truncate":100},"title":{}}],"valueAxes":[{"id":"ValueAxis-1","name":"LeftAxis-1","type":"value","position":"left","show":true,"style":{},"scale":{"type":"linear","mode":"normal"},"labels":{"show":true,"rotate":0,"filter":false,"truncate":100},"title":{"text":"Count"}}],"seriesParams":[{"show":true,"type":"area","mode":"stacked","data":{"label":"Count","id":"1"},"drawLinesBetweenPoints":true,"lineWidth":2,"showCircles":true,"interpolate":"linear","valueAxis":"ValueAxis-1"}],"addTooltip":true,"addLegend":true,"legendPosition":"right","times":[],"addTimeMarker":false,"thresholdLine":{"show":false,"value":10,"width":1,"style":"full","color":"#E7664C"},"labels":{}}}',
    },
    references: [
      {
        id: '4f75abd0-b7ca-11ea-9044-07f9c61c294e',
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
          '{"query":{"query":"","language":"kuery"},"filter":[],"indexRefName":"kibanaSavedObjectMeta.searchSourceJSON.index"}',
      },
      title: 'S3Accesslog - Requeast URL Key',
      uiStateJSON: '{"vis":{"params":{"sort":{"columnIndex":null,"direction":null}}}}',
      version: 1,
      visState:
        '{"title":"S3Accesslog - Requeast URL Key","type":"table","aggs":[{"id":"1","enabled":true,"type":"count","params":{},"schema":"metric"},{"id":"2","enabled":true,"type":"terms","params":{"field":"RequestURI_key","orderBy":"1","order":"desc","size":5,"otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"},"schema":"bucket"}],"params":{"perPage":10,"showPartialRows":false,"showMetricsAtAllLevels":false,"sort":{"columnIndex":null,"direction":null},"showTotal":false,"totalFunc":"sum","percentageCol":""}}',
    },
    references: [
      {
        id: '4f75abd0-b7ca-11ea-9044-07f9c61c294e',
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
          '{"query":{"query":"","language":"lucene"},"filter":[],"indexRefName":"kibanaSavedObjectMeta.searchSourceJSON.index"}',
      },
      title: 'S3Accesslog - Request URI Key(Bar)',
      uiStateJSON: '{}',
      version: 1,
      visState:
        '{"title":"S3Accesslog - Request URI Key(Bar)","type":"histogram","aggs":[{"id":"1","enabled":true,"type":"count","params":{},"schema":"metric"},{"id":"2","enabled":true,"type":"terms","params":{"field":"RequestURI_key","orderBy":"1","order":"desc","size":5,"otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"},"schema":"segment"},{"id":"3","enabled":true,"type":"terms","params":{"field":"RequestURI_key","orderBy":"1","order":"desc","size":5,"otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"},"schema":"group"}],"params":{"type":"histogram","grid":{"categoryLines":false},"categoryAxes":[{"id":"CategoryAxis-1","type":"category","position":"bottom","show":false,"style":{},"scale":{"type":"linear"},"labels":{"show":true,"filter":true,"truncate":100},"title":{}}],"valueAxes":[{"id":"ValueAxis-1","name":"LeftAxis-1","type":"value","position":"left","show":true,"style":{},"scale":{"type":"linear","mode":"normal"},"labels":{"show":true,"rotate":0,"filter":false,"truncate":100},"title":{"text":"Count"}}],"seriesParams":[{"show":true,"type":"histogram","mode":"stacked","data":{"label":"Count","id":"1"},"valueAxis":"ValueAxis-1","drawLinesBetweenPoints":true,"lineWidth":2,"showCircles":true}],"addTooltip":true,"addLegend":true,"legendPosition":"right","times":[],"addTimeMarker":false,"labels":{"show":false},"thresholdLine":{"show":false,"value":10,"width":1,"style":"full","color":"#E7664C"}}}',
    },
    references: [
      {
        id: '4f75abd0-b7ca-11ea-9044-07f9c61c294e',
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
          '{"query":{"query":"","language":"kuery"},"filter":[],"indexRefName":"kibanaSavedObjectMeta.searchSourceJSON.index"}',
      },
      title: 'S3Accesslog - Requester',
      uiStateJSON: '{"vis":{"params":{"sort":{"columnIndex":null,"direction":null}}}}',
      version: 1,
      visState:
        '{"title":"S3Accesslog - Requester","type":"table","aggs":[{"id":"1","enabled":true,"type":"count","params":{},"schema":"metric"},{"id":"2","enabled":true,"type":"terms","params":{"field":"Requester","orderBy":"1","order":"desc","size":5,"otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"},"schema":"bucket"}],"params":{"perPage":10,"showPartialRows":false,"showMetricsAtAllLevels":false,"sort":{"columnIndex":null,"direction":null},"showTotal":false,"totalFunc":"sum","percentageCol":""}}',
    },
    references: [
      {
        id: '4f75abd0-b7ca-11ea-9044-07f9c61c294e',
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
      title: 'S3Accesslog - Buckets Request Counts ',
      uiStateJSON: '{}',
      version: 1,
      visState:
        '{"title":"S3Accesslog - Buckets Request Counts ","type":"histogram","aggs":[{"id":"1","enabled":true,"type":"count","params":{"customLabel":"Requet Count"},"schema":"metric"},{"id":"2","enabled":true,"type":"terms","params":{"field":"Bucket","orderBy":"1","order":"desc","size":5,"otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"},"schema":"segment"},{"id":"3","enabled":true,"type":"terms","params":{"field":"Bucket","orderBy":"1","order":"desc","size":5,"otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"},"schema":"group"}],"params":{"addLegend":true,"addTimeMarker":false,"addTooltip":true,"categoryAxes":[{"id":"CategoryAxis-1","labels":{"filter":true,"show":true,"truncate":100},"position":"bottom","scale":{"type":"linear"},"show":false,"style":{},"title":{},"type":"category"}],"grid":{"categoryLines":false},"labels":{"show":false},"legendPosition":"right","seriesParams":[{"data":{"id":"1","label":"Requet Count"},"drawLinesBetweenPoints":true,"lineWidth":2,"mode":"stacked","show":true,"showCircles":true,"type":"histogram","valueAxis":"ValueAxis-1"}],"thresholdLine":{"color":"#E7664C","show":false,"style":"full","value":10,"width":1},"times":[],"type":"histogram","valueAxes":[{"id":"ValueAxis-1","labels":{"filter":false,"rotate":0,"show":true,"truncate":100},"name":"LeftAxis-1","position":"left","scale":{"mode":"normal","type":"linear"},"show":true,"style":{},"title":{"text":"Requet Count"},"type":"value"}]}}',
    },
    references: [
      {
        id: '4f75abd0-b7ca-11ea-9044-07f9c61c294e',
        name: 'kibanaSavedObjectMeta.searchSourceJSON.index',
        type: 'index-pattern',
      },
    ],
    type: 'visualization',
  },
];

export const s3IndexPatternConfig: IndexPatternSavedObjectCreationConfig = {
  attributes: {
    fields:
      '[{"count":0,"name":"@id","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"@log_s3bucket","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"@log_s3key","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":10,"name":"@log_type","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"@message","type":"string","esTypes":["text"],"scripted":false,"searchable":true,"aggregatable":false,"readFromDocValues":false},{"count":0,"name":"timestamp","type":"date","esTypes":["date"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"AuthType","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"Bucket","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"BucketOwner","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"BytesSent","type":"number","esTypes":["integer"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"CipherSuite","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"EndPoint","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"ErrorCode","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"HTTPstatus","type":"number","esTypes":["short"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"HostId","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"Key","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"ObjectSize","type":"number","esTypes":["integer"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"Operation","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"Referrer","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"RemoteIP","type":"ip","esTypes":["ip"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"RequestDateTime","type":"date","esTypes":["date"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"RequestID","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"RequestURI_httpProtoversion","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"RequestURI_key","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"RequestURI_operation","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"Requester","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"SchemaVersion","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"SigV","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"TLSVersion","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"TotalTime","type":"number","esTypes":["integer"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"TurnAroundTime","type":"number","esTypes":["integer"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"UserAgent","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"_id","type":"string","esTypes":["_id"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":false},{"count":0,"name":"_index","type":"string","esTypes":["_index"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":false},{"count":0,"name":"_source","type":"_source","esTypes":["_source"],"scripted":false,"searchable":false,"aggregatable":false,"readFromDocValues":false},{"count":0,"name":"apiVersion","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"base.tags","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":10,"name":"cloud.account.id","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"cloud.provider","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":10,"name":"cloud.region","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"container.image.tag","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"cwe_timestamp","type":"date","esTypes":["date"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"cwl_timestamp","type":"date","esTypes":["date"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"destination.address","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"destination.as.number","type":"number","esTypes":["integer"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":10,"name":"destination.bytes","type":"number","esTypes":["long"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"destination.domain","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"destination.geo.city_name","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"destination.geo.country_iso_code","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":10,"name":"destination.geo.country_name","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"destination.geo.location","type":"geo_point","esTypes":["geo_point"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":10,"name":"destination.ip","type":"ip","esTypes":["ip"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"destination.nat.ip","type":"ip","esTypes":["ip"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"destination.nat.port","type":"number","esTypes":["integer"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":10,"name":"destination.packets","type":"number","esTypes":["long"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":10,"name":"destination.port","type":"number","esTypes":["integer"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"dns.answers.ttl","type":"number","esTypes":["long"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"dns.header_flags","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"dns.id","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"dns.resolved_ip","type":"ip","esTypes":["ip"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"ecs.version","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":10,"name":"error.message","type":"string","esTypes":["text"],"scripted":false,"searchable":true,"aggregatable":false,"readFromDocValues":false},{"count":0,"name":"event.category","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"event.code","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"event.created","type":"date","esTypes":["date"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"event.duration","type":"number","esTypes":["long"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"event.end","type":"date","esTypes":["date"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"event.id","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":10,"name":"event.ingested","type":"date","esTypes":["date"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"event.kind","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":10,"name":"event.module","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":10,"name":"event.outcome","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"event.risk_score","type":"number","esTypes":["float"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"event.risk_score_norm","type":"number","esTypes":["float"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"event.sequence","type":"number","esTypes":["long"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":10,"name":"event.severity","type":"number","esTypes":["long"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"event.start","type":"date","esTypes":["date"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"event.timezone","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"event.type","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"file.accessed","type":"date","esTypes":["date"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"file.attributes","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"file.created","type":"date","esTypes":["date"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"file.ctime","type":"date","esTypes":["date"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"file.gid","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"file.inode","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"file.mode","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"file.mtime","type":"date","esTypes":["date"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"file.size","type":"number","esTypes":["long"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"file.uid","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"group.id","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"host.disk.read.bytes","type":"number","esTypes":["long"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"host.disk.write.bytes","type":"number","esTypes":["long"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"host.hostname","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"host.id","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"host.ip","type":"ip","esTypes":["ip"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"host.mac","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"host.network.egress.bytes","type":"number","esTypes":["long"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"host.network.egress.packets","type":"number","esTypes":["long"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"host.network.ingress.bytes","type":"number","esTypes":["long"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"host.network.ingress.packets","type":"number","esTypes":["long"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"host.uptime","type":"number","esTypes":["long"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"http.request.body.bytes","type":"number","esTypes":["long"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"http.request.body.content","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"http.request.body.content.text","type":"string","esTypes":["text"],"scripted":false,"searchable":true,"aggregatable":false,"readFromDocValues":false,"subType":{"multi":{"parent":"http.request.body.content"}}},{"count":10,"name":"http.request.bytes","type":"number","esTypes":["long"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":10,"name":"http.request.method","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":10,"name":"http.request.referrer","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"http.response.body.bytes","type":"number","esTypes":["long"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"http.response.body.content","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"http.response.body.content.text","type":"string","esTypes":["text"],"scripted":false,"searchable":true,"aggregatable":false,"readFromDocValues":false,"subType":{"multi":{"parent":"http.response.body.content"}}},{"count":10,"name":"http.response.bytes","type":"number","esTypes":["long"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":10,"name":"http.response.status_code","type":"number","esTypes":["short"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":10,"name":"http.version","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"interface.alias","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"interface.id","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"interface.name","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"log.level","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"log.origin.file.line","type":"number","esTypes":["long"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"log.syslog.facility.code","type":"number","esTypes":["long"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"log.syslog.priority","type":"number","esTypes":["long"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"log.syslog.severity.code","type":"number","esTypes":["long"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":10,"name":"network.bytes","type":"number","esTypes":["integer"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"network.community_id","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"network.forwarded_ip","type":"ip","esTypes":["ip"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":10,"name":"network.iana_number","type":"number","esTypes":["short"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":10,"name":"network.packets","type":"number","esTypes":["long"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"observer.ip","type":"ip","esTypes":["ip"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"observer.mac","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"observer.serial_number","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"observer.version","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"organization.id","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"os.family","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"os.full","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"os.full.text","type":"string","esTypes":["text"],"scripted":false,"searchable":true,"aggregatable":false,"readFromDocValues":false,"subType":{"multi":{"parent":"os.full"}}},{"count":0,"name":"os.kernel","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"os.name","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"os.name.text","type":"string","esTypes":["text"],"scripted":false,"searchable":true,"aggregatable":false,"readFromDocValues":false,"subType":{"multi":{"parent":"os.name"}}},{"count":0,"name":"os.platform","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"os.type","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"os.version","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"process.args","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"process.args_count","type":"number","esTypes":["long"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"process.command_line","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"process.command_line.text","type":"string","esTypes":["text"],"scripted":false,"searchable":true,"aggregatable":false,"readFromDocValues":false,"subType":{"multi":{"parent":"process.command_line"}}},{"count":0,"name":"process.entity_id","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"process.exit_code","type":"number","esTypes":["long"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"process.pgid","type":"number","esTypes":["long"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":10,"name":"process.pid","type":"number","esTypes":["long"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"process.ppid","type":"number","esTypes":["long"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"process.start","type":"date","esTypes":["date"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"process.thread.id","type":"number","esTypes":["long"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"process.uptime","type":"number","esTypes":["long"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"related.hash","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":10,"name":"related.hosts","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":10,"name":"related.ip","type":"ip","esTypes":["ip"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":10,"name":"related.user","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"rule.author","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"rule.category","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":10,"name":"rule.description","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":10,"name":"rule.id","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"rule.uuid","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"rule.version","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"service.ephemeral_id","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"service.id","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"service.version","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"source.address","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"source.as.number","type":"number","esTypes":["integer"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":10,"name":"source.as.organization.name","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":10,"name":"source.bytes","type":"number","esTypes":["long"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"source.geo.city_name","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"source.geo.country_iso_code","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":10,"name":"source.geo.country_name","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"source.geo.location","type":"geo_point","esTypes":["geo_point"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":10,"name":"source.ip","type":"ip","esTypes":["ip"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"source.nat.ip","type":"ip","esTypes":["ip"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"source.nat.port","type":"number","esTypes":["integer"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":10,"name":"source.packets","type":"number","esTypes":["long"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":10,"name":"source.port","type":"number","esTypes":["integer"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"span.id","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"threat.enrichments.indicator.confidence","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true,"subType":{"nested":{"path":"threat.enrichments"}}},{"count":0,"name":"threat.enrichments.indicator.description","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true,"subType":{"nested":{"path":"threat.enrichments"}}},{"count":0,"name":"threat.enrichments.indicator.email.address","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true,"subType":{"nested":{"path":"threat.enrichments"}}},{"count":0,"name":"threat.enrichments.indicator.first_seen","type":"date","esTypes":["date"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true,"subType":{"nested":{"path":"threat.enrichments"}}},{"count":0,"name":"threat.enrichments.indicator.ip","type":"ip","esTypes":["ip"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true,"subType":{"nested":{"path":"threat.enrichments"}}},{"count":0,"name":"threat.enrichments.indicator.last_seen","type":"date","esTypes":["date"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true,"subType":{"nested":{"path":"threat.enrichments"}}},{"count":0,"name":"threat.enrichments.indicator.marking.tlp","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true,"subType":{"nested":{"path":"threat.enrichments"}}},{"count":0,"name":"threat.enrichments.indicator.modified_at","type":"date","esTypes":["date"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true,"subType":{"nested":{"path":"threat.enrichments"}}},{"count":0,"name":"threat.enrichments.indicator.name","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true,"subType":{"nested":{"path":"threat.enrichments"}}},{"count":0,"name":"threat.enrichments.indicator.port","type":"number","esTypes":["long"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true,"subType":{"nested":{"path":"threat.enrichments"}}},{"count":0,"name":"threat.enrichments.indicator.provider","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true,"subType":{"nested":{"path":"threat.enrichments"}}},{"count":0,"name":"threat.enrichments.indicator.reference","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true,"subType":{"nested":{"path":"threat.enrichments"}}},{"count":0,"name":"threat.enrichments.indicator.scanner_stats","type":"number","esTypes":["long"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true,"subType":{"nested":{"path":"threat.enrichments"}}},{"count":0,"name":"threat.enrichments.indicator.sightings","type":"number","esTypes":["long"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true,"subType":{"nested":{"path":"threat.enrichments"}}},{"count":0,"name":"threat.enrichments.indicator.type","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true,"subType":{"nested":{"path":"threat.enrichments"}}},{"count":0,"name":"threat.enrichments.matched.atomic","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true,"subType":{"nested":{"path":"threat.enrichments"}}},{"count":0,"name":"threat.enrichments.matched.field","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true,"subType":{"nested":{"path":"threat.enrichments"}}},{"count":0,"name":"threat.enrichments.matched.id","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true,"subType":{"nested":{"path":"threat.enrichments"}}},{"count":0,"name":"threat.enrichments.matched.index","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true,"subType":{"nested":{"path":"threat.enrichments"}}},{"count":0,"name":"threat.enrichments.matched.occurred","type":"date","esTypes":["date"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true,"subType":{"nested":{"path":"threat.enrichments"}}},{"count":0,"name":"threat.enrichments.matched.type","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true,"subType":{"nested":{"path":"threat.enrichments"}}},{"count":10,"name":"threat.matched.indicators","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"threat.matched.names","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":10,"name":"threat.matched.providers","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"threat.matched.types","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"trace.id","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"transaction.id","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":10,"name":"url.domain","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":10,"name":"url.full","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"url.full.text","type":"string","esTypes":["text"],"scripted":false,"searchable":true,"aggregatable":false,"readFromDocValues":false,"subType":{"multi":{"parent":"url.full"}}},{"count":0,"name":"url.original","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"url.original.text","type":"string","esTypes":["text"],"scripted":false,"searchable":true,"aggregatable":false,"readFromDocValues":false,"subType":{"multi":{"parent":"url.original"}}},{"count":10,"name":"url.port","type":"number","esTypes":["long"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":10,"name":"user.id","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":10,"name":"user.name","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"user.roles","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"user_agent.device.name","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":10,"name":"user_agent.name","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":10,"name":"user_agent.original","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"user_agent.original.text","type":"string","esTypes":["text"],"scripted":false,"searchable":true,"aggregatable":false,"readFromDocValues":false,"subType":{"multi":{"parent":"user_agent.original"}}},{"count":0,"name":"user_agent.os.family","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"user_agent.os.family.text","type":"string","esTypes":["text"],"scripted":false,"searchable":true,"aggregatable":false,"readFromDocValues":false,"subType":{"multi":{"parent":"user_agent.os.family"}}},{"count":0,"name":"user_agent.os.full","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"user_agent.os.kernel","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"user_agent.os.name","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"user_agent.os.name.text","type":"string","esTypes":["text"],"scripted":false,"searchable":true,"aggregatable":false,"readFromDocValues":false,"subType":{"multi":{"parent":"user_agent.os.name"}}},{"count":0,"name":"user_agent.os.platform","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"user_agent.os.type","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"user_agent.os.version","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"user_agent.version","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"vlan.id","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"vulnerability.category","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"vulnerability.classification","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"vulnerability.description","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"vulnerability.description.text","type":"string","esTypes":["text"],"scripted":false,"searchable":true,"aggregatable":false,"readFromDocValues":false,"subType":{"multi":{"parent":"vulnerability.description"}}},{"count":0,"name":"vulnerability.enumeration","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"vulnerability.id","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"vulnerability.reference","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"vulnerability.report_id","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"vulnerability.scanner.vendor","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"vulnerability.score.base","type":"number","esTypes":["float"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"vulnerability.score.environmental","type":"number","esTypes":["float"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"vulnerability.score.temporal","type":"number","esTypes":["float"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"vulnerability.score.version","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"vulnerability.severity","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true}]',
    timeFieldName: 'timestamp',
    title: 'log-aws-s3accesslog-*',
  },
  id: undefined,
  migrationVersion: undefined,
  references: [],
  type: 'index-pattern',
};
