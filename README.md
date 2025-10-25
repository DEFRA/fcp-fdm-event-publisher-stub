![Build](https://github.com/defra/fcp-fdm-event-publisher-stub/actions/workflows/publish.yml/badge.svg)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_fcp-fdm-event-publisher-stub&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=DEFRA_fcp-fdm-event-publisher-stub)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_fcp-fdm-event-publisher-stub&metric=bugs)](https://sonarcloud.io/summary/new_code?id=DEFRA_fcp-fdm-event-publisher-stub)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_fcp-fdm-event-publisher-stub&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=DEFRA_fcp-fdm-event-publisher-stub)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_fcp-fdm-event-publisher-stub&metric=duplicated_lines_density)](https://sonarcloud.io/summary/new_code?id=DEFRA_fcp-fdm-event-publisher-stub)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_fcp-fdm-event-publisher-stub&metric=coverage)](https://sonarcloud.io/summary/new_code?id=DEFRA_fcp-fdm-event-publisher-stub)

# Farming Data Model (FDM)

The Farming Data Model (FDM) service is a common component to support data exchange between Farming and Countryside Programme (FCP) services.

FDM subscribes to events across the FCP ecosystem via an AWS SQS queue. These events are persisted and precompiled into a data model which can be queried via REST API endpoints.

This stub service simulates the publishing of events to FDM consistent with those published by other FCP services.

The intention of the stub is to support local development and performance testing of FDM without the need to deploy and configure the full suite of FCP services.

## API

When the API is enabled (default for non-production environments) the following endpoints are available:

| Method | Endpoint                          | Description                         |
|--------|----------------------------------|-------------------------------------|
| `POST` | `/api/v1/simulate/messages`      | Simulate the publishing of messages to FDM |

All `/api/v1/simulate` endpoints accept the following optional query parameters:

| Parameter   | Type    | Description                                                                 |
|-------------|---------|-----------------------------------------------------------------------------|
| `scenario`  | String  | The name of a specific scenario to simulate. If not provided all scenarios will be simulated. |
| `repetitions` | Integer | The number of times to repeat the scenario(s). Default is `1`. |

## Requirements

### Docker

This application is intended to be run in a Docker container to ensure consistency across environments.

Docker can be installed from [Docker's official website](https://docs.docker.com/get-docker/).

> The test suite includes integration tests which are dependent on a Postgres container so cannot be run without Docker.

## Local development

### Setup

Install application dependencies:

```bash
npm install
```

### Development

To run the application in `development` mode run:

```bash
npm run docker:dev
```

### Testing

To test the application run:

```bash
npm run docker:test
```

Tests can also be run in watch mode to support Test Driven Development (TDD):

```bash
npm run docker:test:watch
```

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable
information providers in the public sector to license the use and re-use of their information under a common open
licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
