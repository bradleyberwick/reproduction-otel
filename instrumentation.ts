export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { registerOtel } = await import('./lib/otel/instrumentation.node');

    console.log('registering instrumentation node...');

    registerOtel({
      endpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || '',
      serviceName: process.env.OTEL_SERVICE_NAME || 'test-app',
    });
  }
}
