const k8s = require('@kubernetes/client-node');
const { logger } = require('../../utils/logger');
const monitoringService = require('../monitoring/monitoringService');

class ScalingService {
  constructor() {
    this.kc = new k8s.KubeConfig();
    this.kc.loadFromDefault();
    this.k8sApi = this.kc.makeApiClient(k8s.AppsV1Api);
    
    this.deploymentName = process.env.K8S_DEPLOYMENT_NAME;
    this.namespace = process.env.K8S_NAMESPACE;
    
    this.metrics = {
      cpuThreshold: 80, // 80% CPU gebruik
      memoryThreshold: 85, // 85% geheugen gebruik
      requestLatencyThreshold: 500, // 500ms
    };
  }

  async scaleDeployment(replicas) {
    try {
      const deployment = await this.k8sApi.readNamespacedDeployment(
        this.deploymentName,
        this.namespace
      );
      
      deployment.body.spec.replicas = replicas;
      
      await this.k8sApi.replaceNamespacedDeployment(
        this.deploymentName,
        this.namespace,
        deployment.body
      );
      
      logger.info(`Scaled deployment ${this.deploymentName} to ${replicas} replicas`);
      return true;
    } catch (error) {
      logger.error('Error scaling deployment:', error);
      throw error;
    }
  }

  async getCurrentMetrics() {
    try {
      const metricsResponse = await monitoringService.getMetrics();
      
      // Parse metrics en bereken gemiddelden
      const metrics = {
        cpuUsage: 0,
        memoryUsage: 0,
        requestLatency: 0,
        activeUsers: 0
      };
      
      // Hier zouden we de prometheus metrics moeten parsen
      // Voor nu gebruiken we dummy data
      metrics.cpuUsage = Math.random() * 100;
      metrics.memoryUsage = Math.random() * 100;
      metrics.requestLatency = Math.random() * 1000;
      metrics.activeUsers = Math.floor(Math.random() * 1000);
      
      return metrics;
    } catch (error) {
      logger.error('Error getting current metrics:', error);
      throw error;
    }
  }

  async checkScaling() {
    try {
      const metrics = await this.getCurrentMetrics();
      const deployment = await this.k8sApi.readNamespacedDeployment(
        this.deploymentName,
        this.namespace
      );
      
      const currentReplicas = deployment.body.spec.replicas;
      let newReplicas = currentReplicas;
      
      // Scale up conditions
      if (
        metrics.cpuUsage > this.metrics.cpuThreshold ||
        metrics.memoryUsage > this.metrics.memoryThreshold ||
        metrics.requestLatency > this.metrics.requestLatencyThreshold
      ) {
        newReplicas = currentReplicas + 1;
      }
      
      // Scale down conditions
      if (
        metrics.cpuUsage < this.metrics.cpuThreshold / 2 &&
        metrics.memoryUsage < this.metrics.memoryThreshold / 2 &&
        metrics.requestLatency < this.metrics.requestLatencyThreshold / 2
      ) {
        newReplicas = Math.max(1, currentReplicas - 1);
      }
      
      // Apply scaling if needed
      if (newReplicas !== currentReplicas) {
        await this.scaleDeployment(newReplicas);
        logger.info(`Auto-scaled from ${currentReplicas} to ${newReplicas} replicas`);
      }
      
      return {
        currentReplicas,
        newReplicas,
        metrics
      };
    } catch (error) {
      logger.error('Error checking scaling:', error);
      throw error;
    }
  }

  async getScalingHistory() {
    try {
      const events = await this.k8sApi.listNamespacedEvent(this.namespace);
      
      return events.body.items
        .filter(event => event.involvedObject.name === this.deploymentName)
        .map(event => ({
          timestamp: event.lastTimestamp,
          type: event.type,
          reason: event.reason,
          message: event.message
        }));
    } catch (error) {
      logger.error('Error getting scaling history:', error);
      throw error;
    }
  }

  async setScalingThresholds(thresholds) {
    try {
      this.metrics = {
        ...this.metrics,
        ...thresholds
      };
      
      logger.info('Updated scaling thresholds:', this.metrics);
      return this.metrics;
    } catch (error) {
      logger.error('Error setting scaling thresholds:', error);
      throw error;
    }
  }
}

module.exports = new ScalingService();
