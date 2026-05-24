
DROP POLICY "Anyone submits request" ON public.service_requests;
CREATE POLICY "Anyone submits request" ON public.service_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(name) BETWEEN 1 AND 200
    AND char_length(phone) BETWEEN 4 AND 40
    AND (message IS NULL OR char_length(message) <= 2000)
  );

DROP POLICY "Anyone records click" ON public.click_events;
CREATE POLICY "Anyone records click" ON public.click_events
  FOR INSERT TO anon, authenticated
  WITH CHECK (char_length(kind) BETWEEN 1 AND 60);
