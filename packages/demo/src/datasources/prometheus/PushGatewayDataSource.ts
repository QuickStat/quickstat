import { PrometheusDataSource, PushGatewayStrategy } from '@quickstat/prometheus'

const dataSource = new PrometheusDataSource<PushGatewayStrategy>()

dataSource.setStrategy(
  new PushGatewayStrategy({
    url: 'http://localhost:9091',
    auto: {
      pushInterval: 1000,
      jobName: 'pushgateway',
    },
  }),
)

export default dataSource
