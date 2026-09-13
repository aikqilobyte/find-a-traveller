insert into categories (name, slug) values
  ('Documents', 'documents'),
  ('Books', 'books'),
  ('Clothing', 'clothing'),
  ('Electronics', 'electronics'),
  ('Luxury', 'luxury'),
  ('Gifts', 'gifts'),
  ('Other', 'other')
on conflict (name) do nothing;
