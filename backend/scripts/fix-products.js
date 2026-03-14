require('dotenv').config();
const { getDB } = require('./config/firebase');

async function fixProducts() {
  const db = getDB();

  // 1. Fetch all existing products
  const snapshot = await db.collection('products').get();
  const allProducts = [];
  snapshot.forEach(doc => {
    allProducts.push({ id: doc.id, ...doc.data() });
  });

  console.log(`Found ${allProducts.length} total products in database. Cleaning up...`);

  // 2. Delete all existing products to start fresh
  const deleteBatch = db.batch();
  allProducts.forEach(p => {
    deleteBatch.delete(db.collection('products').doc(p.id));
  });
  await deleteBatch.commit();
  console.log('All existing duplicate products deleted.');

  // 3. Define the exactly 12 products we want with their images
  const productsToKeep = [
    { 
      brand: 'Bosch', name: 'Serie 6 PID775DC1E 2-Zone', price: 6799, oldPrice: 9499, type: 'Portable',
      wattage: '3400W', zones: '2 Zones', tag: 'TOP RATED', tagCls: '', rating: 4.8, reviews: 891, inStock: true,
      features: ['PowerBoost','FlexInduction','AutoHeat Plus','PerfectFry Sensor'],
      specs: {Wattage:'3400W',Zones:'2',Weight:'2.8 kg',Warranty:'3 Years',Voltage:'230V AC'},
      image: 'https://i.ibb.co/tMcSRYRF/1-3.webp',
      images: [
        'https://i.ibb.co/tMcSRYRF/1-3.webp',
        'https://i.ibb.co/YB7MNnwr/1-2-1.webp',
        'https://i.ibb.co/WW5shQV1/1-1.webp'
      ]
    },
    { 
      brand: 'Philips', name: 'Viva Collection HD4928 2100W', price: 3299, oldPrice: 4999, type: 'Portable',
      wattage: '2100W', zones: '1 Zone', tag: 'HOT DEAL', tagCls: 'sale', rating: 4.6, reviews: 4892, inStock: true,
      features: ['Rapid Heat Tech','Keep Warm','10 Settings','Smooth Touch'],
      specs: {Wattage:'2100W',Zones:'1',Weight:'2.1 kg',Warranty:'2 Years',Voltage:'230V AC'},
      image: 'https://i.ibb.co/bRCC59Lx/1-3-1.webp',
      images: [
        'https://i.ibb.co/bRCC59Lx/1-3-1.webp',
        'https://i.ibb.co/4gCcGhzY/1-2-2.webp',
        'https://i.ibb.co/rRpDbfbC/1-1-1.webp'
      ]
    },
    { 
      brand: 'Pigeon', name: 'Rapido Cute Induction Cooktop 1800W', price: 3595, oldPrice: 4999, type: 'Portable',
      wattage: '1800W', zones: '1 Zone', tag: 'HOT DEAL', tagCls: 'sale', rating: 4.3, reviews: 3842, inStock: true,
      features: ['7 Preset Menus','LED Display','Child Lock','Auto Voltage Regulator'],
      specs: {Wattage:'1800W',Zones:'1',Weight:'1.5 kg',Warranty:'1 Year',Voltage:'230V AC'},
      image: 'https://i.ibb.co/TB1PyvWW/1-3.avif',
      images: [
        'https://i.ibb.co/TB1PyvWW/1-3.avif',
        'https://i.ibb.co/BHRZY5Fk/1-2.avif',
        'https://i.ibb.co/nNVH8LMk/1-1.avif'
      ]
    },
    { 
      brand: 'Koryo', name: 'KIC27SP Induction Cooktop 2000W', price: 1499, oldPrice: 2999, type: 'Portable',
      wattage: '2000W', zones: '1 Zone', tag: 'EFFICIENT', tagCls: 'new', rating: 4.3, reviews: 721, inStock: true,
      features: ['Feather Touch','High-Temp Protection','8 Auto-cook Programs','Polished Glass'],
      specs: {Wattage:'2000W',Zones:'1',Weight:'2.0 kg',Warranty:'1 Year',Voltage:'230V AC'},
      image: 'https://i.ibb.co/kg8w0V6J/1-jpg.jpg',
      images: ['https://i.ibb.co/kg8w0V6J/1-jpg.jpg']
    },
    { 
      brand: 'Morphy Richards', name: 'Primo Travel 1600W', price: 2799, oldPrice: 3799, type: 'Portable',
      wattage: '1600W', zones: '1 Zone', tag: 'COMPACT', tagCls: 'new', rating: 4.3, reviews: 567, inStock: true,
      features: ['Ultra Portable','Travel Pouch','Voltage Stabilizer','Quick Heat'],
      specs: {Wattage:'1600W',Zones:'1',Weight:'1.2 kg',Warranty:'1 Year',Voltage:'110-230V'},
      image: 'https://i.ibb.co/zWQL6q1j/2.webp',
      images: ['https://i.ibb.co/zWQL6q1j/2.webp']
    },
    { 
      brand: 'Philips', name: 'Premium HD4938 2100W', price: 4199, oldPrice: 5999, type: 'Portable',
      wattage: '2100W', zones: '1 Zone', tag: 'PREMIUM', tagCls: '', rating: 4.7, reviews: 2192, inStock: true,
      features: ['Sensor Touch','Glass Panel','Child Lock','Timer'],
      specs: {Wattage:'2100W',Zones:'1',Weight:'2.6 kg',Warranty:'2 Years',Voltage:'230V AC'},
      image: 'https://i.ibb.co/Z69226YV/2-3-jpg.jpg',
      images: [
        'https://i.ibb.co/Z69226YV/2-3-jpg.jpg',
        'https://i.ibb.co/Z1Jt7TBj/2-2-jpg.jpg',
        'https://i.ibb.co/r25FyFRC/2-1-jpg.jpg'
      ]
    },
    { 
      brand: 'iBELL', name: '20YO Cloud-X Induction Cooktop 2000W', price: 1333, oldPrice: 2499, type: 'Portable',
      wattage: '2000W', zones: '1 Zone', tag: 'AFFORDABLE', tagCls: 'sale', rating: 4.1, reviews: 2150, inStock: true,
      features: ['LED Display','Crystal Glass','Cool Touch','Auto-off'],
      specs: {Wattage:'2000W',Zones:'1',Weight:'1.4 kg',Warranty:'1 Year',Voltage:'230V AC'},
      image: 'https://i.ibb.co/DFmTwLS/1-3-2.webp',
      images: [
        'https://i.ibb.co/DFmTwLS/1-3-2.webp',
        'https://i.ibb.co/TD4DhfWL/1-2-3.webp',
        'https://i.ibb.co/g8YWR88/1-1-2.webp'
      ]
    },
    { 
      brand: 'Prestige', name: 'PIC 16.0+ Induction Cooktop', price: 4499, oldPrice: 5999, type: 'Portable',
      wattage: '2000W', zones: '1 Zone', tag: 'POPULAR', tagCls: '', rating: 4.5, reviews: 3120, inStock: true,
      features: ['Pan Sensor','8 Indian Menus','Countdown Timer','Safety Cutoff'],
      specs: {Wattage:'2000W',Zones:'1',Weight:'2.0 kg',Warranty:'2 Years',Voltage:'230V AC'},
      image: 'https://i.ibb.co/vxKKdFJP/1-3-3.webp',
      images: [
        'https://i.ibb.co/vxKKdFJP/1-3-3.webp',
        'https://i.ibb.co/27QTmJSw/1-2-4.webp',
        'https://i.ibb.co/67GcV873/1-1-3.webp'
      ]
    },
    { 
      brand: 'AmazonBasics', name: 'Induction Cooktop 1900W', price: 1900, oldPrice: 2999, type: 'Portable',
      wattage: '1900W', zones: '1 Zone', tag: 'BEST VALUE', tagCls: '', rating: 4.3, reviews: 4820, inStock: true,
      features: ['6 Preset Functions','Pause Function','Matte Finish','1-year Warranty'],
      specs: {Wattage:'1900W',Zones:'1',Weight:'1.9 kg',Warranty:'1 Year',Voltage:'230V AC'},
      image: 'https://i.ibb.co/gbQCQ3Dr/1-jpg-1.jpg',
      images: ['https://i.ibb.co/gbQCQ3Dr/1-jpg-1.jpg']
    },
    { 
      brand: 'Sunflame', name: 'SF-IC28 Induction Cooker 1400W', price: 2900, oldPrice: 5590, type: 'Portable',
      wattage: '1400W', zones: '1 Zone', tag: 'TRUSTED', tagCls: '', rating: 4.2, reviews: 543, inStock: true,
      features: ['Touch Panel','8 Power Levels','Indian Menu Options','Auto Cut-off'],
      specs: {Wattage:'1400W',Zones:'1',Weight:'1.5 kg',Warranty:'1 Year',Voltage:'230V AC'},
      image: 'https://i.ibb.co/qLBBsfQH/1.webp',
      images: ['https://i.ibb.co/qLBBsfQH/1.webp']
    },
    { 
      brand: 'Butterfly', name: 'Elite V3 Induction Cooktop 2200W', price: 4099, oldPrice: 5999, type: 'Portable',
      wattage: '2200W', zones: '1 Zone', tag: 'POWERFUL', tagCls: '', rating: 4.5, reviews: 1205, inStock: true,
      features: ['Touch Controls','Pan Sensor','Auto Shut-off','A-Grade Crystal Glass'],
      specs: {Wattage:'2200W',Zones:'1',Weight:'2.2 kg',Warranty:'1 Year',Voltage:'230V AC'},
      image: 'https://i.ibb.co/zHhRt87L/1-3-4.webp',
      images: [
        'https://i.ibb.co/zHhRt87L/1-3-4.webp',
        'https://i.ibb.co/hFkNHLp6/1-2.webp',
        'https://i.ibb.co/FkGNf8sC/1-1-4.webp'
      ]
    },
    { 
      brand: 'Bajaj', name: 'Majesty ICX Neo 1900W', price: 1899, oldPrice: 2799, type: 'Portable',
      wattage: '1900W', zones: '1 Zone', tag: 'NEW', tagCls: 'new', rating: 4.2, reviews: 1203, inStock: true,
      features: ['Indian Menu Preset','Anti-Skid Feet','7 Levels','LED Display'],
      specs: {Wattage:'1900W',Zones:'1',Weight:'1.6 kg',Warranty:'1 Year',Voltage:'230V AC'},
      image: 'https://i.ibb.co/4gJfGNNQ/1-3-5.webp',
      images: [
        'https://i.ibb.co/4gJfGNNQ/1-3-5.webp',
        'https://i.ibb.co/CKNw0HcD/1-2-5.webp',
        'https://i.ibb.co/R4GVvSbH/1-1-6.webp'
      ]
    }
  ];

  // 4. Create the new 12 exact products
  const createBatch = db.batch();
  productsToKeep.forEach(p => {
    const ref = db.collection('products').doc();
    createBatch.set(ref, { ...p, createdAt: new Date().toISOString() });
  });

  await createBatch.commit();
  console.log(`✅ Success! Exact ${productsToKeep.length} products created with your images!`);
  process.exit(0);
}

fixProducts().catch(console.error);
