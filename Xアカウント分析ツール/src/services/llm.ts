export interface TweetAnalysis {
    topics: string[];
    sentiment: 'positive' | 'neutral' | 'negative';
    tags: string[];
}

export class LLMService {
    async analyzeTweet(_text: string): Promise<TweetAnalysis> {
        // Mock analysis
        await new Promise(resolve => setTimeout(resolve, 200));

        const topics = ['Tech', 'Business', 'Life'];
        const tags = ['#insight', '#growth', '#update'];

        return {
            topics: [topics[Math.floor(Math.random() * topics.length)]],
            sentiment: Math.random() > 0.5 ? 'positive' : 'neutral',
            tags: [tags[Math.floor(Math.random() * tags.length)]],
        };
    }
}

export const llmService = new LLMService();
