export const CITY_ATTRACTIONS: Record<string, string[]> = {
  // México
  'Cancún': ['Zona Hoteleira', 'Chichen Itzá', 'Tulum', 'Isla Mujeres', 'Playa del Carmen', 'Cobá', 'Cenote Ik Kil', 'Xcaret', 'Xel-Há', 'Cenote Dos Ojos', 'Holbox', 'Mercado 28'],
  'Playa del Carmen': ['5ª Avenida', 'Cenote Azul', 'Tulum', 'Ilha Cozumel', 'Xcaret', 'Xel-Há', 'Akumal (tartarugas)', 'Laguna Bacalar'],
  'Cidade do México': ['Museu Nacional de Antropologia', 'Teotihuacán', 'Centro Histórico', 'Xochimilco', 'Frida Kahlo Museum', 'Chapultepec', 'Polanco', 'Mercado de La Merced', 'Palácio de Belas Artes', 'Torre Latinoamericana'],

  // Estados Unidos
  'Miami': ['South Beach', 'Wynwood Walls', 'Little Havana', 'Brickell', 'Bayside Marketplace', 'Everglades', 'Art Deco Historic District', 'Design District', 'Key Biscayne'],
  'Orlando': ['Walt Disney World', 'Universal Studios', 'Islands of Adventure', 'SeaWorld', 'LEGOLAND', 'Kennedy Space Center', 'International Drive', 'Disney Springs', 'ICON Park'],
  'Nova York': ['Times Square', 'Central Park', 'Estátua da Liberdade', 'Brooklyn Bridge', 'Metropolitan Museum', 'Empire State Building', 'High Line', 'Chelsea Market', 'MOMA', 'Coney Island', 'One World Trade Center'],
  'Los Angeles': ['Hollywood Boulevard', 'Santa Monica Pier', 'Griffith Observatory', 'Getty Center', 'Venice Beach', 'Universal Studios Hollywood', 'Beverly Hills', 'Malibu', 'Disneyland (Anaheim)'],
  'Las Vegas': ['The Strip', 'Fremont Street Experience', 'Grand Canyon', 'Red Rock Canyon', 'Hoover Dam', 'Cirque du Soleil', 'show no hotel Bellagio', 'Death Valley'],
  'San Francisco': ['Golden Gate Bridge', 'Alcatraz', 'Fisherman\'s Wharf', 'Chinatown', 'Napa Valley', 'Muir Woods', 'Lombard Street', 'Union Square'],

  // Europa
  'Lisboa': ['Torre de Belém', 'Mosteiro dos Jerónimos', 'Alfama', 'Sintra', 'Castelo de São Jorge', 'LX Factory', 'Oceanário', 'Museu de Arte Antiga', 'Cascais', 'Time Out Market'],
  'Porto': ['Ribeira', 'Caves de Vinho do Porto', 'Torre dos Clérigos', 'Parque de Serralves', 'Livraria Lello', 'Ponte Dom Luís I', 'Mercado do Bolhão', 'Matosinhos (frutos do mar)'],
  'Madrid': ['Museu do Prado', 'Parque del Retiro', 'Gran Vía', 'Plaza Mayor', 'Museu Rainha Sofia', 'Mercado de San Miguel', 'Toledo (day trip)', 'Segóvia (day trip)', 'Palácio Real'],
  'Barcelona': ['Sagrada Família', 'Park Güell', 'Las Ramblas', 'Bairro Gótico', 'Casa Batlló', 'Camp Nou', 'Mercado de La Boqueria', 'Barceloneta Beach', 'Montjuïc'],
  'Paris': ['Torre Eiffel', 'Museu do Louvre', 'Notre-Dame', 'Montmartre & Sacré-Cœur', 'Champs-Élysées', 'Museu de Orsay', 'Palace de Versailles', 'Marais', 'Sainte-Chapelle', 'Moulin Rouge'],
  'Roma': ['Coliseu', 'Vaticano & Museus', 'Fontana di Trevi', 'Pantheon', 'Fórum Romano', 'Piazza Navona', 'Campo de Fiori', 'Trastevere', 'Villa Borghese', 'Palatino'],
  'Florença': ['Galeria Uffizi', 'Catedral de Florença (Duomo)', 'Ponte Vecchio', 'David de Michelangelo (Academia)', 'Palazzo Pitti', 'Jardins de Boboli', 'Piazzale Michelangelo', 'San Gimignano'],
  'Veneza': ['Praça São Marcos', 'Palácio Ducal', 'Grande Canal', 'Ponte de Rialto', 'Ilha de Burano', 'Ilha de Murano', 'Basílica de São Marcos', 'Passeio de gôndola'],
  'Amsterdã': ['Museu Van Gogh', 'Anne Frank House', 'Rijksmuseum', 'Passeio de barco pelos canais', 'Vondelpark', 'Keukenhof (tulipas)', 'Bairro das Luzes', 'Heineken Experience'],
  'Praga': ['Castelo de Praga', 'Ponte Carlos', 'Praça da Cidade Velha', 'Relógio Astronômico', 'Josefov (bairro judeu)', 'Vyšehrad', 'Viagem a Český Krumlov'],
  'Budapeste': ['Parlamento húngaro', 'Bastião dos Pescadores', 'Banhos Széchenyi', 'Ponte das Correntes', 'Castelo de Buda', 'Ruin bars do Distrito 7', 'Ópera do Estado'],
  'Viena': ['Palácio Schönbrunn', 'Museu de História da Arte', 'Praça Stephansdom', 'Belvedere', 'Prater (roda gigante)', 'Café Central', 'Operahaus'],
  'Londres': ['Torre de Londres', 'Buckingham Palace', 'British Museum', 'London Eye', 'Tower Bridge', 'Hyde Park', 'Tate Modern', 'Covent Garden', 'Mercado de Borough', 'Kensington Palace'],
  'Atenas': ['Acrópole & Partenon', 'Museu da Acrópole', 'Ágora Antiga', 'Plaka', 'Museu Nacional de Arqueologia', 'Monte Licabeto', 'Cape Sounion (day trip)'],
  'Istambul': ['Mesquita Azul', 'Hagia Sophia', 'Grande Bazar', 'Topkapi Palace', 'Bósforo (passeio de barco)', 'Kapaliçarşı', 'Beyoğlu & Istiklal Caddesi', 'Galata Tower'],
  'Santorini': ['Oia (pôr do sol)', 'Fira', 'Praia de Perissa (areia vulcânica)', 'Praia Vermelha', 'Akrotiri (sítio arqueológico)', 'Imerovigli', 'Passeio de barco ao vulcão'],
  'Dubrovnik': ['Muralhas da cidade velha', 'Forte Lovrijenac', 'Ilha de Lokrum', 'Stradun', 'Teleférico de Dubrovnik', 'Praia de Banje', 'Passeio de barco pelas ilhas'],

  // América do Sul
  'Buenos Aires': ['La Boca & Caminito', 'Cemitério da Recoleta', 'Puerto Madero', 'Palermo', 'San Telmo (feira de domingo)', 'Teatro Colón', 'Tigre (delta do Paraná)', 'Barrancas de Belgrano'],
  'Santiago': ['Cerro San Cristóbal', 'Plaza de Armas', 'Barrio Bellavista', 'Mercado Central (frutos do mar)', 'Valparaíso (day trip)', 'Viña del Mar', 'Valle Nevado (ski)'],
  'Lima': ['Miraflores', 'Barranco', 'Larco Museum', 'Centro Histórico', 'Huaca Pucllana', 'Mercado de Surquillo', 'Gastronomia local (restaurantes Top 50)'],
  'Cusco': ['Machu Picchu', 'Vale Sagrado', 'Centro Histórico de Cusco', 'Sacsayhuamán', 'Mercado de San Pedro', 'Pisac (ruínas e mercado)', 'Chinchero', 'Rainbow Mountain (Vinicunca)'],
  'Bogotá': ['Centro Histórico La Candelaria', 'Museu do Ouro', 'Monserrate', 'Zona Rosa', 'Usaquén', 'Coffee tour (Eje Cafetero)'],
  'Cartagena': ['Cidade Murada', 'Castelo de San Felipe', 'Boca Grande', 'Ilha Barú', 'Rosario Islands', 'Getsemanê'],

  // Caribe
  'Punta Cana': ['Bávaro Beach', 'Cap Cana', 'Saona Island', 'Altos de Chavón', 'Dolphin Explorer', 'Mercado Artesanal'],
  'Aruba': ['Eagle Beach', 'Palm Beach', 'Arikok National Park', 'Alto Vista Chapel', 'Natural Pool', 'Oranjestad (capital)'],

  // Ásia
  'Tóquio': ['Shibuya Crossing', 'Templo Senso-ji (Asakusa)', 'Harajuku', 'Akihabara', 'Shinjuku', 'TeamLab Borderless', 'Monte Fuji (day trip)', 'Nikko', 'Palácio Imperial', 'Tsukiji Fish Market'],
  'Kyoto': ['Fushimi Inari', 'Arashiyama & Floresta de Bambu', 'Kinkaku-ji (Pavilhão Dourado)', 'Gion (geishas)', 'Nishiki Market', 'Templo Kiyomizudera', 'Nara (day trip — cervos)', 'Osaka (day trip)'],
  'Bangkok': ['Grand Palace', 'Wat Pho (Buda Reclinado)', 'Wat Arun', 'Khao San Road', 'Chatuchak Weekend Market', 'Passeio pelo Rio Chao Phraya', 'Mercado Flutuante', 'Ayutthaya (day trip)'],
  'Bali': ['Tanah Lot', 'Ubud & Floresta dos Macacos', 'Tegallalang (terraços de arroz)', 'Seminyak Beach', 'Kuta Beach', 'Templo Besakih', 'Nusa Penida', 'Rendang cooking class'],
  'Dubai': ['Burj Khalifa', 'Dubai Mall', 'Palm Jumeirah', 'Dubai Creek & Souk', 'Deserto (safari)', 'Frame Dubai', 'Marina Walk', 'Abu Dhabi (Mesquita Sheikh Zayed)'],
  'Singapura': ['Gardens by the Bay', 'Marina Bay Sands', 'Sentosa Island', 'Chinatown', 'Little India', 'Clarke Quay', 'Singapore Zoo', 'Orchard Road'],
  'Maldivas': ['Snorkel no recife de corais', 'Pôr do sol no bangalô sobre a água', 'Passeio de dhoni (barco local)', 'Observação de golfinhos', 'Mergulho', 'Praia privativa', 'Spa sobre a água'],

  // África & Oriente Médio
  'Cairo': ['Pirâmides de Gizé & Esfinge', 'Museu Egípcio', 'Khan el-Khalili (bazar)', 'Luxor (day trip)', 'Rio Nilo (passeio de feluca)', 'Cidadela de Saladin'],
  'Cidade do Cabo': ['Table Mountain', 'Boulders Beach (pinguins)', 'Cape Point', 'V&A Waterfront', 'Bairro Bo-Kaap', 'Rota dos Vinhos (Stellenbosch)', 'Robben Island'],

  // Brasil
  'Rio de Janeiro': ['Cristo Redentor', 'Pão de Açúcar', 'Copacabana', 'Ipanema', 'Santa Teresa', 'Museu do Amanhã', 'Escadaria Selarón', 'Floresta da Tijuca', 'Prainha', 'Parque Lage'],
  'São Paulo': ['Ibirapuera', 'Museu de Arte de São Paulo (MASP)', 'Vila Madalena & Beco do Batman', 'Mercado Municipal (Mercadão)', 'Liberdade (bairro japonês)', 'Pinacoteca', 'Avenida Paulista', 'Bar original & gastronomia paulistana'],
  'Florianópolis': ['Lagoa da Conceição', 'Praia da Joaquina', 'Praia do Campeche', 'Lagoa do Peri', 'Ilha do Campeche', 'Sambaqui', 'Mercado Público'],
  'Foz do Iguaçu': ['Cataratas do Iguaçu (lado brasileiro)', 'Cataratas do Iguaçu (lado argentino)', 'Parque das Aves', 'Itaipu Binacional', 'Marco das três fronteiras', 'Rafting no Rio Iguaçu'],
  'Salvador': ['Pelourinho', 'Elevador Lacerda', 'Mercado Modelo', 'Forte de Santo Antônio', 'Porto da Barra', 'Igreja de São Francisco', 'Bonfim', 'Morro de São Paulo'],
  'Manaus': ['Teatro Amazonas', 'Encontro das Águas', 'Mercado Municipal Adolpho Lisboa', 'Tour pela floresta amazônica', 'Pesca de piranha', 'Museu do Índio'],
}

