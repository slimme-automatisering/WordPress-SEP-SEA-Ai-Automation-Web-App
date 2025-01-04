const AWS = require('aws-sdk');
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
const { logger } = require('../../utils/logger');
const config = require('../../config');

class BackupService {
  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION
    });
    
    this.backupBucket = process.env.AWS_BACKUP_BUCKET;
  }

  async createDatabaseBackup() {
    try {
      const client = await MongoClient.connect(config.mongoUri);
      const db = client.db();
      
      // Dump database
      const timestamp = new Date().toISOString();
      const backupPath = path.join(__dirname, `../../../backups/db-${timestamp}.gz`);
      
      const collections = await db.listCollections().toArray();
      const backup = {};
      
      for (const collection of collections) {
        const data = await db.collection(collection.name).find({}).toArray();
        backup[collection.name] = data;
      }
      
      // Write to file
      await fs.promises.writeFile(backupPath, JSON.stringify(backup));
      
      // Upload to S3
      const fileStream = fs.createReadStream(backupPath);
      
      await this.s3.upload({
        Bucket: this.backupBucket,
        Key: `database/db-${timestamp}.gz`,
        Body: fileStream
      }).promise();
      
      // Cleanup local file
      await fs.promises.unlink(backupPath);
      
      logger.info(`Database backup created successfully: db-${timestamp}.gz`);
      
      await client.close();
      return true;
    } catch (error) {
      logger.error('Error creating database backup:', error);
      throw error;
    }
  }

  async createFileBackup() {
    try {
      const timestamp = new Date().toISOString();
      const uploadsDir = path.join(__dirname, '../../../uploads');
      
      // Create zip of uploads directory
      const backupPath = path.join(__dirname, `../../../backups/files-${timestamp}.zip`);
      
      // Upload to S3
      const fileStream = fs.createReadStream(backupPath);
      
      await this.s3.upload({
        Bucket: this.backupBucket,
        Key: `files/files-${timestamp}.zip`,
        Body: fileStream
      }).promise();
      
      // Cleanup local file
      await fs.promises.unlink(backupPath);
      
      logger.info(`File backup created successfully: files-${timestamp}.zip`);
      return true;
    } catch (error) {
      logger.error('Error creating file backup:', error);
      throw error;
    }
  }

  async restoreFromBackup(backupId) {
    try {
      // Download backup from S3
      const response = await this.s3.getObject({
        Bucket: this.backupBucket,
        Key: `database/${backupId}`
      }).promise();
      
      const backup = JSON.parse(response.Body.toString());
      
      // Restore to database
      const client = await MongoClient.connect(config.mongoUri);
      const db = client.db();
      
      for (const [collection, data] of Object.entries(backup)) {
        await db.collection(collection).deleteMany({});
        if (data.length > 0) {
          await db.collection(collection).insertMany(data);
        }
      }
      
      await client.close();
      
      logger.info(`Database restored successfully from backup: ${backupId}`);
      return true;
    } catch (error) {
      logger.error('Error restoring from backup:', error);
      throw error;
    }
  }

  async listBackups() {
    try {
      const response = await this.s3.listObjects({
        Bucket: this.backupBucket,
        Prefix: 'database/'
      }).promise();
      
      return response.Contents.map(item => ({
        id: item.Key.replace('database/', ''),
        timestamp: item.LastModified,
        size: item.Size
      }));
    } catch (error) {
      logger.error('Error listing backups:', error);
      throw error;
    }
  }
}

module.exports = new BackupService();
