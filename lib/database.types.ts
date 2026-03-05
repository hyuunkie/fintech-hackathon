export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          supabase_auth_id: string | null;
          full_name: string | null;
          nric_hash: string | null;
          date_of_birth: string | null;
          nationality: string | null;
          email: string | null;
          annual_income: number | null;
          cpf_oa_balance: number | null;
          cpf_sa_balance: number | null;
          cpf_ma_balance: number | null;
          cpf_ra_balance: number | null;
          cpf_data_updated_at: string | null;
          onboarding_complete: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["users"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
      };
      bank_accounts: {
        Row: {
          id: string;
          user_id: string;
          plaid_item_id: string;
          plaid_account_id: string;
          institution_name: string | null;
          account_name: string | null;
          account_type: string | null;
          account_subtype: string | null;
          current_balance: number | null;
          available_balance: number | null;
          currency: string;
          is_active: boolean;
          last_synced_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["bank_accounts"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["bank_accounts"]["Insert"]>;
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          bank_account_id: string | null;
          plaid_transaction_id: string | null;
          amount: number;
          currency: string;
          merchant_name: string | null;
          category: string | null;
          category_detail: string | null;
          transaction_date: string;
          description: string | null;
          is_pending: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["transactions"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["transactions"]["Insert"]>;
      };
      investment_accounts: {
        Row: {
          id: string;
          user_id: string;
          provider: string;
          snaptrade_account_id: string | null;
          brokerage_name: string | null;
          account_name: string | null;
          account_type: string | null;
          total_value: number | null;
          cash_balance: number | null;
          currency: string;
          is_active: boolean;
          last_synced_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["investment_accounts"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["investment_accounts"]["Insert"]>;
      };
      investment_positions: {
        Row: {
          id: string;
          investment_account_id: string;
          user_id: string;
          ticker_symbol: string | null;
          asset_name: string | null;
          asset_type: string | null;
          quantity: number | null;
          average_cost: number | null;
          current_price: number | null;
          current_value: number | null;
          unrealised_gain_loss: number | null;
          currency: string;
          last_updated_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["investment_positions"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["investment_positions"]["Insert"]>;
      };
      manual_assets: {
        Row: {
          id: string;
          user_id: string;
          asset_type: string;
          asset_name: string;
          estimated_value: number;
          currency: string;
          notes: string | null;
          property_address: string | null;
          outstanding_loan: number | null;
          last_valued_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["manual_assets"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["manual_assets"]["Insert"]>;
      };
      milestones: {
        Row: {
          id: string;
          user_id: string;
          milestone_type: string;
          title: string;
          target_amount: number | null;
          current_amount: number;
          target_date: string | null;
          monthly_savings: number | null;
          projected_date: string | null;
          on_track: boolean | null;
          is_complete: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["milestones"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["milestones"]["Insert"]>;
      };
      wellness_scores: {
        Row: {
          id: string;
          user_id: string;
          overall_score: number | null;
          liquidity_score: number | null;
          diversification_score: number | null;
          debt_score: number | null;
          savings_rate_score: number | null;
          milestone_score: number | null;
          net_worth: number | null;
          total_assets: number | null;
          total_liabilities: number | null;
          monthly_income: number | null;
          monthly_expenses: number | null;
          emergency_fund_months: number | null;
          savings_rate_pct: number | null;
          calculated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["wellness_scores"]["Row"], "id" | "calculated_at">;
        Update: Partial<Database["public"]["Tables"]["wellness_scores"]["Insert"]>;
      };
      insights: {
        Row: {
          id: string;
          user_id: string;
          insight_type: string;
          title: string;
          body: string;
          data_point: string | null;
          severity: "info" | "warning" | "positive";
          is_dismissed: boolean;
          dismissed_at: string | null;
          generated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["insights"]["Row"], "id" | "generated_at">;
        Update: Partial<Database["public"]["Tables"]["insights"]["Insert"]>;
      };
      scenarios: {
        Row: {
          id: string;
          user_id: string;
          scenario_name: string;
          scenario_type: string;
          parameters: Json;
          baseline_net_worth_10yr: number | null;
          scenario_net_worth_10yr: number | null;
          net_difference: number | null;
          summary_text: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["scenarios"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["scenarios"]["Insert"]>;
      };
      stress_test_results: {
        Row: {
          id: string;
          user_id: string;
          scenario_name: string;
          result: "safe" | "stressed" | "critical";
          months_sustainable: number | null;
          shortfall_amount: number | null;
          summary_text: string | null;
          calculated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["stress_test_results"]["Row"], "id" | "calculated_at">;
        Update: Partial<Database["public"]["Tables"]["stress_test_results"]["Insert"]>;
      };
    };
  };
}
