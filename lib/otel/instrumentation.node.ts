import { NodeSDK, logs } from '@opentelemetry/sdk-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-grpc';
import { OtelOptions } from '../../types/otel';
import { UndiciInstrumentation } from '@opentelemetry/instrumentation-undici';
import { BunyanInstrumentation } from '@opentelemetry/instrumentation-bunyan';
import { CompositePropagator, W3CBaggagePropagator, W3CTraceContextPropagator } from "@opentelemetry/core";

export function registerOtel({ endpoint, serviceName }: Omit<OtelOptions, 'consoleLogging'>) {
  const sdk = new NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    }),
    traceExporter: new OTLPTraceExporter({}),
    textMapPropagator: new CompositePropagator({
      propagators: [new W3CBaggagePropagator(), new W3CTraceContextPropagator()],
    }),
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({}),
    }),
    logRecordProcessor: new logs.SimpleLogRecordProcessor(new OTLPLogExporter()),
    instrumentations: [
      new UndiciInstrumentation({}),
      new BunyanInstrumentation({}),
    ],
  });

  sdk.start();

  console.log('instrumentation `node` enabled');

  function shutdown() {
    sdk
      .shutdown()
      .then(
        () => console.log('Instrumentation Node SDK shut down successfully'),
        (err) => console.log('Error shutting down Instrumentation Node SDK', err)
      )
      .finally(() => process.exit(0));
  }

  process.on('exit', shutdown);
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
