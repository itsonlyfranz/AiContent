import { supabase } from './supabase';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
}

export interface Plan {
  id: string;
  name: string;
  max_generations: number | null;
  price: number;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  generations_used: number;
  plan: Plan;
  profile?: Profile;
}

interface SubscriptionWithPlan {
  generations_used: number;
  plan: {
    max_generations: number | null;
  };
}

export class SubscriptionService {
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          plan:plans(
            id,
            name,
            max_generations,
            price
          )
        `)
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching subscription:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error in getUserSubscription:', error);
      return null;
    }
  }

  async incrementGenerationCount(userId: string): Promise<boolean> {
    const { error } = await supabase.rpc('increment_generation_count', {
      user_id_input: userId
    });

    if (error) {
      console.error('Error incrementing generation count:', error);
      return false;
    }

    return true;
  }

  async canGenerate(userId: string): Promise<boolean> {
    const remaining = await this.getRemainingGenerations(userId);
    if (remaining === null) return true; // Unlimited plan
    return remaining > 0;
  }

  async getRemainingGenerations(userId: string): Promise<number | null> {
    try {
      const { data: subscription, error } = await supabase
        .from('user_subscriptions')
        .select(`
          generations_used,
          plan:plans(max_generations)
        `)
        .eq('user_id', userId)
        .single() as { 
          data: SubscriptionWithPlan | null, 
          error: any 
        };

      if (error) {
        console.error('Error fetching generations:', error);
        return null;
      }

      if (!subscription) return null;
      
      const maxGenerations = subscription.plan?.max_generations;
      if (maxGenerations === null) return null; // Unlimited plan
      
      return Math.max(0, maxGenerations - subscription.generations_used);
    } catch (error) {
      console.error('Unexpected error in getRemainingGenerations:', error);
      return null;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .limit(1);
      
      if (error) {
        console.error('Connection test error:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Unexpected error in testConnection:', error);
      return false;
    }
  }

  async getUserProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error in getUserProfile:', error);
      return null;
    }
  }

  async updateUserProfile(userId: string, updates: Partial<Profile>): Promise<boolean> {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) {
      console.error('Error updating profile:', error);
      return false;
    }

    return true;
  }
} 