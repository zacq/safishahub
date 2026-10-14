-- Follow-up fields captured at meetup
alter table leads add column if not exists priority text;
alter table leads add column if not exists location text;
alter table leads add column if not exists budget numeric;
alter table leads add column if not exists next_follow_up date;

-- Forward every new lead to Airtable "Follow-up Leads"
-- (base app0aMrhr5uIbYtKv, table tblx95Vhgabtp2wao).
-- Requires the PAT in Vault under the name 'airtable_pat':
--   select vault.create_secret('<AIRTABLE_PAT>', 'airtable_pat');
create extension if not exists pg_net;

create or replace function public.push_lead_to_airtable()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  pat text;
  vehicle text;
begin
  select decrypted_secret into pat from vault.decrypted_secrets where name = 'airtable_pat';
  if pat is null then
    return new;
  end if;

  vehicle := case new.asset_type
    when 'vehicle' then nullif(concat_ws(' ', new.vehicle_model, upper(new.registration_number)), '')
    when 'motorbike' then nullif(concat_ws(' ', 'Motorbike:', new.motorbike_model), 'Motorbike:')
    when 'carpet' then nullif(concat_ws(' ', 'Carpet:', new.carpet_type, new.carpet_size), 'Carpet:')
  end;

  perform net.http_post(
    url := 'https://api.airtable.com/v0/app0aMrhr5uIbYtKv/tblx95Vhgabtp2wao',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || pat,
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'typecast', true,
      'records', jsonb_build_array(jsonb_build_object(
        'fields', jsonb_strip_nulls(jsonb_build_object(
          'Customer Name', nullif(new.customer_name, ''),
          'Phone', nullif(new.customer_phone, ''),
          'Interests', nullif(new.customer_needs, ''),
          'Vehicle', vehicle,
          'Location', nullif(new.location, ''),
          'Budget (KES)', new.budget,
          'Priority', nullif(new.priority, ''),
          'Next Follow-up', new.next_follow_up,
          'Source', 'Walk-in',
          'Status', 'New',
          'Date Added', coalesce(new.date, current_date)
        ))
      ))
    )
  );

  return new;
end;
$$;

drop trigger if exists leads_to_airtable on leads;
create trigger leads_to_airtable
  after insert on leads
  for each row execute function public.push_lead_to_airtable();
