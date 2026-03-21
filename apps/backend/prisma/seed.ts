import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
console.log('🚀 ~ process.env.DATABASE_URL:', process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

const IMAGE_POSTS = [
  {
    userName: 'Alice Johnson',
    caption: 'Beautiful sunset from the mountains 🏔️ Nothing beats the view from up here.',
    url: 'https://picsum.photos/id/15/800/600',
  },
  {
    userName: 'Ben Carter',
    caption: 'Morning coffee and a good book. Perfect start to the day ☕📖',
    url: 'https://picsum.photos/id/28/800/600',
  },
  {
    userName: 'Clara Wu',
    caption: 'Exploring the city streets 🏙️ Every corner tells a story.',
    url: 'https://picsum.photos/id/42/800/600',
  },
  {
    userName: 'David Kim',
    caption: 'Weekend hike completed! 🥾 My legs are dead but the views were worth it.',
    url: 'https://picsum.photos/id/57/800/600',
  },
  {
    userName: 'Emma Rodriguez',
    caption: "Golden hour is absolutely magical 🌅 Can't stop taking photos.",
    url: 'https://picsum.photos/id/63/800/600',
  },
  {
    userName: 'Felix Nguyen',
    caption: "Found this hidden waterfall on today's adventure 💦",
    url: 'https://picsum.photos/id/76/800/600',
  },
  {
    userName: 'Grace Park',
    caption: "Ocean vibes all day 🌊 There's something so calming about the sea.",
    url: 'https://picsum.photos/id/89/800/600',
  },
  {
    userName: 'Henry Liu',
    caption: 'Farmers market haul 🍎🥕🌻 Supporting local never felt so good.',
    url: 'https://picsum.photos/id/102/800/600',
  },
  {
    userName: 'Iris Patel',
    caption: 'Architecture never ceases to amaze me 🏛️',
    url: 'https://picsum.photos/id/119/800/600',
  },
  {
    userName: 'James Miller',
    caption: 'Camping under the stars ⭐ Disconnecting to reconnect.',
    url: 'https://picsum.photos/id/133/800/600',
  },
  {
    userName: 'Kate Brown',
    caption: 'Homemade pasta night 🍝 The sauce took 4 hours and it was SO worth it.',
    url: 'https://picsum.photos/id/145/800/600',
  },
  {
    userName: 'Leo Chen',
    caption: 'First snow of the season ❄️ Everything looks so peaceful.',
    url: 'https://picsum.photos/id/167/800/600',
  },
  {
    userName: 'Maya Singh',
    caption: 'Yoga at sunrise on the beach 🧘‍♀️ Starting the day right.',
    url: 'https://picsum.photos/id/180/800/600',
  },
  {
    userName: 'Noah Davis',
    caption: 'Street art tour around downtown — so much talent out there 🎨',
    url: 'https://picsum.photos/id/193/800/600',
  },
  {
    userName: 'Olivia Taylor',
    caption: 'Garden is finally blooming 🌷🌸 3 months of patience paying off.',
    url: 'https://picsum.photos/id/206/800/600',
  },
  {
    userName: 'Paul Martinez',
    caption: 'Road trip through the desert 🚗 The emptiness out here is surreal.',
    url: 'https://picsum.photos/id/219/800/600',
  },
  {
    userName: 'Quinn Adams',
    caption: "Vintage market finds 🕹️📻🎸 One person's old is another's treasure.",
    url: 'https://picsum.photos/id/232/800/600',
  },
  {
    userName: 'Rachel Lee',
    caption: 'Rooftop dinner with the best view in the city 🍷✨',
    url: 'https://picsum.photos/id/245/800/600',
  },
  {
    userName: 'Sam Wilson',
    caption: 'Kayaking through the mangroves 🛶 Nature up close is breathtaking.',
    url: 'https://picsum.photos/id/258/800/600',
  },
  {
    userName: 'Tina Clark',
    caption: 'Museum day ☁️ Rainy days are perfect for culture.',
    url: 'https://picsum.photos/id/271/800/600',
  },
  {
    userName: 'Uma Johnson',
    caption: 'Hot air balloon ride at dawn 🎈 Checked off the bucket list!',
    url: 'https://picsum.photos/id/284/800/600',
  },
  {
    userName: 'Victor Huang',
    caption: 'Night photography is my new obsession 🌃📸',
    url: 'https://picsum.photos/id/297/800/600',
  },
  {
    userName: 'Wendy Scott',
    caption: 'Lavender fields in full bloom 💜 The smell was incredible.',
    url: 'https://picsum.photos/id/310/800/600',
  },
  {
    userName: 'Xander Young',
    caption: 'Fishing at the lake with dad 🎣 Some traditions never get old.',
    url: 'https://picsum.photos/id/323/800/600',
  },
  {
    userName: 'Yuki Tanaka',
    caption: 'Cherry blossom season has arrived 🌸 Tokyo is magical right now.',
    url: 'https://picsum.photos/id/336/800/600',
  },
  {
    userName: 'Zoe Williams',
    caption: 'Sunrise swim in the lake 🏊 Cold but worth every second.',
    url: 'https://picsum.photos/id/349/800/600',
  },
  {
    userName: 'Aaron Brooks',
    caption: 'Pizza making class was the highlight of my week 🍕👨‍🍳',
    url: 'https://picsum.photos/id/362/800/600',
  },
  {
    userName: 'Bella Stone',
    caption: 'Cliffside trail with views for days 🌄 Legs: destroyed. Soul: restored.',
    url: 'https://picsum.photos/id/375/800/600',
  },
  {
    userName: 'Carlos Reyes',
    caption: 'Spontaneous trip to the countryside 🌾 Best decision of the month.',
    url: 'https://picsum.photos/id/388/800/600',
  },
  {
    userName: 'Diana Fox',
    caption: 'Bookshop café = my happy place 📚☕ Could stay here forever.',
    url: 'https://picsum.photos/id/401/800/600',
  },
];

async function fetchBlurDataUrl(picsumId: string): Promise<string | null> {
  try {
    const res = await fetch(`https://picsum.photos/id/${picsumId}/8/6`);
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const contentType = res.headers.get('content-type') ?? 'image/jpeg';
    return `data:${contentType};base64,${base64}`;
  } catch {
    return null;
  }
}

async function main() {
  console.log('Seeding image posts...');

  const count = await prisma.imagePost.count();
  if (count > 0) {
    console.log(`Already have ${count} image posts — skipping.`);
    return;
  }

  console.log('Fetching blur placeholders...');
  const data = await Promise.all(
    IMAGE_POSTS.map(async post => {
      const id = post.url.match(/\/id\/(\d+)\//)?.[1];
      const blurDataUrl = id ? await fetchBlurDataUrl(id) : null;
      return { ...post, blurDataUrl };
    }),
  );

  await prisma.imagePost.createMany({ data });
  console.log(`Seeded ${data.length} image posts.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
