-- Schedule hourly control tests (runs at the top of every hour)
SELECT cron.schedule(
  'run-scheduled-control-tests',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://oiawdxbwnfupwajxfdcp.supabase.co/functions/v1/run-scheduled-tests',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pYXdkeGJ3bmZ1cHdhanhmZGNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMjc0MzMsImV4cCI6MjA4MTkwMzQzM30.1e8SkUBYhRpt1XpR9EeBKytaX0eFXNH33aD1em_mcnk'
    ),
    body := jsonb_build_object('timestamp', now()::text)
  );
  $$
);