-- supabase/migrations/20260226000002_seed_countries.sql
-- EU-27 member states seed
-- Ordered alphabetically by ISO code
-- flag_emoji: Unicode regional indicator symbols

INSERT INTO countries (code, name_es, name_en, flag_emoji) VALUES
  ('AT', 'Austria',        'Austria',        '🇦🇹'),
  ('BE', 'Bélgica',        'Belgium',        '🇧🇪'),
  ('BG', 'Bulgaria',       'Bulgaria',       '🇧🇬'),
  ('HR', 'Croacia',        'Croatia',        '🇭🇷'),
  ('CY', 'Chipre',         'Cyprus',         '🇨🇾'),
  ('CZ', 'Chequia',        'Czechia',        '🇨🇿'),
  ('DK', 'Dinamarca',      'Denmark',        '🇩🇰'),
  ('EE', 'Estonia',        'Estonia',        '🇪🇪'),
  ('FI', 'Finlandia',      'Finland',        '🇫🇮'),
  ('FR', 'Francia',        'France',         '🇫🇷'),
  ('DE', 'Alemania',       'Germany',        '🇩🇪'),
  ('GR', 'Grecia',         'Greece',         '🇬🇷'),
  ('HU', 'Hungría',        'Hungary',        '🇭🇺'),
  ('IE', 'Irlanda',        'Ireland',        '🇮🇪'),
  ('IT', 'Italia',         'Italy',          '🇮🇹'),
  ('LV', 'Letonia',        'Latvia',         '🇱🇻'),
  ('LT', 'Lituania',       'Lithuania',      '🇱🇹'),
  ('LU', 'Luxemburgo',     'Luxembourg',     '🇱🇺'),
  ('MT', 'Malta',          'Malta',          '🇲🇹'),
  ('NL', 'Países Bajos',   'Netherlands',    '🇳🇱'),
  ('PL', 'Polonia',        'Poland',         '🇵🇱'),
  ('PT', 'Portugal',       'Portugal',       '🇵🇹'),
  ('RO', 'Rumanía',        'Romania',        '🇷🇴'),
  ('SK', 'Eslovaquia',     'Slovakia',       '🇸🇰'),
  ('SI', 'Eslovenia',      'Slovenia',       '🇸🇮'),
  ('ES', 'España',         'Spain',          '🇪🇸'),
  ('SE', 'Suecia',         'Sweden',         '🇸🇪');
