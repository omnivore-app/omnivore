# Article Content Analysis Prompt

You are analyzing an article for content monetization opportunities. Extract structured insights that can be used to create valuable blog posts, newsletters, and social media content.

⚠️ **CRITICAL ANTI-HALLUCINATION RULE**

This rule applies to EVERY field in your analysis:
- If information is NOT explicitly present in the article content, use "N/A" (for strings) or ["N/A"] (for arrays)
- DO NOT infer, guess, estimate, or use knowledge from your training data
- Only extract information that is directly stated in the article text
- When in doubt, use "N/A" - it's better to have missing data than invented data

## Article Details

**Title**: {{title}}
**Author**: {{author}}
**URL**: {{url}}
**Word Count**: {{wordCount}}
**Published**: {{publishedAt}}

**Content**:
{{content}}

{{#if highlights}}
**User Highlights**:
{{#each highlights}}
- "{{quote}}"{{#if annotation}} — Note: {{annotation}}{{/if}}
{{/each}}
{{/if}}

## Analysis Task

Extract the following information and return as JSON:

```json
{
  "topics": ["topic1", "topic2"],
  "topicScores": {
    "topic1": 0.95,
    "topic2": 0.88
  },
  "summary": "2-3 sentence summary capturing main points and why this matters",
  "keyPoints": [
    "First key takeaway",
    "Second key takeaway",
    "Third key takeaway"
  ],
  "sentiment": "positive|neutral|negative",
  "monetizationAngle": "How to turn this into valuable content",

  "contentType": "tutorial|comparison|announcement|case-study|deep-dive|news|tool-review|other",
  "publishedDate": "2024-03-15 OR N/A",
  "updatedDate": "2024-03-20 OR N/A",
  "problemStatement": "What problem does this article address OR N/A",
  "audienceLevel": "beginner|intermediate|advanced OR N/A",

  "technologiesMentioned": ["Ray", "Python", "Dask"],
  "companiesMentioned": ["Anyscale", "OpenAI"],
  "peopleMentioned": ["author name if notable"],
  "conceptsExplained": ["distributed computing", "actor model"],
  "relatedTechnologies": ["Spark", "Dask"],
  "useCases": ["ML training", "data processing"],

  "targetKeywords": ["distributed python", "ray framework"],
  "searchQuestions": ["how to scale python workloads"],

  "githubRepo": "https://github.com/org/repo OR N/A",
  "releaseInfo": "v2.0 released OR N/A"
}
```

## Guidelines

### Topics (2-5 main topics)
Prioritize these categories that align with the content strategy:
- **AI & Machine Learning**: ai, machine-learning, llm, neural-networks, training, inference
- **Developer Tools**: developer-tools, ide, debugging, testing, ci-cd
- **Software Engineering**: software-engineering, architecture, design-patterns, code-quality
- **DevOps & Infrastructure**: devops, kubernetes, docker, cloud-native, infrastructure
- **Databases**: databases, sql, nosql, data-modeling, performance
- **Cloud**: cloud, aws, azure, gcp, serverless
- **Startups & Business**: startups, product, growth, monetization, business-strategy
- **Security**: security, auth, encryption, vulnerabilities

### Topic Scores (0-1 confidence)
- 0.90-1.0: Core focus of article
- 0.70-0.89: Significant discussion
- 0.50-0.69: Mentioned/relevant but not central
- Below 0.50: Don't include

### Summary
Focus on the "so what?" - why does this matter to developers/tech professionals?

### Key Points
Extract actionable insights, surprising facts, or important takeaways. Focus on what readers can learn or apply.

### Sentiment
- **positive**: Optimistic, solutions-focused, celebrates innovation
- **neutral**: Informative, balanced, educational
- **negative**: Critical, identifies problems, warnings

### Monetization Angle
Identify content opportunities:
- "Compare with 2-3 similar tools for comparison post"
- "Tutorial on implementing this technique"
- "Weekly roundup: combine with X other articles on topic Y"
- "Deep dive: expand on concept Z with 10+ articles"
- "Contrarian take: why this approach has limitations"

### Content Type
Describe what kind of article this is using open-ended language:
- "getting started guide", "comparison review", "release announcement", "case study", "technical deep dive", "news article", "tool documentation", etc.
- Use N/A if unclear from content

### Dates
- Extract publishedDate and updatedDate if shown in article (use ISO format YYYY-MM-DD)
- Use "N/A" if dates not present

### Problem Statement
- What specific problem does the article address?
- Use N/A if not explicitly stated

### Audience Level
- Based on technical depth: "beginner", "intermediate", "advanced"
- Use N/A if unclear

### Knowledge Graph Fields
Extract ONLY what's explicitly mentioned:
- **technologiesMentioned**: Specific tools, frameworks, languages named in article
- **companiesMentioned**: Organizations, companies mentioned
- **peopleMentioned**: Notable people mentioned (founders, researchers, etc.) - use N/A if none
- **conceptsExplained**: Technical concepts or techniques explained
- **relatedTechnologies**: Technologies this compares to or builds upon
- **useCases**: Specific use cases or scenarios described

### SEO Signals
- **targetKeywords**: Keywords that appear emphasized/repeated in article (N/A if none obvious)
- **searchQuestions**: If article answers specific questions, list them (N/A if not question-format)

### Trend Signals
- **githubRepo**: If article is about or links to a GitHub repository
- **releaseInfo**: If article announces a new version or release
- Use N/A for both if not applicable

## Output Format

Return ONLY valid JSON matching the schema above. No markdown code blocks, no additional text.
