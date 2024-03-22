## Version 2.13.0.0 2024-03-19

Compatible with OpenSearch Dashboards 2.13.0

### Maintenance
* added riysaxen-amzn as a maintainer ([#898](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/898))

### Features
* added spinner to better indicate that rules are loading ([#905](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/905))
* Rule editor enhancements ([#924](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/924))
* Fetch all findings and alerts for the detectors when displaying in the tables ([#942](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/942))

### Infrastructure
* Updated cypress version to match core OSD ([#907](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/907))

### Bug Fixes
* added more mime types for yaml file ([#909](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/909))
* Load log type from log source if present ([#894](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/894))
* Update actions menu after start/stop detector action for the selected detector ([#895](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/895))
* loading spinner added; fixed copied popup ([#904](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/904))
* fixed view surrounding logs for aliases ([#906](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/906))
* fetching channel types using API; updated type imports ([#919](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/919))
* fixed UI for setting alert severity ([#920](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/920))
* Do not filter timestamp field from required mappings when at least one rule is selected ([#925](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/925))
* fixed create button staying in submit state on review config ([#926](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/926))
* don't show index-pattern creation form once created ([#927](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/927))
* Fixed logic to get all alerts for a detector ([#965](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/965))

### Documentation
* Added release notes for 2.13.0 ([#959](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/959))