import mongoose from 'mongoose';
import { BaseModel } from './baseModel.js';

const productSchema = new mongoose.Schema({
  wooId: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['simple', 'variable', 'grouped', 'external'],
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'private', 'publish'],
    default: 'publish'
  },
  featured: {
    type: Boolean,
    default: false
  },
  description: String,
  shortDescription: String,
  sku: {
    type: String,
    trim: true
  },
  price: {
    regular: {
      type: Number,
      required: true,
      min: 0
    },
    sale: {
      type: Number,
      min: 0
    },
    saleStart: Date,
    saleEnd: Date
  },
  taxStatus: {
    type: String,
    enum: ['taxable', 'shipping', 'none'],
    default: 'taxable'
  },
  taxClass: String,
  manageStock: {
    type: Boolean,
    default: false
  },
  stockQuantity: Number,
  stockStatus: {
    type: String,
    enum: ['instock', 'outofstock', 'onbackorder'],
    default: 'instock'
  },
  backorders: {
    type: String,
    enum: ['no', 'notify', 'yes'],
    default: 'no'
  },
  weight: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  shippingClass: String,
  images: [{
    wooId: Number,
    src: String,
    alt: String
  }],
  attributes: [{
    name: String,
    position: Number,
    visible: Boolean,
    variation: Boolean,
    options: [String]
  }],
  categories: [{
    wooId: Number,
    name: String,
    slug: String
  }],
  tags: [{
    wooId: Number,
    name: String,
    slug: String
  }],
  variations: [{
    wooId: Number,
    attributes: [{
      name: String,
      option: String
    }],
    price: {
      regular: Number,
      sale: Number
    },
    stockQuantity: Number,
    stockStatus: String
  }],
  metaData: [{
    key: String,
    value: mongoose.Schema.Types.Mixed
  }],
  seoData: {
    title: String,
    description: String,
    keywords: [String],
    score: Number
  }
});

const orderSchema = new mongoose.Schema({
  wooId: {
    type: Number,
    required: true
  },
  parentId: Number,
  status: {
    type: String,
    enum: [
      'pending',
      'processing',
      'on-hold',
      'completed',
      'cancelled',
      'refunded',
      'failed'
    ],
    required: true
  },
  currency: {
    type: String,
    required: true
  },
  dateCreated: {
    type: Date,
    required: true
  },
  dateModified: {
    type: Date,
    required: true
  },
  discountTotal: {
    type: Number,
    default: 0
  },
  discountTax: {
    type: Number,
    default: 0
  },
  shippingTotal: {
    type: Number,
    default: 0
  },
  shippingTax: {
    type: Number,
    default: 0
  },
  cartTax: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  totalTax: {
    type: Number,
    default: 0
  },
  customerId: {
    type: Number,
    default: 0
  },
  orderKey: String,
  billing: {
    firstName: String,
    lastName: String,
    company: String,
    address1: String,
    address2: String,
    city: String,
    state: String,
    postcode: String,
    country: String,
    email: String,
    phone: String
  },
  shipping: {
    firstName: String,
    lastName: String,
    company: String,
    address1: String,
    address2: String,
    city: String,
    state: String,
    postcode: String,
    country: String
  },
  paymentMethod: String,
  paymentMethodTitle: String,
  transactionId: String,
  customerNote: String,
  lineItems: [{
    wooId: Number,
    name: String,
    productId: Number,
    variationId: Number,
    quantity: Number,
    taxClass: String,
    subtotal: Number,
    subtotalTax: Number,
    total: Number,
    totalTax: Number,
    taxes: [{
      id: Number,
      total: Number,
      subtotal: Number
    }],
    metaData: [{
      key: String,
      value: mongoose.Schema.Types.Mixed
    }]
  }],
  taxLines: [{
    wooId: Number,
    rateCode: String,
    rateId: Number,
    label: String,
    compound: Boolean,
    taxTotal: Number,
    shippingTaxTotal: Number,
    metaData: [{
      key: String,
      value: mongoose.Schema.Types.Mixed
    }]
  }],
  shippingLines: [{
    wooId: Number,
    methodTitle: String,
    methodId: String,
    total: Number,
    totalTax: Number,
    taxes: [{
      id: Number,
      total: Number,
      subtotal: Number
    }],
    metaData: [{
      key: String,
      value: mongoose.Schema.Types.Mixed
    }]
  }],
  feeLines: [{
    wooId: Number,
    name: String,
    taxClass: String,
    taxStatus: String,
    total: Number,
    totalTax: Number,
    taxes: [{
      id: Number,
      total: Number,
      subtotal: Number
    }],
    metaData: [{
      key: String,
      value: mongoose.Schema.Types.Mixed
    }]
  }],
  couponLines: [{
    wooId: Number,
    code: String,
    discount: Number,
    discountTax: Number,
    metaData: [{
      key: String,
      value: mongoose.Schema.Types.Mixed
    }]
  }],
  refunds: [{
    wooId: Number,
    reason: String,
    total: Number
  }],
  metaData: [{
    key: String,
    value: mongoose.Schema.Types.Mixed
  }],
  analyticsData: {
    source: String,
    medium: String,
    campaign: String,
    term: String,
    content: String
  }
});

