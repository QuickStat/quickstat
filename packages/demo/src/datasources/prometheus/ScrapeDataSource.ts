import { PrometheusDataSource, ScrapeStrategy } from '@quickstat/prometheus'

const dataSource = new PrometheusDataSource()

dataSource.setStrategy(
  new ScrapeStrategy(),
)

export default dataSource
