CREATE TABLE museums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    founded_year INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO museums (name, description, city, address, founded_year) VALUES
('Музей Абая', 'Литературно-мемориальный музей казахского поэта Абая Кунанбаева.', 'Алматы', 'ул. Абая, 10', 1940),
('Музей Жамбыла', 'Музей народного поэта-акына Жамбыла Жабаева.', 'Алматы', 'ул. Жамбыла, 15', 1950),
('Музей Мухтара Ауэзова', 'Литературно-мемориальный музей писателя Мухтара Ауэзова.', 'Алматы', 'ул. Ауэзова, 20', 1963);
