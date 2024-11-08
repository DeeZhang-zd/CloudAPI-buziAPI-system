// const amqp = require('amqplib');
// const sharp = require('sharp');
// const path = require('path');
// const fs = require('fs');

// const queue = 'thumbnail_queue';
// const thumbnailDir = path.join(__dirname, "./thumbnails")
// if (!fs.existsSync(thumbnailDir)) {
//     fs.mkdirSync(thumbnailDir);
// }

// async function processThumbnail(message) {
//     const { photoId, filename, path: filePath } = message;
//     const thumbnailPath = path.join(thumbnailDir, `thumbnail_${filename}`);
//     console.log(`Processing thumbnail for photo ID ${photoId}`);
//     console.log(`Original file path: ${filePath}`);
//     console.log(`Thumbnail path: ${thumbnailPath}`);
//     try {
//         await sharp(filePath)
//             .resize(100, 100)
//             .toFile(thumbnailPath);

//         console.log(`Thumbnail generated for photo ID ${photoId} at ${thumbnailPath}`);
//     } catch (error) {
//         console.error(`Error processing thumbnail for photo ID ${photoId}:`, error);
//     }
// }

// async function startWorker() {
//     const connection = await amqp.connect('amqp://localhost');
//     const channel = await connection.createChannel();

//     await channel.assertQueue(queue, { durable: true });
//     channel.prefetch(1);

//     console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', queue);

//     channel.consume(queue, async (msg) => {
//         if (msg !== null) {
//             const message = JSON.parse(msg.content.toString());
//             console.log(" [x] Received %s", message);
//             await processThumbnail(message);
//             channel.ack(msg);
//         }
//     }, { noAck: false });
// }

// startWorker().catch(console.error);
const amqp = require('amqplib');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const queue = 'thumbnail_queue';
const thumbnailDir = path.join(__dirname, 'thumbnails');

// Ensure the thumbnail directory exists
if (!fs.existsSync(thumbnailDir)) {
    fs.mkdirSync(thumbnailDir);
}

async function processThumbnail(message) {
    const { photoId, filename, path: filePath } = message;
    const thumbnailPath = path.join(thumbnailDir, `thumbnail_${filename}`);

    console.log(`Processing thumbnail for photo ID ${photoId}`);
    console.log(`Original file path: ${filePath}`);
    console.log(`Thumbnail path: ${thumbnailPath}`);

    try {
        await sharp(filePath)
            .resize(100, 100)
            .toFile(thumbnailPath);

        console.log(`Thumbnail generated for photo ID ${photoId} at ${thumbnailPath}`);
    } catch (error) {
        console.error(`Error processing thumbnail for photo ID ${photoId}:`, error);
    }
}

async function startWorker() {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    await channel.assertQueue(queue, { durable: true });
    channel.prefetch(1);

    console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', queue);

    channel.consume(queue, async (msg) => {
        if (msg !== null) {
            const message = JSON.parse(msg.content.toString());
            console.log(" [x] Received %s", message);
            await processThumbnail(message);
            channel.ack(msg);
        }
    }, { noAck: false });
}

startWorker().catch(console.error);
