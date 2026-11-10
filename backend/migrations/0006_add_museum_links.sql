ALTER TABLE museums ADD COLUMN image_url TEXT;
ALTER TABLE museums ADD COLUMN two_gis_url TEXT;

UPDATE museums SET 
    image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Abai_Kunanbayev_Museum.jpg/800px-Abai_Kunanbayev_Museum.jpg',
    two_gis_url = 'https://2gis.kz/almaty/search/Музей%20Абая'
WHERE name = 'Музей Абая';

UPDATE museums SET 
    image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Mukhtar_Auezov_Museum.jpg/800px-Mukhtar_Auezov_Museum.jpg',
    two_gis_url = 'https://2gis.kz/almaty/search/Музей%20Ауэзова'
WHERE name = 'Музей Мухтара Ауэзова';

UPDATE museums SET 
    image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Akhmet_Baitursynov_Museum.jpg/800px-Akhmet_Baitursynov_Museum.jpg',
    two_gis_url = 'https://2gis.kz/almaty/search/Музей%20Байтурсынова'
WHERE name = 'Музей Ахмета Байтурсынова';

UPDATE museums SET 
    image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Gabit_Musrepov_Museum.jpg/800px-Gabit_Musrepov_Museum.jpg',
    two_gis_url = 'https://2gis.kz/almaty/search/Музей%20Мусрепова'
WHERE name = 'Музей Габита Мусрепова';

UPDATE museums SET 
    image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Saken_Seifullin_Museum.jpg/800px-Saken_Seifullin_Museum.jpg',
    two_gis_url = 'https://2gis.kz/almaty/search/Музей%20Сейфуллина'
WHERE name = 'Музей Сакена Сейфуллина';
