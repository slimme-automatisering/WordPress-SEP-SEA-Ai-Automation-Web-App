from flask import Flask, request, jsonify
import nltk
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import requests
import os
from dotenv import load_dotenv
from prometheus_client import Counter, Histogram, start_http_server

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Metrics
KEYWORD_REQUESTS = Counter('keyword_requests_total', 'Total keyword research requests')
PROCESSING_TIME = Histogram('keyword_processing_seconds', 'Time spent processing keywords')

# Download required NLTK data
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('wordnet')

class KeywordResearch:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words='english')
        self.serp_api_key = os.getenv('SERP_API_KEY')
    
    def analyze_keyword(self, keyword):
        """Analyze a single keyword using SERP API"""
        try:
            params = {
                'q': keyword,
                'api_key': self.serp_api_key,
                'location': 'Netherlands'
            }
            response = requests.get('https://serpapi.com/search', params=params)
            data = response.json()
            
            return {
                'keyword': keyword,
                'search_volume': data.get('search_metadata', {}).get('total_results', 0),
                'related_searches': [item['query'] for item in data.get('related_searches', [])]
            }
        except Exception as e:
            app.logger.error(f"Error analyzing keyword {keyword}: {str(e)}")
            return None

    def find_related_keywords(self, seed_keyword):
        """Find related keywords using NLP"""
        tokens = nltk.word_tokenize(seed_keyword.lower())
        related = []
        
        # Use WordNet to find synonyms
        for token in tokens:
            synsets = nltk.wordnet.wordnet.synsets(token)
            for syn in synsets:
                for lemma in syn.lemmas():
                    if lemma.name() != token:
                        related.append(lemma.name())
        
        return list(set(related))

    def calculate_keyword_difficulty(self, serp_data):
        """Calculate keyword difficulty score"""
        # Simplified scoring based on number of SERP features and competition
        base_score = 50
        if 'ads' in serp_data:
            base_score += 10
        if 'knowledge_graph' in serp_data:
            base_score += 5
        if 'featured_snippet' in serp_data:
            base_score += 15
            
        return min(base_score, 100)

keyword_research = KeywordResearch()

@app.route('/health')
def health_check():
    return jsonify({'status': 'healthy'})

@app.route('/api/keywords/analyze', methods=['POST'])
def analyze_keywords():
    try:
        data = request.get_json()
        keywords = data.get('keywords', [])
        
        if not keywords:
            return jsonify({'error': 'No keywords provided'}), 400
            
        KEYWORD_REQUESTS.inc()
        
        results = []
        for keyword in keywords:
            # Analyze main keyword
            analysis = keyword_research.analyze_keyword(keyword)
            if analysis:
                # Find related keywords
                related = keyword_research.find_related_keywords(keyword)
                analysis['related_keywords'] = related
                
                # Calculate difficulty
                difficulty = keyword_research.calculate_keyword_difficulty(analysis)
                analysis['difficulty'] = difficulty
                
                results.append(analysis)
        
        return jsonify({
            'results': results,
            'total_keywords': len(results)
        })
        
    except Exception as e:
        app.logger.error(f"Error in keyword analysis: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/keywords/export', methods=['POST'])
def export_keywords():
    try:
        data = request.get_json()
        keywords = data.get('keywords', [])
        format = data.get('format', 'csv')
        
        if not keywords:
            return jsonify({'error': 'No keywords provided'}), 400
            
        df = pd.DataFrame(keywords)
        
        if format == 'csv':
            return df.to_csv(index=False)
        elif format == 'json':
            return df.to_json(orient='records')
        else:
            return jsonify({'error': 'Unsupported format'}), 400
            
    except Exception as e:
        app.logger.error(f"Error in keyword export: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Start metrics server
    start_http_server(8000)
    # Start Flask app
    app.run(host='0.0.0.0', port=5000)
