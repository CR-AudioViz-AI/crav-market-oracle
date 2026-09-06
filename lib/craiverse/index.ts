import { secretKey, publishableKey, supabaseUrl } from "@craudioviz/platform-sdk";
// =====================================================
// JAVARIVERSE SDK
// Shared library for all CR AudioViz AI applications
// Version: 1.0.0
// =====================================================

// ⚠️ _supabase MUST be declared before getSupabase() — TDZ guard
let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  // 2026-08-19: this function was CORRUPTED in 27 files, byte-identically.
  // `return _supabase;` had been spliced into the middle of the options object:
  //
  //   return sb.createClient(url, key, { auth: { persistSession: false   return _supabase;
  //   } })
  //
  // The repo did not compile - 102 type errors across 29 files - and every route
  // using it threw "supabase is not defined". javarimarket.com kept serving only
  // because Vercel holds the last successful build; the next push would have
  // failed and stayed failed.
  //
  // Now caches properly, which is what _supabase was always for, and pins
  // no-store: Next 14 caches PostgREST GETs by URL and serves stale rows.
  if (_supabase) return _supabase;
  const sb = require('@supabase/supabase-js');
  const url = supabaseUrl();
  const key = secretKey();
  if (!url || !key) return null;
  _supabase = sb.createClient(url, key, {
    auth: { persistSession: false },
    global: { fetch: (u: RequestInfo | URL, o?: RequestInit) => fetch(u, { ...o, cache: 'no-store' }) },
  });
  return _supabase;
}

// =====================================================
// CONFIGURATION
// =====================================================

const JAVARIVERSE_CONFIG = {
  supabaseUrl: supabaseUrl(),
  supabaseAnonKey: publishableKey(),
  appSlug: process.env.NEXT_PUBLIC_APP_SLUG || 'unknown',
};

// 2026-08-19: the declaration line of this interface was destroyed by the same
// splice that corrupted 27 other files in this repo - the header was replaced
// with a stray comment, leaving orphaned members and breaking the whole module.
// JavariverseUser is referenced by getCurrentUser() below, which is how the name
// was recovered.
export interface JavariverseUser {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  org_id?: string;
  org_role?: 'owner' | 'admin' | 'member' | 'viewer';
  preferences: Record<string, any>;
  is_active: boolean;
  created_at: string;
}

export interface JavariverseCredits {
  id: string;
  user_id?: string;
  org_id?: string;
  balance: number;
  lifetime_earned: number;
  lifetime_spent: number;
  bonus_balance: number;
  bonus_expires_at?: string;
}

export interface JavariverseSubscription {
  id: string;
  plan_id: string;
  plan_name: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'paused' | 'expired';
  billing_cycle: 'monthly' | 'yearly';
  current_period_end: string;
  credits_monthly: number;
}

export interface DeductCreditsResult {
  success: boolean;
  new_balance: number;
  credits_deducted: number;
  error?: string;
}

// =====================================================
// AUTH FUNCTIONS
// =====================================================

/**
 * Get the current authenticated user's profile
 */
export async function getCurrentUser(): Promise<JavariverseUser | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('javariverse_profiles')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    return profile;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
}

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string, displayName?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
    },
  });
  
  if (error) throw error;
  
  // Create profile record
  if (data.user) {
    await supabase.from('javariverse_profiles').insert({
      auth_user_id: data.user.id,
      email: email,
      display_name: displayName,
    });
    
    // Give new user 50 free credits
    const { data: profile } = await supabase
      .from('javariverse_profiles')
      .select('id')
      .eq('auth_user_id', data.user.id)
      .single();
      
    if (profile) {
      await supabase.from('user_credits').insert({
        user_id: profile.id,
        balance: 50,
        lifetime_earned: 50,
      });
      
      // Log the transaction
      await supabase.from('credit_transactions').insert({
        user_id: profile.id,
        amount: 50,
        balance_after: 50,
        type: 'bonus',
        source_app: JAVARIVERSE_CONFIG.appSlug,
        source_action: 'signup_bonus',
      });
    }
  }
  
  return data;
}

/**
 * Sign out
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Get auth session
 */
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// =====================================================
// CREDIT FUNCTIONS
// =====================================================

/**
 * Get user's current credit balance
 */
export async function getCredits(userId: string): Promise<JavariverseCredits | null> {
  const { data } = await supabase
    .from('user_credits')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  return data;
}

/**
 * Deduct credits from user's balance
 * Returns success status and new balance
 */
