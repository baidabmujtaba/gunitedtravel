-- Add booking fields to service_requests
ALTER TABLE public.service_requests
  ADD COLUMN IF NOT EXISTS booking_type text,
  ADD COLUMN IF NOT EXISTS persons integer,
  ADD COLUMN IF NOT EXISTS travel_class text;

-- History table
CREATE TABLE IF NOT EXISTS public.request_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  old_status text,
  new_status text NOT NULL,
  changed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.request_status_history TO authenticated;
GRANT ALL ON public.request_status_history TO service_role;

ALTER TABLE public.request_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read history" ON public.request_status_history
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System insert history" ON public.request_status_history
  FOR INSERT TO authenticated WITH CHECK (true);

-- Trigger to log status changes
CREATE OR REPLACE FUNCTION public.log_request_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.request_status_history(request_id, old_status, new_status, changed_by)
    VALUES (NEW.id, NULL, NEW.status::text, auth.uid());
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.request_status_history(request_id, old_status, new_status, changed_by)
    VALUES (NEW.id, OLD.status::text, NEW.status::text, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_request_status ON public.service_requests;
CREATE TRIGGER trg_log_request_status
AFTER INSERT OR UPDATE OF status ON public.service_requests
FOR EACH ROW EXECUTE FUNCTION public.log_request_status_change();