export interface FollowupOption {
  label_en: string;
  label_ur: string;
  symptom: string;
}

export interface PredictRequest {
  user_input: string;
  session_id?: string;
  accumulated_symptoms?: string[];
  force_predict?: boolean;
}

export interface PredictResponse {
  // Multi-step flow control
  flow_step?: 'followup' | 'result' | null;
  followup_question?: string;
  followup_question_ur?: string;
  followup_options?: FollowupOption[];

  status: 'success' | 'insufficient_symptoms' | 'low_confidence';
  prediction_id?: number;
  extracted_symptoms: string[];
  message?: string;
  suggestions?: string[];
  detected_language?: string;
  translated_text?: string;
  xgb_prediction?: string;
  xgb_confidence?: number;
  xgb_top3?: Array<{ disease: string; confidence: number }>;
  rf_prediction?: string;
  rf_confidence?: number;
  bert_prediction?: string;
  bert_confidence?: number;
  severity?: 'Mild' | 'Moderate' | 'Severe';
  recommendation?: string[];
  doctor_consultation?: string;
  symptom_count?: number;
  disclaimer?: string;
  disease_max_symptoms?: string;
  precautionary_measures?: string;

  // Lab test confirmation
  test_recommendation?: string;
}

export interface FeedbackRequest {
  prediction_id: number;
  rating: number;
  comment: string;
}

export interface HistoryItem {
  id: number;
  user_input: string;
  xgb_prediction: string;
  severity: string;
  created_at: string;
}

export interface ApiStatus {
  status: string;
  online: boolean;
}
