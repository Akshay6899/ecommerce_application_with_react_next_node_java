import { db } from './db/mongo';

const sampleProducts = [
  { title: 'iPhone 15 Pro', description: 'Apple A17 Pro chip, titanium frame, 256GB.', price: 134900, category: 'Electronics', image: 'https://picsum.photos/seed/iphone/400/300', stock: 25, rating: 4.7 },
  { title: 'Samsung Galaxy S24', description: 'Snapdragon 8 Gen 3, 5000mAh, 12GB RAM.', price: 79999, category: 'Electronics', image: 'https://picsum.photos/seed/s24/400/300', stock: 40, rating: 4.5 },
  { title: 'Sony WH-1000XM5', description: 'Industry-leading noise cancellation headphones.', price: 29990, category: 'Audio', image: 'https://picsum.photos/seed/sony/400/300', stock: 60, rating: 4.8 },
  { title: 'MacBook Air M3', description: '13-inch, 16GB unified memory, 512GB SSD.', price: 134900, category: 'Computers', image: 'https://picsum.photos/seed/mba/400/300', stock: 20, rating: 4.9 },
  { title: 'Dell XPS 15', description: 'Intel Core i7, 32GB RAM, 1TB NVMe, RTX 4060.', price: 189990, category: 'Computers', image: 'https://picsum.photos/seed/xps/400/300', stock: 15, rating: 4.6 },
  { title: 'Levi\'s 511 Jeans', description: 'Slim fit, stretch denim.', price: 2499, category: 'Fashion', image: 'https://picsum.photos/seed/jeans/400/300', stock: 200, rating: 4.3 },
  { title: 'Nike Air Force 1', description: 'Classic white sneakers.', price: 7995, category: 'Footwear', image: 'https://picsum.photos/seed/af1/400/300', stock: 80, rating: 4.7 },
  { title: 'Boat Rockerz 450', description: 'Bluetooth on-ear headphones, 15h battery.', price: 1499, category: 'Audio', image: 'https://picsum.photos/seed/boat/400/300', stock: 300, rating: 4.2 },
  { title: 'Mi LED Smart TV 43"', description: '4K UHD, Android TV, HDR10.', price: 27999, category: 'TV', image: 'https://picsum.photos/seed/mitv/400/300', stock: 50, rating: 4.4 },
  { title: 'Prestige Pressure Cooker', description: '5L aluminium, ISI certified.', price: 1299, category: 'Kitchen', image: 'https://picsum.photos/seed/prestige/400/300', stock: 150, rating: 4.5 },
  { title: 'Logitech MX Master 3S', description: 'Wireless performance mouse.', price: 8995, category: 'Accessories', image: 'https://picsum.photos/seed/mx3/400/300', stock: 70, rating: 4.8 },
  { title: 'Kindle Paperwhite', description: '6.8" display, waterproof, 16GB.', price: 14999, category: 'Books', image: 'https://picsum.photos/seed/kindle/400/300', stock: 45, rating: 4.7 },
  { title: 'Fitbit Charge 6', description: 'Heart rate, GPS, 7-day battery.', price: 13999, category: 'Wearables', image: 'https://picsum.photos/seed/fitbit/400/300', stock: 65, rating: 4.4 },
  { title: 'Philips Air Fryer', description: '4.1L, rapid air technology.', price: 9999, category: 'Kitchen', image: 'https://picsum.photos/seed/airfryer/400/300', stock: 90, rating: 4.6 },
  { title: 'Adidas Ultraboost 22', description: 'Premium running shoes.', price: 16999, category: 'Footwear', image: 'https://picsum.photos/seed/ub22/400/300', stock: 55, rating: 4.7 },
  { title: 'Canon EOS R50', description: 'Mirrorless 24MP, 4K video.', price: 73999, category: 'Cameras', image: 'https://picsum.photos/seed/eosr50/400/300', stock: 18, rating: 4.5 },
  { title: 'OnePlus Buds 3', description: 'ANC, 44h playback.', price: 5499, category: 'Audio', image: 'https://picsum.photos/seed/buds3/400/300', stock: 120, rating: 4.3 },
  { title: 'IKEA Office Chair', description: 'Ergonomic, mesh back.', price: 11990, category: 'Furniture', image: 'https://picsum.photos/seed/ikea/400/300', stock: 30, rating: 4.4 },
  { title: 'Rubik\'s Cube 3x3', description: 'Original speed cube.', price: 499, category: 'Toys', image: 'https://picsum.photos/seed/rubik/400/300', stock: 500, rating: 4.6 },
  { title: 'Cricket Bat — SG', description: 'English willow, full size.', price: 4999, category: 'Sports', image: 'https://picsum.photos/seed/bat/400/300', stock: 40, rating: 4.5 }
];

export async function seedIfEmpty() {
  const col = db().collection('products');
  const count = await col.countDocuments();
  if (count === 0) {
    await col.insertMany(sampleProducts);
    console.log(`🌱 Seeded ${sampleProducts.length} products`);
  }
}
