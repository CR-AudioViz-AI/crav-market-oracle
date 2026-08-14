'use client';

import React, { useEffect, useState } from 'react';
import { getCredits, getSubscription, getCurrentUser, type JavariverseCredits, type JavariverseSubscription } from './index';

// =====================================================
// CREDIT BAR COMPONENT
// Shows credit balance on every page when logged in
// =====================================================

interface CreditBarProps {
  className?: string;
  showSubscription?: boolean;
  onBuyCredits?: () => void;
}

export function CreditBar({ 
  className = '', 
  showSubscription = true,
  onBuyCredits 
}: CreditBarProps) {
  const [credits, setCredits] = useState<JavariverseCredits | null>(null);
  const [subscription, setSubscription] = useState<JavariverseSubscription | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const user = await getCurrentUser();
        if (!user) {
          setLoading(false);
          return;
        }
        
        setUserId(user.id);
        setIsAdmin(user.org_role === 'owner' || user.org_role === 'admin');
        
        const [creditsData, subData] = await Promise.all([
          getCredits(user.id),
          showSubscription ? getSubscription(user.id) : null,
        ]);
        
        setCredits(creditsData);
        setSubscription(subData);
      } catch (error) {
        console.error('Error loading credit bar data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [showSubscription]);

  // Don't render if not logged in
  if (loading || !userId) {
    return null;
  }

  const totalCredits = (credits?.balance || 0) + (credits?.bonus_balance || 0);
  const isLowCredits = totalCredits < 10;

  return (
    <div className={`credit-bar ${className}`}>
      <div className="credit-bar-content">
        {/* Credit Display */}
        <div className="credit-display">
          <span className="credit-icon">💳</span>
          {isAdmin ? (
            <span className="credit-amount admin">
              Free Unlimited
            </span>
          ) : (
            <>
              <span className={`credit-amount ${isLowCredits ? 'low' : ''}`}>
                {totalCredits.toLocaleString()} credits
              </span>
              {credits?.bonus_balance && credits.bonus_balance > 0 && (
                <span className="bonus-badge">
                  +{credits.bonus_balance} bonus
                </span>
              )}
            </>
          )}
        </div>

        {/* Subscription Badge */}
        {showSubscription && subscription && (
          <div className="subscription-badge">
            <span className={`plan-name ${subscription.plan_name?.toLowerCase()}`}>
              {subscription.plan_name}
            </span>
          </div>
        )}

        {/* Buy Credits Button */}
        {!isAdmin && (
          <button 
            className="buy-credits-btn"
            onClick={onBuyCredits || (() => window.location.href = '/pricing')}
          >
            {isLowCredits ? 'Low Credits!' : 'Buy Credits'}
          </button>
        )}
      </div>

      <style jsx>{`
        .credit-bar {
          background: linear-gradient(135deg, #0A1628 0%, #1a2942 100%);
          border-bottom: 1px solid rgba(59, 130, 246, 0.3);
          padding: 8px 16px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .credit-bar-content {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 16px;
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .credit-display {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .credit-icon {
          font-size: 18px;
        }
        
        .credit-amount {
          color: #10B981;
          font-weight: 600;
          font-size: 14px;
        }
        
        .credit-amount.admin {
          color: #60A5FA;
          font-style: italic;
        }
        
        .credit-amount.low {
          color: #F59E0B;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        
        .bonus-badge {
          background: rgba(16, 185, 129, 0.2);
          color: #10B981;
          font-size: 11px;
          padding: 2px 6px;
          border-radius: 10px;
          font-weight: 500;
        }
        
        .subscription-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .plan-name {
          padding: 4px 12px;
          border-radius: 20px;
        }
        
        .plan-name.free {
          background: rgba(107, 114, 128, 0.3);
          color: #9CA3AF;
        }
        
        .plan-name.starter {
          background: rgba(59, 130, 246, 0.2);
          color: #60A5FA;
        }
        
        .plan-name.pro {
          background: rgba(139, 92, 246, 0.2);
          color: #A78BFA;
        }
        
        .plan-name.enterprise {
          background: rgba(245, 158, 11, 0.2);
          color: #FBBF24;
        }
        
        .buy-credits-btn {
          background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%);
          color: white;
          border: none;
          padding: 6px 16px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .buy-credits-btn:hover {
          background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
          transform: translateY(-1px);
        }
        
        /* Low credits warning */
        .credit-amount.low ~ .buy-credits-btn {
          animation: pulse 2s infinite;
        }
        
        @media (max-width: 640px) {
          .credit-bar-content {
            gap: 8px;
          }
          
          .subscription-badge {
            display: none;
          }
          
          .credit-amount {
            font-size: 13px;
          }
          
          .buy-credits-btn {
            padding: 4px 12px;
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
}

// =====================================================
// AUTH GATE COMPONENT
// Wrap pages that require authentication
// =====================================================

interface AuthGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireCredits?: number;
}

export function AuthGate({ 
  children, 
  fallback,
  requireCredits 
}: AuthGateProps) {
  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState<JavariverseCredits | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        
        if (currentUser && requireCredits) {
          const creditsData = await getCredits(currentUser.id);
          setCredits(creditsData);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    }
    
    checkAuth();
  }, [requireCredits]);

  if (loading) {
    return (
      <div className="auth-loading">
        <div className="spinner"></div>
        <style jsx>{`
          .auth-loading {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 200px;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(59, 130, 246, 0.3);
            border-top-color: #3B82F6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return fallback || (
      <div className="auth-required">
        <h2>Sign in required</h2>
        <p>Please sign in to access this feature.</p>
        <a href="/login">Sign In</a>
        <style jsx>{`
          .auth-required {
            text-align: center;
            padding: 60px 20px;
            color: #9CA3AF;
          }
          .auth-required h2 {
            color: white;
            margin-bottom: 8px;
          }
          .auth-required a {
            display: inline-block;
            margin-top: 20px;
            background: #3B82F6;
            color: white;
            padding: 10px 24px;
            border-radius: 8px;
            text-decoration: none;
          }
        `}</style>
      </div>
    );
  }

  if (requireCredits && credits) {
    const totalCredits = credits.balance + credits.bonus_balance;
    if (totalCredits < requireCredits) {
      return (
        <div className="insufficient-credits">
          <h2>Insufficient Credits</h2>
          <p>This action requires {requireCredits} credits. You have {totalCredits}.</p>
          <a href="/pricing">Buy Credits</a>
          <style jsx>{`
            .insufficient-credits {
              text-align: center;
              padding: 60px 20px;
              color: #9CA3AF;
            }
            .insufficient-credits h2 {
              color: #F59E0B;
              margin-bottom: 8px;
            }
            .insufficient-credits a {
              display: inline-block;
              margin-top: 20px;
              background: #DC2626;
              color: white;
              padding: 10px 24px;
              border-radius: 8px;
              text-decoration: none;
            }
          `}</style>
        </div>
      );
    }
  }

  return <>{children}</>;
}

// =====================================================
// REACT HOOKS
// =====================================================

/**
 * Hook to get current user and credits
 */
export function useJavariverse() {
  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState<JavariverseCredits | null>(null);
  const [subscription, setSubscription] = useState<JavariverseSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        
        if (currentUser) {
          const [creditsData, subData] = await Promise.all([
            getCredits(currentUser.id),
            getSubscription(currentUser.id),
          ]);
          setCredits(creditsData);
          setSubscription(subData);
        }
      } catch (error) {
        console.error('useJavariverse error:', error);
      } finally {
        setLoading(false);
      }
    }
    
    load();
  }, []);

  const refreshCredits = async () => {
    if (user) {
      const creditsData = await getCredits(user.id);
      setCredits(creditsData);
    }
  };

  return {
    user,
    credits,
    subscription,
    loading,
    refreshCredits,
    isAdmin: user?.org_role === 'owner' || user?.org_role === 'admin',
    totalCredits: (credits?.balance || 0) + (credits?.bonus_balance || 0),
  };
}

export default {
  CreditBar,
  AuthGate,
  useJavariverse,
};
