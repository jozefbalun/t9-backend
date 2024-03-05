# T9 Backend
Backend for generate combinations based t9 input. Uses serverless supabase functions.

## Features
- Generate combinations
- Match with real words. Enabled by default. Currently, contains ~4000 most common english words.

## Requirements
Function `word-from-input` needs database table `wordlist`.
```sql
create table
  public.wordlist (
    id serial,
    word text not null,
    constraint wordlist_pkey primary key (id)
  ) tablespace pg_default;
```

### env
- `SUPABASE_URL=`
- `SUPABASE_ANON_KEY=`


## Develop

### Deploy function
`supabase functions deploy word-from-input --project-ref rbdnjaimjzibimdnnwjt`
