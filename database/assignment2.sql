-- 1 -- 
INSERT INTO public.account 
	(account_firstname, account_lastname, account_email, account_password) 
	VALUES 
	('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');
	
-- 2 --
UPDATE public.account
	SET account_type = 'Admin'
	WHERE account_email = 'tony@starkent.com';
	
-- 3 --
DELETE FROM public.account
	WHERE account_email = 'tony@starkent.com';

-- 4 --
UPDATE public.inventory
	SET inv_description = 'Do you have 6 kids and like to go offroading? The Hummer gives you the a huge interior with an engine to get you out of any muddy or rocky situation.'
	WHERE inv_make = 'GM' AND inv_model = 'Hummer';

-- 5 --
SELECT inv_make , inv_model , classification_name
	FROM public.inventory i JOIN public.classification c
	ON i.classification_id = c.classification_id
	WHERE c.classification_name = 'Sport';

-- 6 --
UPDATE public.inventory
SET inv_image = regexp_replace(inv_image, '(^/images)(/)', '\1/vehicles\2'),
    inv_thumbnail = regexp_replace(inv_thumbnail, '(^/images)(/)', '\1/vehicles\2');