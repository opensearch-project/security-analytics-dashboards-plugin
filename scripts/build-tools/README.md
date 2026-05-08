# update-engine-schemas

Fetches JSON Schema files from the [wazuh/wazuh](https://github.com/wazuh/wazuh) repository and writes them to `common/schemas/`. These schemas are used to validate resource editor forms (decoders, and any future resource types) against the same constraints the engine enforces.

## Usage

Runs automatically on `yarn install` via the `postinstall` hook. Can also be triggered manually:

```bash
yarn generate:schemas
```

If no branch is provided through the environment, the script will prompt for one:

```
Enter the git reference (branch/tag) of the wazuh/wazuh repository to fetch schemas from (e.g., main, v5.0.0):
```

To skip the prompt, pass the reference explicitly:

```bash
GIT_REF=main yarn generate:schemas
# or
bash scripts/build-tools/update-engine-schemas main
```

To skip the download entirely (e.g. in CI where schemas are already present):

```bash
SKIP_DOWNLOAD_ENGINE_SCHEMAS=true yarn generate:schemas
```

## How branch resolution works

The script builds a list of candidate references in order: the input ref, the `wazuh.version` from `package.json`, `v${version}`, and `main` as a final fallback. It checks each against the wazuh/wazuh repository via `git ls-remote` and uses the first one that exists.

## Adding a new schema

Add an entry to `SCHEMA_SOURCES` in `scripts/generate-engine-schemas.js`:

```js
{ name: 'wazuh-filters', urls: [wazuhUrl('src/engine/ruleset/schemas/wazuh-filters.json'), '...main fallback...'] }
```

The schema will be written to `common/schemas/wazuh-filters.schema.json` and can be imported directly in the relevant form page.
