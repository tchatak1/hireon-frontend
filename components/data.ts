export const SKILLS = ['Painters', 'Electrician', 'Mechanic', 'Plumber', 'Carpenter', 'Tiler'];

export const HERO_IMAGES: Record<string, any> = {
  Painters:    { uri: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800' },
  Electrician: { uri: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800' },
  Mechanic:    { uri: 'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=800' },
  Plumber:     { uri: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800' },
  Carpenter:   { uri: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800' },
  Tiler:       { uri: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800' },
};

export const TOP_PICKS: Record<string, any[]> = {
  Painters: [
    { id: '1', name: 'Abdul Hafiz', location: 'Bonaberi-Douala',  rating: 3.5, image: { uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' } },
    { id: '2', name: 'Jeff Ateba',  location: 'Buea-Mayor street', rating: 4.2, image: { uri: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400' } },
    { id: '3', name: 'Paul Mbarga', location: 'Yaounde Centre',    rating: 4.0, image: { uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400' } },
  ],
  Electrician: [
    { id: '4', name: 'Eric Fon',    location: 'Akwa-Douala',  rating: 4.5, image: { uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400' } },
    { id: '5', name: 'Steve Bello', location: 'Biyem-Assi',   rating: 3.8, image: { uri: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400' } },
  ],
  Mechanic:  [{ id: '6', name: 'Chris Nkeng', location: 'Mvan-Yaounde', rating: 4.1, image: { uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400' } }],
  Plumber:   [{ id: '7', name: 'Boris Tabi',  location: 'Limbe Centre',  rating: 3.9, image: { uri: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400' } }],
  Carpenter: [{ id: '8', name: 'Alain Yong',  location: 'Bafoussam',     rating: 4.3, image: { uri: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400' } }],
  Tiler:     [{ id: '9', name: 'René Mbida',  location: 'Ngousso',       rating: 4.0, image: { uri: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400' } }],
};

export const NEW_PROFESSIONALS: Record<string, any[]> = {
  Painters: [
    { id: 'n1', name: 'Luc Essomba', location: 'Nkol-Eton',   rating: 3.2, image: { uri: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=400' } },
    { id: 'n2', name: 'Marc Dion',   location: 'Ekounou',      rating: 3.5, image: { uri: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400' } },
    { id: 'n3', name: 'Guy Tchamba', location: 'Deido-Douala', rating: 3.0, image: { uri: 'https://images.unsplash.com/photo-1542206395-9feb3edaa68d?w=400' } },
  ],
  Electrician: [
    { id: 'n4', name: 'Herve Ndi',   location: 'Omnisport', rating: 3.3, image: { uri: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400' } },
    { id: 'n5', name: 'Joel Atanga', location: 'New Bell',   rating: 3.1, image: { uri: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=400' } },
  ],
  Mechanic:  [{ id: 'n6', name: 'Didier Kom', location: 'Bassa',     rating: 3.4, image: { uri: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400' } }],
  Plumber:   [{ id: 'n7', name: 'Felix Eba',  location: 'Bonaberi',  rating: 3.0, image: { uri: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400' } }],
  Carpenter: [{ id: 'n8', name: 'Serge Ako',  location: 'Essos',     rating: 3.6, image: { uri: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400' } }],
  Tiler:     [{ id: 'n9', name: 'Pierre Zoa', location: 'Mvog-Ada',  rating: 3.2, image: { uri: 'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?w=400' } }],
};