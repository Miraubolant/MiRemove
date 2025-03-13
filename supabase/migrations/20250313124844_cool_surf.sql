-- Update contact emails in legal content
UPDATE legal_content
SET content = REPLACE(
  REPLACE(
    REPLACE(
      content,
      'privacy@miremover.com',
      'contact@miraubolant.com'
    ),
    'terms@miremover.com',
    'contact@miraubolant.com'
  ),
  'dpo@miremover.com',
  'contact@miraubolant.com'
)
WHERE type IN ('privacy', 'terms', 'gdpr');