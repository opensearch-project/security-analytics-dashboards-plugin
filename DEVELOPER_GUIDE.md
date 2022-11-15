- [Developer guide](#developer-guide)
  - [Forking and Cloning](#forking-and-cloning)
  - [Install Prerequisites](#install-prerequisites)
  - [Environment Setup](#environment-setup)
  - [Build](#build)
  - [Run](#run)
  - [Test](#test)

## Developer guide

So you want to contribute code to this project? Excellent! We're glad you're here. Here's what you need to do.

### Forking and Cloning

Fork this repository on GitHub, and clone locally with `git clone`.

### Install Prerequisites

You will need to install [node.js](https://nodejs.org/en/), [nvm](https://github.com/nvm-sh/nvm/blob/master/README.md), and [yarn](https://yarnpkg.com/) in your environment to properly pull down dependencies to build and bootstrap the plugin.

### Environment Setup

1. [Download](https://opensearch.org/downloads.html) minimal distribution of OpenSearch for the version that matches the OpenSearch Dashboards version specified in [opensearch_dashboards.json](./opensearch_dashboards.json#L4).
2. [Install](https://opensearch.org/docs/latest/opensearch/install/plugins/) the [opensearch-security-analytics](https://github.com/opensearch-project/security-analytics) plugin.
3. Clone the [OpenSearch Dashboards](https://github.com/opensearch-project/OpenSearch-Dashboards) source code and checkout the branch corresponding to the [version specified in package.json](./package.json#L7).

   See the [OpenSearch Dashboards contributing guide](https://github.com/opensearch-project/OpenSearch-Dashboards/blob/main/CONTRIBUTING.md) and [developer guide](https://github.com/opensearch-project/OpenSearch-Dashboards/blob/main/DEVELOPER_GUIDE.md) for more instructions on setting up your development environment.

4. Change your node version to the version specified in `.node-version` inside the OpenSearch Dashboards root directory (this can be done with the `nvm use` command).
5. Create a `plugins` directory inside the OpenSearch Dashboards source code directory, if `plugins` directory doesn't exist.
6. Check out this package from version control into the `plugins` directory.
7. Run `yarn osd bootstrap` inside `OpenSearch-Dashboards/plugins/security-analytics-dashboards-plugin`.

Ultimately, your directory structure should look like this:

<!-- prettier-ignore -->
```md
.
├── OpenSearch-Dashboards
│   └──plugins
│      └── security-analytics-dashboards-plugin
```

### Build

To build the plugin's distributable zip simply run `yarn build`.

Example output: `./build/security-analytics-dashboards-1.0.0.0.zip`

### Run

In the base OpenSearch Dashboards directory, run

- `yarn start --no-base-path`

  Starts OpenSearch Dashboards and includes this plugin. OpenSearch Dashboards will be available on `localhost:5601`.

### Test

- `yarn test:jest`

  - Runs the plugin tests.

- `yarn run cypress open`

  - Opens the Cypress test runner

- `yarn run cypress run`

  - Runs the Cypress test runner

### Backport

- [Link to backport documentation](https://github.com/opensearch-project/opensearch-plugins/blob/main/BACKPORT.md)