export async function deductCredits(
  userId: string,
  amount: number,
  action: string,
  reference?: string
): Promise<DeductCreditsResult> {
  try {
    // Get current balance
    const { data: credits } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (!credits) {
      return { success: false, new_balance: 0, credits_deducted: 0, error: 'No credit record found' };
    }
    
    // Check if sufficient balance (including bonus)
    const totalAvailable = credits.balance + credits.bonus_balance;
    if (totalAvailable < amount) {
      return { 
        success: false, 
        new_balance: credits.balance, 
        credits_deducted: 0, 
        error: 'Insufficient credits' 
      };
    }
    
    // Deduct from bonus first, then regular balance
    let remainingDeduct = amount;
    let newBonusBalance = credits.bonus_balance;
    let newBalance = credits.balance;
    
    if (credits.bonus_balance > 0) {
      const bonusDeduct = Math.min(credits.bonus_balance, remainingDeduct);
      newBonusBalance = credits.bonus_balance - bonusDeduct;
      remainingDeduct -= bonusDeduct;
    }
    
    if (remainingDeduct > 0) {
      newBalance = credits.balance - remainingDeduct;
    }
    
    // Update balance
    const { error: updateError } = await supabase
      .from('user_credits')
      .update({
        balance: newBalance,
        bonus_balance: newBonusBalance,
        lifetime_spent: credits.lifetime_spent + amount,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
      
    if (updateError) throw updateError;
    
    // Log transaction
    await supabase.from('credit_transactions').insert({
      user_id: userId,
      amount: -amount,
      balance_after: newBalance,
      type: 'spend',
      source_app: JAVARIVERSE_CONFIG.appSlug,
      source_action: action,
      source_reference: reference,
    });
    
    // Log activity
    await logActivity(userId, 'credit_spent', {
      amount,
      action,
      new_balance: newBalance,
    });
    
    return {
      success: true,
      new_balance: newBalance,
      credits_deducted: amount,
    };
  } catch (error: any) {
    console.error('Error deducting credits:', error);
    return { 
      success: false, 
      new_balance: 0, 
      credits_deducted: 0, 
      error: error.message 
    };
  }
}

/**
 * Add credits to user's balance (for purchases)
 */
export async function addCredits(
  userId: string,
  amount: number,
  type: 'purchase' | 'refund' | 'bonus' | 'referral' | 'achievement' | 'adjustment',
  reference?: string
): Promise<{ success: boolean; new_balance: number; error?: string }> {
  try {
    const { data: credits } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (!credits) {
      // Create credits record if doesn't exist
      await supabase.from('user_credits').insert({
        user_id: userId,
        balance: amount,
        lifetime_earned: amount,
      });
      
      await supabase.from('credit_transactions').insert({
        user_id: userId,
        amount: amount,
        balance_after: amount,
        type,
        source_app: JAVARIVERSE_CONFIG.appSlug,
        source_reference: reference,
      });
      
      return { success: true, new_balance: amount };
    }
    
    const newBalance = credits.balance + amount;
    
    await supabase
      .from('user_credits')
      .update({
        balance: newBalance,
        lifetime_earned: credits.lifetime_earned + amount,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
      
    await supabase.from('credit_transactions').insert({
      user_id: userId,
      amount: amount,
      balance_after: newBalance,
      type,
      source_app: JAVARIVERSE_CONFIG.appSlug,
      source_reference: reference,
    });
    
    return { success: true, new_balance: newBalance };
  } catch (error: any) {
    console.error('Error adding credits:', error);
    return { success: false, new_balance: 0, error: error.message };
  }
}

// =====================================================
// SUBSCRIPTION FUNCTIONS
// =====================================================

/**
 * Get user's active subscription
 */
export async function getSubscription(userId: string): Promise<JavariverseSubscription | null> {
  const { data } = await supabase
    .from('user_subscriptions')
    .select(`
      *,
      plan:javariverse_subscription_plans(name, credits_monthly)
    `)
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();
    
  if (!data) return null;
  
  return {
    ...data,
    plan_name: data.plan?.name,
    credits_monthly: data.plan?.credits_monthly,
  };
}

// =====================================================
// SUPPORT TICKET FUNCTIONS
// =====================================================

/**
 * Create a support ticket
 */
export async function createTicket(
  userId: string,
  subject: string,
  description: string,
  category: 'billing' | 'technical' | 'feature_request' | 'bug_report' | 'account' | 'general' | 'urgent',
  priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
) {
  const { data, error } = await supabase
    .from('support_tickets')
    .insert({
      user_id: userId,
      subject,
      description,
      category,
      priority,
      source_app: JAVARIVERSE_CONFIG.appSlug,
      source_url: typeof window !== 'undefined' ? window.location.href : '',
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

/**
 * Get user's tickets
 */
export async function getTickets(userId: string, status?: string) {
  let query = supabase
    .from('support_tickets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (status) {
    query = query.eq('status', status);
  }
  
  const { data } = await query;
  return data || [];
}

// =====================================================
// ACTIVITY LOGGING
// =====================================================

/**
 * Log user activity
 */
export async function logActivity(
  userId: string,
  action: string,
  metadata?: Record<string, any>
) {
  await supabase.from('javari_activity_log').insert({
    user_id: userId,
    action,
    source_app: JAVARIVERSE_CONFIG.appSlug,
    metadata,
  });
}

// =====================================================
// APP USAGE TRACKING
// =====================================================

/**
 * Track app usage
 */
export async function trackUsage(
  userId: string,
  action: string,
  creditsUsed: number = 0,
  metadata?: Record<string, any>
) {
  // Get app ID
  const { data: app } = await supabase
    .from('javariverse_apps')
    .select('id')
    .eq('slug', JAVARIVERSE_CONFIG.appSlug)
    .single();
    
  if (app) {
    await supabase.from('javari_usage_analytics').insert({
      app_id: app.id,
      user_id: userId,
      action,
      credits_used: creditsUsed,
      metadata,
    });
  }
}

// =====================================================
// ENHANCEMENT VOTING
// =====================================================

/**
 * Submit an enhancement request
 */
export async function submitEnhancement(
  userId: string,
  title: string,
  description: string,
  category: 'feature' | 'improvement' | 'integration' | 'ui_ux' | 'performance' | 'other'
) {
  const { data, error } = await supabase
    .from('javariverse_enhancements')
    .insert({
      author_id: userId,
      title,
      description,
      category,
      target_app: JAVARIVERSE_CONFIG.appSlug,
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

/**
 * Vote on an enhancement
 */
export async function voteEnhancement(
  userId: string,
  enhancementId: string,
  vote: 1 | -1
) {
  // Upsert vote
  await supabase
    .from('javariverse_enhancement_votes')
    .upsert({
      enhancement_id: enhancementId,
      user_id: userId,
      vote,
    }, {
      onConflict: 'enhancement_id,user_id',
    });
    
  // Update vote count
  const { data: votes } = await supabase
    .from('javariverse_enhancement_votes')
    .select('vote')
    .eq('enhancement_id', enhancementId);
    
  const voteCount = votes?.reduce((sum, v) => sum + v.vote, 0) || 0;
  
  await supabase
    .from('javariverse_enhancements')
    .update({ vote_count: voteCount })
    .eq('id', enhancementId);
}

// =====================================================
// REFERRAL SYSTEM
// =====================================================

/**
 * Generate a referral code for user
 */
export async function generateReferralCode(userId: string): Promise<string> {
  const code = `REF-${userId.substring(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  
  // Store in user preferences
  await supabase
    .from('javariverse_profiles')
    .update({
      preferences: { referral_code: code },
    })
    .eq('id', userId);
    
  return code;
}

/**
 * Apply a referral code
 */
export async function applyReferralCode(userId: string, code: string) {
  // Find referrer
  const { data: referrer } = await supabase
    .from('javariverse_profiles')
    .select('id')
    .contains('preferences', { referral_code: code })
    .single();
    
  if (!referrer) {
    throw new Error('Invalid referral code');
  }
  
  // Check if already referred
  const { data: existing } = await supabase
    .from('javariverse_referrals')
    .select('id')
    .eq('referred_id', userId)
    .single();
    
  if (existing) {
    throw new Error('Already used a referral code');
  }
  
  // Create referral record
  await supabase.from('javariverse_referrals').insert({
    referrer_id: referrer.id,
    referred_id: userId,
    referral_code: code,
    status: 'pending',
  });
  
  // Give referred user bonus credits
  await addCredits(userId, 25, 'referral', `Referred by ${referrer.id}`);
}

// =====================================================
// EXPORTS
// =====================================================

export default {
  // Auth
  getCurrentUser,
  signIn,
  signUp,
  signOut,
  getSession,
  
  // Credits
  getCredits,
  deductCredits,
  addCredits,
  
  // Subscriptions
  getSubscription,
  
  // Support
  createTicket,
  getTickets,
  
  // Activity
  logActivity,
  trackUsage,
  
  // Enhancements
  submitEnhancement,
  voteEnhancement,
  
  // Referrals
  generateReferralCode,
  applyReferralCode,
  
  // Raw client for advanced use
  supabase,
};
