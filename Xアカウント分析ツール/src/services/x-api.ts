// import { PrismaClient } from '@prisma/client';

// Mock types
export interface XAccount {
  id: string;
  username: string;
  name: string;
  profile_image_url: string;
  public_metrics: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
    listed_count: number;
  };
  created_at: string;
}

export interface XTweet {
  id: string;
  text: string;
  created_at: string;
  public_metrics: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
    impression_count: number;
  };
  entities?: {
    urls?: { expanded_url: string }[];
    media?: { type: string }[];
  };
}

// Mock Data Generator
export class MockXApi {
  async getAccount(username: string): Promise<XAccount> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      id: '123456789',
      username: username,
      name: `${username} Official`,
      profile_image_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      public_metrics: {
        followers_count: Math.floor(Math.random() * 10000) + 500,
        following_count: Math.floor(Math.random() * 500) + 10,
        tweet_count: Math.floor(Math.random() * 5000) + 100,
        listed_count: Math.floor(Math.random() * 100),
      },
      created_at: '2020-01-01T00:00:00.000Z',
    };
  }

  async getTweets(userId: string, limit: number = 50): Promise<XTweet[]> {
    await new Promise(resolve => setTimeout(resolve, 800));

    const tweets: XTweet[] = [];
    const now = new Date();

    for (let i = 0; i < limit; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000 * Math.random()); // Random time within last 50 days
      const hasMedia = Math.random() > 0.5;
      const hasUrl = Math.random() > 0.7;

      tweets.push({
        id: `tweet-${i}`,
        text: `This is a sample tweet number ${i}. #sample #mock`,
        created_at: date.toISOString(),
        public_metrics: {
          like_count: Math.floor(Math.random() * 500),
          retweet_count: Math.floor(Math.random() * 100),
          reply_count: Math.floor(Math.random() * 50),
          quote_count: Math.floor(Math.random() * 20),
          impression_count: Math.floor(Math.random() * 10000) + 500,
        },
        entities: {
          media: hasMedia ? [{ type: Math.random() > 0.8 ? 'video' : 'photo' }] : undefined,
          urls: hasUrl ? [{ expanded_url: 'https://example.com' }] : undefined,
        }
      });
    }

    return tweets;
  }
}

export const xApi = new MockXApi();
