import { OpenAI } from 'openai';
import puppeteer from 'puppeteer';
import cheerio from 'cheerio';
import logger from '../utils/logger.js';

const openai = new OpenAI(process.env.OPENAI_API_KEY);

export const runAudit = async (req, res) => {
  try {
    const { url } = req.query;
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.goto(url);

    const html = await page.content();
    const $ = cheerio.load(html);

    const audit = {
      meta: {
        title: $('title').text(),
        description: $('meta[name="description"]').attr('content'),
      },
      headings: {
        h1: $('h1').length,
        h2: $('h2').length,
      },
      images: $('img').length,
      imagesWithoutAlt: $('img:not([alt])').length,
      links: $('a').length,
      performance: await page.metrics(),
    };

    await browser.close();
    res.json(audit);
  } catch (error) {
    logger.error('SEO Audit error:', error);
    res.status(500).json({ error: 'Audit uitvoering mislukt' });
  }
};

export const optimizeContent = async (req, res) => {
  try {
    const { content, keywords } = req.body;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "system",
        content: "Je bent een SEO expert die content optimaliseert."
      }, {
        role: "user",
        content: `Optimaliseer deze content voor de volgende keywords: ${keywords}\n\nContent: ${content}`
      }],
    });

    res.json({ 
      optimizedContent: completion.choices[0].message.content,
      suggestions: completion.choices[0].message.content.split('\n\n')[0]
    });
  } catch (error) {
    logger.error('Content optimalisatie error:', error);
    res.status(500).json({ error: 'Content optimalisatie mislukt' });
  }
}; 