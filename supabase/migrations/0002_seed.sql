-- TutorFinder BD — seed reference data (Dhaka areas, subjects, levels)
-- Apply after 0001 via: supabase db push

insert into public.areas (slug, name, bengali_name, thana) values
  ('dhanmondi', 'Dhanmondi', 'ধানমন্ডি', 'Dhanmondi'),
  ('uttara', 'Uttara', 'উত্তরা', 'Uttara'),
  ('gulshan', 'Gulshan', 'গুলশান', 'Gulshan'),
  ('banani', 'Banani', 'বনানী', 'Banani'),
  ('bashundhara', 'Bashundhara R/A', 'বসুন্ধরা', 'Badda'),
  ('badda', 'Badda', 'বাড্ডা', 'Badda'),
  ('mirpur', 'Mirpur', 'মিরপুর', 'Mirpur'),
  ('mohammadpur', 'Mohammadpur', 'মোহাম্মদপুর', 'Mohammadpur'),
  ('tejgaon', 'Tejgaon', 'তেজগাঁও', 'Tejgaon'),
  ('khilgaon', 'Khilgaon', 'খিলগাঁও', 'Khilgaon'),
  ('motijheel', 'Motijheel', 'মতিঝিল', 'Motijheel'),
  ('wari', 'Wari', 'ওয়ারী', 'Wari'),
  ('lalbagh', 'Old Dhaka (Lalbagh)', 'লালবাগ', 'Lalbagh'),
  ('cantonment', 'Dhaka Cantonment', 'ঢাকা ক্যান্টনমেন্ট', 'Cantonment'),
  ('ramna', 'Ramna', 'রমনা', 'Ramna'),
  ('keraniganj', 'Keraniganj', 'কেরানীগঞ্জ', 'Keraniganj'),
  ('savar', 'Savar', 'সাভার', 'Savar')
on conflict (slug) do nothing;

insert into public.subjects (slug, name, bengali_name, category) values
  -- academic
  ('bangla', 'Bangla', 'বাংলা', 'academic'),
  ('english', 'English', 'ইংরেজি', 'academic'),
  ('math', 'Mathematics', 'গণিত', 'academic'),
  ('higher-math', 'Higher Mathematics', 'উচ্চতর গণিত', 'academic'),
  ('physics', 'Physics', 'পদার্থবিজ্ঞান', 'academic'),
  ('chemistry', 'Chemistry', 'রসায়ন', 'academic'),
  ('biology', 'Biology', 'জীববিজ্ঞান', 'academic'),
  ('ict', 'ICT', 'আইসিটি', 'academic'),
  ('accounting', 'Accounting', 'হিসাববিজ্ঞান', 'academic'),
  ('finance', 'Finance & Banking', 'ফিন্যান্স ও ব্যাংকিং', 'academic'),
  ('economics', 'Economics', 'অর্থনীতি', 'academic'),
  ('statistics', 'Statistics', 'পরিসংখ্যান', 'academic'),
  ('history', 'History', 'ইতিহাস', 'academic'),
  ('geography', 'Geography', 'ভূগোল', 'academic'),
  ('islamic-studies', 'Islamic Studies', 'ইসলাম শিক্ষা', 'academic'),
  ('social-science', 'Social Science', 'সামাজিক বিজ্ঞান', 'academic'),
  -- admission / test prep
  ('admission-medical', 'Admission – Medical', 'মেডিকেল ভর্তি', 'admission'),
  ('admission-engineering', 'Admission – Engineering', 'ইঞ্জিনিয়ারিং ভর্তি', 'admission'),
  ('admission-general', 'Admission – University (general)', 'বিশ্ববিদ্যালয় ভর্তি', 'admission'),
  ('ielts', 'IELTS', 'আইইএলটিএস', 'testprep'),
  ('gre', 'GRE', 'জিআরই', 'testprep'),
  ('sat', 'SAT', 'স্যাট', 'testprep'),
  -- madrasa
  ('madrasa-dakhil', 'Dakhil (Madrasa)', 'দাখিল', 'madrasa'),
  ('madrasa-alim', 'Alim (Madrasa)', 'আলিম', 'madrasa'),
  -- language / quran / skills
  ('arabic-quran', 'Arabic & Quran', 'আরবি ও কুরআন', 'language'),
  ('spoken-english', 'Spoken English', 'স্পোকেন ইংলিশ', 'language'),
  ('coding-kids', 'Coding for Kids', 'কোডিং', 'skills'),
  ('programming', 'Programming (Uni)', 'প্রোগ্রামিং', 'skills'),
  ('guitar', 'Guitar', 'গিটার', 'skills'),
  ('drawing', 'Drawing & Art', 'আঁকা', 'skills'),
  ('dance', 'Dance', 'নাচ', 'skills')
on conflict (slug) do nothing;

insert into public.levels (code, label) values
  ('primary', 'Primary (Class 1–5)'),
  ('class6-8', 'Class 6–8'),
  ('ssc-bangla', 'SSC – Bangla Medium'),
  ('ssc-english-version', 'SSC – English Version'),
  ('ssc-english-medium', 'SSC – English Medium (Cambridge)'),
  ('hsc-bangla', 'HSC – Bangla Medium'),
  ('hsc-english-version', 'HSC – English Version'),
  ('hsc-english-medium', 'HSC – English Medium (Cambridge)'),
  ('o-level', 'O-Level'),
  ('a-level', 'A-Level'),
  ('medical-admission', 'Medical Admission Test'),
  ('engineering-admission', 'Engineering Admission Test'),
  ('university-others', 'University Admission (others)'),
  ('university-current', 'Current University Courses'),
  ('madrasa-dakhil', 'Madrasa – Dakhil'),
  ('madrasa-alim', 'Madrasa – Alim'),
  ('ielts-toefl', 'IELTS / TOEFL'),
  ('skills', 'Skills & Hobbies')
on conflict (code) do nothing;

-- storage bucket for tutor photos (public read)
insert into storage.buckets (id, name, public)
values ('tutor-photos', 'tutor-photos', true)
on conflict (id) do nothing;

create policy "tutor_photos_public_read" on storage.objects
  for select using (bucket_id = 'tutor-photos');
create policy "tutor_photos_owner_write" on storage.objects
  for insert with check (bucket_id = 'tutor-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "tutor_photos_owner_update" on storage.objects
  for update using (bucket_id = 'tutor-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "tutor_photos_owner_delete" on storage.objects
  for delete using (bucket_id = 'tutor-photos' and (storage.foldername(name))[1] = auth.uid()::text);