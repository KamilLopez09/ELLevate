-- Use the latest pass row per camper (not max cumulative) so retried syncs stay accurate.

CREATE OR REPLACE FUNCTION public.get_group_leaderboard(p_group_letter text)
RETURNS TABLE (
  camper_id text,
  first_name text,
  last_initial text,
  cumulative_score integer,
  weeks_passed bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    t.camper_id,
    (array_agg(t.first_name ORDER BY t.completed_at DESC))[1] AS first_name,
    (array_agg(t.last_initial ORDER BY t.completed_at DESC))[1] AS last_initial,
    coalesce(
      (array_agg(t.cumulative_score ORDER BY t.completed_at DESC))[1],
      0
    )::integer AS cumulative_score,
    count(DISTINCT t.week_number) AS weeks_passed
  FROM public.camper_telemetry AS t
  WHERE t.group_letter = upper(trim(p_group_letter))
  GROUP BY t.camper_id
  ORDER BY cumulative_score DESC, weeks_passed DESC, camper_id ASC;
$$;

REVOKE ALL ON FUNCTION public.get_group_leaderboard(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_group_leaderboard(text) TO service_role;
