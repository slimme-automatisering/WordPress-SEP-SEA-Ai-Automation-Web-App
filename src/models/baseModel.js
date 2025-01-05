import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

export class BaseModel {
  constructor(name, schema) {
    // Voeg timestamps toe
    schema.set("timestamps", true);

    // Voeg standaard indexes toe
    schema.index({ createdAt: 1 });
    schema.index({ updatedAt: 1 });

    // Voeg standaard plugins toe
    schema.plugin(this.addVersioning);
    schema.plugin(this.addSoftDelete);
    schema.plugin(this.addQueryHelpers);

    // Creëer model
    this.model = mongoose.model(name, schema);
    this.logger = logger;
  }

  /**
   * Plugin voor document versioning
   */
  addVersioning(schema) {
    // Voeg version veld toe
    schema.add({ version: { type: Number, default: 1 } });

    // Increment version bij updates
    schema.pre("save", function (next) {
      if (this.isModified() && !this.isNew) {
        this.version++;
      }
      next();
    });
  }

  /**
   * Plugin voor soft delete
   */
  addSoftDelete(schema) {
    // Voeg deleted velden toe
    schema.add({
      deleted: { type: Boolean, default: false },
      deletedAt: { type: Date, default: null },
      deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
    });

    // Filter deleted documents uit queries
    schema.pre(/^find/, function () {
      if (!this.getQuery().includeDeleted) {
        this.where({ deleted: false });
      }
    });

    // Soft delete method
    schema.methods.softDelete = async function (userId) {
      this.deleted = true;
      this.deletedAt = new Date();
      this.deletedBy = userId;
      return this.save();
    };

    // Restore method
    schema.methods.restore = async function () {
      this.deleted = false;
      this.deletedAt = null;
      this.deletedBy = null;
      return this.save();
    };
  }

  /**
   * Plugin voor query helpers
   */
  addQueryHelpers(schema) {
    // Pagination helper
    schema.query.paginate = function (page = 1, limit = 10) {
      const skip = (page - 1) * limit;
      return this.skip(skip).limit(limit);
    };

    // Search helper
    schema.query.search = function (fields, searchTerm) {
      if (!searchTerm) return this;

      const searchQuery = fields.map((field) => ({
        [field]: { $regex: searchTerm, $options: "i" },
      }));

      return this.or(searchQuery);
    };

    // Filter helper
    schema.query.filterBy = function (filters = {}) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          this.where(key, value);
        }
      });
      return this;
    };

    // Sort helper
    schema.query.sortBy = function (sortField, sortOrder = "asc") {
      if (!sortField) return this;
      return this.sort({ [sortField]: sortOrder });
    };

    // Date range helper
    schema.query.dateRange = function (field, startDate, endDate) {
      if (!startDate && !endDate) return this;

      const dateQuery = {};
      if (startDate) dateQuery.$gte = new Date(startDate);
      if (endDate) dateQuery.$lte = new Date(endDate);

      return this.where(field, dateQuery);
    };
  }

  /**
   * Create document
   */
  async create(data) {
    try {
      const doc = new this.model(data);
      await doc.save();

      this.logger.info(`${this.model.modelName} created:`, {
        id: doc._id,
        data: doc.toObject(),
      });

      return doc;
    } catch (error) {
      this.logger.error(`${this.model.modelName} creation error:`, error);
      throw error;
    }
  }

  /**
   * Find document by ID
   */
  async findById(id, options = {}) {
    try {
      const doc = await this.model
        .findById(id)
        .select(options.select)
        .populate(options.populate);

      if (!doc) {
        this.logger.warn(`${this.model.modelName} not found:`, { id });
        return null;
      }

      return doc;
    } catch (error) {
      this.logger.error(`${this.model.modelName} find error:`, error);
      throw error;
    }
  }

  /**
   * Find documents
   */
  async find(query = {}, options = {}) {
    try {
      const {
        page,
        limit,
        sort,
        order,
        search,
        searchFields,
        dateField,
        startDate,
        endDate,
        select,
        populate,
      } = options;

      let dbQuery = this.model.find(query).select(select).populate(populate);

      // Apply search
      if (search && searchFields) {
        dbQuery = dbQuery.search(searchFields, search);
      }

      // Apply date range
      if (dateField && (startDate || endDate)) {
        dbQuery = dbQuery.dateRange(dateField, startDate, endDate);
      }

      // Apply sort
      if (sort) {
        dbQuery = dbQuery.sortBy(sort, order);
      }

      // Get total count
      const total = await this.model.countDocuments(dbQuery.getQuery());

      // Apply pagination
      if (page && limit) {
        dbQuery = dbQuery.paginate(page, limit);
      }

      // Execute query
      const docs = await dbQuery;

      return {
        data: docs,
        total,
        page: page || 1,
        limit: limit || docs.length,
        totalPages: limit ? Math.ceil(total / limit) : 1,
      };
    } catch (error) {
      this.logger.error(`${this.model.modelName} find error:`, error);
      throw error;
    }
  }

  /**
   * Update document
   */
  async update(id, data, options = {}) {
    try {
      const doc = await this.model.findById(id);
      if (!doc) {
        this.logger.warn(`${this.model.modelName} not found:`, { id });
        return null;
      }

      // Update fields
      Object.assign(doc, data);

      // Save with options
      await doc.save(options);

      this.logger.info(`${this.model.modelName} updated:`, {
        id,
        changes: data,
      });

      return doc;
    } catch (error) {
      this.logger.error(`${this.model.modelName} update error:`, error);
      throw error;
    }
  }

  /**
   * Delete document
   */
  async delete(id, userId) {
    try {
      const doc = await this.model.findById(id);
      if (!doc) {
        this.logger.warn(`${this.model.modelName} not found:`, { id });
        return null;
      }

      // Soft delete
      await doc.softDelete(userId);

      this.logger.info(`${this.model.modelName} deleted:`, {
        id,
        deletedBy: userId,
      });

      return doc;
    } catch (error) {
      this.logger.error(`${this.model.modelName} delete error:`, error);
      throw error;
    }
  }

  /**
   * Restore document
   */
  async restore(id) {
    try {
      const doc = await this.model.findById(id);
      if (!doc) {
        this.logger.warn(`${this.model.modelName} not found:`, { id });
        return null;
      }

      // Restore document
      await doc.restore();

      this.logger.info(`${this.model.modelName} restored:`, { id });

      return doc;
    } catch (error) {
      this.logger.error(`${this.model.modelName} restore error:`, error);
      throw error;
    }
  }

  /**
   * Bulk operations
   */
  async bulkWrite(operations, options = {}) {
    try {
      const result = await this.model.bulkWrite(operations, options);

      this.logger.info(`${this.model.modelName} bulk write completed:`, {
        matched: result.matchedCount,
        modified: result.modifiedCount,
        deleted: result.deletedCount,
      });

      return result;
    } catch (error) {
      this.logger.error(`${this.model.modelName} bulk write error:`, error);
      throw error;
    }
  }
}
