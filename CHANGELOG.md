# Eclipt Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v0.1.4] - 2020-04-16

### Fixed
- bug when command is followed by a single argument

## [v0.1.3] - 2020-04-04

### Added
- support for array options

### Fixed
- bug where trailing arg after required command would throw 'unknown command'

### Changed
- exception andling to always display last context help

## [v0.1.2] - 2019-07-15

### Added
- Rule to ignore args preffixing the main tool name.

## [v0.1.1] - 2019-07-15

### Added
- Setting to describe expected positional arguments.

### Changed
- Arguments passed to command callback functions (data, ...args).

## [v0.1.0] - 2019-07-14
- First officially published version.

[v0.1.0]: https://gitlab.com/GCSBOSS/eclipt/-/tags/v0.1.0
[v0.1.1]: https://gitlab.com/GCSBOSS/eclipt/-/tags/v0.1.1
[v0.1.2]: https://gitlab.com/GCSBOSS/eclipt/-/tags/v0.1.2
[v0.1.3]: https://gitlab.com/GCSBOSS/eclipt/-/tags/v0.1.3
[v0.1.4]: https://gitlab.com/GCSBOSS/eclipt/-/tags/v0.1.4
