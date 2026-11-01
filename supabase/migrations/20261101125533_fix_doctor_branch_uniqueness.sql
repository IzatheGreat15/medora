ALTER TABLE public.doctor_branches
DROP CONSTRAINT doctor_branches_doctor_clinic_unique;

ALTER TABLE public.doctor_branches
ADD CONSTRAINT doctor_branches_doctor_branch_unique
UNIQUE (doctor_id, branch_id);