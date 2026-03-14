// seed-products.js — One-time script to populate Firestore with products
require('dotenv').config();
const { getDB } = require('./config/firebase');

async function seedProducts() {
  const db = getDB();

  const products = [
    { brand:'Havells', name:'Insta Cook PT Turbo 2000W', price:2199, oldPrice:3499, type:'Portable',
      wattage:'2000W', zones:'1 Zone', tag:'BESTSELLER', tagCls:'', rating:4.4, reviews:2341, inStock:true,
      image:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center',
      features:['Auto Shut-Off','Child Lock','8 Power Levels','Digital Display'],
      specs:{Wattage:'2000W',Zones:'1',Weight:'1.8 kg',Warranty:'2 Years',Voltage:'230V AC'} },
    { brand:'Philips', name:'Viva Collection HD4928 2100W', price:3299, oldPrice:4999, type:'Portable',
      wattage:'2100W', zones:'1 Zone', tag:'HOT DEAL', tagCls:'sale', rating:4.6, reviews:4892, inStock:true,
      image:'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop&crop=center',
      features:['Rapid Heat Tech','Keep Warm','10 Settings','Smooth Touch'],
      specs:{Wattage:'2100W',Zones:'1',Weight:'2.1 kg',Warranty:'2 Years',Voltage:'230V AC'} },
    { brand:'Bajaj', name:'Majesty ICX Neo 1900W', price:1899, oldPrice:2799, type:'Portable',
      wattage:'1900W', zones:'1 Zone', tag:'NEW', tagCls:'new', rating:4.2, reviews:1203, inStock:true,
      image:'https://images.unsplash.com/photo-1556909114-4c36e03d48b5?w=400&h=400&fit=crop&crop=center',
      features:['Indian Menu Preset','Anti-Skid Feet','7 Levels','LED Display'],
      specs:{Wattage:'1900W',Zones:'1',Weight:'1.6 kg',Warranty:'1 Year',Voltage:'230V AC'} },
    { brand:'Bosch', name:'Serie 6 PID775DC1E 2-Zone', price:6799, oldPrice:9499, type:'Portable',
      wattage:'3400W', zones:'2 Zones', tag:'TOP RATED', tagCls:'', rating:4.8, reviews:891, inStock:true,
      image:'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop&crop=center',
      features:['PowerBoost','FlexInduction','AutoHeat Plus','PerfectFry Sensor'],
      specs:{Wattage:'3400W',Zones:'2',Weight:'2.8 kg',Warranty:'3 Years',Voltage:'230V AC'} },
    { brand:'Prestige', name:'PIC 16.0+ Induction Cooktop', price:4499, oldPrice:5999, type:'Portable',
      wattage:'2000W', zones:'1 Zone', tag:'POPULAR', tagCls:'', rating:4.5, reviews:3120, inStock:true,
      image:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center',
      features:['Pan Sensor','8 Indian Menus','Countdown Timer','Safety Cutoff'],
      specs:{Wattage:'2000W',Zones:'1',Weight:'2.0 kg',Warranty:'2 Years',Voltage:'230V AC'} },
    { brand:'Siemens', name:'EH611BEB1E 60cm Built-In', price:24999, oldPrice:34999, type:'Built-In',
      wattage:'7200W', zones:'4 Zones', tag:'PREMIUM', tagCls:'', rating:4.9, reviews:342, inStock:true,
      image:'https://images.unsplash.com/photo-1556909114-4c36e03d48b5?w=400&h=400&fit=crop&crop=center',
      features:['4-Zone Cooking','TouchSlider','CombiZone','Safety Lock'],
      specs:{Wattage:'7200W',Zones:'4',Weight:'9.5 kg',Warranty:'5 Years',Voltage:'230V AC'} },
    { brand:'Samsung', name:'Chef 60cm NZ64R3727BK', price:19499, oldPrice:26999, type:'Built-In',
      wattage:'6000W', zones:'4 Zones', tag:'NEW', tagCls:'new', rating:4.7, reviews:218, inStock:true,
      image:'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop&crop=center',
      features:['Virtual Flame UI','Boost Mode','Flex Zone','Child Safety Lock'],
      specs:{Wattage:'6000W',Zones:'4',Weight:'8.2 kg',Warranty:'4 Years',Voltage:'230V AC'} },
    { brand:'Morphy Richards', name:'Primo Travel 1600W', price:2799, oldPrice:3799, type:'Portable',
      wattage:'1600W', zones:'1 Zone', tag:'COMPACT', tagCls:'new', rating:4.3, reviews:567, inStock:true,
      image:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center',
      features:['Ultra Portable','Travel Pouch','Voltage Stabilizer','Quick Heat'],
      specs:{Wattage:'1600W',Zones:'1',Weight:'1.2 kg',Warranty:'1 Year',Voltage:'110-230V'} },
    { brand:'Pigeon', name:'Rapido Cute Induction Cooktop 1800W', price:3595, oldPrice:4999, type:'Portable',
      wattage:'1800W', zones:'1 Zone', tag:'HOT DEAL', tagCls:'sale', rating:4.3, reviews:3842, inStock:true,
      image:'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop&crop=center',
      features:['7 Preset Menus','LED Display','Child Lock','Auto Voltage Regulator'],
      specs:{Wattage:'1800W',Zones:'1',Weight:'1.5 kg',Warranty:'1 Year',Voltage:'230V AC'} },
    { brand:'Butterfly', name:'Elite V3 Induction Cooktop 2200W', price:4099, oldPrice:5999, type:'Portable',
      wattage:'2200W', zones:'1 Zone', tag:'POWERFUL', tagCls:'', rating:4.5, reviews:1205, inStock:true,
      image:'https://images.unsplash.com/photo-1556909114-4c36e03d48b5?w=400&h=400&fit=crop&crop=center',
      features:['Touch Controls','Pan Sensor','Auto Shut-off','A-Grade Crystal Glass'],
      specs:{Wattage:'2200W',Zones:'1',Weight:'2.2 kg',Warranty:'1 Year',Voltage:'230V AC'} },
    { brand:'Glen', name:'GL 3073 IN Induction Stove 1600W', price:2790, oldPrice:3999, type:'Portable',
      wattage:'1600W', zones:'1 Zone', tag:'COMPACT', tagCls:'', rating:4.4, reviews:867, inStock:true,
      image:'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop&crop=center',
      features:['Touch Controls','Crystalline Glass','8 Functions','Auto Cut-off'],
      specs:{Wattage:'1600W',Zones:'1',Weight:'1.8 kg',Warranty:'1 Year',Voltage:'230V AC'} },
    { brand:'iBELL', name:'20YO Cloud-X Induction Cooktop 2000W', price:1333, oldPrice:2499, type:'Portable',
      wattage:'2000W', zones:'1 Zone', tag:'AFFORDABLE', tagCls:'sale', rating:4.1, reviews:2150, inStock:true,
      image:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center',
      features:['LED Display','Crystal Glass','Cool Touch','Auto-off'],
      specs:{Wattage:'2000W',Zones:'1',Weight:'1.4 kg',Warranty:'1 Year',Voltage:'230V AC'} },
    { brand:'AmazonBasics', name:'Induction Cooktop 1900W', price:1900, oldPrice:2999, type:'Portable',
      wattage:'1900W', zones:'1 Zone', tag:'BEST VALUE', tagCls:'', rating:4.3, reviews:4820, inStock:true,
      image:'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop&crop=center',
      features:['6 Preset Functions','Pause Function','Matte Finish','1-year Warranty'],
      specs:{Wattage:'1900W',Zones:'1',Weight:'1.9 kg',Warranty:'1 Year',Voltage:'230V AC'} },
    { brand:'Crompton', name:'InstaServe Induction Cooktop 1600W', price:2800, oldPrice:4200, type:'Portable',
      wattage:'1600W', zones:'1 Zone', tag:'STYLISH', tagCls:'', rating:4.4, reviews:932, inStock:true,
      image:'https://images.unsplash.com/photo-1556909114-4c36e03d48b5?w=400&h=400&fit=crop&crop=center',
      features:['7 One-touch Menus','Over-voltage Shield','Large Glass Size','Timer Control'],
      specs:{Wattage:'1600W',Zones:'1',Weight:'1.7 kg',Warranty:'1 Year',Voltage:'230V AC'} },
    { brand:'Sunflame', name:'SF-IC28 Induction Cooker 1400W', price:2900, oldPrice:5590, type:'Portable',
      wattage:'1400W', zones:'1 Zone', tag:'TRUSTED', tagCls:'', rating:4.2, reviews:543, inStock:true,
      image:'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop&crop=center',
      features:['Touch Panel','8 Power Levels','Indian Menu Options','Auto Cut-off'],
      specs:{Wattage:'1400W',Zones:'1',Weight:'1.5 kg',Warranty:'1 Year',Voltage:'230V AC'} },
    { brand:'Koryo', name:'KIC27SP Induction Cooktop 2000W', price:1499, oldPrice:2999, type:'Portable',
      wattage:'2000W', zones:'1 Zone', tag:'EFFICIENT', tagCls:'new', rating:4.3, reviews:721, inStock:true,
      image:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center',
      features:['Feather Touch','High-Temp Protection','8 Auto-cook Programs','Polished Glass'],
      specs:{Wattage:'2000W',Zones:'1',Weight:'2.0 kg',Warranty:'1 Year',Voltage:'230V AC'} },
  ];

  try {
    const batch = db.batch();
    products.forEach(p => {
      const ref = db.collection('products').doc();
      batch.set(ref, { ...p, createdAt: new Date().toISOString() });
    });
    await batch.commit();
    console.log(`✅ ${products.length} products seeded to Firestore!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seedProducts();
