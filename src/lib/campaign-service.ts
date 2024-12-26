import { supabase } from './supabase';

export interface CampaignContent {
  campaign: string;
  content_subject: string;
  target_audience: string;
  linkedin_content: string;
  twitter_content: string;
  blog_content: string;
  reference_links: string;
  status?: 'pending' | 'completed' | 'error';
  created_at?: string;
  updated_at?: string;
}

export interface SaveCampaignParams {
  name: string;
  content: string;
  platform: string;
  userId: string;
}

export class CampaignService {
  async createCampaign(content: CampaignContent) {
    try {
      // Check if campaign already exists
      const { data: existingCampaign } = await supabase
        .from('campaigns')
        .select()
        .eq('campaign', content.campaign)
        .single();

      if (existingCampaign) {
        throw new Error('Campaign with this name already exists');
      }

      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          ...content,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Campaign creation error:', error);
      throw error;
    }
  }

  async updateCampaignContent(campaign: string, content: Partial<CampaignContent>) {
    const { data, error } = await supabase
      .from('campaigns')
      .update({
        ...content,
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('campaign', campaign)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getCampaign(campaign: string) {
    const { data, error } = await supabase
      .from('campaigns')
      .select()
      .eq('campaign', campaign)
      .single();

    if (error) throw error;
    return data;
  }

  async saveCampaign(params: SaveCampaignParams): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('campaigns')
        .insert({
          campaign: params.name,
          content: params.content,
          platform: params.platform,
          user_id: params.userId,
          status: 'completed'
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error saving campaign:', error);
      return false;
    }
  }
} 