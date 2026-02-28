/**
 * Seed: Testing Round 1 – Jade City
 * Source: "Testing Round 1 - Jade City Solutions.pdf"
 *
 * Run with:
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-jade-city.ts
 * or add to package.json scripts and run: npm run seed:jade-city
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CONTEST_TITLE = 'Testing Round 1 – Jade City';

const problems = [
    {
        title: 'Problem 1 – Rabbits and Chickens',
        statement: `You arrive at Jade City and into the imperial palace. To first test your worth as an intelligent demon hunter, the governor asks you a question that has stumped the greatest scholars.

There are only rabbits and chickens in a pen. The rabbits have 4 legs and the chickens have 2 legs. There are 54 heads and 152 legs. Let the number of rabbits be x.

What is the sum of the digits of x?`,
        correctAnswer: '4',
        points: 100,
    },
    {
        title: 'Problem 2 – The Outfit',
        statement: `To get ready for the journey, you must choose a colored hat, robe, and staff. For each accessory, you can choose one of 3 colors: Red, Green, and Blue. However, it must be that two of the colors of the accessories must be the same, and the third color must be different.

How many different ways can you choose an outfit?`,
        correctAnswer: '18',
        points: 150,
    },
    {
        title: 'Problem 3 – Carriage Fee',
        statement: `As you are headed to Devil Mountain, you and your three other demon hunter friends want to pay for the carriage fee. All of you have exactly one $1, one $2, and one $3 coin. Each of you wants to pitch in exactly one coin to the total carriage fee, which is $8.

How many ways can you and your friends pay for the carriage?`,
        correctAnswer: '19',
        points: 200,
    },
    {
        title: 'Problem 4 – The Enchanted Forest Doors',
        statement: `On the way to Devil Mountain, you encounter an enchanted forest. The entrance is protected by the demon's magic. There are 100 doors numbered 1 to 100 from left to right; all remain closed at the beginning.

Toggling the state of a door means: if it's open, close it; if it's closed, open it.

For each round i from 1 ≤ i ≤ 100, toggle every i-th door. The doors that are open at the end of this process are "safe".

What is the sum of the indices of all the safe doors?`,
        correctAnswer: '385',
        points: 200,
    },
    {
        title: 'Problem 5 – Double Death Ritual',
        statement: `You come face to face with the demon. You and your friends must perform a precise magic ritual called "Double Death" to defeat it.

Let M be the demon, which stands in the middle of the circumcircle (P₂P₃P₄), where your 3 friends stand. Also, P₂P₃ = P₄P₃ and ∠P₂P₃P₄ = 90°.

You must then stand at P₁, the point that is the center of a circle tangent to line P₂P₄ at A and circle (P₂P₃P₄) at B.

By measuring the scale of the demon, it is known that the radius of circle (P₂P₃P₄) is 10 and P₃A = 13.

You are tasked to cast a spell that goes from A to B. The length AB can be represented as a/b in its lowest form. What is a + b?

(Note: (XYZ) denotes the unique circle passing through X, Y, and Z)`,
        correctAnswer: '44',
        points: 300,
    },
];

async function main() {
    console.log('🏯 Seeding Testing Round 1 – Jade City...\n');

    // Remove any existing version so we can re-run cleanly
    const existing = await prisma.contest.findFirst({
        where: { title: CONTEST_TITLE },
        include: { problems: true, submissions: true, ratingHistory: true, registrations: true },
    });

    if (existing) {
        console.log(`  ♻️  Removing existing contest (id: ${existing.id})...`);
        await prisma.submission.deleteMany({ where: { contestId: existing.id } });
        await prisma.ratingHistory.deleteMany({ where: { contestId: existing.id } });
        await prisma.registration.deleteMany({ where: { contestId: existing.id } });
        await prisma.problem.deleteMany({ where: { contestId: existing.id } });
        await prisma.contest.delete({ where: { id: existing.id } });
    }

    // Contest ran Nov 27 2024 - set as ENDED so ratings / standings work
    const contest = await prisma.contest.create({
        data: {
            title: CONTEST_TITLE,
            description:
                'Jade City is a math-adventure themed contest inspired by Chinese folklore. ' +
                'You are an intelligent demon hunter navigating Jade City to defeat the demon. ' +
                'Featuring problems in algebra, combinatorics, and geometry.',
            startTime: new Date('2024-11-27T09:00:00Z'),
            endTime:   new Date('2024-11-27T11:30:00Z'),
            status: 'ENDED',
            themeSlug: 'jade-city',
        },
    });

    console.log(`  ✅ Contest created: "${contest.title}" (id: ${contest.id})\n`);

    for (const p of problems) {
        const created = await prisma.problem.create({
            data: { ...p, contestId: contest.id },
        });
        console.log(`  ✅ Problem added: "${created.title}" - answer: ${created.correctAnswer} (${created.points} pts)`);
    }

    console.log(`\n🎉 Done! Visit http://localhost:3000/contests/${contest.id} to see the contest.`);
    console.log(`   Admin panel → Contests to manage it.`);
}

main()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
