-- Insert demo organization
INSERT INTO public.organizations (id, name, industry, size, current_maturity_level, baseline_risk_exposure, current_risk_exposure)
VALUES (
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  'Acme Financial Services',
  'Financial Services',
  'large',
  'level_3',
  450000000,
  285000000
);

-- Insert compliance framework
INSERT INTO public.compliance_frameworks (organization_id, framework, is_primary)
VALUES 
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'nist_csf', true),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'iso_27001', false),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'soc2', false);

-- Insert threat scenarios with FAIR data (excluding generated columns)
INSERT INTO public.threat_scenarios (organization_id, name, description, threat_type, asset_at_risk, threat_event_frequency, vulnerability_factor, primary_loss_magnitude, secondary_loss_magnitude, risk_level, mitigating_control_ids)
VALUES 
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'SQL Injection Data Breach', 'External attackers exploit SQL injection vulnerabilities to access customer database', 'External Attack', 'Customer Database (10M records)', 10, 0.12, 50000000, 35400000, 'medium', ARRAY['4a48c256-9357-43fc-9de2-0f943f56fa86', 'dd283379-bf98-48c3-a9bc-582b6a753d52']::uuid[]),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Ransomware Infection', 'Ransomware attack through phishing email compromises critical systems', 'Malware', 'Core Banking Infrastructure', 8, 0.15, 80000000, 40800000, 'high', ARRAY['9371092a-94d2-4908-b412-8069a4e5cf55', 'f4a37ccb-27de-45db-afc7-1c56c3de5e93']::uuid[]),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Insider Data Theft', 'Malicious insider exfiltrates sensitive customer financial data', 'Insider Threat', 'Financial Records', 5, 0.18, 30000000, 15200000, 'medium', ARRAY['0b7c69fe-c7a4-42b5-83ef-d941c9547b6d', '2c43a8ab-c1ba-4b49-aed8-99ed97b02652']::uuid[]),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Phishing Account Takeover', 'Credential theft through targeted phishing leads to unauthorized account access', 'Social Engineering', 'Employee Credentials', 15, 0.22, 20000000, 12600000, 'medium', ARRAY['96fb913e-8073-4c38-857f-a243b9fa2f49', '82f19135-625b-4f1e-bddb-b8c864f55aca']::uuid[]);

-- Insert organization controls with varied statuses
INSERT INTO public.organization_controls (organization_id, control_id, is_enabled, current_status, pass_rate, risk_weight, last_tested_at)
VALUES
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '0b7c69fe-c7a4-42b5-83ef-d941c9547b6d', true, 'pass', 98, 1.2, now() - interval '2 minutes'),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '6b84ee3e-b7d8-4437-8be5-f75b362cc7f3', true, 'pass', 94, 1.0, now() - interval '5 minutes'),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '2c43a8ab-c1ba-4b49-aed8-99ed97b02652', true, 'warning', 87, 1.3, now() - interval '8 minutes'),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '7ad88577-b7c8-4ab1-bafb-4b4f6373c54c', true, 'pass', 96, 1.1, now() - interval '3 minutes'),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '96fb913e-8073-4c38-857f-a243b9fa2f49', true, 'pass', 91, 1.4, now() - interval '6 minutes'),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '4a48c256-9357-43fc-9de2-0f943f56fa86', true, 'pass', 95, 1.2, now() - interval '4 minutes'),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '974d04b0-b687-48bc-97f0-fcf49058e953', true, 'pass', 97, 1.1, now() - interval '7 minutes'),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'dd283379-bf98-48c3-a9bc-582b6a753d52', true, 'fail', 72, 1.5, now() - interval '12 minutes'),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'f4a37ccb-27de-45db-afc7-1c56c3de5e93', true, 'pass', 93, 1.2, now() - interval '9 minutes'),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '9371092a-94d2-4908-b412-8069a4e5cf55', true, 'pass', 89, 1.3, now() - interval '11 minutes'),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '82f19135-625b-4f1e-bddb-b8c864f55aca', true, 'pass', 92, 1.0, now() - interval '15 minutes'),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '48053d85-a66c-4a7a-bf74-bb43997a8820', true, 'warning', 84, 1.2, now() - interval '20 minutes');

-- Insert maturity assessment
INSERT INTO public.maturity_assessments (organization_id, overall_level, domain_scores, improvement_recommendations, projected_risk_reduction)
VALUES (
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  'level_3',
  '{"identify": 3.2, "protect": 3.5, "detect": 3.4, "respond": 3.1, "recover": 2.9}',
  '[{"domain": "recover", "recommendation": "Implement automated backup verification", "impact": "high"}, {"domain": "identify", "recommendation": "Enhance asset discovery automation", "impact": "medium"}]',
  75000000
);

-- Insert risk calculation history
INSERT INTO public.risk_calculations (organization_id, compliance_score, control_pass_rate, maturity_level, total_risk_exposure, projected_risk_exposure, calculation_details, calculated_at)
VALUES
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 87, 91, 'level_3', 285000000, 210000000, '{"threat_scenarios": 4, "controls_tested": 12, "methodology": "FAIR"}', now()),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 85, 89, 'level_3', 310000000, 235000000, '{"threat_scenarios": 4, "controls_tested": 12, "methodology": "FAIR"}', now() - interval '1 month'),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 82, 86, 'level_3', 340000000, 260000000, '{"threat_scenarios": 4, "controls_tested": 12, "methodology": "FAIR"}', now() - interval '2 months'),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 78, 82, 'level_2', 380000000, 290000000, '{"threat_scenarios": 4, "controls_tested": 10, "methodology": "FAIR"}', now() - interval '3 months'),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 74, 78, 'level_2', 420000000, 320000000, '{"threat_scenarios": 4, "controls_tested": 10, "methodology": "FAIR"}', now() - interval '4 months'),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 70, 74, 'level_2', 450000000, 350000000, '{"threat_scenarios": 4, "controls_tested": 8, "methodology": "FAIR"}', now() - interval '5 months');