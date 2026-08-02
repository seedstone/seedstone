# Changelog

## 3.0.0

- Replaced the gem-only renderer API with `create(plugin, target, seed, options?)`.
- Added bundled gem, cat, and fox implementations with direct package entry points.
- Added the dependency-free trait engine and third-party plugin authoring API.
- Renamed configuration inputs to overrides and added plugin-derived option, config, and view types.
- Added dual ESM/CommonJS packages with matching declarations.

See [MIGRATION.md](MIGRATION.md) for the v2 upgrade guide.
