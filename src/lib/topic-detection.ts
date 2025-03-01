/**
 * Topic detection utility for posts
 * This uses a simple keyword-based approach to detect topics from post content
 * In a production environment, you might want to use a more sophisticated NLP approach
 */

// Define topic keywords - these can be expanded over time
const topicKeywords: Record<string, string[]> = {
  tech: [
    'programming', 'code', 'developer', 'software', 'app', 'technology',
    'tech', 'ai', 'machine learning', 'data', 'algorithm', 'computer',
    'cloud', 'api', 'frontend', 'backend', 'fullstack', 'devops',
    'javascript', 'typescript', 'python', 'java', 'react', 'angular',
    'vue', 'node', 'database', 'sql', 'nosql', 'blockchain', 'crypto',
    'web3', 'nft', 'saas', 'startup', 'product', 'engineering', 'github',
    'git', 'repository', 'code review', 'pull request', 'commit', 'merge',
    'deployment', 'ci/cd', 'infrastructure', 'server', 'aws', 'azure', 'gcp'
  ],
  design: [
    'design', 'ui', 'ux', 'user interface', 'user experience', 'graphic',
    'visual', 'creative', 'art', 'illustration', 'typography', 'layout',
    'wireframe', 'prototype', 'figma', 'sketch', 'adobe', 'photoshop',
    'illustrator', 'color', 'aesthetic', 'brand', 'logo', 'icon', 'usability',
    'accessibility', 'a11y', 'responsive', 'mobile', 'desktop', 'web design',
    'product design', 'interaction', 'animation', 'motion', '3d', 'rendering'
  ],
  marketing: [
    'marketing', 'brand', 'social media', 'content', 'seo', 'ppc', 'ads',
    'campaign', 'audience', 'customer', 'analytics', 'conversion', 'funnel',
    'growth', 'strategy', 'engagement', 'email', 'newsletter', 'copywriting',
    'advertising', 'promotion', 'market', 'sales', 'lead', 'acquisition',
    'retention', 'churn', 'cac', 'ltv', 'roi', 'kpi', 'metric', 'performance',
    'ab test', 'split test', 'landing page', 'cta', 'call to action'
  ],
  business: [
    'business', 'startup', 'entrepreneur', 'founder', 'ceo', 'executive',
    'leadership', 'management', 'strategy', 'finance', 'investment', 'funding',
    'venture capital', 'vc', 'angel', 'pitch', 'revenue', 'profit', 'scaling',
    'operations', 'hr', 'team', 'hiring', 'recruitment', 'company', 'enterprise',
    'board', 'investor', 'stakeholder', 'shareholder', 'equity', 'valuation',
    'exit', 'acquisition', 'ipo', 'merger', 'partnership', 'alliance'
  ],
  health: [
    'health', 'wellness', 'fitness', 'exercise', 'workout', 'nutrition',
    'diet', 'mental health', 'meditation', 'mindfulness', 'yoga', 'running',
    'cycling', 'gym', 'strength', 'cardio', 'healthcare', 'medical', 'doctor',
    'patient', 'hospital', 'clinic', 'therapy', 'medicine', 'treatment'
  ],
  education: [
    'education', 'learning', 'teaching', 'school', 'university', 'college',
    'course', 'class', 'lecture', 'student', 'professor', 'teacher', 'academic',
    'study', 'research', 'knowledge', 'skill', 'training', 'workshop', 'bootcamp',
    'certification', 'degree', 'curriculum', 'e-learning', 'online learning'
  ]
};

/**
 * Detect the most likely topic from post content
 * @param content The post content to analyze
 * @returns The detected topic or undefined if no clear topic is found
 */
export function detectTopicFromContent(content: string): string | undefined {
  if (!content || content.trim().length === 0) {
    return undefined;
  }

  const normalizedContent = content.toLowerCase();
  const contentWords = normalizedContent.split(/\s+/).length;
  const topicScores: Record<string, number> = {};

  // Initialize scores for all topics
  Object.keys(topicKeywords).forEach(topic => {
    topicScores[topic] = 0;
  });

  // Calculate score for each topic based on keyword matches
  Object.entries(topicKeywords).forEach(([topic, keywords]) => {
    // Track unique keyword matches to avoid over-counting repeated terms
    const matchedKeywords = new Set<string>();
    
    keywords.forEach(keyword => {
      // For multi-word keywords, use a more flexible matching approach
      if (keyword.includes(' ')) {
        if (normalizedContent.includes(keyword)) {
          matchedKeywords.add(keyword);
          // Give higher weight to multi-word matches as they're more specific
          topicScores[topic] += 2;
        }
      } else {
        // For single-word keywords, use word boundary matching
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = normalizedContent.match(regex);
        
        if (matches && matches.length > 0) {
          matchedKeywords.add(keyword);
          // Score based on frequency but with diminishing returns
          topicScores[topic] += Math.min(matches.length, 3);
        }
      }
    });
    
    // Adjust score based on content length and keyword diversity
    if (matchedKeywords.size > 0) {
      // Bonus for having multiple unique keywords (topic diversity)
      const diversityBonus = Math.min(matchedKeywords.size / 3, 2);
      topicScores[topic] *= (1 + diversityBonus);
      
      // Normalize by content length to avoid bias toward longer posts
      // but maintain a minimum threshold for very short content
      const lengthFactor = Math.max(contentWords / 50, 1);
      topicScores[topic] = topicScores[topic] / lengthFactor;
    }
  });

  // Find the topic with the highest score
  let maxScore = 0;
  let detectedTopic: string | undefined = undefined;

  Object.entries(topicScores).forEach(([topic, score]) => {
    if (score > maxScore) {
      maxScore = score;
      detectedTopic = topic;
    }
  });

  // Calculate confidence as the difference between the top score and the runner-up
  let runnerUpScore = 0;
  Object.entries(topicScores).forEach(([topic, score]) => {
    if (topic !== detectedTopic && score > runnerUpScore) {
      runnerUpScore = score;
    }
  });
  
  const confidence = maxScore > 0 ? (maxScore - runnerUpScore) / maxScore : 0;
  
  // Only return a topic if the score is above a threshold and we have reasonable confidence
  return (maxScore >= 2 && confidence >= 0.2) ? detectedTopic : undefined;
}

