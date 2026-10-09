/**
 * AI Service for Complaint Categorization & Redressal Assistance
 * Provider abstraction supporting Google Gemini, OpenAI, and intelligent civic NLP analyzer.
 */

const callGemini = async (apiKey, prompt, categories) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const systemInstruction = `You are an AI assistant for JanSamadhan (Citizen Grievance Redressal System).
Analyze the complaint title and description and output strict JSON with fields:
- category: One of the available categories: ${JSON.stringify(categories)}
- department: The matching administrative department (must match category name)
- priority: "Low", "Medium", or "High" (based on severity/danger/urgency)
- confidence: integer percentage between 60 and 99
- reasoning: brief 1-2 sentence explanation
Output only valid JSON. Do not wrap in markdown or backticks.`;

  const body = {
    contents: [
      {
        parts: [
          { text: `${systemInstruction}\n\nComplaint to classify:\n${prompt}` }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json"
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error('Empty response from Gemini');
  return JSON.parse(rawText);
};

const callOpenAI = async (apiKey, prompt, categories) => {
  const url = 'https://api.openai.com/v1/chat/completions';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an AI grievance classifier for JanSamadhan. Available categories: ${JSON.stringify(categories)}.
Return JSON with:
{
  "category": string,
  "department": string,
  "priority": "Low"|"Medium"|"High",
  "confidence": number (60-99),
  "reasoning": string
}`
        },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
};

/**
 * Built-in Civic NLP Semantic Classifier (Intelligent Fallback Provider)
 * Provides robust keyword and semantic pattern matching for civic complaints
 * when external cloud API keys are not provided.
 */
const classifyWithCivicNLP = (title, description, availableCategories) => {
  const combined = `${title} ${description}`.toLowerCase();

  const rules = [
    {
      category: 'Streetlight Problem',
      phrases: ['street light', 'street light not working', 'streetlight', 'streetlights', 'street lamp', 'light pole', 'dark street'],
      keywords: ['streetlight', 'lamp', 'bulb', 'illumination', 'lighting', 'lights'],
      highKeywords: ['total darkness', 'unsafe', 'crime', 'women safety', 'accidents at night'],
      reasoning: 'Identified public illumination or streetlight malfunction.'
    },
    {
      category: 'Road/Pothole',
      phrases: ['broken road', 'deep pothole', 'damaged road', 'road repair', 'speed breaker'],
      keywords: ['pothole', 'potholes', 'asphalt', 'tar', 'flyover', 'pavement', 'footpath', 'highway', 'speedbreaker', 'crater', 'bump'],
      highKeywords: ['deep pothole', 'accident', 'danger', 'injury', 'severely damaged', 'fatal', 'wheel', 'fell'],
      reasoning: 'Keywords match vehicular roadway infrastructure hazards.'
    },
    {
      category: 'Garbage Collection',
      phrases: ['garbage collection', 'waste disposal', 'uncollected garbage', 'overflowing bin', 'foul odor'],
      keywords: ['garbage', 'trash', 'waste', 'dump', 'bin', 'litter', 'smell', 'stench', 'cleaning', 'debris', 'filth', 'rubbish', 'dustbin', 'uncollected', 'plastic'],
      highKeywords: ['overflowing', 'health hazard', 'diseases', 'epidemic', 'foul odor', 'toxic', 'piled up'],
      reasoning: 'Identified civic waste accumulation or uncollected garbage.'
    },
    {
      category: 'Water Leakage',
      phrases: ['water leakage', 'water supply', 'broken pipe', 'pipeline leak', 'drinking water'],
      keywords: ['water', 'leak', 'pipe', 'pipeline', 'contamination', 'supply', 'tap', 'overflow', 'pressure', 'shortage'],
      highKeywords: ['burst', 'flooding road', 'contaminated drinking water', 'poison', 'submerged', 'severe leak'],
      reasoning: 'Related to municipal water supply line disruption or leakage.'
    },
    {
      category: 'Electricity Issue',
      phrases: ['power cut', 'hanging wire', 'short circuit', 'high voltage', 'electric shock', 'power outage'],
      keywords: ['electricity', 'wire', 'transformer', 'spark', 'current', 'shock', 'blackout', 'power', 'meter'],
      highKeywords: ['hanging wire', 'sparking', 'electric shock', 'transformer burst', 'exposed wire', 'fire'],
      reasoning: 'Identified electrical grid anomaly or electrical wiring issue.'
    },
    {
      category: 'Drainage Problem',
      phrases: ['overflowing drain', 'blocked sewer', 'sewerage line', 'clogged drain', 'open manhole'],
      keywords: ['drain', 'drainage', 'gutter', 'sewer', 'sewage', 'clogged', 'blocked', 'stagnant', 'waterlogging', 'flooding', 'manhole', 'sludge'],
      highKeywords: ['open manhole', 'overflowing into houses', 'monsoon flooding', 'hazardous sludge', 'drowning risk'],
      reasoning: 'Identified sewer network blockage or drainage overflow.'
    }
  ];

  // Additional single-word fallback keywords for road
  const genericRoadWords = ['road', 'street'];

  let bestMatch = null;
  let highestScore = 0;

  for (const rule of rules) {
    let score = 0;

    // Check multi-word phrase matches (5 points)
    if (rule.phrases) {
      for (const phrase of rule.phrases) {
        if (combined.includes(phrase)) {
          score += 5;
        }
      }
    }

    // Check primary keywords (3 points)
    for (const kw of rule.keywords) {
      if (combined.includes(kw)) {
        score += 3;
      }
    }

    // Check high severity keywords (4 points)
    for (const hkw of rule.highKeywords) {
      if (combined.includes(hkw)) {
        score += 4;
      }
    }

    // Road generic single words (1 point only if not a streetlight complaint)
    if (rule.category === 'Road/Pothole' && !combined.includes('street light') && !combined.includes('streetlight')) {
      for (const rw of genericRoadWords) {
        if (combined.includes(rw)) {
          score += 1;
        }
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = rule;
    }
  }

  // If no specific match, default to 'Other'
  if (!bestMatch || highestScore === 0) {
    const fallbackCategory = availableCategories.includes('Other') ? 'Other' : availableCategories[0] || 'Other';
    return {
      category: fallbackCategory,
      department: fallbackCategory,
      priority: 'Low',
      confidence: 65,
      reasoning: 'General inquiry or civic issue without specific category pattern.'
    };
  }

  // Ensure matching category is in availableCategories
  let matchedCategory = availableCategories.find(c => c.toLowerCase() === bestMatch.category.toLowerCase()) || bestMatch.category;
  if (!availableCategories.includes(matchedCategory)) {
    matchedCategory = availableCategories[0] || 'Other';
  }

  // Determine priority
  let priority = 'Medium';
  const hasHighTerms = bestMatch.highKeywords.some(hk => combined.includes(hk)) ||
    ['urgent', 'emergency', 'danger', 'hazard', 'immediately', 'critical', 'severe'].some(w => combined.includes(w));
  const hasLowTerms = ['minor', 'slight', 'small', 'request', 'suggestion'].some(w => combined.includes(w));

  if (hasHighTerms) {
    priority = 'High';
  } else if (hasLowTerms && highestScore < 3) {
    priority = 'Low';
  }

  // Compute confidence (between 78% and 96%)
  const confidence = Math.min(96, Math.max(78, 70 + highestScore * 4));

  return {
    category: matchedCategory,
    department: matchedCategory,
    priority,
    confidence,
    reasoning: bestMatch.reasoning
  };
};

/**
 * Main categorization function
 */
exports.analyzeComplaint = async (title, description, availableCategoryNames = []) => {
  const prompt = `Title: ${title}\nDescription: ${description}`;
  const geminiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  let result = null;
  let provider = null;
  let isFallback = false;

  // Try Google Gemini if configured
  if (geminiKey) {
    try {
      result = await callGemini(geminiKey, prompt, availableCategoryNames);
      provider = 'Google Gemini (Live AI)';
      isFallback = false;
    } catch (err) {
      console.warn('Gemini categorization failed, falling back to NLP engine:', err.message);
    }
  }

  // Try OpenAI if configured and Gemini not used/failed
  if (!result && openaiKey) {
    try {
      result = await callOpenAI(openaiKey, prompt, availableCategoryNames);
      provider = 'OpenAI (Live AI)';
      isFallback = false;
    } catch (err) {
      console.warn('OpenAI categorization failed, falling back to NLP engine:', err.message);
    }
  }

  // Fallback to Civic NLP pattern engine
  if (!result) {
    result = classifyWithCivicNLP(title, description, availableCategoryNames);
    provider = 'Deterministic Keyword Engine (Fallback)';
    isFallback = true;
  }

  result.provider = provider;
  result.isFallback = isFallback;

  // Final validation against database categories
  if (availableCategoryNames.length > 0) {
    const validMatch = availableCategoryNames.find(c => c.toLowerCase() === (result.category || '').toLowerCase());
    if (validMatch) {
      result.category = validMatch;
      result.department = validMatch;
    } else {
      result.category = availableCategoryNames.includes('Other') ? 'Other' : availableCategoryNames[0];
      result.department = result.category;
    }
  }

  // Ensure priority is strictly valid
  if (!['Low', 'Medium', 'High'].includes(result.priority)) {
    result.priority = 'Medium';
  }

  // Ensure confidence is formatted
  result.confidence = Math.min(99, Math.max(50, Math.round(Number(result.confidence) || 85)));

  return result;
};
