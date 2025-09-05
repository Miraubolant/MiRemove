// Mock Supabase pour développement local sans CORS
export const mockSupabase = {
  auth: {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      if (email === 'victor@mirault.com' && password.length > 0) {
        return {
          data: {
            user: {
              id: 'mock-user-id',
              email: 'victor@mirault.com'
            }
          },
          error: null
        };
      }
      return {
        data: { user: null },
        error: { message: 'Invalid credentials' }
      };
    },
    
    signUp: async ({ email, password }: { email: string; password: string }) => {
      return {
        data: {
          user: {
            id: 'mock-user-id',
            email
          }
        },
        error: null
      };
    },
    
    signOut: async () => ({ error: null }),
    
    getSession: async () => ({
      data: {
        session: {
          user: {
            id: 'mock-user-id',
            email: 'victor@mirault.com'
          }
        }
      }
    }),
    
    getUser: async () => ({
      data: {
        user: {
          id: 'mock-user-id',
          email: 'victor@mirault.com'
        }
      }
    }),
    
    onAuthStateChange: (callback: any) => {
      // Mock auth state change
      setTimeout(() => {
        callback('SIGNED_IN', {
          user: {
            id: 'mock-user-id',
            email: 'victor@mirault.com'
          }
        });
      }, 100);
      
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  },
  
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: (column: string, value: any) => ({
        single: async () => {
          if (table === 'user_profiles' && column === 'user_id') {
            return {
              data: {
                user_id: 'mock-user-id',
                email: 'victor@mirault.com',
                user_level: 'admin',
                image_limit: 999999
              },
              error: null
            };
          }
          return { data: null, error: null };
        },
        order: (column: string) => ({
          then: async (callback: any) => callback({ data: [], error: null })
        })
      })
    }),
    
    insert: (data: any) => ({
      select: () => ({
        single: async () => ({ data, error: null })
      })
    }),
    
    update: (data: any) => ({
      eq: (column: string, value: any) => ({
        then: async (callback: any) => callback({ error: null })
      })
    })
  }),
  
  rpc: async (functionName: string, params?: any) => {
    
    
    switch (functionName) {
      case 'create_user_profile_manual':
        return { data: true, error: null };
        
      case 'check_user_quota':
        return {
          data: {
            can_process: true,
            remaining: 999999
          },
          error: null
        };
        
      case 'log_processing_operation':
        return {
          data: {
            success: true,
            remaining_operations: 999999,
            total_used: Math.floor(Math.random() * 100),
            limit: 999999,
            user_level: 'admin'
          },
          error: null
        };
        
      case 'get_dashboard_stats':
        return {
          data: {
            users: { total: 42, active_today: 12, active_week: 28 },
            operations: { today: 156, week: 1234, month: 5678, success_rate: 98.5, avg_processing_time_ms: 1250 },
            top_users: [
              { email: 'victor@mirault.com', total_ops: 99, user_level: 'admin', last_active: new Date().toISOString() }
            ],
            operations_breakdown: { bg_removal: 800, resize: 300, head_crop: 150 },
            recent_activity: [
              { operation_type: 'bg_removal', operations_count: 2, success: true, created_at: new Date().toISOString(), email: 'victor@mirault.com' }
            ],
            generated_at: new Date().toISOString()
          },
          error: null
        };
        
      case 'get_user_detailed_stats':
        return {
          data: {
            profile: {
              email: 'victor@mirault.com',
              user_level: 'admin',
              image_limit: 999999,
              created_at: new Date().toISOString(),
              last_active: new Date().toISOString()
            },
            current_month: {
              bg_removal_count: 25,
              resize_count: 15,
              head_crop_count: 8,
              total_operations: 48,
              remaining: 999951,
              month_start: new Date().toISOString()
            },
            monthly_history: [],
            recent_operations: [
              { operation_type: 'bg_removal', operations_count: 1, success: true, processing_time_ms: 1200, created_at: new Date().toISOString() }
            ],
            groups: []
          },
          error: null
        };
        
      default:
        return { data: null, error: null };
    }
  }
};