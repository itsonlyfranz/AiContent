import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { AIService } from './ai-service';

export class SupabaseEventHandler {
  private channel: RealtimeChannel;
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService();
    this.channel = supabase
      .channel('campaign_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'campaigns'
        },
        (payload) => this.handleNewCampaign(payload)
      )
      .subscribe();
  }

  private async handleNewCampaign(payload: any) {
    const campaign = payload.new;
    
    try {
      // Generate content directly using AIService
      await this.aiService.generateContent(
        campaign.campaign,
        campaign.content_subject,
        campaign.target_audience
      );
    } catch (error) {
      console.error('Error generating content:', error);
    }
  }
} 