import apiFetch from '@wordpress/api-fetch';
import licenseService from './licenseService.js';
import OpenAI from 'openai';
import { logger } from '../utils/logger.js';
import { ContentOptimizationService } from './contentOptimization.js';

class WordPressService {
  constructor() {
    this.initialized = false;
    this.contentOptimizer = new ContentOptimizationService();
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  initialize(config, licenseKey) {
    if (!licenseService.verifyLicense(licenseKey, config.domain)) {
      throw new Error('Ongeldige licentie voor WordPress integratie');
    }

    // Configure the root URL for WordPress API requests
    apiFetch.use(apiFetch.createRootURLMiddleware(config.domain + '/wp-json'));

    // Add authentication if needed
    if (config.username && config.password) {
      const credentials = btoa(`${config.username}:${config.password}`);
      apiFetch.use(apiFetch.createNonceMiddleware(credentials));
    }

    this.initialized = true;
  }

  async getPosts(options = {}) {
    if (!this.initialized) {
      throw new Error('WordPress service niet geïnitialiseerd');
    }

    try {
      return await apiFetch({
        path: '/wp/v2/posts',
        method: 'GET',
        ...options
      });
    } catch (error) {
      throw new Error(`WordPress posts ophalen mislukt: ${error.message}`);
    }
  }

  async getPages(options = {}) {
    if (!this.initialized) {
      throw new Error('WordPress service niet geïnitialiseerd');
    }

    try {
      return await apiFetch({
        path: '/wp/v2/pages',
        method: 'GET',
        ...options
      });
    } catch (error) {
      throw new Error(`WordPress pagina's ophalen mislukt: ${error.message}`);
    }
  }

  async createPost(postData) {
    if (!this.initialized) {
      throw new Error('WordPress service niet geïnitialiseerd');
    }

    try {
      return await apiFetch({
        path: '/wp/v2/posts',
        method: 'POST',
        data: postData
      });
    } catch (error) {
      throw new Error(`WordPress post aanmaken mislukt: ${error.message}`);
    }
  }

  async updatePost(postId, postData) {
    if (!this.initialized) {
      throw new Error('WordPress service niet geïnitialiseerd');
    }

    try {
      return await apiFetch({
        path: `/wp/v2/posts/${postId}`,
        method: 'PUT',
        data: postData
      });
    } catch (error) {
      throw new Error(`WordPress post bijwerken mislukt: ${error.message}`);
    }
  }

  async getCategories(options = {}) {
    if (!this.initialized) {
      throw new Error('WordPress service niet geïnitialiseerd');
    }

    try {
      return await apiFetch({
        path: '/wp/v2/categories',
        method: 'GET',
        ...options
      });
    } catch (error) {
      throw new Error(`WordPress categorieën ophalen mislukt: ${error.message}`);
    }
  }

  async getTags(options = {}) {
    if (!this.initialized) {
      throw new Error('WordPress service niet geïnitialiseerd');
    }

    try {
      return await apiFetch({
        path: '/wp/v2/tags',
        method: 'GET',
        ...options
      });
    } catch (error) {
      throw new Error(`WordPress tags ophalen mislukt: ${error.message}`);
    }
  }

  async analyzeContentSEO(content, url) {
    if (!this.initialized) {
      throw new Error('WordPress service niet geïnitialiseerd');
    }

    try {
      // Analyze content structure and SEO elements
      const analysis = {
        titleLength: this.analyzeTitleLength(content.title),
        keywordDensity: this.analyzeKeywordDensity(content.content, content.keywords),
        headingStructure: this.analyzeHeadingStructure(content.content),
        metaDescription: this.analyzeMetaDescription(content.meta_description),
        contentLength: this.analyzeContentLength(content.content),
        readabilityScore: await this.calculateReadabilityScore(content.content),
        internalLinks: await this.analyzeInternalLinks(content.content, url),
        imageOptimization: this.analyzeImages(content.content),
        competitorComparison: await this.analyzeCompetitors(url, content.keywords)
      };

      return {
        analysis,
        improvements: await this.generateImprovements(analysis, content)
      };
    } catch (error) {
      logger.error('SEO analysis failed:', error);
      throw new Error(`SEO analyse mislukt: ${error.message}`);
    }
  }

  async optimizeContent(contentId, contentType = 'post') {
    try {
      // Get current content
      let content;
      switch(contentType) {
        case 'post':
          content = await this.getPost(contentId);
          break;
        case 'page':
          content = await this.getPage(contentId);
          break;
        case 'product':
          content = await this.getProduct(contentId);
          break;
        default:
          throw new Error('Ongeldig content type');
      }

      // Analyze current SEO status
      const analysis = await this.analyzeContentSEO(content, content.link);

      // Generate optimized content using AI
      const optimizedContent = await this.generateOptimizedContent(content, analysis);

      // Update the content
      switch(contentType) {
        case 'post':
          await this.updatePost(contentId, optimizedContent);
          break;
        case 'page':
          await this.updatePage(contentId, optimizedContent);
          break;
        case 'product':
          await this.updateProduct(contentId, optimizedContent);
          break;
      }

      return {
        success: true,
        improvements: analysis.improvements,
        changes: this.compareContent(content, optimizedContent)
      };
    } catch (error) {
      logger.error('Content optimization failed:', error);
      throw new Error(`Content optimalisatie mislukt: ${error.message}`);
    }
  }

  async scheduleOptimizations() {
    try {
      // Get all content types
      const [posts, pages, products] = await Promise.all([
        this.getPosts({ per_page: 100 }),
        this.getPages({ per_page: 100 }),
        this.getProducts({ per_page: 100 })
      ]);

      // Analyze and optimize each content piece
      const optimizationTasks = [
        ...posts.map(post => this.optimizeContent(post.id, 'post')),
        ...pages.map(page => this.optimizeContent(page.id, 'page')),
        ...products.map(product => this.optimizeContent(product.id, 'product'))
      ];

      // Run optimizations with rate limiting
      const results = await this.runWithRateLimit(optimizationTasks, 5); // 5 concurrent tasks

      return {
        success: true,
        totalOptimized: results.length,
        results
      };
    } catch (error) {
      logger.error('Scheduled optimizations failed:', error);
      throw new Error(`Geplande optimalisaties mislukt: ${error.message}`);
    }
  }

  private async analyzeCompetitors(url, keywords) {
    try {
      const prompt = `Analyze the top 10 competing pages for the URL ${url} and keywords ${keywords.join(', ')}. 
                     Identify their SEO strategies, content structure, and key differentiators.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an SEO expert analyzing competitor websites."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7
      });

      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      logger.error('Competitor analysis failed:', error);
      throw error;
    }
  }

  private async generateOptimizedContent(content, analysis) {
    try {
      const prompt = `Optimize the following content based on the SEO analysis:
                     Content: ${JSON.stringify(content)}
                     Analysis: ${JSON.stringify(analysis)}
                     
                     Requirements:
                     1. Maintain the original message and tone
                     2. Improve keyword placement and density
                     3. Enhance readability and structure
                     4. Optimize meta descriptions and titles
                     5. Suggest internal linking opportunities`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an SEO expert optimizing website content."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7
      });

      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      logger.error('Content optimization generation failed:', error);
      throw error;
    }
  }

  private async runWithRateLimit(tasks, concurrency) {
    const results = [];
    for (let i = 0; i < tasks.length; i += concurrency) {
      const batch = tasks.slice(i, i + concurrency);
      const batchResults = await Promise.all(batch);
      results.push(...batchResults);
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay between batches
    }
    return results;
  }

  private analyzeTitleLength(title) {
    const length = title.length;
    return {
      length,
      optimal: length >= 30 && length <= 60,
      recommendation: length < 30 ? 'Title is too short' : length > 60 ? 'Title is too long' : 'Title length is optimal'
    };
  }

  private analyzeKeywordDensity(content, keywords) {
    return keywords.map(keyword => {
      const regex = new RegExp(keyword, 'gi');
      const matches = content.match(regex) || [];
      const wordCount = content.split(/\s+/).length;
      const density = (matches.length / wordCount) * 100;

      return {
        keyword,
        density,
        count: matches.length,
        optimal: density >= 0.5 && density <= 2.5
      };
    });
  }

  private analyzeHeadingStructure(content) {
    const headings = {
      h1: (content.match(/<h1[^>]*>.*?<\/h1>/g) || []).length,
      h2: (content.match(/<h2[^>]*>.*?<\/h2>/g) || []).length,
      h3: (content.match(/<h3[^>]*>.*?<\/h3>/g) || []).length,
      h4: (content.match(/<h4[^>]*>.*?<\/h4>/g) || []).length
    };

    return {
      headings,
      optimal: headings.h1 === 1 && headings.h2 > 0,
      recommendations: []
    };
  }

  private async calculateReadabilityScore(content) {
    // Strip HTML tags
    const plainText = content.replace(/<[^>]*>/g, '');
    
    // Calculate various readability metrics
    const sentences = plainText.split(/[.!?]+/).length;
    const words = plainText.split(/\s+/).length;
    const syllables = this.countSyllables(plainText);
    
    // Calculate Flesch Reading Ease score
    const fleschScore = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
    
    return {
      score: fleschScore,
      level: this.getReadabilityLevel(fleschScore),
      recommendations: this.getReadabilityRecommendations(fleschScore)
    };
  }

  private countSyllables(text) {
    return text.toLowerCase()
               .replace(/[^a-z]/g, '')
               .replace(/[^aeiou]+/g, ' ')
               .trim()
               .split(' ')
               .length;
  }

  private getReadabilityLevel(score) {
    if (score >= 90) return 'Very Easy';
    if (score >= 80) return 'Easy';
    if (score >= 70) return 'Fairly Easy';
    if (score >= 60) return 'Standard';
    if (score >= 50) return 'Fairly Difficult';
    if (score >= 30) return 'Difficult';
    return 'Very Difficult';
  }

  private async getProduct(productId) {
    try {
      return await apiFetch({
        path: `/wc/v3/products/${productId}`,
        method: 'GET'
      });
    } catch (error) {
      throw new Error(`Product ophalen mislukt: ${error.message}`);
    }
  }

  private async updateProduct(productId, productData) {
    try {
      return await apiFetch({
        path: `/wc/v3/products/${productId}`,
        method: 'PUT',
        data: productData
      });
    } catch (error) {
      throw new Error(`Product bijwerken mislukt: ${error.message}`);
    }
  }

  private async getProducts(options = {}) {
    try {
      return await apiFetch({
        path: '/wc/v3/products',
        method: 'GET',
        ...options
      });
    } catch (error) {
      throw new Error(`Products ophalen mislukt: ${error.message}`);
    }
  }

  private compareContent(oldContent, newContent) {
    return {
      titleChanged: oldContent.title !== newContent.title,
      contentChanged: oldContent.content !== newContent.content,
      metaChanged: oldContent.meta_description !== newContent.meta_description,
      keywordsAdded: this.compareKeywords(oldContent.keywords, newContent.keywords)
    };
  }
}

export default new WordPressService();
