# Schemas

Total: 15

## AIModel

- Domain: `compute`
- Version: `unversioned`
- Tags: `core`, `compute`, `ai`

AI model configuration and metadata

## BaseEvent

- Domain: `events`
- Version: `unversioned`
- Tags: `events`, `envelope`

Generic base event envelope (pre-catalog canonicalization)

## BaseForm

- Domain: `forms`
- Version: `unversioned`
- Tags: `form`, `base`

Base form envelope shared by specialized form schemas

## BugForm

- Domain: `forms`
- Version: `unversioned`
- Tags: `form`, `bug`, `issue`

Bug report submission form

## CommitMetadata

- Domain: `operations`
- Version: `unversioned`
- Tags: `commit`, `metadata`, `automation`

Structured commit metadata enrichment (automation / analysis)

## ConsoleLogExport

- Domain: `observability`
- Version: `unversioned`
- Tags: `log`, `console`, `export`

Serialized console log export bundle

## DebugReport

- Domain: `observability`
- Version: `unversioned`
- Tags: `debug`, `report`, `observability`

Structured debug / diagnostics report aggregate

## FeedbackForm

- Domain: `forms`
- Version: `unversioned`
- Tags: `form`, `feedback`

General feedback / feature / sponsor intake form

## FunnelsPlan

- Domain: `operations`
- Version: `unversioned`
- Tags: `funnels`, `plan`, `ops`

Marketing / product funnels plan configuration schema

## GestureConfig

- Domain: `design-system`
- Version: `unversioned`
- Tags: `ui`, `interaction`

Client gesture interaction tuning parameters

## InternetFriendResults

- Domain: `analytics`
- Version: `unversioned`
- Tags: `analytics`, `results`, `diagnostics`

Structured matrix / vector / hybrid diagnostic result formats

## MLDatasetFossil

- Domain: `ml`
- Version: `unversioned`
- Tags: `ml`, `dataset`, `fossil`

Machine learning dataset fossil metadata & payload snapshot

## PRForm

- Domain: `forms`
- Version: `unversioned`
- Tags: `form`, `pr`, `code-review`

Pull request review / metadata submission form

## SLARules

- Domain: `operations`
- Version: `unversioned`
- Tags: `sla`, `rules`, `ops`

Service Level Agreement rule definitions

## UserAuth

- Domain: `auth`
- Version: `unversioned`
- Tags: `core`, `user`

User authentication identity baseline (session integration)
