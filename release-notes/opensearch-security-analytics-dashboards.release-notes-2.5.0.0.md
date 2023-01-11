## Version 2.5.0.0 2023-01-09
Compatible with OpenSearch 2.5.0

### Maintenance
* Made minor changes to polish the UI. ([#247](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/247))
* Bumped version to 2.5. ([#297](https://github.com/opensearch-project/alerting-dashboards-plugin/pull/297))
* Updated MAINTAINERS.md format. ([#284](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/284))
* Bump json5 from 1.0.1 to 1.0.2. ([#285](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/285))
* Remove experimental banner. ([#303](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/303))

### Features
* Refactoring | Updates overview stats components to use EUI/Stats loading component. ([#194](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/194))
* Update chart legend font size and padding. ([#196](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/196))
* YAML Rule Editor Support. ([#201](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/201))
* Adds dynamic chart time unit based on the selected time span. ([#204](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/204))
* Rule YAML preview. ([#209](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/209))
* Feature/detector navigation to findings and alerts. ([#210](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/210))
* Show surrounding documents when index pattern is available; Finding flyout UI polish. ([#216](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/216))
* Rule flyout opening from Findings and Alerts page. ([#219](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/219))
* Show success toast when detector is updated. ([#224](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/224))
* Add chart tooltips. ([#225](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/225))
* Add interactive legend into charts. ([#226](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/226))
* Implement date/time picker on the overview page. ([#232](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/232))
* Rule details flyout on create rule page. ([#236](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/236))
* Add loading state for all tables visualizations on overview page. ([#237](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/237))
* Toggle all rules button on detector edit page. ([#239](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/239))
* Rule form validation on submit. ([#264](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/264))
* Feature/charts should show the entire time range selected in the filter. ([#265](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/265))
* Rule details flyout on detector create 4th step. ([#266](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/266))
* More validations on YAML rule editor. ([#279](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/279))
* Rule details flyout on detector view page. ([#292](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/292))
* Improve rules view in detector details. ([#310](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/310))
* Adds findings alerts legend in overview page. ([#318](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/318))
* Feature/hide view docs button. ([#320](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/320))
* Improved field mapping UX. ([#330](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/330))
* Data source single select field. ([#333](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/333))

### Infrastructure
* Remove mac os from unit test platforms. ([#211](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/211))
* Public Components Snapshot Tests. ([#218](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/218))
* Sort alerts in descending order of timestamp by default. ([#222](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/222))
* Filtered findings shown in alert details. ([#229](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/229))
* Cypress checking on rule YAML content. ([#248](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/248))
* Creating new object for alert condition initialization. ([#255](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/255))
* Added windows to cypress test runs. ([#259](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/259))
* Streamline rules request. ([#281](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/281))
* Detector must have at least one alert set. ([#289](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/289))
* Updated field mapping UX; disabled windows run for cypress. ([#307](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/307))
* Improve alert condition input placeholders. ([#308](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/308))
* Status chart colors update. ([#309](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/309))

### Bug Fixes
* Alerts and Findings overview table should have even height. ([#250](https://github.com/opensearch-project/security-analytics-dashboards-plugin/issues/250))
* Fix cypress flaky tests. ([#261](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/261))
* Fetch only Rules matching Rule Types. ([#262](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/262))
* Edit detector rules table paging goes to page the first page. ([#270](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/270))
* Cypress windows tests fix. ([#296](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/296))
* Wait for field mapping creation to succeed before detector creation API call. ([#317](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/317))
* Fixed styling issues. ([#322](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/322))
* Patch missing detector_id with data already on UI. ([#328](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/328))

### Documentation
* Updated UI text and spacing in create detector workflow. ([#150](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/150))
* Add 2.5.0 release notes. ([#329](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/329))