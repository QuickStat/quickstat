# Rest Plugin Example

To quickly set up and run the Rest Plugin example, follow the steps below.

## Grafana Dashboard

The dashboard is located under `./docker/grafana/provisioning/dashboards/rest.json`, which also has been published to [Grafana's Dashboard Hub](https://grafana.com/grafana/dashboards/21152).

![](./assets/rest_grafana_overview.png)
![](./assets/rest_grafana_distribution.png)
![](./assets/rest_grafana_size.png)

### Clone Repo & Install Dependencies

First, clone the repository to your local machine:

```bash
git clone https://github.com/QuickStat/quickstat.git
```

Next, install the dependencies required for running the example:

```bash
npm i -g pnpm
pnpm install
```

Pnpm has been used to due the support of workspaces.

### Start Docker

Navigate to the Rest Plugin example directory:

```bash
cd quickstat/examples/plugins/rest
```

Start Docker by running the following command:

```bash
cd /docker
docker-compose up -d
```

This command will spawn the necessary services required for running the Rest Plugin example. The services include:

- Prometheus: Exposes the metrics to Grafana
- Grafana: Used for visualizing the metrics

### Start Rest Application

After Docker has been successfully started, you can now start the QuickStat Rest metrics collector:

```bash
npm run start:main
```

After the application has been started the metrics will be exposed at `http://localhost:3242`, ready for scraping by Prometheus.Furthermore a simple rest api is exposed at `http://localhost:3032`, where requests will be executed in order to generate metrics.

# Disclaimer

The docker-setup exposes some ports to the host machine. If you are planning to use this setup in a production environment, make sure to secure the ports and the services running on them or blocking them.