const customerSchema = new mongoose.Schema({
  wooId: {
    type: Number,
    required: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  firstName: String,
  lastName: String,
  role: {
    type: String,
    default: 'customer'
  },
  username: String,
  billing: {
    firstName: String,
    lastName: String,
    company: String,
    address1: String,
    address2: String,
    city: String,
    state: String,
    postcode: String,
    country: String,
    email: String,
    phone: String
  },
  shipping: {
    firstName: String,
    lastName: String,
    company: String,
    address1: String,
    address2: String,
    city: String,
    state: String,
    postcode: String,
    country: String
  },
  isPayingCustomer: {
    type: Boolean,
    default: false
  },
  avatarUrl: String,
  metaData: [{
    key: String,
    value: mongoose.Schema.Types.Mixed
  }],
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  totalSpent: {
    type: Number,
    default: 0
  },
  lastOrder: {
    type: Date
  },
  analyticsData: {
    firstVisit: Date,
    lastVisit: Date,
    totalVisits: Number,
    source: String,
    medium: String
  }
});

// Schema definitie
const schema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  storeUrl: {
    type: String,
    required: true,
    trim: true
  },
  consumerKey: {
    type: String,
    required: true
  },
  consumerSecret: {
    type: String,
    required: true
  },
  products: [productSchema],
  orders: [orderSchema],
  customers: [customerSchema],
  settings: {
    sync: {
      products: {
        enabled: {
          type: Boolean,
          default: true
        },
        interval: {
          type: String,
          enum: ['realtime', 'hourly', 'daily'],
          default: 'hourly'
        }
      },
      orders: {
        enabled: {
          type: Boolean,
          default: true
        },
        interval: {
          type: String,
          enum: ['realtime', 'hourly', 'daily'],
          default: 'realtime'
        }
      },
      customers: {
        enabled: {
          type: Boolean,
          default: true
        },
        interval: {
          type: String,
          enum: ['realtime', 'hourly', 'daily'],
          default: 'daily'
        }
      }
    },
    webhooks: {
      enabled: {
        type: Boolean,
        default: true
      },
      secret: String,
      endpoints: [{
        topic: String,
        url: String,
        status: String
      }]
    },
    analytics: {
      tracking: {
        enabled: {
          type: Boolean,
          default: true
        },
        utmParameters: {
          type: Boolean,
          default: true
        }
      },
      reporting: {
        enabled: {
          type: Boolean,
          default: true
        },
        schedule: String,
        recipients: [String]
      }
    }
  }
});

// Indexes
schema.index({ projectId: 1, storeUrl: 1 }, { unique: true });
schema.index({ 'products.wooId': 1 });
schema.index({ 'orders.wooId': 1 });
schema.index({ 'customers.wooId': 1 });
schema.index({ 'products.sku': 1 });
schema.index({ 'orders.dateCreated': 1 });
schema.index({ 'customers.email': 1 });

export class WooCommerceModel extends BaseModel {
  constructor() {
    super('WooCommerce', schema);
  }

  /**
   * Voeg product toe of update bestaand product
   */
  async upsertProduct(projectId, product) {
    const doc = await this.model.findOne({ projectId });
    if (!doc) return null;

    const index = doc.products.findIndex(p => p.wooId === product.wooId);
    if (index > -1) {
      doc.products[index] = product;
    } else {
      doc.products.push(product);
    }

    return doc.save();
  }

  /**
   * Voeg order toe of update bestaande order
   */
  async upsertOrder(projectId, order) {
    const doc = await this.model.findOne({ projectId });
    if (!doc) return null;

    const index = doc.orders.findIndex(o => o.wooId === order.wooId);
    if (index > -1) {
      doc.orders[index] = order;
    } else {
      doc.orders.push(order);
    }

    return doc.save();
  }

  /**
   * Voeg klant toe of update bestaande klant
   */
  async upsertCustomer(projectId, customer) {
    const doc = await this.model.findOne({ projectId });
    if (!doc) return null;

    const index = doc.customers.findIndex(c => c.wooId === customer.wooId);
    if (index > -1) {
      doc.customers[index] = customer;
    } else {
      doc.customers.push(customer);
    }

    return doc.save();
  }

  /**
   * Update product voorraad
   */
  async updateProductStock(projectId, wooId, quantity, stockStatus) {
    return this.model.updateOne(
      { projectId, 'products.wooId': wooId },
      { 
        $set: { 
          'products.$.stockQuantity': quantity,
          'products.$.stockStatus': stockStatus
        }
      }
    );
  }

  /**
   * Update order status
   */
  async updateOrderStatus(projectId, wooId, status) {
    return this.model.updateOne(
      { projectId, 'orders.wooId': wooId },
      { $set: { 'orders.$.status': status } }
    );
  }

  /**
   * Haal producten op met filters
   */
  async getProducts(projectId, filters = {}) {
    const doc = await this.model.findOne({ projectId });
    if (!doc) return null;

    return doc.products.filter(product => {
      return Object.entries(filters).every(([key, value]) => {
        if (key.includes('.')) {
          const [parent, child] = key.split('.');
          return product[parent] && product[parent][child] === value;
        }
        return product[key] === value;
      });
    });
  }

  /**
   * Haal orders op met filters
   */
  async getOrders(projectId, filters = {}) {
    const doc = await this.model.findOne({ projectId });
    if (!doc) return null;

    return doc.orders.filter(order => {
      return Object.entries(filters).every(([key, value]) => {
        if (key.includes('.')) {
          const [parent, child] = key.split('.');
          return order[parent] && order[parent][child] === value;
        }
        return order[key] === value;
      });
    });
  }

  /**
   * Haal klanten op met filters
   */
  async getCustomers(projectId, filters = {}) {
    const doc = await this.model.findOne({ projectId });
    if (!doc) return null;

    return doc.customers.filter(customer => {
      return Object.entries(filters).every(([key, value]) => {
        if (key.includes('.')) {
          const [parent, child] = key.split('.');
          return customer[parent] && customer[parent][child] === value;
        }
        return customer[key] === value;
      });
    });
  }
}
