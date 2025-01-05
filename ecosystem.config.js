export default {
  apps: [
    {
      name: "seo-sea-automation",
      script: "src/index.js",
      instances: "max",
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
      error_file: "logs/pm2/err.log",
      out_file: "logs/pm2/out.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss",

      // Monitoring
      monitor: true,
      monitoring: {
        cpu: true,
        memory: true,
        http: true,
      },
    },
  ],
};
