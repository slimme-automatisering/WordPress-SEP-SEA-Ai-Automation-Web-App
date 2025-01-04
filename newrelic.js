'use strict'

exports.config = {
  app_name: ['SEO & SEA Automation'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  logging: {
    level: 'info',
    enabled: true
  },
  allow_all_headers: true,
  attributes: {
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
      'request.headers.proxyAuthorization',
      'request.headers.setCookie*',
      'request.headers.x*',
      'response.headers.cookie',
      'response.headers.authorization',
      'response.headers.proxyAuthorization',
      'response.headers.setCookie*',
      'response.headers.x*'
    ]
  },
  distributed_tracing: {
    enabled: true
  },
  transaction_tracer: {
    enabled: true,
    transaction_threshold: 4,
    record_sql: 'obfuscated',
    explain_threshold: 500
  },
  slow_sql: {
    enabled: true,
    max_samples: 5
  },
  error_collector: {
    enabled: true,
    ignore_status_codes: [404, 401]
  }
}