export const GENERIC_ATTRACTIONS: Record<string, string[]> = {
  gastronomico: ['Tour gastronômico local', 'Mercado tradicional', 'Aula de culinária local', 'Restaurante premiado do destino', 'Degustação de vinhos ou cervejas locais'],
  cultural: ['Museu histórico local', 'Centro histórico', 'Galeria de arte', 'Show de dança ou música tradicional', 'Visita a templo ou catedral'],
  aventura: ['Trilha na natureza', 'Rafting ou esportes aquáticos', 'Tirolesa', 'Passeio de bicicleta', 'Escalada ou rapel'],
  relax: ['Spa e massagem', 'Praia particular', 'Piscina natural', 'Tarde livre no resort', 'Pôr do sol no deck'],
  compras: ['Shopping local', 'Mercado de artesanato', 'Bairro de lojas de grife', 'Feira livre', 'Outlets'],
  natureza: ['Parque nacional', 'Trilha ecológica', 'Observação de animais', 'Cachoeira', 'Jardim botânico'],
  historico: ['Ruínas arqueológicas', 'Castelo ou palácio', 'Museu de história', 'Sítio histórico tombado', 'Tour guiado no centro antigo'],
  praias: ['Praia principal do destino', 'Snorkel ou mergulho', 'Passeio de barco pelo litoral', 'Praia escondida (off the beaten path)', 'Esportes de praia'],
  familia: ['Parque temático', 'Aquário ou zoológico', 'Museu interativo', 'Passeio de barco', 'Parque de diversões'],
}