/**
 * Get all available topics
 * @returns Array of topic IDs
 */
export function getAvailableTopics(): string[] {
  return ['all', ...Object.keys(topicKeywords)];
}

/**
 * Get topic display information
 * @returns Array of topic objects with id and label
 */
export function getTopicDisplayInfo(): Array<{id: string, label: string}> {
  return [
    { id: 'all', label: 'All' },
    ...Object.keys(topicKeywords).map(topic => ({
      id: topic,
      label: topic.charAt(0).toUpperCase() + topic.slice(1)
    }))
  ];
}

/**
 * Get detailed topic scores for a given content
 * This is useful for debugging and analytics
 * @param content The post content to analyze
 * @returns Object containing detailed topic scores and confidence values
 */
export function getTopicScoreDetails(content: string): {
  scores: Record<string, number>;
  detectedTopic: string | undefined;
  confidence: number;
  keywordMatches: Record<string, string[]>;
} {
  if (!content || content.trim().length === 0) {
    return {
      scores: {},
      detectedTopic: undefined,
      confidence: 0,
      keywordMatches: {}
    };
  }

  const normalizedContent = content.toLowerCase();
  const contentWords = normalizedContent.split(/\s+/).length;
  const topicScores: Record<string, number> = {};
  const keywordMatches: Record<string, string[]> = {};

  // Initialize scores for all topics
  Object.keys(topicKeywords).forEach(topic => {
    topicScores[topic] = 0;
    keywordMatches[topic] = [];
  });

  // Calculate score for each topic based on keyword matches
  Object.entries(topicKeywords).forEach(([topic, keywords]) => {
    // Track unique keyword matches to avoid over-counting repeated terms
    const matchedKeywords = new Set<string>();
    
    keywords.forEach(keyword => {
      // For multi-word keywords, use a more flexible matching approach
      if (keyword.includes(' ')) {
        if (normalizedContent.includes(keyword)) {
          matchedKeywords.add(keyword);
          keywordMatches[topic].push(keyword);
          // Give higher weight to multi-word matches as they're more specific
          topicScores[topic] += 2;
        }
      } else {
        // For single-word keywords, use word boundary matching
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = normalizedContent.match(regex);
        
        if (matches && matches.length > 0) {
          matchedKeywords.add(keyword);
          keywordMatches[topic].push(keyword);
          // Score based on frequency but with diminishing returns
          topicScores[topic] += Math.min(matches.length, 3);
        }
      }
    });
    
    // Adjust score based on content length and keyword diversity
    if (matchedKeywords.size > 0) {
      // Bonus for having multiple unique keywords (topic diversity)
      const diversityBonus = Math.min(matchedKeywords.size / 3, 2);
      topicScores[topic] *= (1 + diversityBonus);
      
      // Normalize by content length to avoid bias toward longer posts
      // but maintain a minimum threshold for very short content
      const lengthFactor = Math.max(contentWords / 50, 1);
      topicScores[topic] = topicScores[topic] / lengthFactor;
    }
  });

  // Find the topic with the highest score
  let maxScore = 0;
  let detectedTopic: string | undefined = undefined;

  Object.entries(topicScores).forEach(([topic, score]) => {
    if (score > maxScore) {
      maxScore = score;
      detectedTopic = topic;
    }
  });

  // Calculate confidence as the difference between the top score and the runner-up
  let runnerUpScore = 0;
  Object.entries(topicScores).forEach(([topic, score]) => {
    if (topic !== detectedTopic && score > runnerUpScore) {
      runnerUpScore = score;
    }
  });
  
  const confidence = maxScore > 0 ? (maxScore - runnerUpScore) / maxScore : 0;
  
  return {
    scores: topicScores,
    detectedTopic: (maxScore >= 2 && confidence >= 0.2) ? detectedTopic : undefined,
    confidence,
    keywordMatches
  };
}
