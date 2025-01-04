export default {
  optimization: {
    readability: {
      minScore: 70,
      targetScore: 80
    },
    keywords: {
      minDensity: 0.5,
      maxDensity: 2.5,
      minCount: 3
    },
    content: {
      minLength: 300,
      optimalLength: 1500
    },
    headings: {
      requireH1: true,
      maxH1Count: 1,
      minH2Count: 2
    },
    meta: {
      titleMinLength: 30,
      titleMaxLength: 60,
      descriptionMinLength: 120,
      descriptionMaxLength: 155
    }
  },
  scheduling: {
    dailyOptimization: '0 2 * * *',  // Every day at 2 AM
    weeklyAnalysis: '0 3 * * 0',     // Every Sunday at 3 AM
    maxConcurrentTasks: 5,
    delayBetweenTasks: 1000          // 1 second
  },
  competitors: {
    maxCompetitorsToAnalyze: 10,
    analysisDepth: 'deep',           // 'basic', 'standard', or 'deep'
    metrics: [
      'contentLength',
      'keywordDensity',
      'headingStructure',
      'readabilityScore',
      'internalLinks',
      'imageOptimization'
    ]
  },
  ai: {
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 1500
  }
};
